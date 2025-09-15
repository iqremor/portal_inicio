from app import create_app
from models import db, create_tables

app = create_app()
with app.app_context():
    create_tables()
    print("Database tables created.")
