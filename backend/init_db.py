import os
import time

from app import create_app
from models import db
from seed_db import seed_cuadernillos, seed_users

# --- Configuration ---
DB_FILENAME = "sistema_gestion.db"


def reset_database():
    """
    Completely resets the database.
    - Deletes the old database file.
    - Drops all tables.
    - Creates all tables.
    - Seeds the database with initial data.
    """
    app = create_app()
    with app.app_context():
        # 1. Find and delete the old database file
        # The database is located in the 'instance' folder relative to the app's root.
        instance_path = app.instance_path
        db_path = os.path.join(instance_path, DB_FILENAME)

        print(f"Database path is: {db_path}")

        if os.path.exists(db_path):
            print("--- Found old database. Deleting... ---")
            try:
                os.remove(db_path)
                print(f"--- Successfully deleted {db_path} ---")
                # Give the filesystem a moment
                time.sleep(0.1)
            except OSError as e:
                print(f"--- Error deleting database file: {e} ---")
                print(
                    "--- Please close any programs using the database and try again. ---"
                )
                return

        # 2. Drop all tables (just in case the file wasn't deleted)
        print("--- Dropping all database tables... ---")
        db.drop_all()
        print("--- Tables dropped. ---")

        # 3. Create all tables
        print("--- Creating all database tables from models... ---")
        db.create_all()
        print("--- Tables created successfully. ---")

        # 4. Seed the database
        print("\n--- Seeding database with initial data... ---")
        try:
            seed_users()
            seed_cuadernillos()
            print("\n--- Database has been successfully reset and seeded! ---")
        except Exception as e:
            print(f"\n--- An error occurred during seeding: {e} ---")
            db.session.rollback()


if __name__ == "__main__":
    print("=============================================")
    print("===      DATABASE RESET SCRIPT      ===")
    print("=============================================")
    print("This script will completely wipe and reset your database.")
    # Simple confirmation prompt
    if input("Are you sure you want to continue? (y/n): ").lower() != "y":
        print("--- Aborted by user. ---")
    else:
        reset_database()
