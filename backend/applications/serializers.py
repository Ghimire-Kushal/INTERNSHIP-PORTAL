from rest_framework import serializers
from .models import Application
class ApplicationSerializer(serializers.ModelSerializer):
    job_title=serializers.CharField(source="job.title",read_only=True); company_name=serializers.CharField(source="job.company.company_name",read_only=True); student_name=serializers.CharField(source="student.get_full_name",read_only=True); student_email=serializers.EmailField(source="student.email",read_only=True)
    class Meta: model=Application; fields="__all__"; read_only_fields=("job","student","status","applied_at","updated_at","employer_note")
class StatusSerializer(serializers.ModelSerializer):
    class Meta: model=Application; fields=("status","employer_note")
