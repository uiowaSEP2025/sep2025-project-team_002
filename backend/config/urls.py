"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import home
    2. Add a URL to urlpatterns:  path('', home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("", include("users.urls")),
    path("admin/", admin.site.urls),
    path("users/", include("users.urls")),
    # path("api/", include("users.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/report/", include("report.urls")),
    path("api/", include("schools.urls")),
    path("api/preferences/", include("preferences.urls")),
]
