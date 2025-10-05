import os
import uuid
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.db import models
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import LimitOffsetPagination
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from .models import Resume, Job, JobMatch
from .serializers import (
    UserSerializer, ResumeSerializer, ResumeListSerializer,
    JobSerializer, JobListSerializer, JobMatchSerializer,
    AskQuerySerializer, MatchJobSerializer
)
from .utils import (
    extract_text_from_file, extract_skills_from_text,
    extract_experience_info, find_matching_resumes,
    match_job_with_resumes
)

# Authentication Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response({
        'error': {
            'code': 'VALIDATION_ERROR',
            'message': 'Registration failed',
            'details': serializer.errors
        }
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': {
                'code': 'FIELD_REQUIRED',
                'field': 'username/password',
                'message': 'Username and password are required'
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    return Response({
        'error': {
            'code': 'INVALID_CREDENTIALS',
            'message': 'Invalid username or password'
        }
    }, status=status.HTTP_401_UNAUTHORIZED)

# Resume Views
class ResumeListCreateView(generics.ListCreateAPIView):
    """GET /api/resumes and POST /api/resumes"""
    queryset = Resume.objects.all()
    pagination_class = LimitOffsetPagination
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]  # Allow anonymous uploads for hackathon
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ResumeListSerializer
        return ResumeSerializer
    
    def get_queryset(self):
        queryset = Resume.objects.all()
        search_query = self.request.query_params.get('q', '')
        
        if search_query:
            queryset = queryset.filter(
                models.Q(name__icontains=search_query) |
                models.Q(email__icontains=search_query) |
                models.Q(skills__icontains=search_query) |
                models.Q(extracted_text__icontains=search_query)
            )
        
        return queryset
    
    def get_or_create_anonymous_user(self):
        """Get or create an anonymous user for hackathon demo uploads"""
        anonymous_user, created = User.objects.get_or_create(
            username='anonymous_hackathon_user',
            defaults={
                'email': 'anonymous@hackathon.demo',
                'first_name': 'Anonymous',
                'last_name': 'User'
            }
        )
        return anonymous_user
    
    def create(self, request, *args, **kwargs):
        try:
            # Handle idempotency
            idempotency_key = request.headers.get('Idempotency-Key')
            if idempotency_key and request.user.is_authenticated:
                existing = Resume.objects.filter(
                    uploaded_by=request.user,
                    name__icontains=idempotency_key
                ).first()
                if existing:
                    return Response(ResumeSerializer(existing).data, status=status.HTTP_200_OK)
            
            # Check if file is provided
            if 'file' not in request.FILES:
                return Response({
                    'error': {
                        'code': 'FIELD_REQUIRED',
                        'field': 'file',
                        'message': 'Resume file is required'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract text from uploaded file
            resume_file = request.FILES['file']
            
            # Save file temporarily
            import tempfile
            temp_path = os.path.join(tempfile.gettempdir(), f'{uuid.uuid4()}_{resume_file.name}')
            
            try:
                with open(temp_path, 'wb+') as temp_file:
                    for chunk in resume_file.chunks():
                        temp_file.write(chunk)
                
                # Extract text and skills
                extracted_text = extract_text_from_file(temp_path)
                skills = extract_skills_from_text(extracted_text)
                experience = extract_experience_info(extracted_text)
                
            except Exception as e:
                return Response({
                    'error': {
                        'code': 'FILE_PROCESSING_ERROR',
                        'message': f'Failed to process file: {str(e)}'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            # Prepare data for serializer
            data = request.data.copy()
            if not data.get('name'):
                data['name'] = os.path.splitext(resume_file.name)[0]
            if not data.get('email'):
                data['email'] = 'extracted@email.com'  # Will try to extract from text later
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                # Save resume with extracted data
                # Handle anonymous users by creating or using a default user
                user_to_assign = request.user if request.user.is_authenticated else self.get_or_create_anonymous_user()
                
                resume = serializer.save(
                    uploaded_by=user_to_assign,
                    extracted_text=extracted_text,
                    skills=', '.join(skills) if skills else '',
                    experience=experience
                )
                
                return Response(
                    ResumeSerializer(resume).data,
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response({
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid data provided',
                        'details': serializer.errors
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': {
                    'code': 'UPLOAD_ERROR',
                    'message': f'Upload failed: {str(e)}'
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /api/resumes/:id"""
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    lookup_field = 'id'

# Job Views
class JobListCreateView(generics.ListCreateAPIView):
    """GET /api/jobs and POST /api/jobs"""
    queryset = Job.objects.all()
    pagination_class = LimitOffsetPagination
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobListSerializer
        return JobSerializer
    
    def perform_create(self, serializer):
        # Handle idempotency
        idempotency_key = self.request.headers.get('Idempotency-Key')
        if idempotency_key:
            existing = Job.objects.filter(
                created_by=self.request.user,
                title=serializer.validated_data.get('title'),
                company=serializer.validated_data.get('company')
            ).first()
            if existing:
                return existing
        
        return serializer.save(created_by=self.request.user)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /api/jobs/:id"""
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = 'id'

# Ask Query View
@api_view(['POST'])
def ask_query(request):
    """POST /api/ask - Query resumes with natural language"""
    serializer = AskQuerySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid query parameters',
                'details': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    query = serializer.validated_data['query']
    k = serializer.validated_data['k']
    
    # Get all resumes data
    resumes = Resume.objects.all().values(
        'id', 'name', 'email', 'skills', 'extracted_text'
    )
    
    # Find matching resumes
    results = find_matching_resumes(query, list(resumes))
    
    return Response({
        'query': query,
        'total_results': len(results),
        'results': results[:k]
    })

# Job Matching View
@api_view(['POST'])
def match_job_with_candidates(request, job_id):
    """POST /api/jobs/:id/match - Match job with candidates"""
    job = get_object_or_404(Job, id=job_id)
    
    serializer = MatchJobSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid parameters',
                'details': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    top_n = serializer.validated_data['top_n']
    
    # Get all resumes data
    resumes = Resume.objects.all().values(
        'id', 'name', 'email', 'skills', 'extracted_text'
    )
    
    # Match job with resumes
    job_requirements = f"{job.description} {job.requirements}"
    matches = match_job_with_resumes(job_requirements, list(resumes), top_n)
    
    # Store matches in database for future reference
    for match_data in matches:
        resume = Resume.objects.get(id=match_data['resume_id'])
        job_match, created = JobMatch.objects.get_or_create(
            job=job,
            resume=resume,
            defaults={
                'match_score': match_data['match_score'],
                'matched_skills': ', '.join(match_data['matched_skills']),
                'missing_requirements': ' | '.join(match_data['missing_requirements']),
                'evidence_snippets': ' | '.join(match_data['evidence_snippets'])
            }
        )
        if not created:
            # Update existing match
            job_match.match_score = match_data['match_score']
            job_match.matched_skills = ', '.join(match_data['matched_skills'])
            job_match.missing_requirements = ' | '.join(match_data['missing_requirements'])
            job_match.evidence_snippets = ' | '.join(match_data['evidence_snippets'])
            job_match.save()
    
    return Response({
        'job_id': job_id,
        'job_title': job.title,
        'total_matches': len(matches),
        'matches': matches
    })
