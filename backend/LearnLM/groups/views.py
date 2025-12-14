from rest_framework import viewsets, generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from .models import StudyGroup, StudyMaterial
from .serializers import StudyGroupSerializer, UserSerializer, StudyMaterialSerializer

User = get_user_model()

# 1. User Registration View
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# 2. Study Group ViewSet (Replaces StudyGroupList & StudyGroupDetail)
# This ONE class handles Listing, Creating, Retrieving, Updating, and Deleting!
class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated]
    
    # Search Configuration
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'subject__name']

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

# 3. Study Material List (Keeping this as is for now)
class StudyMaterialList(generics.ListCreateAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'study_group__name']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

# 4. Dashboard Stats View
class UserDashboardStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        joined_count = StudyGroup.objects.filter(members=user).count()
        created_count = StudyGroup.objects.filter(creator=user).count()

        return Response({
            "username": user.username,
            "joined_groups": joined_count,
            "created_groups": created_count,
            "study_hours": 0,
            "points": 100
        })

# 5. User Profile View (For the Sidebar)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)