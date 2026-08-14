from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    class Meta:
        model = Company
        fields = ("id", "company_name", "company_logo", "industry", "company_size", "description", "website", "email", "phone", "address", "city", "country", "founded_year", "is_verified", "owner_name", "created_at", "updated_at")
        read_only_fields = ("id", "is_verified", "owner_name", "created_at", "updated_at")
