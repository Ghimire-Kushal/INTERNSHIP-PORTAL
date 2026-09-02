from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from applications.models import Application, Interview, SavedJob
from companies.models import Company
from jobs.models import Job
from users.models import User
class DashboardView(APIView):
 permission_classes=[IsAuthenticated]
 def get(self,request):
  user=request.user
  if user.role=="student":
   qs=Application.objects.filter(student=user);return Response({"applications":qs.count(),"shortlisted":qs.filter(status="shortlisted").count(),"interviews":Interview.objects.filter(application__student=user).count(),"saved_jobs":SavedJob.objects.filter(student=user).count()})
  if user.role=="employer":
   jobs=Job.objects.filter(company__owner=user);apps=Application.objects.filter(job__in=jobs);return Response({"active_jobs":jobs.filter(status="open", application_deadline__gte=timezone.localdate()).count(),"total_jobs":jobs.count(),"applications":apps.count(),"shortlisted":apps.filter(status="shortlisted").count(),"selected":apps.filter(status="selected").count()})
  return Response({"users":User.objects.count(),"students":User.objects.filter(role="student").count(),"employers":User.objects.filter(role="employer").count(),"companies":Company.objects.count(),"jobs":Job.objects.count(),"applications":Application.objects.count()})
