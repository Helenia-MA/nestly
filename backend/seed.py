# hardcoding in some of the categories now
from app import create_app
from models import Category
from extensions import db

app = create_app()

categories = [
    # personal services: hairdressing, barber, beauty, manicure/pedicure, fitness training, cleaning&laundry
    {"name": "Haircut", "group": "Personal Services", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO-PVI5oee9uip4ws93GPqZE5XcNp9ayr4-A&s"},
    {"name": "Barber", "group": "Personal Services", "icon": "https://cdn-icons-png.flaticon.com/512/5607/5607344.png"},
    {"name": "Beauty", "group": "Personal Services", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaQkRJningQ-Y2BpLU81almbLzNz8HdITE2w&s"},
    {"name": "Manicure/Pedicure", "group": "Personal Services", "icon": "https://www.shutterstock.com/image-vector/manicure-pedicure-salon-vector-icons-260nw-1006808296.jpg"},
    {"name": "Fitness Training", "group": "Personal Services", "icon": "https://static.thenounproject.com/png/1926483-200.png"},
    {"name": "Cleaning & Laundry", "group": "Personal Services", "icon": "https://thumbs.dreamstime.com/b/black-white-sign-laundry-dry-cleaning-service-hanger-washing-machine-symbol-vector-clothes-80311468.jpg"},

    # Home & Property Services: house cleaning, gardening & landscaping, painting & repairs, plumbing, electrical, pest control, moving & packing
    {"name": "House Cleaning", "group": "Home & Property", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREfoO-seMehfB9NdQZ5mIFoUKiy7X4mtXolA&s"},
    {"name": "Gardening & Landscaping", "group": "Home & Property", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrpxDB1Lh77Gipzj0ufosOVduz8Efrc5LF9w&s"},
    {"name": "Painting & Repairs", "group": "Home & Property", "icon": "https://www.shutterstock.com/image-vector/house-repair-icon-painting-services-260nw-285143516.jpg"},
    {"name": "Plumbing", "group": "Home & Property", "icon": "https://www.shutterstock.com/image-vector/plumbing-service-icon-representing-repair-260nw-1360859993.jpg"},
    {"name": "Electrical", "group": "Home & Property", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvIMILgOQOHe62dRg1WgyNIhU0-iP3bLvMdA&s"},
    {"name": "Pest Control", "group": "Home & Property", "icon": "https://cdn-icons-png.flaticon.com/512/16872/16872629.png"},
    {"name": "Moving & Packing", "group": "Home & Property", "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSUMn5WGPKzBbF3qKR_PYlOx8a9lj_O_fhNg&s"},
]

with app.app_context():
    for cat in categories:
        existing = Category.query.filter_by(name=cat["name"]).first()
        if not existing:
            new_category = Category(
                name = cat["name"], group = cat["group"], icon = cat["icon"]
            )
            db.session.add(new_category)
            print(f"Added category: {cat['name']}")
        else:
            print(f"skipped (already exists): {cat['name']}")

    db.session.commit()
    print("Seeding completed.")
