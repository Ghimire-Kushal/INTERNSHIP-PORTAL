from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from jobs.models import Job
from .models import Application
from .models import SavedJob
from .serializers import ApplicationSerializer, StatusSerializer
from .serializers import SavedJobSerializer
from .models import Interview
from .serializers import InterviewSerializer
class InterviewsView(generics.ListCreateAPIView):
 permission_classes=[IsAuthenticated];serializer_class=InterviewSerializer
 def get_queryset(self):
  qs=Interview.objects.select_related("application__job")
  return qs.filter(application__job__company__owner=self.request.user) if self.request.user.role=="employer" else qs.filter(application__student=self.request.user)
 def post(self,request):
  if request.user.role!="employer": raise PermissionDenied("Only employers can schedule interviews.")
  application=Application.objects.filter(pk=request.data.get("application"),job__company__owner=request.user).first()
  if not application: raise PermissionDenied("Application not found.")
  serializer=InterviewSerializer(data=request.data);serializer.is_valid(raise_exception=True);serializer.save(application=application);application.status=Application.Status.INTERVIEW;application.save(update_fields=["status","updated_at"]);return Response(serializer.data,status=201)
class SavedJobsView(generics.ListCreateAPIView):
 permission_classes=[IsAuthenticated];serializer_class=SavedJobSerializer
 def get_queryset(self): return SavedJob.objects.filter(student=self.request.user).select_related("job__company")
 def post(self,request):
  if request.user.role!="student": raise PermissionDenied("Student account required.")
  job=Job.objects.filter(pk=request.data.get("job"),status="open").first()
  if not job: raise ValidationError("Job not found.")
  saved,_=SavedJob.objects.get_or_create(student=request.user,job=job);return Response(SavedJobSerializer(saved).data,status=201)
class SavedJobDetailView(APIView):
 permission_classes=[IsAuthenticated]
 def delete(self,request,pk): SavedJob.objects.filter(pk=pk,student=request.user).delete();return Response(status=204)
class ApplyView(APIView):
 permission_classes=[IsAuthenticated]
 def post(self,request,job_id):
  if request.user.role!="student": raise PermissionDenied("Only students can apply.")
  job=Job.objects.filter(pk=job_id,status="open",application_deadline__gte=timezone.localdate()).first()
  if not job: raise ValidationError("This job is not accepting applications.")
  if Application.objects.filter(job=job,student=request.user).exists(): raise ValidationError("You have already applied for this job.")
  serializer=ApplicationSerializer(data=request.data);serializer.is_valid(raise_exception=True);serializer.save(job=job,student=request.user);return Response(serializer.data,status=201)
class MyApplicationsView(generics.ListAPIView):
 permission_classes=[IsAuthenticated];serializer_class=ApplicationSerializer
 def get_queryset(self):
  if self.request.user.role!="student": raise PermissionDenied("Student account required.")
  return Application.objects.filter(student=self.request.user).select_related("job__company")
class WithdrawView(APIView):
 permission_classes=[IsAuthenticated]
 def patch(self,request,pk):
  application=Application.objects.filter(pk=pk,student=request.user).first()
  if not application: raise PermissionDenied("Application not found.")
  application.status=Application.Status.WITHDRAWN;application.save(update_fields=["status","updated_at"]);return Response(ApplicationSerializer(application).data)
class ApplicantsView(generics.ListAPIView):
 permission_classes=[IsAuthenticated];serializer_class=ApplicationSerializer
 def get_queryset(self):
  if self.request.user.role!="employer": raise PermissionDenied("Employer account required.")
  return Application.objects.filter(job_id=self.kwargs["job_id"],job__company__owner=self.request.user).select_related("student","job__company")
class UpdateStatusView(APIView):
 permission_classes=[IsAuthenticated]
 def patch(self,request,pk):
  application=Application.objects.filter(pk=pk,job__company__owner=request.user).first()
  if not application or request.user.role!="employer": raise PermissionDenied("You cannot update this application.")
  serializer=StatusSerializer(application,data=request.data,partial=True);serializer.is_valid(raise_exception=True);serializer.save();return Response(ApplicationSerializer(application).data)
