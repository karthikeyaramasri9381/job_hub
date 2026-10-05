from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from profiles.models import CandidateProfile, RecruiterProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    profile_id = serializers.SerializerMethodField()
    company_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'google_account', 'profile_id', 'company_id', 'is_active', 'created_at')
        read_only_fields = ('id', 'google_account', 'created_at')

    def get_profile_id(self, obj):
        if obj.role == User.Role.CANDIDATE and hasattr(obj, 'candidate_profile'):
            return obj.candidate_profile.id
        elif obj.role == User.Role.RECRUITER and hasattr(obj, 'recruiter_profile'):
            return obj.recruiter_profile.id
        return None

    def get_company_id(self, obj):
        if obj.role == User.Role.RECRUITER and hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.company:
            return obj.recruiter_profile.company.id
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=[User.Role.CANDIDATE, User.Role.RECRUITER], default=User.Role.CANDIDATE)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.Role.CANDIDATE)
        )

        # Create role profile automatically
        if user.role == User.Role.CANDIDATE:
            full_name = f"{user.first_name} {user.last_name}".strip()
            CandidateProfile.objects.create(user=user, full_name=full_name)
        elif user.role == User.Role.RECRUITER:
            RecruiterProfile.objects.create(user=user)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        # Append user data to the response payload
        data['user'] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)
    role = serializers.ChoiceField(
        choices=[User.Role.CANDIDATE, User.Role.RECRUITER],
        default=User.Role.CANDIDATE,
        required=False
    )
