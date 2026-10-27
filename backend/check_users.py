import sqlite3
from pathlib import Path

# Find SQLite database files in the backend folder
files = [
    p for p in Path(".").rglob("*")
    if p.is_file() and p.suffix.lower() in {".db", ".sqlite", ".sqlite3"}
    and ".venv" not in p.parts
]

if not files:
    print("No SQLite database found.")
    raise SystemExit

for db in files:
    print(f"\nDatabase: {db}")

    try:
        con = sqlite3.connect(f"file:{db.resolve()}?mode=ro", uri=True)
        tables = con.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()

        for (table,) in tables:
            columns = [
                row[1] for row in con.execute(
                    f'PRAGMA table_info("{table}")'
                ).fetchall()
            ]

            if "email" in columns:
                print(f"\nUser table: {table}")
                rows = con.execute(
                    f'SELECT email FROM "{table}"'
                ).fetchall()

                for row in rows:
                    print("Registered email:", row[0])

        con.close()

    except sqlite3.Error as e:
        print("Could not inspect this database:", e)