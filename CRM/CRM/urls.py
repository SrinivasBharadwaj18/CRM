from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Include insurer app APIs
    path("api/", include("insurer.urls")),
]