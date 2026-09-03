from django.contrib.auth.password_validation import validate_password
from django.core import mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role", "phone", "profile_image", "is_verified", "created_at")
        read_only_fields = ("id", "role", "is_verified", "created_at")

    def validate_profile_image(self, value):
        if value and value.size > 3 * 1024 * 1024:
            raise serializers.ValidationError("Profile photo must be 3 MB or smaller.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], style={"input_type": "password"})
    role = serializers.ChoiceField(choices=[User.Role.STUDENT, User.Role.EMPLOYER])

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name", "role")

    def validate_email(self, value):
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, validators=[validate_password], trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def save(self):
        user = User.objects.filter(email__iexact=self.validated_data["email"], is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = self.context["request"].build_absolute_uri("/").rstrip("/")
            from django.conf import settings
            frontend_url = getattr(settings, "FRONTEND_URL", frontend_url)
            link = f"{frontend_url}/reset-password/{uid}/{token}"
            mail.send_mail("Reset your CareerBridge password", f"Open this link to reset your password: {link}", None, [user.email])
        return user


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password], trim_whitespace=False)

    def validate(self, attrs):
        from django.core.exceptions import ValidationError
        from django.utils.encoding import force_str
        from django.utils.http import urlsafe_base64_decode
        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(attrs["uid"])))
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "This password reset link is invalid or expired."})
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"detail": "This password reset link is invalid or expired."})
        attrs["user"] = user
        return attrs
