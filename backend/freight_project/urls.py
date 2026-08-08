from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    
    # Matching React endpoint base paths
    path('api/', include('authentication.urls')),
    path('api/admin-panel/', include('admin_panel.urls')),
    path('api/', include('pricing.urls')),
]
