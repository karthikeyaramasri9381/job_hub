from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    LogoutView,
    UserProfileView,
    GoogleAuthView
)
from .admin_views import (
    AdminStatsAPIView,
    AdminUsersListAPIView,
    AdminUserToggleActiveAPIView,
    AdminJobsListAPIView,
    AdminJobDeleteAPIView
)

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('google/', GoogleAuthView.as_view(), name='auth_google'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='auth_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('me/', UserProfileView.as_view(), name='auth_me'),

    # Admin Management APIs
    path('admin/stats/', AdminStatsAPIView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUsersListAPIView.as_view(), name='admin_users_list'),
    path('admin/users/<int:pk>/toggle-active/', AdminUserToggleActiveAPIView.as_view(), name='admin_user_toggle_active'),
    path('admin/jobs/', AdminJobsListAPIView.as_view(), name='admin_jobs_list'),
    path('admin/jobs/<int:pk>/', AdminJobDeleteAPIView.as_view(), name='admin_job_delete'),
]
