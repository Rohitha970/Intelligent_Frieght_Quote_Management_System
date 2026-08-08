from django.urls import path
from . import views

urlpatterns = [
    path('calculate-freight/', views.calculate_freight, name='calculate_freight'),
]