import os
from django.conf import settings
from rest_framework import viewsets, generics, filters, permissions, parsers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Avg, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied

# 👇 1. UPDATED IMPORT: Bring in the new AIService class
from .ai_services import AIService
from .utils import extract_text_from_file, load_image_for_ai
from .models import StudyGroup, StudyMaterial, QuizResult, UserActivity, AssignedQuiz
from .models import StudyGroup, StudyMaterial, QuizResult, UserActivity,AssignedQuiz
from .serializers import QuizResultSerializer, StudyGroupSerializer, UserSerializer, StudyMaterialSerializer,AssignedQuizSerializer

User = get_user_model()

class LargePagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
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
    pagination_class = LargePagination 

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['post'])
    def join(self, request):
        code = request.data.get('code')
        if not code: return Response({'error': 'Code is required'}, status=400)
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

        extracted_text = extract_text_from_file(material.file.name)
        if not extracted_text: return Response({"error": "PDF is empty or unreadable"}, status=400)

        # 👇 2. UPDATED: Call the new class method
        print(f"🚀 Asking AI to generate cards for topic: {topic}")
        flashcards = AIService.generate_flashcards(extracted_text, num_cards=10)

        return Response({"flashcards": flashcards}, status=200)

class AIDoubtView(APIView):
    def post(self, request):
        material_id = request.data.get('materialId')
        question = request.data.get('question')

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)
        file_path = material.file.path
        extension = os.path.splitext(file_path)[1].lower()

        # 🚦 THE TRAFFIC COP LOGIC 🚦
        if extension in ['.jpg', '.jpeg', '.png']:
            # Route B: It's an image! Use Vision.
            img_obj = load_image_for_ai(file_path)
            answer = AIService.explain_image(img_obj, question)
        else:
            # Route A: It's a Document! Extract text.
            extracted_text = extract_text_from_file(file_path)
            answer = AIService.get_answer(question, extracted_text)

        return Response({"answer": answer}, status=200)
class AIQuizView(APIView):
    def post(self, request):
        material_id = request.data.get('materialId')
        topic = request.data.get('topic', 'General')

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        # 👇 BULLETPROOF FILE PATH 👇
        file_path = os.path.join(settings.MEDIA_ROOT, material.file.name)

        extracted_text = extract_text_from_file(file_path)

        if not extracted_text: 
            return Response({"error": "Document is empty or unreadable"}, status=400)

        quiz = AIService.generate_quiz(extracted_text, num_questions=5)
        return Response({"quiz": quiz}, status=200)

class QuizResultCreateView(generics.CreateAPIView):
    queryset = QuizResult.objects.all()
    serializer_class = QuizResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_data(request):
    user = request.user
    raw_scores = QuizResult.objects.filter(user=user).values_list('score', flat=True)
    score_distribution = [
        {"range": "0-40%", "count": 0},
        {"range": "40-60%", "count": 0},
        {"range": "60-80%", "count": 0},
        {"range": "80-100%", "count": 0},
    ]
    
    for s in raw_scores:
        if s < 40: score_distribution[0]["count"] += 1
        elif s < 60: score_distribution[1]["count"] += 1
        elif s < 80: score_distribution[2]["count"] += 1
        else: score_distribution[3]["count"] += 1

    subjects = UserActivity.objects.filter(user=user).values_list('section_name', flat=True).distinct()
    bivariate_data = []
    for subject in subjects:
        activity = UserActivity.objects.filter(user=user, section_name=subject).aggregate(Sum('time_spent'))
        total_seconds = activity['time_spent__sum'].total_seconds() if activity['time_spent__sum'] else 0
        hours = round(total_seconds / 3600, 1)

        avg_score = QuizResult.objects.filter(user=user, topic__icontains=subject).aggregate(Avg('score'))
        score = avg_score['score__avg'] or 0

        bivariate_data.append({
            "subject": subject,
            "hours_studied": hours,
            "average_score": score
        })

    return Response({
        "univariate": score_distribution,
        "bivariate": bivariate_data
    })

class AssignedQuizCreateView(generics.CreateAPIView):
    queryset = AssignedQuiz.objects.all()
    serializer_class = AssignedQuizSerializer
    permission_classes = [IsAuthenticated]
    def perform_create(self, serializer):
        group_id = self.request.data.get('study_group')
        try:
            group = StudyGroup.objects.get(id=group_id)
        except StudyGroup.DoesNotExist:
            raise serializer.ValidationError("Study group not found")
        if self.request.user != group.creator:
            raise permissions.PermissionDenied("Only the group creator can assign quizzes")
        serializer.save(assigned_by=self.request.user)


class ListAssignedQuizView(generics.ListAPIView):
    serializer_class = AssignedQuizSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        # The frontend will pass the group ID like ?study_group=7
        group_id = self.request.query_params.get('study_group')
        # Returns all quizzes for this group, ordered by deadline (closest first)
        if group_id:
            return AssignedQuiz.objects.filter(study_group_id=group_id).order_by('deadline')
        return AssignedQuiz.objects.none()
    

class ManageAssignedQuizView(generics.RetrieveUpdateDestroyAPIView):
    """ Allows Group Owners to Edit or Delete an existing assigned quiz """
    queryset = AssignedQuiz.objects.all()
    serializer_class = AssignedQuizSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        quiz = self.get_object() # Get the specific quiz from the database
        # 🛡️ SECURITY CHECK: Prevent students from hacking the quiz!
        if quiz.study_group.creator != self.request.user:
            raise PermissionDenied("Only the Group Owner can edit this quiz!")

        serializer.save()

    def perform_destroy(self, instance):
        # 🛡️ SECURITY CHECK: Only owner can delete
        if instance.study_group.creator != self.request.user:
            raise PermissionDenied("Only the Group Owner can delete this quiz!")
        instance.delete()

