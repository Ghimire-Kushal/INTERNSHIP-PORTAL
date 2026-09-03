from rest_framework import serializers
from .models import Application
from .models import SavedJob
from .models import Interview
class InterviewSerializer(serializers.ModelSerializer):
    job_title=serializers.CharField(source="application.job.title",read_only=True)
    class Meta: model=Interview; fields="__all__"; read_only_fields=("application","created_at")
class SavedJobSerializer(serializers.ModelSerializer):
    title=serializers.CharField(source="job.title",read_only=True); company_name=serializers.CharField(source="job.company.company_name",read_only=True)
    class Meta: model=SavedJob; fields=("id","job","title","company_name","saved_at")
class ApplicationSerializer(serializers.ModelSerializer):
    job_title=serializers.CharField(source="job.title",read_only=True); company_name=serializers.CharField(source="job.company.company_name",read_only=True); student_name=serializers.CharField(source="student.get_full_name",read_only=True); student_email=serializers.EmailField(source="student.email",read_only=True)
    class Meta: model=Application; fields="__all__"; read_only_fields=("job","student","status","applied_at","updated_at","employer_note")
    def validate_cv(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("CV must be 5 MB or smaller.")
        if value and value.name.lower().rsplit(".", 1)[-1] not in {"pdf", "doc", "docx"}:
            raise serializers.ValidationError("CV must be a PDF, DOC, or DOCX file.")
        return value
class StatusSerializer(serializers.ModelSerializer):
    class Meta: model=Application; fields=("status","employer_note")
