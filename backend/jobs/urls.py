from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, JobAlertViewSet, JobViewSet
router=DefaultRouter(); router.register("categories",CategoryViewSet,basename="category"); router.register("alerts",JobAlertViewSet,basename="job-alert"); router.register("",JobViewSet,basename="job")
urlpatterns=router.urls
