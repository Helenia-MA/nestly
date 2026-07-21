# Nestly
(tentative name)

A two-sided service booking marketplace currently for Kenya, connecting customers with local service businesses. Customers can explore businesses, browse their services, and book appointments online and business owners can manage bookings, staff schedules and their business profiles all in one place while getting an opportunity to advertise their services to a larger audience.


## Live Demo
https://nestly-sage.vercel.app/

## Tech stack
**Frontend;** React, Vite, Tailwind CSS, React Bug Calendar
**Backend;** Flask, Python, SQLAlchemy, PostgreSQL
**Auth;** JWT
**Deployment;** Render(Backend), Vercel(Frontend)

## Running it locally
**Backend**
cd backend
python -m venve venv
source venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python seed.py
flask run --port 5001

**Frontend**
cd frontend
npm install
npm run dev

Then open http://localhost:5173/ 

## Features
**For customers;**
- Browse services by category with search, price and distance filters
- View business profiles with photos, services and reviews
- Real-time availability booking with working hours engine
- Manage upcoming and past bookings
- Leave reviews after visits
- Save favourite businesses

**For business owners:**
- Register and manage one or multiple businesses
- Calendar view of all bookings (week/day/agenda filters)
- Manage services with photos and pricing
- Set working hours and blocked times (for breaks etc)
- Upload verification documents
- Dashboard with booking stats

**For admins:**
- Platform overview with key stats
- Manage businesses (verify, pause, view owner)
- Manage users (suspend/unsuspend)
- Manage service categories

## Screenshots of the main pages
**Homepage**
<img width="1470" height="956" alt="Screenshot 2026-07-21 at 3 31 14 AM" src="https://github.com/user-attachments/assets/cddb7892-1301-47cd-84c0-9c1a2087fe11" />

**BusinessDashboard**
<img width="1470" height="956" alt="Screenshot 2026-07-21 at 3 33 34 AM" src="https://github.com/user-attachments/assets/e4dc1b93-3c1b-494a-bade-a7b54f00950a" />

**AdminDashboard**
<img width="1470" height="956" alt="Screenshot 2026-07-21 at 3 34 09 AM" src="https://github.com/user-attachments/assets/902a926c-4973-4375-b3b9-706ade135fce" />


## Planned (stretch goals)
- Staff management system (per-staff availability and scheduling)
- Email/SMS notifications
- M-Pesa payment integration
- AI assistant for customer support
- Mobile app
- Google OAuth option
- Walk-in booking by owner


