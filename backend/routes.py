from flask import Blueprint, jsonify

auth_bp = Blueprint('auth', __name__)
business_bp = Blueprint('business', __name__)
booking_bp = Blueprint('booking', __name__)
customer_bp = Blueprint('customer', __name__)
admin_bp = Blueprint('admin', __name__)

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Nestly app is running!"}), 200