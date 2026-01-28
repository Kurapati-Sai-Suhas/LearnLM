from rest_framework import viewsets, generics, filters, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.pagination import PageNumberPagination # 👈 Import this

# Safe Import for AI
try:
    from .ai_services import (
        generate_flashcards_with_gemini, 
        answer_doubt_with_gemini,
        generate_quiz_with_gemini
    )
except ImportError:
    # Fallback to prevent crash if file is missing
    def generate_flashcards_with_gemini(*args): return []
    def generate_quiz_with_gemini(*args): return []
    def answer_doubt_with_gemini(*args): return "Backend Error: AI Service not found."

from .utils import extract_text_from_pdf
from .models import StudyGroup, StudyMaterial
from .serializers import StudyGroupSerializer, UserSerializer, StudyMaterialSerializer

User = get_user_model()

# 👇 1. ADD THIS CLASS (Fixes "No Groups Found")
class LargePagination(PageNumberPagination):
    page_size = 8             # Default: 9 items (Perfect for 3x3 grid)
    page_size_query_param = 'page_size' # Allow frontend to request more (e.g., ?page_size=100)
    max_page_size = 1000

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all().order_by('-created_at')
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['id', 'join_code', 'capacity']
    search_fields = ['name', 'description', 'join_code']
    
    # 👇 2. USE IT HERE
    pagination_class = LargePagination 

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['post'])
    def join(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Code is required'}, status=400)

        try:
            group = StudyGroup.objects.get(join_code=code)
            if group.members.count() >= group.capacity:
                return Response({'error': 'Group is full!'}, status=400)
            if request.user in group.members.all():
                 return Response({'message': 'Already a member', 'id': group.id}, status=200)

            group.members.add(request.user)
            return Response({'message': 'Joined successfully!', 'id': group.id})

        except StudyGroup.DoesNotExist:
            return Response({'error': 'Invalid Group Code'}, status=404)

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        group = self.get_object()
        if request.user not in group.members.all():
            return Response({"Message": "You are not a member of this group."}, status=400)
        group.members.remove(request.user)
        return Response({"Message": "You have left the group."}, status=200)

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = StudyMaterial.objects.all().order_by('-upload_date')
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['study_group', 'uploaded_by'] 
    search_fields = ['title', 'study_group__name']

    def perform_create(self, serializer):
        group_id = self.request.data.get('study_group')
        print(f"📦 Uploading file... Group ID: {group_id}")
        serializer.save(uploaded_by=self.request.user, study_group_id=group_id)

class UserDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        joined_count = StudyGroup.objects.filter(members=user).count()
        created_count = StudyGroup.objects.filter(creator=user).count()

        return Response({
            "username": user.username,
            "active_groups": joined_count + created_count,
            "created_groups": created_count,
            "joined_groups": joined_count,
            "study_hours": 0,
            "achievement_points": 100
        })

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AIFlashcardView(APIView):
    def post(self, request):
        material_id = request.data.get('materialId')
        topic = request.data.get('topic', 'General')

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        extracted_text = extract_text_from_pdf(material.file.name)
        if not extracted_text:
             return Response({"error": "PDF is empty or unreadable"}, status=400)

        print(f"🚀 Asking AI to generate cards for topic: {topic}")
        flashcards = generate_flashcards_with_gemini(extracted_text, topic)

        return Response({"flashcards": flashcards}, status=200)

class AIDoubtView(APIView):
    def post(self, request):
        material_id = request.data.get('materialId')
        question = request.data.get('question')

        if not question:
            return Response({"error": "Question is required"}, status=400)

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        extracted_text = extract_text_from_pdf(material.file.name)
        if not extracted_text:
             return Response({"error": "PDF is empty"}, status=400)

        answer = answer_doubt_with_gemini(extracted_text, question)

        return Response({"answer": answer}, status=200)
    
class AIQuizView(APIView):
    def post(self, request):
        material_id = request.data.get('materialId')
        topic = request.data.get('topic', 'General')
        difficulty = request.data.get('difficulty', 'Medium')
        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        extracted_text = extract_text_from_pdf(material.file.name)
        if not extracted_text: return Response({"error": "PDF is empty"}, status=400)

        quiz = generate_quiz_with_gemini(extracted_text, topic, difficulty)
        return Response({"quiz": quiz}, status=200)
