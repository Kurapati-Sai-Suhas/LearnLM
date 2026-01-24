from rest_framework import serializers
from .models import StudyGroup, StudyMaterial
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
