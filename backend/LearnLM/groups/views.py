from .permissions import IsOwnerOrReadOnly
from rest_framework import viewsets, generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from .models import StudyGroup, StudyMaterial
from .serializers import StudyGroupSerializer, UserSerializer, StudyMaterialSerializer

User = get_user_model()


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        groups=StudyGroup.objects.all()


class StudyGroupViewSet(viewsets.ModelViewSet):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [IsAuthenticated,IsOwnerOrReadOnly]
    # Search Configuration
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    # 1. Exact Matches (Good for IDs, Numbers, Codes)
    filterset_fields = ['id', 'join_code', 'capacity']
    # 2. Fuzzy Search (Good for Text)
    # ⚠️ REMOVED: id, created_at, members (These cause crashes in text search)
    search_fields = ['name', 'description', 'join_code']
    # 3. Sorting (Good for Ranking)
    # ⚠️ REMOVED: description (Sorting by long text is slow and useless)
    ordering_fields = ['created_at', 'capacity', 'name']


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
                 return Response({'message': 'Already a member'}, status=200)

            group.members.add(request.user)
            return Response({'message': 'Joined successfully!', 'id': group.id})

        except StudyGroup.DoesNotExist:
            return Response({'error': 'Invalid Group Code'}, status=404)


    @action(detail=True, methods=["post",])
    def leave(self, request, pk=None):
        group=self.get_object()
        user=request.user
        if user not in group.members.all():
            return Response({"Message":"You are not a member of this group."}, status=400)
        group.members.remove(request.user)
        return Response({"Message":"You have left the group."}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def kickmember(self, request, pk=None):
        group = self.get_object()
        user = request.user
        member_id = request.data.get('member_id')

        if group.creator != user:
            return Response({"status": "only the creator can kick members"}, status=403)
        if not member_id:
             return Response({"status": "member_id is required"}, status=400)

        try:
            usertobekicked = User.objects.get(id=member_id)
        except User.DoesNotExist:
            return Response({"status": "User not found"}, status=404)

        if usertobekicked not in group.members.all():
            return Response({"status": "user is not a member of the group"}, status=400)
        group.members.remove(usertobekicked)
        return Response({"status": "member kicked successfully"}, status=200)


class StudyMaterialList(generics.ListCreateAPIView):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['study_group', 'uploaded_by']
    search_fields = ['title', 'group__name']

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)



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

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)