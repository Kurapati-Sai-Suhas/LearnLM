
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # 👈 IMPORT THESE!

# Import your views
from .views import StudyGroupViewSet, CreateUserView, StudyMaterialList, UserDashboardStats, UserProfileView

# Create the Router
router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='studygroup')

urlpatterns = [
    # 1. The Groups API (api/groups/)
    path('', include(router.urls)),

    # 2. Authentication (Login/Register)
    # 👇 THESE WERE MISSING!
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', CreateUserView.as_view(), name='register'),

    # 3. Other Features
    path('materials/', StudyMaterialList.as_view(), name='material-list'),
    path('dashboard/stats/', UserDashboardStats.as_view(), name='dashboard-stats'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
]