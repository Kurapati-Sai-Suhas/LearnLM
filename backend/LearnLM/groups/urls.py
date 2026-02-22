from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# 👇 Fix Imports: Use MaterialViewSet, NOT StudyMaterialList
from .views import (
    AIFlashcardView, 
    StudyGroupViewSet, 
    MaterialViewSet,      # <--- Changed this
    CreateUserView, 
    UserDashboardStats, 
    UserProfileView,
    AIDoubtView,
    AIQuizView,
    analytics_data,
    QuizResultCreateView,
    ListAssignedQuizView,
    AssignedQuizCreateView,
    ManageAssignedQuizView,
    # <--- Added this

)

# Create the Router
router = DefaultRouter()
router.register(r'groups', StudyGroupViewSet, basename='studygroup')
# 👇 Register Materials here (because it is now a ViewSet)
router.register(r'materials', MaterialViewSet, basename='studymaterial')

urlpatterns = [
    # 1. Router URLs (api/groups/ AND api/materials/)
    path('', include(router.urls)),

    # 2. Authentication (Login/Register)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', CreateUserView.as_view(), name='register'),

    # 3. User & Dashboard
    path('dashboard/stats/', UserDashboardStats.as_view(), name='dashboard-stats'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),

    # 4. AI Features 🧠
    path('ai/flashcards/', AIFlashcardView.as_view(), name='ai-flashcards'),
    path('ai/quiz/', AIQuizView.as_view(), name='ai-quiz'),      # 👈 The missing link for Quiz
    path('ai/doubt/', AIDoubtView.as_view(), name='ai-doubt'),
    path('analytics/charts/', analytics_data, name='analytics-charts'),
    path('quiz/save/', QuizResultCreateView.as_view(), name='save-quiz'),
    path('quizzes/assign/', AssignedQuizCreateView.as_view(), name='assign-quiz'),
    path('quizzes/assigned/', ListAssignedQuizView.as_view(), name='list-assigned-quizzes'),
    path('quizzes/assigned/<int:pk>/', ManageAssignedQuizView.as_view(), name='manage-assigned-quiz')
]
