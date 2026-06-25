from flask import Blueprint, request, jsonify
from flask_jwt_extended import (create_access_token, jwt_required, get_jwt_identity)
from models import User
import services
from datetime import datetime

auth_bp = Blueprint('auth', __name__)
business_bp = Blueprint('business', __name__)
booking_bp = Blueprint('booking', __name__)
customer_bp = Blueprint('customer', __name__)
admin_bp = Blueprint('admin', __name__)
category_bp = Blueprint('category', __name__)  # new blueprint for categories

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Nestly app is running!"}), 200

# USER SIGN UP AND LOG IN
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    user, error = services.signup_user(data)

    if error:
        return jsonify({'error': error}), 400

    # generating JWT token
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user, error = services.login_user(data)

    if error:
        return jsonify({'error': error}), 401

    # generating JWT token
    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()

    # SELECT * FROM users WHERE id = :user_id
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'User': user.to_dict()}), 200

@ auth_bp.route('/logout', methods=['POST'])
@ jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

# business registration
@business_bp.route('', methods=['POST'])
@jwt_required()
def create_business():
    user_id = get_jwt_identity()
    data = request.get_json()

    business, error = services.create_business(user_id, data)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({
        'message': 'Business created successfully',
        'business': business.to_dict()
    }), 201

@business_bp.route('/<int:business_id>', methods=['GET'])
def get_business(business_id):
    business, error = services.get_business(business_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify({'business': business.to_full_dict()}), 200

@business_bp.route('/<int:business_id>', methods=['PUT'])
@jwt_required()
def update_business(business_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    business, error = services.update_business(business_id, user_id, data)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Business updated successfully',
        'business': business.to_dict()
    }), 200

@business_bp.route('/<int:business_id>/status', methods=['PUT'])
@jwt_required()
def update_business_status(business_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    new_status = data.get('status')

    business, error = services.update_business_status(business_id, user_id, new_status)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': f'Business status updated to {new_status}',
        'business': business.to_dict()
    }), 200

@business_bp.route('/<int:business_id>/hours', methods=['POST'])
@jwt_required()
def set_working_hours(business_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    hours, error = services.set_working_hours(business_id, user_id, data)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Working hours set and saved successfully',
        'hours': [h.to_dict() for h in hours]
    }), 201

@business_bp.route('/<int:business_id>/hours', methods=['GET'])
def get_working_hours(business_id):
    hours, error = services.get_working_hours(business_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'business_id': business_id,
        'hours': [h.to_dict() for h in hours]
    }), 200

# SERVICE MANAGEMENT
@business_bp.route('/<int:business_id>/services', methods=['POST'])
@jwt_required()
def create_service(business_id):
    user_id  = get_jwt_identity()
    data = request.get_json()

    service, error = services.create_service(business_id, user_id, data)
    if error:
        return jsonify({'error': error}), 400
    return jsonify({
        'message': 'Service created successfully',
        'service': service.to_dict()
    }), 201

@business_bp.route('/<int:business_id>/services', methods=['GET'])
def get_services(business_id):
    services_list, error = services.get_services(business_id)
    if error:
        return jsonify({'error': error}), 404
    return jsonify({'services': [s.to_full_dict() for s in services_list]}), 200

@business_bp.route('/<int:business_id>/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(business_id, service_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    service, error = services.update_service(business_id, service_id, user_id, data)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Service updated successfully',
        'service': service.to_full_dict()
    }), 200

# updating the toggle
@business_bp.route('/<int:business_id>/services/<int:service_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_service(business_id, service_id):
    user_id = get_jwt_identity()

    service, error = services.toggle_service(business_id, service_id, user_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': f'Service {"actived" if service.is_active else "deactived"} successfully',
        'service': service.to_dict()
    }), 200

# deleting a service
@business_bp.route('/<int:business_id>/services/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(business_id, service_id):
    user_id = get_jwt_identity()

    success, error = services.delete_service(business_id, service_id, user_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Service deleted successfully'
    }), 200

# PHOTO ROUTES
@business_bp.route('/<int:business_id>/photos', methods=['POST'])
@jwt_required()
def upload_business_photo(business_id):
    user_id = get_jwt_identity()
    file = request.files.get('photo')

    photo, error = services.upload_business_photo(business_id, user_id, file)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Photo uploaded successfully',
        'photo': photo.to_dict()
    }), 201

@business_bp.route('/<int:business_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_business_photo(business_id, photo_id):
    user_id = get_jwt_identity()

    success, error = services.delete_business_photo(business_id, photo_id, user_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Photo deleted successfully'
    }), 200

@business_bp.route('/<int:business_id>/services/<int:service_id>/photos', methods=['POST'])
@jwt_required()
def upload_service_photo(business_id, service_id):
    user_id = get_jwt_identity()
    file = request.files.get('photo')

    photo, error = services.upload_service_photo(business_id, service_id, user_id, file)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Photo uploaded successfully',
        'photo': photo.to_dict()
    }), 201

