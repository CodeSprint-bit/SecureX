import sqlite3

from app.database import DATABASE_PATH

connection = sqlite3.connect(DATABASE_PATH)

try:
    columns = {
        row[1]
        for row in connection.execute("PRAGMA table_info(officers)")
    }

    if "is_admin" not in columns:
        connection.execute(
            "ALTER TABLE officers "
            "ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0"
        )
        print("Added is_admin column.")
    else:
        print("is_admin column already exists.")

    connection.commit()

finally:
    connection.close()