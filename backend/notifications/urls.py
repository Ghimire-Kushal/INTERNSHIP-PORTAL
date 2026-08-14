from django.urls import path
from .views import NotificationList,ReadAll,ReadNotification
urlpatterns=[path("",NotificationList.as_view()),path("<int:pk>/read/",ReadNotification.as_view()),path("read-all/",ReadAll.as_view())]
