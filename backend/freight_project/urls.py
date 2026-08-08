from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
def home(request):
    return HttpResponse("API Server is Live and Running! 🚀")
urlpatterns = [
     path('', home, name='home'),
    path('favicon.ico', lambda request: HttpResponse(status=204)), 
    
    path('admin/', admin.site.urls),
    
    
    # Matching React endpoint base paths
    path('api/', include('authentication.urls')),
    path('api/admin-panel/', include('admin_panel.urls')),
    path('api/', include('pricing.urls')),
]
