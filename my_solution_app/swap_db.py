from app import db, translation, app  # Ensure you import the app instance

# Run inside the application context
with app.app_context():
    with db.session.begin():
        for row in translation.query.all():
            row.translation2_chatGPT, row.translation3_chatGPTmini = (
                row.translation3_chatGPTmini,
                row.translation2_chatGPT,
            )
        db.session.commit()