from django.db import models
from django.contrib.auth.models import User
import uuid

class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    file = models.FileField(upload_to='resumes/')
    extracted_text = models.TextField(blank=True)
    skills = models.TextField(blank=True)  # Comma-separated skills
    experience = models.TextField(blank=True)
    education = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.email}"

class Job(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobMatch(models.Model):
    """Stores job-resume matching results"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    match_score = models.FloatField()
    matched_skills = models.TextField(blank=True)
    missing_requirements = models.TextField(blank=True)
    evidence_snippets = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-match_score']
        unique_together = ['job', 'resume']

    def __str__(self):
        return f"Match: {self.resume.name} -> {self.job.title} ({self.match_score:.2f})"
