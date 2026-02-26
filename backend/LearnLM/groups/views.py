import os
from django.conf import settings
from rest_framework import viewsets, generics, filters, permissions, parsers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination
from django.db.models import Avg, Sum, Q
from rest_framework.exceptions import PermissionDenied

from .ai_services import AIService
from .utils import extract_text_from_file, load_image_for_ai
from .models import StudyGroup, StudyMaterial, QuizResult, UserActivity, AssignedQuiz, Connection, DirectMessage
from .serializers import ConnectionSerializer, QuizResultSerializer, StudyGroupSerializer, UserBasicSerializer, UserSerializer, StudyMaterialSerializer, AssignedQuizSerializer

User = get_user_model()

class LargePagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 1000

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class StudyGroupViewSet(viewsets.ModelViewSet):
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['id', 'join_code', 'capacity']
    search_fields = ['name', 'description', 'join_code']
    pagination_class = LargePagination 

    def get_queryset(self):
        user = self.request.user
        return StudyGroup.objects.filter(
            Q(members=user) | Q(creator=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        # 👇 FIX 1: Automatically add the creator to the members list upon creation!
        group = serializer.save(creator=self.request.user)
        group.members.add(self.request.user)

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
        active_groups_count = StudyGroup.objects.filter(Q(members=user) | Q(creator=user)).distinct().count()
        created_count = StudyGroup.objects.filter(creator=user).count()
        joined_count = StudyGroup.objects.filter(members=user).count()
        
        return Response({
            "username": user.username,
            "active_groups": active_groups_count,
            "created_groups": created_count,
            "joined_groups": joined_count,
            "study_hours": 0,
            "quizzes_taken": 0,
            "achievement_points": 100
        })

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AIFlashcardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        material_id = request.data.get('materialId')
        topic = request.data.get('topic', 'General')
        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

        file_path = material.file.path
        extracted_text = extract_text_from_file(file_path)
        
        if not extracted_text: 
            return Response({"error": "PDF is empty or unreadable"}, status=400)

        print(f"🚀 Asking AI to generate cards for topic: {topic}")
        flashcards = AIService.generate_flashcards(extracted_text, num_cards=10)

        return Response({"flashcards": flashcards}, status=200)

class AIDoubtView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        material_id = request.data.get('materialId')
        question = request.data.get('question')

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)
            
        file_path = material.file.path
        extension = os.path.splitext(file_path)[1].lower()

        if extension in ['.jpg', '.jpeg', '.png']:
            img_obj = load_image_for_ai(file_path)
            answer = AIService.explain_image(img_obj, question)
        else:
            extracted_text = extract_text_from_file(file_path)
            answer = AIService.get_answer(question, extracted_text)

        return Response({"answer": answer}, status=200)

class AIQuizView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        material_id = request.data.get('materialId')
        topic = request.data.get('topic', 'General')

        try:
            material = StudyMaterial.objects.get(id=material_id)
        except StudyMaterial.DoesNotExist:
            return Response({"error": "File not found"}, status=404)

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
        group_id = self.request.query_params.get('study_group')
        if group_id:
            return AssignedQuiz.objects.filter(study_group_id=group_id).order_by('deadline')
        return AssignedQuiz.objects.none()

class ManageAssignedQuizView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AssignedQuiz.objects.all()
    serializer_class = AssignedQuizSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        quiz = self.get_object()
        if quiz.study_group.creator != self.request.user:
            raise PermissionDenied("Only the Group Owner can edit this quiz!")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.study_group.creator != self.request.user:
            raise PermissionDenied("Only the Group Owner can delete this quiz!")
        instance.delete()

class getGroupMembers(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        try:
            group = StudyGroup.objects.get(id=group_id)
            # 👇 FIX 2: Manually bundle the creator into the member list if they aren't already there!
            return User.objects.filter(Q(id__in=group.members.all()) | Q(id=group.creator.id)).distinct()
        except StudyGroup.DoesNotExist:
            return User.objects.none()

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 3:
            return Response({"users": []})
        users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
        serializer = UserBasicSerializer(users, many=True)
        return Response({"users": serializer.data})


class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if Connection.objects.filter(sender=request.user, receiver=receiver).exists() or \
           Connection.objects.filter(sender=receiver, receiver=request.user).exists():
            return Response({"error": "Connection already exists or is pending."}, status=status.HTTP_400_BAD_REQUEST)

        Connection.objects.create(sender=request.user, receiver=receiver, status='pending')
        return Response({"message": "Friend request sent!"}, status=status.HTTP_201_CREATED)


class FriendRequestActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id):
        action = request.data.get('action')
        try:
            connection = Connection.objects.get(id=connection_id, receiver=request.user, status='pending')
        except Connection.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == 'accept':
            connection.status = 'accepted'
            connection.save()
            return Response({"message": "Friend request accepted!"})
        elif action == 'reject':
            connection.status = 'rejected'
            connection.save()
            return Response({"message": "Friend request rejected."})
        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)


class FriendsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending_requests = Connection.objects.filter(receiver=request.user, status='pending')
        accepted_connections = Connection.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user),
            status='accepted'
        )

        return Response({
            "pending": ConnectionSerializer(pending_requests, many=True).data,
            "friends": ConnectionSerializer(accepted_connections, many=True).data
        })