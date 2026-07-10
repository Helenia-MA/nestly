from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate, jwt
import cloudinary


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # initializing extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # CORS(app, origins=[app.config['FRONTEND_URL']])
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )

    from models import User

    # register blueprints
    from routes import auth_bp, business_bp, booking_bp, customer_bp, admin_bp, category_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(business_bp, url_prefix='/api/businesses')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(customer_bp, url_prefix='/api/customers')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)
