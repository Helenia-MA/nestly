from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # initializing extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=[app.config['FRONTEND_URL']])

    from models import User

    # register blueprints
    from routes import auth_bp, business_bp, booking_bp, customer_bp, admin_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(business_bp, url_prefix='/api/businesses')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(customer_bp, url_prefix='/api/customers')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
