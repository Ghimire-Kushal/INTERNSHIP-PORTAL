from django.urls import path
from .views import ApplicantsView,ApplyView,MyApplicationsView,UpdateStatusView,WithdrawView
urlpatterns=[path("my/",MyApplicationsView.as_view()),path("<int:pk>/withdraw/",WithdrawView.as_view()),path("<int:pk>/status/",UpdateStatusView.as_view()),path("jobs/<int:job_id>/apply/",ApplyView.as_view()),path("jobs/<int:job_id>/applicants/",ApplicantsView.as_view())]
