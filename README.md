# SecureX — AI-Powered Document Verification

SecureX is a web application for supporting document verification workflows, officer and checkpost management, verification history, and case reporting.

The project uses React and Vite for the frontend, FastAPI for the backend, and SQLite for local data storage.

> **Important:** Automated document analysis can identify potential anomalies, but does not independently prove that a document is genuine or fraudulent. Official verification requires appropriate issuer or cryptographic validation where available.

## Features

- Officer authentication and account workflows
- Checkpost management
- Document verification records and history
- OCR text storage and document-processing dependencies
- Case reporting
- Administrative workflows
- REST API with interactive documentation

Feature availability depends on the implemented routes and integrated processing pipeline. Installed libraries alone do not establish that a feature is operational.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Routing | React Router |
| Maps | Leaflet, React Leaflet |
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Authentication | JWT, pwdlib password hashing |
| Document processing dependencies | OpenCV, Pillow, PyMuPDF, pytesseract, pyzbar |
| OCR dependency in frontend | Tesseract.js |
| PDF generation dependency | ReportLab |

## Project Structure

```text
SecureX/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── admin.py
│   │   │   ├── history.py
│   │   │   └── case_reports.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── requirements.txt
│   └── tests/
├── docs/
│   └── TECHNICAL_DESIGN.md
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── sample_data/
│   └── README.md
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Prerequisites

Install:

- Python
- Node.js and npm
- Git
- Visual Studio Code (recommended)

## Run SecureX on Windows

### 1. Clone the repository

```powershell
git clone https://github.com/CodeSprint-bit/SecureX.git
cd SecureX
```

If you already have the project, open PowerShell in its root directory instead.

### 2. Configure the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If PowerShell blocks activation, you can run the environment's Python directly using `.\.venv\Scripts\python.exe`.

### 3. Set the JWT secret

The current backend reads `CARECIRCLE_SECRET_KEY` from the process environment. Generate a strong local development secret:

```powershell
$env:CARECIRCLE_SECRET_KEY = python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Keep this terminal open while running the backend. This command sets the variable for the current PowerShell session.

The `.env.example` file documents the variable; it is not automatically loaded by the current `security.py`.

**Security warning:** The current security module contains a hardcoded fallback secret if the environment variable is missing. Remove that fallback and require a configured secret before using the application outside local development.

### 4. Start the backend

From the `backend` directory:

```powershell
python -m uvicorn app.main:app --reload
```

Local endpoints:

- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

The application creates missing database tables on startup. The SQLite database is stored at `backend/securex.db`.

### 5. Start the frontend

Open a second PowerShell terminal in the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite, usually:

http://localhost:5173

Ensure the frontend API URL and FastAPI CORS configuration match the addresses being used.

## Environment Variables

| Variable | Purpose |
|---|---|
| `CARECIRCLE_SECRET_KEY` | Signs and validates JWT access tokens |

Never commit `.env` files, real credentials, access tokens, private documents, or production databases.

## Testing

Backend test dependencies are listed in `backend/tests/requirements.txt`.

Install them in the active backend environment if needed:

```powershell
python -m pip install -r tests/requirements.txt
```

Automated test coverage and results must be verified separately. Do not assume the application passes tests until they have been implemented and executed.

Use synthetic documents and fictional identities for demonstrations. See `sample_data/README.md` for suggested test scenarios.

## Technical Documentation

See [`docs/TECHNICAL_DESIGN.md`](docs/TECHNICAL_DESIGN.md) for the architecture overview, database models, security notes, and development guidance.

## Security and Privacy

- Use synthetic data for demonstrations and testing.
- Enforce authorization for every protected record and endpoint.
- Validate uploaded files by content and size.
- Store sensitive files privately.
- Use HTTPS in production.
- Apply a documented retention and deletion policy.
- Never treat OCR output or an anomaly score as definitive proof of fraud.

## Roadmap

Potential improvements include:

- More robust and evaluated document-tampering analysis
- OCR field extraction and validation
- Cryptographic signature verification
- Authorized issuer-verification integrations
- Reviewer workflows and audit logging
- Automated tests and reproducible performance evaluations

## Author

Ritik Sharma

- GitHub: https://github.com/CodeSprint-bit
- Repository: https://github.com/CodeSprint-bit/SecureX

## License

This project is distributed under the MIT License. See [`LICENSE`](LICENSE).

---

SecureX aims to make document screening more efficient and explainable while keeping human review and authoritative verification central to the process.