@business_bp.route('/<int:business_id>/services/<int:service_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_service_photo(business_id, service_id, photo_id):
    user_id = get_jwt_identity()

    success, error = services.delete_service_photo(business_id, service_id, photo_id, user_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Photo deleted successfully'
    }), 200

# blocked time routes
@business_bp.route('/<int:business_id>/blocked-times', methods=['POST'])
@jwt_required()
def create_blocked_time(business_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    blocked, error = services.create_blocked_time(business_id, user_id, data)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Blocked time created successfully',
        'blocked_time': blocked.to_dict()
    }), 201

@business_bp.route('/<int:business_id>/blocked-times', methods=['GET'])
def get_blocked_times(business_id):
    blocked, error = services.get_blocked_times(business_id)
    if error:
        return jsonify({'error': error}), 404

    return jsonify({
        'business_id': business_id,
        'blocked_times': [bt.to_dict() for bt in blocked]
    }), 200

@business_bp.route('/<int:business_id>/blocked-times/<int:blocked_time_id>', methods=['DELETE'])
@jwt_required()
def delete_blocked_time(business_id, blocked_time_id):
    user_id = get_jwt_identity()

    success, error = services.delete_blocked_time(business_id, blocked_time_id, user_id)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Blocked time deleted successfully'
    }), 200

# CUSTOMER BROWSING
# getting all categories
@category_bp.route('', methods=['GET'])
def get_categories():
    categories, error = services.get_categories()
    if error:
        return jsonify({'error': error}), 404

    return jsonify({
        'categories': [c.to_dict() for c in categories]
    }), 200

# getting all businesses
@business_bp.route('', methods=['GET'])
def get_all_businesses():
    filters = {
        'category_id': request.args.get('category_id'),
        'search': request.args.get('search'),
        'min_price': request.args.get('min_price'),
        'max_price': request.args.get('max_price'),
        'lat': request.args.get('lat'),
        'lon': request.args.get('lon'),
        'max_distance': request.args.get('max_distance')
    }
    businesses, error = services.get_all_businesses(filters)
    if error:
        return jsonify({'error': error}), 404
    return jsonify({
        'businesses': [b.to_dict() for b in businesses]
    }), 200

@booking_bp.route('/availability', methods=['GET'])
def get_availability():
    business_id = request.args.get('business_id')
    service_id = request.args.get('service_id')
    date_str = request.args.get('date')

    # ensuring all the required parameters are provided
    if not business_id or not service_id or not date_str:
        return jsonify({
            'error': 'business_id, service_id and date are required'
        }), 400

    # converting date string to date object
    # expecting format: 2026-06-25
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }), 400

    windows, error = services.get_available_windows(int(business_id), int(service_id), date)

    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'business_id': int(business_id),
        'service_id': int(service_id),
        'date': date_str,
        'available_windows': windows
    }), 200

# booking
@booking_bp.route('', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()

    booking, error = services.create_booking(user_id, data)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Booking created successfully',
        'booking': booking.to_dict()
    }), 201

# customer bookings
@booking_bp.route('', methods=['GET'])
@jwt_required()
def get_customer_bookings():
    user_id = get_jwt_identity()
    bookings, error = services.get_customer_bookings(user_id)

    if error:
        return jsonify({'error': error}), 404

    return jsonify({
        'bookings': [b.to_dict() for b in bookings]
    }), 200

# customer cancelling a booking
@booking_bp.route('/<int:booking_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_booking(booking_id):
    user_id = get_jwt_identity()

    booking, error = services.cancel_booking(booking_id, user_id)

    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Booking cancelled successfully',
        'booking': booking.to_dict()
    }), 200

# business owner cancelling a booking
@booking_bp.route('/<int:booking_id>/cancel-by-business', methods=['PATCH'])
@jwt_required()
def cancel_booking_by_business(booking_id):
    user_id = get_jwt_identity()

    booking, error = services.cancel_booking_by_business(booking_id, user_id)

    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'message': 'Booking cancelled successfully',
        'booking': booking.to_dict()
    }), 200

# business owner viewing bookings for their business
@business_bp.route('/<int:business_id>/bookings', methods=['GET'])
@jwt_required()
def get_business_bookings(business_id):
    user_id = get_jwt_identity()
    filters = {
        'status': request.args.get('status'),
        'service_id': request.args.get('service_id'),
        'date': request.args.get('date')
    }

    bookings, error = services.get_business_bookings(business_id, user_id, filters)
    if error:
        return jsonify({'error': error}), 400

    return jsonify({
        'bookings' : [b.to_dict() for b in bookings]
    }), 200