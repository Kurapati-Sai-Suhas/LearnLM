

from rest_framework import serializers
from .models import StudyGroup, StudyMaterial, QuizResult,Connection,AssignedQuiz
from django.contrib.auth import get_user_model

User = get_user_model()

class StudyGroupMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ['id', 'name']

# --- 1. The "Mini" Serializer (For Displaying Names) ---
# We use this inside Groups and Materials to show "Alice" instead of "ID: 5"
class UserDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'university', 'role']


# --- 2. The Main User Serializer (For Registration) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'university', 'bio', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


# --- 3. The Study Group Serializer (Updated) ---
class StudyGroupSerializer(serializers.ModelSerializer):
    # 👇 CHANGE 1: We use the "Mini" serializer for the creator
    creator = UserDisplaySerializer(read_only=True)
    # 👇 CHANGE 2: We use the "Mini" serializer for members too!
    # (Your previous code used the heavy UserSerializer here)
    members = UserDisplaySerializer(many=True, read_only=True)
    id = serializers.CharField(read_only=True)

    class Meta:
        model = StudyGroup
        # Don't forget to add 'creator' to the fields list!
        fields = ['id', 'name', 'description', 'creator', 'members', 'join_code', 'created_at', 'capacity']


# --- 4. The Study Material Serializer ---
class StudyMaterialSerializer(serializers.ModelSerializer):
    # 👇 BONUS: Let's show the uploader's name too!
    study_group = StudyGroupMiniSerializer(read_only=True)
    uploaded_by = UserDisplaySerializer(read_only=True)

    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'file', 'uploaded_by', 'study_group', 'upload_date']
        read_only_fields = ['uploaded_by', 'upload_date']

class QuizResultSerializer(serializers.ModelSerializer):
    user = UserDisplaySerializer(read_only=True)
    study_group = StudyGroupMiniSerializer(read_only=True)

    class Meta:
        model = QuizResult
        fields = ['id', 'user', 'study_group', 'score', 'date_taken']
        read_only_fields = ['user', 'study_group', 'date_taken']

class AssignedQuizSerializer(serializers.ModelSerializer):
    # This creates the nice "Assigned by: Admin" text for the frontend
    creator_name = serializers.ReadOnlyField(source='assigned_by.username')

    class Meta:
        model = AssignedQuiz
        fields = ['id', 'study_group', 'assigned_by', 'topic', 'quiz_data', 'deadline', 'assigned_at', 'creator_name']
        read_only_fields = ['assigned_by', 'assigned_at'] 
class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# 2. The Profile Serializer
class ProfileSerializer(serializers.ModelSerializer):
    # This nests the User info inside the Profile, so React gets everything at once!
    user = UserBasicSerializer(read_only=True)
    class Meta:
        model = User
        # Add whatever fields you put in your models.py!
        fields = ['id', 'user', 'skills', 'achievements', 'major', 'graduation_year', 'bio']

# 3. The Friend Request / Connection Serializer
class ConnectionSerializer(serializers.ModelSerializer):
    # When we fetch a friend request, we want to see WHO sent it and WHO received it
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']
