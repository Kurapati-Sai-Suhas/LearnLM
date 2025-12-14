from rest_framework import serializers
from .models import StudyGroup, StudyMaterial
from django.contrib.auth import get_user_model

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'university', 'bio', 'role']
        # Rule 1: Hide the Password
        # 'write_only': True -> Frontend can SEND password, but Backend NEVER sends it back.
        extra_kwargs = {'password': {'write_only': True}}

    # Rule 2: Hash the Password
    def create(self, validated_data):
        # We override the default 'create' function.
        # 1. Grab the password from the data
        password = validated_data.pop('password', None)
        # 2. Create the user object (but don't save to DB yet)
        # instance = User(username="suhas", email="...", university="...")
        instance = self.Meta.model(**validated_data)
        # 3. The Magic Step: Hash the password
        if password is not None:
            instance.set_password(password) # Turns "123" into "pbkdf2_sha256$..."
        # 4. Save to DB
        instance.save()
        return instance


class StudyGroupSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = StudyGroup
        fields = ['id', 'name', 'description','join_code', 'created_at']

class StudyMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyMaterial
        fields = ['id', 'title', 'file', 'uploaded_by', 'study_group', 'upload_date']
        # We read these (GET), but we don't ask user to input them (POST)
        # The backend sets them automatically.
        read_only_fields = ['uploaded_by', 'upload_date']


