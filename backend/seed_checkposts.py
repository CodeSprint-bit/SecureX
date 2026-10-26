from app.database import Base, SessionLocal, engine
from app.models import Checkpost

Base.metadata.create_all(bind=engine)

db = SessionLocal()

sample_checkposts = [
    {
        "name": "SecureX Test Checkpost Alpha",
        "address": "Development Test Location Alpha",
        "latitude": "27.1000",
        "longitude": "93.6000",
    },
    {
        "name": "SecureX Test Checkpost Beta",
        "address": "Development Test Location Beta",
        "latitude": "27.2000",
        "longitude": "93.7000",
    },
]

try:
    for item in sample_checkposts:
        existing = (
            db.query(Checkpost)
            .filter(Checkpost.name == item["name"])
            .first()
        )

        if not existing:
            db.add(Checkpost(**item))

    db.commit()
    print("Sample checkposts are ready for development testing.")

finally:
    db.close()