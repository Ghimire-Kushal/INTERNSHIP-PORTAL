from django.utils import timezone
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from companies.models import Company
from .models import Category, Job
from .serializers import CategorySerializer, JobSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset=Category.objects.all(); serializer_class=CategorySerializer; permission_classes=[AllowAny]; pagination_class=None
class JobViewSet(viewsets.ModelViewSet):
    serializer_class=JobSerializer; filter_backends=[filters.SearchFilter,filters.OrderingFilter]; search_fields=["title","company__company_name","skills_required","location"]; ordering_fields=["created_at","salary_min","application_deadline","views"]
    def get_queryset(self):
        qs=Job.objects.select_related("company","category")
        if self.action in {"create","update","partial_update","destroy","mine"}:
            return qs.filter(company__owner=self.request.user)
        return qs.filter(status=Job.Status.OPEN,application_deadline__gte=timezone.localdate())
    def get_permissions(self): return [AllowAny()] if self.action in {"list","retrieve"} else [IsAuthenticated()]
    def perform_create(self, serializer):
        if self.request.user.role != "employer": raise PermissionDenied("Only employers can post jobs.")
        company=Company.objects.filter(owner=self.request.user).first()
        if not company: raise PermissionDenied("Create your company profile before posting a job.")
        serializer.save(company=company)
    @action(detail=False, methods=["get"])
    def mine(self, request):
        if request.user.role != "employer": raise PermissionDenied("Only employers can manage jobs.")
        return Response(self.get_serializer(self.get_queryset(),many=True).data)
    @action(detail=False, methods=["get"])
    def recommended(self, request):
        if not request.user.is_authenticated or request.user.role != "student": raise PermissionDenied("Student account required.")
        profile = getattr(request.user, "student_profile", None)
        skills = [] if not profile else list(profile.student_skills.values_list("skill__name", flat=True))
        jobs = Job.objects.select_related("company", "category").filter(status=Job.Status.OPEN, application_deadline__gte=timezone.localdate())
        ranked = []
        for job in jobs:
            score = sum(skill.lower() in job.skills_required.lower() for skill in skills) * 20
            if profile and profile.city and profile.city.lower() in job.location.lower(): score += 15
            ranked.append((min(score, 100), job))
        ranked.sort(key=lambda item: item[0], reverse=True)
        data = self.get_serializer([job for _, job in ranked[:10]], many=True).data
        for payload, (score, _) in zip(data, ranked): payload["match_percentage"] = score
        return Response(data)
