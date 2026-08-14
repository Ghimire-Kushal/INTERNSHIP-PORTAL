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
