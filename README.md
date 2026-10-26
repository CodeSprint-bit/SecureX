# SecureX — AI-Powered Document Verification

**SecureX** is a web-based document verification platform designed to help authorized personnel review identity documents, identify potential tampering indicators, and manage verification activities through a centralized dashboard.

The project combines a modern React frontend with a Python FastAPI backend to support document screening, verification history, checkpost workflows, and case reporting.

> **Important:** Automated analysis can identify potential anomalies, but it cannot independently prove that a document is genuine or fraudulent. Official verification requires appropriate issuer or cryptographic validation where available.

## ✨ Features

- **Document Verification:** Review documents and identify potential inconsistencies.
- **OCR-Based Analysis:** Extract text from supported documents where OCR is implemented.
- **Verification History:** Keep track of verification activities.
- **Checkpost Management:** Support checkpost-related workflows and location-based information.
- **Case Reporting:** Provide workflows for recording and managing reported cases.
- **Authentication:** Support user authentication and access-controlled functionality where configured.
- **Admin Dashboard:** Provide administrative tools for managing relevant platform activities.
- **Responsive Interface:** Built with React and Vite for a modern web experience.

*Feature availability depends on the current implementation and configuration. Some verification methods may require additional integrations or models.*

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| API Communication | REST API |
| Document Analysis | OCR and image-processing components, where implemented |
| Database | Depends on the backend configuration |
| Development Tools | Visual Studio Code, Git, GitHub |

## 📁 Project Structure

```text
SecureX/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   └── tests/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── datasets/
│   │   ├── App.jsx
│   │   ├── Checkposts.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Install the following on your computer:

- Python
- Node.js and npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the repository

```powershell
git clone https://github.com/CodeSprint-bit/SecureX.git
cd SecureX
```

### 2. Set up the backend

From the project root, run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

Install the project's backend dependencies using its existing dependency file, if present:

```powershell
pip install -r requirements.txt
```

If `backend\requirements.txt` does not exist, install the dependencies specified by the project instead.

Configure required environment variables using a local `.env` file or the configuration method used by the application. Never commit real secrets.

Start the API:

```powershell
python -m uvicorn app.main:app --reload
```

The backend should be available at:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open a **second PowerShell terminal** from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

### 4. Configure frontend-to-backend communication

Ensure the frontend API base URL matches the running backend. If the frontend and backend use different ports, configure CORS in FastAPI to allow the frontend origin.

Follow any additional environment or database initialization instructions required by the current project configuration.

## 🔐 Security and Privacy

SecureX is intended to assist document review, not replace authoritative verification.

- Do not upload real identity documents to an untrusted deployment.
- Keep credentials, secret keys, and private data out of Git.
- Use synthetic documents for demonstrations and testing.
- Restrict document access to authorized users.
- Avoid treating an automated risk score as proof of fraud.
- Verify digital signatures or issuer records through appropriate trusted mechanisms where available.

## 🧪 Testing

Use authorized synthetic documents to evaluate the application. Test normal documents, modified samples, low-quality scans, invalid uploads, and inconclusive cases.

Do not claim accuracy, precision, recall, or fraud-detection performance without measured evaluation results.

## 🗺️ Roadmap

Potential future improvements include:

- More robust document tampering analysis.
- Improved OCR and identity-field extraction.
- Cryptographic signature validation.
- Trusted issuer verification integrations.
- Enhanced reviewer workflows and audit logs.
- Automated testing and documented performance evaluation.

## 👨‍💻 Author

**Ritik Sharma**

Computer Science and Engineering student interested in software development, AI, and cybersecurity.

- **GitHub:** [CodeSprint-bit](https://github.com/CodeSprint-bit)
- **Project:** [SecureX Repository](https://github.com/CodeSprint-bit/SecureX)

## 📄 License

A license has not yet been specified. Add a `LICENSE` file before distributing the project under an open-source license.

---

*SecureX aims to make document screening more efficient, transparent, and explainable while keeping human review and authoritative verification central to the process.*