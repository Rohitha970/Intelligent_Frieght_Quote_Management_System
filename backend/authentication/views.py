import json
import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

# --- REGISTER VIEW ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body)
        
        email = data.get('email')
        password = data.get('password')
        username = data.get('username') or (email.split('@')[0] if email else None)
        role = data.get('role', 'user')
        admin_passcode = data.get('admin_passcode', '')

        if not email or not password:
            return Response({'error': 'Email and Password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if role == 'admin' and admin_passcode != 'freighthub-admin-123':
            return Response({'error': 'Invalid Admin Passcode.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            username = f"{username}{random.randint(100, 999)}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        if hasattr(user, 'role'):
            user.role = role
            user.save()

        return Response({
            'message': 'User registered successfully!',
            'token': f'session-token-{user.id}', 
            'user': {'email': user.email, 'username': user.username, 'role': role}
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("REGISTRATION ERROR:", str(e))
        return Response({'error': f'Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- LOGIN VIEW ---
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body)
        
        email_or_username = data.get('email') or data.get('username')
        password = data.get('password')

        if not email_or_username or not password:
            return Response({'error': 'Please provide email/username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        user_obj = User.objects.filter(email=email_or_username).first() or User.objects.filter(username=email_or_username).first()

        if user_obj is None:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        user_role = getattr(user, 'role', 'user')

        return Response({
            'message': 'Login successful!',
            'token': f'session-token-{user.id}',
            'user': {
                'email': user.email,
                'username': user.username,
                'role': user_role
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        return Response({'error': f'Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- PLACEHOLDER VIEWS TO PREVENT CRASHES IF ACCESSED ---
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def process_auth(request):
    return Response({'status': 'ok'})

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def verify_session(request):
    return Response({'status': 'verified'})