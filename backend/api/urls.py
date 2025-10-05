from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    register, login,
    ResumeListCreateView, ResumeDetailView,
    JobListCreateView, JobDetailView,
    ask_query, match_job_with_candidates
)

urlpatterns = [
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Resumes
    path('resumes/', ResumeListCreateView.as_view(), name='resume-list-create'),
    path('resumes/<uuid:id>/', ResumeDetailView.as_view(), name='resume-detail'),
    
    # Jobs
    path('jobs/', JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<uuid:id>/', JobDetailView.as_view(), name='job-detail'),
    path('jobs/<uuid:job_id>/match/', match_job_with_candidates, name='job-match'),
    
    # Query
    path('ask/', ask_query, name='ask-query'),
]