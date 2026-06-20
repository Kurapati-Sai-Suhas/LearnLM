from rest_framework import serializers
from .models import StudyGroup, StudyMaterial, QuizResult, Connection, AssignedQuiz, CodingPortal, Profile
from django.contrib.auth import get_user_model

User = get_user_model()

class StudyGroupMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ['id', 'name']

class UserDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'university', 'role']

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

# 👇 NEW: The Global Coding Portal Serializer
class CodingPortalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingPortal
        fields = ['id', 'name', 'description', 'is_active']

# --- 3. The Study Group Serializer (Updated) ---
class StudyGroupSerializer(serializers.ModelSerializer):
    creator = UserDisplaySerializer(read_only=True)
    members = UserDisplaySerializer(many=True, read_only=True)
    id = serializers.CharField(read_only=True)
    
    # 👇 NEW: Groups now return their subscribed global portals!
    active_portals = CodingPortalSerializer(many=True, read_only=True)

    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description', 'creator', 'members', 'join_code', 'created_at', 'capacity', 'active_portals']

class StudyMaterialSerializer(serializers.ModelSerializer):
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
    creator_name = serializers.ReadOnlyField(source='assigned_by.username')

    class Meta:
        model = AssignedQuiz
        fields = ['id', 'study_group', 'assigned_by', 'topic', 'quiz_data', 'deadline', 'assigned_at', 'creator_name']
        read_only_fields = ['assigned_by', 'assigned_at'] 

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    class Meta:
        model = Profile
        fields = ['id', 'user', 'skills', 'achievements', 'major', 'graduation_year', 'bio']

class ConnectionSerializer(serializers.ModelSerializer):
    sender = UserBasicSerializer(read_only=True)
    receiver = UserBasicSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']