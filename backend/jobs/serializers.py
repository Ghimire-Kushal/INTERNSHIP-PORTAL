from django.utils import timezone
from rest_framework import serializers
from .models import Category, Job
class CategorySerializer(serializers.ModelSerializer):
    class Meta: model=Category; fields=("id","name","slug","description")
class JobSerializer(serializers.ModelSerializer):
    company_name=serializers.CharField(source="company.company_name",read_only=True); category_name=serializers.CharField(source="category.name",read_only=True)
    class Meta:
        model=Job; fields="__all__"; read_only_fields=("company","slug","posted_date","views","created_at","updated_at")
    def validate(self, attrs):
        salary_min = attrs.get("salary_min", getattr(self.instance, "salary_min", None))
        salary_max = attrs.get("salary_max", getattr(self.instance, "salary_max", None))
        if salary_min is not None and salary_max is not None and salary_min > salary_max:
            raise serializers.ValidationError({"salary_min": "Minimum salary cannot exceed maximum salary."})
        deadline=attrs.get("application_deadline")
        if deadline and deadline < timezone.localdate(): raise serializers.ValidationError({"application_deadline":"Deadline cannot be in the past."})
        return attrs
