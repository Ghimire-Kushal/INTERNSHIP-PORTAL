from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from jobs.models import Job
from .models import Application
from .serializers import ApplicationSerializer, StatusSerializer
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
