import getpass

from app.database import SessionLocal
from app.models import Officer

email = input("Enter the registered administrator email: ").strip().lower()
password = getpass.getpass("Enter the administrator password: ")

db = SessionLocal()

try:
    officer = (
        db.query(Officer)
        .filter(Officer.email == email)
        .first()
    )

    if officer is None:
        raise SystemExit("No account found for that email.")

    from app.security import verify_password

    if not verify_password(password, officer.password_hash):
        raise SystemExit("Password verification failed.")

    if not officer.is_active:
        raise SystemExit("This account is disabled.")

    officer.is_admin = True
    officer.account_status = "approved"

    db.commit()

    print("Administrator role enabled successfully.")
    print("Keep this account secure.")

finally:
    db.close()