from django.urls import path
from .views import CompanyDetailView, CompanyListView, MyCompanyView
urlpatterns = [path("me/", MyCompanyView.as_view(), name="my-company"), path("", CompanyListView.as_view(), name="company-list"), path("<int:pk>/", CompanyDetailView.as_view(), name="company-detail")]
