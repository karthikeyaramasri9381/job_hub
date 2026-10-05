"""
URL configuration for JobHub project.
"""
from django.contrib import admin
from django.urls import path, include

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "project": "JobHub API",
        "status": "running",
        "message": "Welcome to JobHub Backend Services",
        "admin": "/admin/",
        "api_endpoints": "/api/jobs/"
    })

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('jobs.urls')),
    path('api/', include('profiles.urls')),
    path('api/', include('companies.urls')),
    path('api/', include('applications.urls')),
    path('api/', include('interviews.urls')),
]

