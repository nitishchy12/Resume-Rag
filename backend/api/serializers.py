from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Resume, Job, JobMatch

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ResumeSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file = serializers.FileField()
    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_by', 'created_at', 'updated_at', 'extracted_text')

class ResumeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing resumes"""
    class Meta:
        model = Resume
        fields = ('id', 'name', 'email', 'phone', 'skills', 'created_at')

class JobSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

class JobListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing jobs"""
    class Meta:
        model = Job
        fields = ('id', 'title', 'company', 'location', 'salary_range', 'created_at')

class JobMatchSerializer(serializers.ModelSerializer):
    resume = ResumeListSerializer(read_only=True)
    job = JobListSerializer(read_only=True)

    class Meta:
        model = JobMatch
        fields = '__all__'

class AskQuerySerializer(serializers.Serializer):
    """Serializer for /api/ask endpoint"""
    query = serializers.CharField(max_length=500)
    k = serializers.IntegerField(default=5, min_value=1, max_value=20)

class MatchJobSerializer(serializers.Serializer):
    """Serializer for /api/jobs/:id/match endpoint"""
    top_n = serializers.IntegerField(default=10, min_value=1, max_value=50)