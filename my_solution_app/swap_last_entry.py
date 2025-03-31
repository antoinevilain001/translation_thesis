from app import db, translation, app
from sqlalchemy import desc

with app.app_context():
    # Get the most recent row based on ID (or use date_added if necessary)
    last_entry = translation.query.order_by(desc(translation.id)).first()

    if last_entry:
        last_entry.translation2_chatGPT, last_entry.translation3_chatGPTmini = (
            last_entry.translation3_chatGPTmini,
            last_entry.translation2_chatGPT,
        )
        db.session.commit()
        print(f"Fixed last entry with ID: {last_entry.id}")
    else:
        print("No entries found.")