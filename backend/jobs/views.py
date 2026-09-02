from django.utils import timezone
from django.db.models import Q
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
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
        action = getattr(self, "action", None)
        if action in {"update", "partial_update", "destroy", "mine"}:
            return qs.filter(company__owner=self.request.user)

        public_jobs = qs.filter(status=Job.Status.OPEN, application_deadline__gte=timezone.localdate())
        if action == "retrieve" and self.request.user.is_authenticated:
            return qs.filter(
                Q(company__owner=self.request.user)
                | Q(status=Job.Status.OPEN, application_deadline__gte=timezone.localdate())
            )
        return public_jobs

    def filter_queryset(self, queryset):
        if self.action != "list":
            return queryset

        queryset = super().filter_queryset(queryset)
        job_types = self._query_values("job_type")
        work_modes = self._query_values("work_mode")
        self._validate_choices("job_type", job_types, Job.JobType.values)
        self._validate_choices("work_mode", work_modes, Job.WorkMode.values)

        if job_types:
            queryset = queryset.filter(job_type__in=job_types)
        if work_modes:
            queryset = queryset.filter(work_mode__in=work_modes)

        categories = self._query_values("category")
        if categories:
            category_ids = [value for value in categories if value.isdigit()]
            category_slugs = [value for value in categories if not value.isdigit()]
            category_filter = Q()
            if category_ids:
                category_filter |= Q(category_id__in=category_ids)
            if category_slugs:
                category_filter |= Q(category__slug__in=category_slugs)
            queryset = queryset.filter(category_filter)

        location = self.request.query_params.get("location", "").strip()
        if len(location) > 160:
            raise ValidationError({"location": ["Location must be 160 characters or fewer."]})
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    def _query_values(self, name):
        return [
            value.strip()
            for raw_value in self.request.query_params.getlist(name)
            for value in raw_value.split(",")
            if value.strip()
        ]

    def _validate_choices(self, name, values, allowed_values):
        invalid_values = sorted(set(values) - set(allowed_values))
        if invalid_values:
            raise ValidationError({name: [f"Unsupported value(s): {', '.join(invalid_values)}."]})

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
