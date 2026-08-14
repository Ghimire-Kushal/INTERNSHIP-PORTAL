from django.conf import settings
from django.db import models

class Company(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company")
    company_name = models.CharField(max_length=180, db_index=True)
    company_logo = models.ImageField(upload_to="company-logos/", blank=True, null=True)
    industry = models.CharField(max_length=120, blank=True, db_index=True)
    company_size = models.CharField(max_length=60, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    country = models.CharField(max_length=100, blank=True)
    founded_year = models.PositiveSmallIntegerField(blank=True, null=True)
    is_verified = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: ordering = ["company_name"]
    def __str__(self): return self.company_name
