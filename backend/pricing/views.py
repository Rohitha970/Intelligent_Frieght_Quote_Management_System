from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_freight(request):
    try:
        data = request.data or {}

        def parse_float(val):
            try:
                return float(val) if val is not None else 0.0
            except (ValueError, TypeError):
                return 0.0

        weight = parse_float(data.get('weight') or data.get('weightKg') or data.get('weight_kg'))
        distance = parse_float(data.get('distance') or data.get('distanceKm') or 1000)

        base_rate = 50.0
        calculated_price = base_rate + (weight * 2.5) + (distance * 1.5)

        return Response({
            "success": True,
            "quote_id": f"QT-{request.data.get('mode', 'FT').upper()}-1001",
            "estimated_price": round(calculated_price, 2),
            "breakdown": {
                "base_freight": round(base_rate + (distance * 1.5), 2),
                "fuel_surcharge": round(weight * 2.5, 2),
                "total_price": round(calculated_price, 2)
            },
            "currency": "INR"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)