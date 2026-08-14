from rest_framework import filters, generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Company
from .serializers import CompanySerializer

def employer_company(request):
    if request.user.role != "employer": raise PermissionDenied("This action is available to employer accounts only.")
    return Company.objects.get_or_create(owner=request.user, defaults={"company_name": f"{request.user.get_full_name() or request.user.username}'s Company"})[0]

class MyCompanyView(APIView):
    permission_classes = [IsAuthenticated]; parser_classes = [JSONParser, MultiPartParser, FormParser]
    def get(self, request): return Response(CompanySerializer(employer_company(request), context={"request": request}).data)
    def put(self, request): return self.save(request, False)
    def patch(self, request): return self.save(request, True)
    def save(self, request, partial):
        serializer = CompanySerializer(employer_company(request), data=request.data, partial=partial, context={"request": request}); serializer.is_valid(raise_exception=True); serializer.save()
        return Response(serializer.data)

class CompanyListView(generics.ListAPIView):
    permission_classes = [AllowAny]; serializer_class = CompanySerializer; filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["company_name", "industry", "city", "country"]; ordering_fields = ["company_name", "created_at"]
    queryset = Company.objects.select_related("owner").all()

class CompanyDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]; serializer_class = CompanySerializer; queryset = Company.objects.select_related("owner").all()
