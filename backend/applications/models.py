from django.conf import settings
from django.db import models
from jobs.models import Job
class Application(models.Model):
    class Status(models.TextChoices): APPLIED="applied","Applied"; REVIEW="under_review","Under Review"; SHORTLISTED="shortlisted","Shortlisted"; INTERVIEW="interview","Interview"; SELECTED="selected","Selected"; REJECTED="rejected","Rejected"; WITHDRAWN="withdrawn","Withdrawn"
    job=models.ForeignKey(Job,on_delete=models.CASCADE,related_name="applications"); student=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="applications"); cover_letter=models.TextField(blank=True); cv=models.FileField(upload_to="application-cvs/",blank=True,null=True); status=models.CharField(max_length=20,choices=Status.choices,default=Status.APPLIED,db_index=True); applied_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True); employer_note=models.TextField(blank=True)
    class Meta: constraints=[models.UniqueConstraint(fields=["job","student"],name="unique_job_application")]; ordering=["-applied_at"]
