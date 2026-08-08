from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Shipment

@api_view(['GET'])
@permission_classes([AllowAny])
def get_shipments(request):
    shipments = Shipment.objects.all().values()
    return Response(list(shipments), status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def update_shipment_status(request, shipment_id):
    new_status = request.data.get('status')
    try:
        shipment = Shipment.objects.get(shipment_id=shipment_id)
        shipment.status = new_status
        shipment.save()
        return Response({'message': 'Status updated successfully'}, status=status.HTTP_200_OK)
    except Shipment.DoesNotExist:
        return Response({'message': 'Shipment not found'}, status=status.HTTP_404_NOT_FOUND)