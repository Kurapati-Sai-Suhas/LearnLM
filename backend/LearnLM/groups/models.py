from django.db import models
from django.contrib.auth.models import AbstractUser

# --- 1. The Custom User Model (From previous discussion) ---
class User(AbstractUser):
    # We inherit standard fields (username, password) and add our own:
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, null=True)
    university = models.CharField(max_length=100, blank=True, null=True)
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return self.username

# --- 2. The Study Group Model ---
class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # RELATIONSHIP 1: The Creator (One-to-Many)
    # If the User is deleted, 'CASCADE' means delete their created groups too.
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    # RELATIONSHIP 2: The Members (Many-to-Many)
    # A group has many members; members can join many groups.
    members = models.ManyToManyField(User, related_name='joined_groups', blank=True)
    # Use this code to let people join
    join_code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# --- 3. The Subject/Tag Model (Optional but recommended) ---
# This allows users to filter groups by "Math", "Physics", etc.
class Subject(models.Model):
    name = models.CharField(max_length=50)
    groups = models.ManyToManyField(StudyGroup, related_name='subjects')

    def __str__(self):
        return self.name


class StudyMaterial(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='study_materials/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    study_group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='files')
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
