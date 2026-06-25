import bcrypt
from models import BusinessPhoto, ServicePhoto, User, Business, WorkingHours, Service, Category, BlockedTime, Booking
from extensions import db
from datetime import datetime, time, timedelta
import cloudinary.uploader
from math import radians, sin, cos, sqrt, atan2

# USER AUTHENTICATION
def signup_user(data):
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    # validating the inputs
    if not name or not password:
        return None, "Name and password are required"

    if not email and not phone:
        return None, "Either email or phone is required"

    # checking if the user already exists
    # SELECT * FROM users WHERE email = :email OR phone = :phone
    if email:
        existing = User.query.filter_by(email=email).first()
        if existing:
            return None, "An account with this email already exists"

    if phone:
        existing = User.query.filter_by(phone=phone).first()
        if existing:
            return None, "An account with this phone number already exists"

    # hashing the password
    password_hash= bcrypt.hashpw(
        password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # creating the user
    # INSERT INTO users (name, email, phone, password_hash) VALUES (:name, :email, :phone, :password_hash)
    user = User(
        name=name,
        email=email,
        phone=phone,
        password_hash=password_hash)

    db.session.add(user)
    db.session.commit()

    return user, None

def login_user(data):
    identifier = data.get('identifier') # email or phone
    password = data.get('password')

    if not identifier or not password:
        return None, "Email/phone and password are required"

    # finding the user by email or phone
    # SELECT * FROM users WHERE email = :identifier OR phone = :identifier
    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()

    if not user:
        return None, "No account found with this email or phone number"

    if user.is_suspended:
        return None, "This account has been suspended. Please contact support."

    # checking the password
    password_matches = bcrypt.checkpw(
        password.encode('utf-8'), user.password_hash.encode('utf-8')
    )

    if not password_matches:
        return None, "incorrect password"

    return user, None

# DISTANCE CALCULATION (for future use in filtering business by distance) - haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371 # earth's radius

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    distance = R * c

    return round(distance, 2)

# BUSINESS MANAGEMENT
# Business registration logic
def create_business(user_id, data):
    name = data.get('name')
    if not name:
        return None, "Business name is required"

    business = Business(
        owner_id=user_id,
        name=name,
        description=data.get('description'),
        location=data.get('location'),
        phone = data.get('phone'),
        instagram = data.get('instagram'),
        tiktok = data.get('tiktok'),
        website = data.get('website'),
        capacity = data.get('capacity', 1),
        status = 'draft'
    )

    db.session.add(business)

    #marking the user as a business owner
    user = User.query.get(user_id)
    user.is_business_owner = True

    db.session.commit()

    return business, None

# logic for viewing business dashboard
def get_business(business_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    return business, None

# updating/editing business details
def update_business(business_id, user_id, data):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to edit this business"

    # only allowing certain fields to be updated
    allowed_fields = ['name', 'description', 'location', 'phone', 'instagram', 'tiktok', 'website', 'capacity', 'latitude', 'longitude']
    for field in allowed_fields:
        if field in data:
            setattr(business, field, data[field])

    db.session.commit()
    return business, None

# publishing, pausing or draft status for business
def update_business_status(business_id, user_id, new_status):
    valid_status = ['draft', 'published', 'paused']

    if new_status not in valid_status:
        return None, "Invalid status"

    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to edit this business"

    business.status = new_status
    db.session.commit()

    return business, None

# working hours management (do weekly schedule)
def set_working_hours(business_id, user_id, data):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to edit this business"

    hours_data = data.get('hours')
    if not hours_data:
        return None, "working hours data is required"

    if len(hours_data) != 7:
        return None, " You must provide hours for all 7 days. For days the business is closed, set 'is_closed' to True."

    # validating each day before saving
    for day in hours_data:
        day_of_week = day.get('day_of_week')
        is_closed = day.get('is_closed', False)

        if day_of_week is None or day_of_week not in range(7):
            return None, f"Invalid day of the week: {day_of_week}"

        if not is_closed:
            if not day.get('open_time') or not day.get('close_time'):
                return None, f"Open and close times are required for {day_of_week} if the business is not closed."

    # deleting existing working hours for this business before saving new ones
    WorkingHours.query.filter_by(business_id=business_id).delete()

    for day in hours_data:
        is_closed = day.get('is_closed', False)

        if is_closed:
            open_time = time(0,0)
            close_time = time(0,0)
        else:
            open_time = datetime.strptime(day.get('open_time'), '%H:%M').time()
            close_time = datetime.strptime(day.get('close_time'), '%H:%M').time()

        working_hours = WorkingHours(
            business_id=business_id,
            day_of_week=day.get('day_of_week'),
            open_time=open_time,
            close_time=close_time,
            is_closed=is_closed
        )
        db.session.add(working_hours)

    db.session.commit()

    all_hours = WorkingHours.query.filter_by(business_id=business_id). order_by(WorkingHours.day_of_week).all()

    return all_hours, None

def get_working_hours(business_id):
    business = Business.query.get(business_id)

    if not business:
        return None, "Business not found"
    # SELECT * FROM working_hours WHERE business_id = :business_id ORDER BY day_of_week
    hours = WorkingHours.query.filter_by(business_id=business_id).order_by(WorkingHours.day_of_week).all()

    return hours, None

# SERVICES MANAGEMENT
# Creating a new service for a business
def create_service(business_id, user_id, data):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to add services to this business"

    name = data.get('name')
    price = data.get('price')
    duration_minutes = data.get('duration_minutes')
    category_id = data.get('category_id')

    # validating the required fields
    if not name:
        return None, "Service name is required"
    if price is None:
        return None, "Service price is required"
    if not duration_minutes:
        return None, "Service duration is required"
    if not category_id:
        return None, "Service category is required"

    # checking if the category exists
    category = Category.query.get(category_id)
    if not category:
        return None, "Category not found"

    service = Service(
        business_id=business_id,
        category_id=category_id,
        name=name,
        description=data.get('description'),
        price=price,
        price_is_negotiable=data.get('price_is_negotiable', False),
        duration_minutes=duration_minutes,
        is_active=True
    )

    db.session.add(service)
    db.session.commit()

    return service, None

# getting all the services for a given business
def get_services(business_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    # SELECT * FROM Services WHERE business_id = :business_id
    services = Service.query.filter_by(business_id=business_id).all()
    return services, None

# updating a service for a business
def update_service(business_id, service_id, user_id, data):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to add services to this business"

    # SELECT * FROM Services WHERE id = :service_id AND business_id = :business_id
    service = Service.query.filter_by(id=service_id, business_id=business_id).first()
    if not service:
        return None, "Service not found"

    # only allowing certain fields to be updated
    allowed_fields = ['name', 'description', 'price', 'duration_minutes', 'price_is_negotiable']
    for field in allowed_fields:
        if field in data:
            setattr(business, field, data[field])

    db.session.commit()
    return business, None

# deleting a service
def delete_service(business_id, service_id, user_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to delete services from this business"

    # SELECT * FROM Services WHERE id = :service_id AND business_id = :business_id
    service = Service.query.filter_by(id=service_id, business_id=business_id).first()
    if not service:
        return None, "Service not found"

    db.session.delete(service)
    db.session.commit()

    return True, None

# marking it active or inactive when not available on a given day or time
def toggle_service(business_id, service_id, user_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to toggle services for this business"

    service = Service.query.filter_by(id=service_id, business_id=business_id).first()
    if not service:
        return None, "Service not found"

    service.is_active = not service.is_active
    db.session.commit()

    return service, None

# PHOTO UPLOADS
def upload_business_photo(business_id, user_id, file):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to upload photos for this business"

    if not file:
        return None, "No file provided for upload"

    # Uploading the photo to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(file, folder='nestly/businesses')
        photo_url = upload_result['secure_url']
    except Exception as e:
        return None, f"Photo upload failed: {str(e)}"

    photo = BusinessPhoto(
        business_id=business_id,
        photo_url=photo_url
    )

    db.session.add(photo)
    db.session.commit()

    return photo, None

def delete_business_photo(business_id, photo_id, user_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to delete photos for this business"

    photo = BusinessPhoto.query.filter_by(id=photo_id, business_id=business_id).first()
    if not photo:
        return None, "Photo not found"

    db.session.delete(photo)
    db.session.commit()

    return True, None

# service photos
def upload_service_photo(business_id, service_id, user_id, file):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to upload photos for this business"

    if not file:
        return None, "No file provided for upload"

    service = Service.query.filter_by(id=service_id, business_id=business_id).first()
    if not service:
        return None, "Service not found"
    # Uploading the photo to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(file, folder='nestly/services')
        photo_url = upload_result['secure_url']
    except Exception as e:
        return None, f"Photo upload failed: {str(e)}"

    photo = ServicePhoto(
        service_id=service_id,
        photo_url=photo_url
    )

    db.session.add(photo)
    db.session.commit()

    return photo, None

def delete_service_photo(business_id, service_id, photo_id, user_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to delete photos for this business"

    service = Service.query.filter_by(id=service_id, business_id=business_id).first()
    if not service:
        return None, "Service not found"

    photo = ServicePhoto.query.filter_by(id=photo_id, service_id=service_id).first()
    if not photo:
        return None, "Photo not found"

    db.session.delete(photo)
    db.session.commit()

    return True, None

# BLOCKED TIME FOR BREAKS ETC
def create_blocked_time(business_id, user_id, data):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to create blocked times for this business"

    start_time = data.get('start_time')
    end_time = data.get('end_time')
    reason = data.get('reason')

    if not start_time or not end_time:
        return None, "Start time and end time are required"

    # converting strings to datetime objects in raw sql we'd store then as TIMESTAMP values
    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except ValueError:
        return None, "Invalid date format. Use ISO format e.g 2026-06-25T09:00:00"

    if end_time <= start_time:
        return None, "End time must be after start time"

    blocked = BlockedTime(
        business_id=business_id,
        start_time=start_time,
        end_time=end_time,
        reason=reason
    )

    db.session.add(blocked)
    db.session.commit()

    return blocked, None

def delete_blocked_time(business_id, blocked_time_id, user_id):
    business = Business.query.get(business_id)

    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to delete blocked times for this business"

    blocked_time = BlockedTime.query.filter_by(id=blocked_time_id, business_id=business_id).first()
    if not blocked_time:
        return None, "Blocked time not found"

    db.session.delete(blocked_time)
    db.session.commit()

    return True, None

def get_blocked_times(business_id):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    blocked_times = BlockedTime.query.filter_by(business_id=business_id).all()
    return blocked_times, None

# CUSTOMER BROWSING LOGIC

def get_categories():
    categories = Category.query.order_by(Category.group, Category.name).all()
    return categories, None

# getting all businesses
def get_all_businesses(filters=None):
    # customers can only see published businesses
    query = Business.query.filter_by(status='published')

    # filtering by category
    if filters:
        if filters.get('category_id'):
            query = query.filter(
                Business.services.any(Service.category_id == int(filters['category_id']))
            )

    # filtering by business name
    if filters.get('search'):
        search_term = f"%{filters['search']}%"
        query = query.filter(
            Business.name.ilike(search_term)
        )

    # filtering by price range
    if filters.get('min_price'):
        query = query.filter(
            Business.services.any(
                Service.price >= float(filters['min_price'])
            )
        )

    if filters.get('max_price'):
        query = query.filter(
            Business.services.any(
                Service.price <= float(filters['max_price'])
            )
        )

    businesses = query.order_by(Business.created_at.desc()).all()

    # filtering by distance (if lat and lon are provided)
    customer_lat = filters.get('lat') if filters else None
    customer_lon = filters.get('lon') if filters else None
    max_distance = filters.get('max_distance') if filters else None

    if customer_lat and customer_lon:
        customer_lat = float(customer_lat)
        customer_lon = float(customer_lon)

        result = []
        for business in businesses:
            # skipping those without coordinates
            if business.latitude is None or business.longitude is None:
                continue
            distance = haversine(
                customer_lat, customer_lon, business.latitude, business.longitude
            )

            if max_distance and distance > float(max_distance):
                continue

            business.distance = distance  # adding a temporary attribute for sorting
            result.append(business)

        result.sort(key=lambda b: b.distance)
        businesses = result

    return businesses, None

# BOOKINGS LOGIC
def get_available_windows(business_id, service_id, date):
    # getting a service first
    service = Service.query.get(service_id)
    if not service:
        return None, "Service not found"

    duration = service.duration_minutes

    # getting business and capacity
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    capacity = business.capacity

    # working hours for the chosen day
    working_hours = WorkingHours.query.filter_by(
        business_id=business_id, day_of_week=date.weekday()
    ).first()

    if not working_hours or working_hours.is_closed:
        return [], None

    open_dt = datetime.combine(date, working_hours.open_time)
    close_dt = datetime.combine(date, working_hours.close_time)

    # getting all overlapping bookings
    bookings = Booking.query.filter(
        Booking.business_id == business_id,
        Booking.start_time < close_dt,
        Booking.end_time > open_dt
    ).order_by(Booking.start_time).all()

    # getting all blocked times
    blocked_times = BlockedTime.query.filter(
        BlockedTime.business_id == business_id,
        BlockedTime.start_time < close_dt,
        BlockedTime.end_time > open_dt
    ).order_by(BlockedTime.start_time).all()

    events = set()
    events.add(open_dt)
    events.add(close_dt)

    for b in bookings:
        events.add(max(b.start_time, open_dt))
        events.add(min(b.end_time, close_dt))

    for bt in blocked_times:
        events.add(max(bt.start_time, open_dt))
        events.add(min(bt.end_time, close_dt))

    # sorting the events
    events = sorted(events)

    # checking each interval btwn events
    free_windows = []
    current_window_start  = None

    for i in range(len(events) - 1):
        slot_start = events[i]
        slot_end = events[i + 1]

        # counting overlapping bookings in the slot
        overlapping_bookings = sum(
            1 for b in bookings if b.start_time < slot_end and b.end_time > slot_start
        )

        # if any blocked time overlaps with the slot, we skip it
        is_blocked = any(bt.start_time < slot_end and bt.end_time > slot_start for bt in blocked_times)

        is_available  = (not is_blocked and overlapping_bookings < capacity)
        if is_available:
            if current_window_start is None:
                current_window_start = slot_start
        else:
            if current_window_start is not None:
                window_duration = (slot_start - current_window_start).total_seconds()/60

                # if the window is long enough for the service duration, we add it to the list
                if window_duration >= duration:
                    latest_start = slot_start - timedelta(minutes=duration)
                    free_windows.append({
                        'from': current_window_start.strftime('%H:%M'),
                        'to': slot_start.strftime('%H:%M'),
                        'latest_start': latest_start.strftime('%H:%M')
                    })
                current_window_start = None


    # handling the free window that might extend to closing time
    if current_window_start is not None:
        window_duration = (close_dt - current_window_start).total_seconds()/60
        if window_duration >= duration:
            latest_start = close_dt - timedelta(minutes=duration)
            free_windows.append({
                'from': current_window_start.strftime('%H:%M'),
                'to': close_dt.strftime('%H:%M'),
                'latest_start': latest_start.strftime('%H:%M')
            })

    return free_windows, None

# creating a booking
def create_booking(customer_id, data):
    business_id = data.get('business_id')
    service_id = data.get('service_id')
    start_time_str = data.get('start_time')
    notes = data.get('notes')

    if not business_id or not service_id or not start_time_str:
        return None, "Business ID, Service ID, and Start Time are required"

    # getting the service and business
    service = Service.query.get(service_id)
    if not service:
        return None, "Service not found"

    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"
    if business.status != 'published':
        return None, "This business is not currently accepting bookings"

    # parsing start time
    try:
        start_time = datetime.fromisoformat(start_time_str)
    except ValueError:
        return None, "Invalid start time format, use ISO format eg 2026-06-25T09:00:00"

    # getting the end time based on service duration
    end_time = start_time + timedelta(minutes=service.duration_minutes)
    if start_time < datetime.now():
        return None, "Cannot book a time in the past"

    # rechecking availability windows
    windows, error = get_available_windows(business_id, service_id, start_time.date())
    if error:
        return None, error

    # confirming our booking fits within one of the available windows
    def parse_window_time(time_str, reference_dt):
        return datetime.strptime(time_str, '%H:%M').replace(
            year=reference_dt.year, month=reference_dt.month, day=reference_dt.day
        )
    valid_window = any(
        parse_window_time(w['from'], start_time) <= start_time and
        end_time <= parse_window_time(w['to'], start_time)
        for w in windows
    )
    if not valid_window:
        return None, "This time slot is no longer available, please choose another time"

    # creating the booking
    booking = Booking(
        customer_id=int(customer_id),
        business_id=business_id,
        service_id=service_id,
        start_time=start_time,
        end_time=end_time,
        status = 'confirmed',
        notes=notes
    )

    db.session.add(booking)
    db.session.commit()

    return booking, None

# getting a customer's bookings
def get_customer_bookings(customer_id):
    bookings = Booking.query.filter_by(customer_id=int(customer_id)
                ).order_by(Booking.start_time.desc()).all()

    return bookings, None

# cancelling a booking
def cancel_booking(booking_id, customer_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None, "Booking not found"

    if booking.customer_id != int(customer_id):
        return None, "You don't have permission to cancel this booking"

    if booking.status != 'confirmed':
        return None, "Only confirmed bookings can be cancelled. This booking has already been cancelled or completed."
    if booking.start_time < datetime.now():
        return None, "Cannot cancel a booking that has already started or passed"

    booking.status = 'cancelled_by_customer'
    db.session.commit()

    return booking, None

# adding a separate cancel by business owner function; for logistics and disputes
def cancel_booking_by_business(booking_id, user_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return None, "Booking not found"

    business = Business.query.get(booking.business_id)
    if business.owner_id != int(user_id):
        return None, "You don't have permission to cancel this booking"
    if booking.status != 'confirmed':
        return None, "This booking is already cancelled"

    booking.status = 'cancelled_by_business'
    db.session.commit()

    return booking, None


def get_business_bookings(business_id, user_id, filters=None):
    business = Business.query.get(business_id)
    if not business:
        return None, "Business not found"

    if business.owner_id != int(user_id):
        return None, "You don't have permission to view bookings for this business"

    query = Booking.query.filter_by(business_id=business_id)

    # can filter by status, service or date
    if filters:
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])

        if filters.get('service_id'):
            query = query.filter_by(service_id=filters['service_id'])

        if filters.get('date'):
            try:
                date = datetime.strptime(filters['date'], '%Y-%m-%d').date()
                day_start= datetime.combine(date, datetime.min.time())
                day_end = datetime.combine(date, datetime.max.time())
                query = query.filter(
                    Booking.start_time >= day_start, Booking.start_time <= day_end
                )
            except ValueError:
                pass

    bookings = query.order_by(Booking.start_time.desc()).all()

    return bookings, None
