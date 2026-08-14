from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Certificate, Education, Experience, Project, Skill, StudentProfile, StudentSkill
from .permissions import IsStudent
from .serializers import CertificateSerializer, EducationSerializer, ExperienceSerializer, ProjectSerializer, SkillSerializer, StudentProfileSerializer, StudentSkillSerializer

def profile_for(request):
    if request.user.role != "student": raise PermissionDenied("This action is available to student accounts only.")
    return StudentProfile.objects.get_or_create(user=request.user)[0]

class MyProfileView(APIView):
    permission_classes = [IsStudent]; parser_classes = [MultiPartParser, FormParser, JSONParser]
    def get(self, request):
        profile = profile_for(request); profile.profile_completion = profile.calculate_completion(); profile.save(update_fields=["profile_completion"])
        return Response(StudentProfileSerializer(profile, context={"request": request}).data)
    def put(self, request): return self._save(request, partial=False)
    def patch(self, request): return self._save(request, partial=True)
    def _save(self, request, partial):
        serializer = StudentProfileSerializer(profile_for(request), data=request.data, partial=partial, context={"request": request}); serializer.is_valid(raise_exception=True); serializer.save()
        profile = serializer.instance; profile.profile_completion = profile.calculate_completion(); profile.save(update_fields=["profile_completion"])
        return Response(StudentProfileSerializer(profile, context={"request": request}).data)

class StudentOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStudent]
    def get_profile(self): return profile_for(self.request)
    def get_queryset(self): return self.queryset.filter(student=self.get_profile())
    def perform_create(self, serializer): serializer.save(student=self.get_profile())

class EducationViewSet(StudentOwnedViewSet): queryset = Education.objects.all(); serializer_class = EducationSerializer
class ExperienceViewSet(StudentOwnedViewSet): queryset = Experience.objects.all(); serializer_class = ExperienceSerializer
class ProjectViewSet(StudentOwnedViewSet): queryset = Project.objects.all(); serializer_class = ProjectSerializer
class CertificateViewSet(StudentOwnedViewSet): queryset = Certificate.objects.all(); serializer_class = CertificateSerializer
class StudentSkillViewSet(StudentOwnedViewSet): queryset = StudentSkill.objects.select_related("skill"); serializer_class = StudentSkillSerializer
class SkillViewSet(viewsets.ReadOnlyModelViewSet): permission_classes = [IsStudent]; queryset = Skill.objects.all(); serializer_class = SkillSerializer; pagination_class = None
