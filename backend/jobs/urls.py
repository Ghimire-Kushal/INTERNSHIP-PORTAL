from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, JobViewSet
router=DefaultRouter(); router.register("categories",CategoryViewSet,basename="category"); router.register("",JobViewSet,basename="job")
urlpatterns=router.urls
