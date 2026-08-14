from rest_framework import serializers
from .models import Certificate, Education, Experience, Project, Skill, StudentProfile, StudentSkill

class StudentProfileSerializer(serializers.ModelSerializer):
    profile_completion = serializers.IntegerField(read_only=True)
    cv = serializers.FileField(required=False, allow_null=True)
    class Meta:
        model = StudentProfile
        exclude = ("user",)
        read_only_fields = ("profile_completion",)
    def validate_cv(self, value):
        if value is None:
            return value
        if value.size > 5 * 1024 * 1024: raise serializers.ValidationError("CV must be 5 MB or smaller.")
        return value

class EducationSerializer(serializers.ModelSerializer):
    class Meta: model = Education; exclude = ("student",)
class SkillSerializer(serializers.ModelSerializer):
    class Meta: model = Skill; fields = ("id", "name")
class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    class Meta: model = StudentSkill; fields = ("id", "skill", "skill_name", "proficiency")
class ExperienceSerializer(serializers.ModelSerializer):
    class Meta: model = Experience; exclude = ("student",)
class ProjectSerializer(serializers.ModelSerializer):
    class Meta: model = Project; exclude = ("student",)
class CertificateSerializer(serializers.ModelSerializer):
    class Meta: model = Certificate; exclude = ("student",)
