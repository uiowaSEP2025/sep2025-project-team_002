from django.urls import path
from .views import report_issue

urlpatterns = [
    path("report_issue/", report_issue, name="report_issue"),
]
