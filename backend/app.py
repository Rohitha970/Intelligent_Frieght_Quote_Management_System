from flask import Flask, request, jsonify, make_response
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_jwt_key_here'

# Unified Login / Register Endpoint
@app.route('/api/auth/process-auth', methods=['POST'])
def process_auth():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    # Replace with your actual database queries
    user = find_user_in_db(username) 
    
    if user:
        # Existing User -> Validate Password
        if not check_password_hash(user['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        role = user.get('role', 'user')
    else:
        # New User -> Automatic Registration
        hashed_pw = generate_password_hash(password)
        user = create_user_in_db(username, hashed_pw, role='user')
        role = 'user'

    # Create JWT Token
    token_payload = {
        'username': username,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')

    # Send response and attach HttpOnly cookie
    response = make_response(jsonify({
        'status': 'success',
        'role': role,
        'username': username
    }))

    response.set_cookie(
        'access_token',
        value=token,
        httponly=True,   # Saves token safely from XSS script access
        secure=False,    # Set to True in production (HTTPS)
        samesite='Lax',  # Protects against CSRF attacks
        max_age=7200     # Token expires in 2 hours
    )

    return response, 200

# Auth Verification Endpoint for Page Reloads
@app.route('/api/auth/verify', methods=['GET'])
def verify_session():
    token = request.cookies.get('access_token')
    if not token:
        return jsonify({'authenticated': False}), 401
    
    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return jsonify({'authenticated': True, 'username': data['username'], 'role': data['role']}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'authenticated': False, 'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'authenticated': False, 'message': 'Invalid token'}), 401