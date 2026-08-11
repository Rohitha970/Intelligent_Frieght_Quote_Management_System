from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import time

@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_freight(request):
    try:
        data = request.data or {}

        def parse_float(val, default=0.0):
            try:
                return float(val) if val is not None else default
            except (ValueError, TypeError):
                return default

        weight = parse_float(data.get('weight') or data.get('weight_kg') or data.get('weightKg'), 100.0)
        distance = parse_float(data.get('distance') or data.get('distanceKm'), 1200.0)
        mode = str(data.get('mode', 'ocean')).lower()
        currency = str(data.get('currency', 'INR')).upper()
        client_estimated_total = parse_float(data.get('client_estimated_total'), 0.0)

        if client_estimated_total > 0:
            total_price = round(client_estimated_total, 2)
            base_price_curr = round(total_price * 0.68, 2)
            fuel_surcharge_curr = round(total_price * 0.15, 2)
            handling_curr = round(total_price * 0.10, 2)
            doc_customs_curr = round(total_price * 0.04, 2)
            peak_season_curr = round(total_price - (base_price_curr + fuel_surcharge_curr + handling_curr + doc_customs_curr), 2)
        else:
            weight = parse_float(data.get('weight') or data.get('weight_kg') or data.get('weightKg'), 100.0)
            distance = parse_float(data.get('distance') or data.get('distanceKm'), 1200.0)
            mode = str(data.get('mode', 'ocean')).lower()

            CURRENCY_FACTORS = {
                'INR': 1.0,
                'USD': 0.012,
                'EUR': 0.011,
                'GBP': 0.0095,
                'AED': 0.044
            }
            factor = CURRENCY_FACTORS.get(currency, 1.0)

            if mode == 'air':
                base_freight = max(18000.0, weight * 280.0 * (1 + distance / 8000.0))
                fuel_surcharge = weight * 45.0
                handling = 6500.0
            elif mode == 'express':
                base_freight = max(35000.0, weight * 580.0)
                fuel_surcharge = weight * 85.0
                handling = 9500.0
            elif mode == 'ground':
                dist_km = distance * 1.15
                base_freight = max(12000.0, dist_km * 28.0)
                fuel_surcharge = weight * 14.0
                handling = 4500.0
            else:  # ocean
                base_freight = max(45000.0, distance * 85.0 + weight * 3.0)
                fuel_surcharge = base_freight * 0.14
                handling = 14500.0

            doc_customs = 4500.0
            peak_season = 3200.0

            total_inr = base_freight + fuel_surcharge + handling + doc_customs + peak_season
            total_price = round(total_inr * factor, 2)
            base_price_curr = round(base_freight * factor, 2)
            fuel_surcharge_curr = round(fuel_surcharge * factor, 2)
            handling_curr = round(handling * factor, 2)
            doc_customs_curr = round(doc_customs * factor, 2)
            peak_season_curr = round(peak_season * factor, 2)

        return Response({
            "success": True,
            "quote_id": f"QT-{str(data.get('mode', 'FT')).upper()}-{int(time.time()) % 100000}",
            "estimated_price": total_price,
            "breakdown": {
                "base_freight": base_price_curr,
                "fuel_surcharge_baf": fuel_surcharge_curr,
                "terminal_handling_thc": handling_curr,
                "documentation_customs": doc_customs_curr,
                "peak_season_isps": peak_season_curr,
                "total_price": total_price
            },
            "currency": currency
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)