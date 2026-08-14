from django.contrib import admin
from .models import Category, Job
admin.site.register(Category)
@admin.register(Job)
class JobAdmin(admin.ModelAdmin): list_display=("title","company","status","application_deadline"); list_filter=("status","job_type","work_mode")
