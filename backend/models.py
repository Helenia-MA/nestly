from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True) # since one can sign up with this or google either
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    is_business_owner = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    profile_photo = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_suspended = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'is_business_owner': self.is_business_owner,
            'is_admin': self.is_admin,
            'profile_photo': self.profile_photo,
            'created_at': self.created_at.isoformat(),
            'is_suspended': self.is_suspended
        }

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    group = db.Column(db.String(100), nullable=True) # e.g. personal services, home & property etc.
    icon = db.Column(db.String(255), nullable=True) # URL to category icon

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'group': self.group,
            'icon': self.icon
        }

class Business(db.Model):
    __tablename__ = 'businesses'

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    instagram = db.Column(db.String(100), nullable=True)
    tiktok = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    cover_photo = db.Column(db.String(255), nullable=True)
    capacity = db.Column(db.Integer, default=1) # o of people that can be served at the same time
    status = db.Column(db.String(20), default='draft') # once done setting up will change to 'published' can be 'suspended' too based on reviews
    is_verified = db.Column(db.Boolean, default=False) # after admin verification
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship('User', backref='businesses')

    def to_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'name': self.name,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'maps_link': f"https://www.google.com/maps/search/?api=1&query={self.latitude},{self.longitude}"
                        if self.latitude and self.longitude else None,
            'phone': self.phone,
            'instagram': self.instagram,
            'tiktok': self.tiktok,
            'website': self.website,
            'cover_photo': self.cover_photo,
            'capacity': self.capacity,
            'status': self.status,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'distance': getattr(self, 'distance', None)
        }

    def to_full_dict(self):
        return {
            'id': self.id,
            'owner_id': self.owner_id,
            'name': self.name,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'maps_link': f"https://www.google.com/maps/search/?api=1&query={self.latitude},{self.longitude}"
                        if self.latitude and self.longitude else None,
            'phone': self.phone,
            'instagram': self.instagram,
            'tiktok': self.tiktok,
            'website': self.website,
            'cover_photo': self.cover_photo,
            'capacity': self.capacity,
            'status': self.status,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'distance': getattr(self, 'distance', None),
            'photos': [photo.to_dict() for photo in self.photos],
            'working_hours': [h.to_dict() for h in self.working_hours],
            'services': [s.to_full_dict() for s in self.services if s.is_active],
        }

# separating this since a business can have multiple photos, and we want to keep track of them separately
class BusinessPhoto(db.Model):
    __tablename__ = 'business_photos'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    photo_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    business = db.relationship('Business', backref='photos')

    def to_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'photo_url': self.photo_url,
            'created_at': self.created_at.isoformat()
        }

class WorkingHours(db.Model):
    __tablename__ = 'working hours'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False) # e.g. 0-6 for Monday-Sunday
    open_time = db.Column(db.Time, nullable=False)
    close_time = db.Column(db.Time, nullable=False)
    is_closed = db.Column(db.Boolean, default=False) # if the business is closed on that day

    business = db.relationship('Business', backref='working_hours')

    def to_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'day_of_week': self.day_of_week,
            'open_time': self.open_time.strftime('%H:%M'),
            'close_time': self.close_time.strftime('%H:%M'),
            'is_closed': self.is_closed
        }

# handling breaks during working hours eg lunch breaks
class BlockedTime(db.Model):
    __tablename__ = 'blocked times'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(255), nullable=True) # optional reason for blocking the time

    business = db.relationship('Business', backref='blocked_times')

    def to_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'reason': self.reason
        }

class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    price_is_negotiable = db.Column(db.Boolean, default=False)
    duration_minutes = db.Column(db.Integer, nullable=False) # duration of the service in minutes
    is_active = db.Column(db.Boolean, default=True) # if the service is currently offered
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    business = db.relationship('Business', backref='services')
    category = db.relationship('Category', backref='services')

    def to_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'category_id': self.category_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'price_is_negotiable': self.price_is_negotiable,
            'duration_minutes': self.duration_minutes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

    def to_full_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'category_id': self.category_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'price_is_negotiable': self.price_is_negotiable,
            'duration_minutes': self.duration_minutes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'photos': [photo.to_dict() for photo in self.photos]
        }

class ServicePhoto(db.Model):
    __tablename__ = 'service_photos'

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    photo_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship('Service', backref='photos')

    def to_dict(self):
        return {
            'id': self.id,
            'service_id': self.service_id,
            'photo_url': self.photo_url,
            'created_at': self.created_at.isoformat()
        }

class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(30), default='confirmed')
    negotiated_price = db.Column(db.Numeric(10, 2), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    business = db.relationship('Business', backref='bookings')
    service = db.relationship('Service', backref='bookings')
    customer = db.relationship('User', backref='bookings')

    def to_dict(self):
        return {
            'id': self.id,
            'business_id': self.business_id,
            'service_id': self.service_id,
            'customer_id': self.customer_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'status': self.status,
            'negotiated_price': float(self.negotiated_price)
                                if self.negotiated_price else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'business_name': self.business.name,
            'service_name': self.service.name,
            'service_price': float(self.service.price),
            'duration_minutes': self.service.duration_minutes
        }
