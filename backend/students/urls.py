from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CertificateViewSet, EducationViewSet, ExperienceViewSet, MyProfileView, ProjectViewSet, SkillViewSet, StudentSkillViewSet
router = DefaultRouter()
router.register("education", EducationViewSet, basename="education"); router.register("skills", SkillViewSet, basename="skill"); router.register("student-skills", StudentSkillViewSet, basename="student-skill"); router.register("experiences", ExperienceViewSet, basename="experience"); router.register("projects", ProjectViewSet, basename="project"); router.register("certificates", CertificateViewSet, basename="certificate")
urlpatterns = [path("me/", MyProfileView.as_view(), name="student-profile"), path("", include(router.urls))]
