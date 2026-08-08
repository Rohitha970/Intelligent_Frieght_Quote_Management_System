from django.urls import path
from . import views

urlpatterns = [
    path('shipments', views.get_shipments, name='get_shipments'),
    path('shipments/<str:shipment_id>/update', views.update_shipment_status, name='update_shipment_status'),
]