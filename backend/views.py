import os
import jwt
import datetime
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Helper function to generate JWT token and cookie response
def build_auth_response(username, role):
    SECRET_KEY = getattr(settings, 'SECRET_KEY', 'your_super_secret_jwt_key_here')
    
    token_payload = {
        'username': username,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm='HS256')

    response_data = {
        'status': 'success',
        'access_token': token,
        'role': role,
        'username': username
    }
    
    response = Response(response_data, status=status.HTTP_200_OK)
    
    # Attach HttpOnly Cookie
    response.set_cookie(
        'access_token',
        value=token,
        httponly=True,   # Protects token from XSS
        secure=False,    # Set to True in production (HTTPS)
        samesite='Lax',
        max_age=7200     # 2 hours
    )
    return response

# Shared authentication handler logic
def handle_auth(request):
    data = request.data or {}
    username = data.get('username') or data.get('identifier')
    password = data.get('password')
    role_preference = data.get('role', 'user')

    if not username or not password:
        return Response({'message': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        # Validate Password
        if not check_password(password, user.password):
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check standard Django superuser/staff flags to infer role
        role = 'admin' if (user.is_staff or user.is_superuser) else role_preference
    except User.DoesNotExist:
        # Automatic Registration for new user with proper staff permissions
        hashed_pw = make_password(password)
        is_admin = (role_preference == 'admin')
        user = User.objects.create(
            username=username, 
            password=hashed_pw,
            is_staff=is_admin,
            is_superuser=is_admin
        )
        role = role_preference

    return build_auth_response(username, role)

# 1. Your Unified Endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def process_auth(request):
    return handle_auth(request)

# 2. Login Endpoint (For Frontend Compatibility)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    return handle_auth(request)

# 3. Registration Endpoint (For Frontend Compatibility)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    return handle_auth(request)

# 4. Session Verification Endpoint
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_session(request):
    token = request.COOKIES.get('access_token')

    # Fallback to Authorization Header
    if not token and 'HTTP_AUTHORIZATION' in request.META:
        auth_header = request.META['HTTP_AUTHORIZATION']
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

    if not token:
        return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)

    SECRET_KEY = getattr(settings, 'SECRET_KEY', 'your_super_secret_jwt_key_here')

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return Response({'authenticated': True, 'username': data['username'], 'role': data['role']}, status=status.HTTP_200_OK)
    except jwt.ExpiredSignatureError:
        return Response({'authenticated': False, 'message': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'authenticated': False, 'message': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)