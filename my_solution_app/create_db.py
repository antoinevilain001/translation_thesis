from app import app, db  # Import your Flask app and db object

# This will create the tables in the database
with app.app_context():
    db.create_all()  # Creates the tables based on the models
    print("Database tables created!")