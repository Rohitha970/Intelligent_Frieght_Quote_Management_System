from django.urls import path
from . import views

urlpatterns = [
    # Login routes[cite: 3]
    path('login/', views.login, name='login'),
    path('login', views.login),

    # Register routes[cite: 3]
    path('register/', views.register, name='register'),
    path('register', views.register),
]