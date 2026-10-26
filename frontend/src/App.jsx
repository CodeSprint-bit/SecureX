
import { useEffect, useState } from "react";

import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  FileCheck,
  History,
  Settings as SettingsIcon,
  Bell,
  Search,
  User,
  Menu,
  X,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  FileImage,
  Trash2,
  RotateCcw,
  Info,
  MapPin,
} from "lucide-react";

import "./App.css";
import "./Auth.css";
import "./Verification.css";

import AdminDashboard from "./AdminDashboard.jsx";
import VerificationHistory from "./VerificationHistory.jsx";
import Notifications from "./Notifications.jsx";
import SettingsPage from "./Settings.jsx";
import Checkposts from "./Checkposts.jsx";

import residenceDataset from "./datasets/residenceCertificates.json";
import identityDataset from "./datasets/identityDocuments.json";
import educationDataset from "./datasets/educationalCertificates.json";

import Tesseract from "tesseract.js";

const API_BASE = "http://127.0.0.1:8000/api";
const TOKEN_KEY = "securex_access_token";
const DEMO_ADMIN_TOKEN = "prototype-demo-token";

// --------------------------------------------------
// DEMO ADMIN
// --------------------------------------------------

function createDemoAdmin() {
  return {
    id: 0,
    officer_id: "ADMIN-DEMO",
    full_name: "SecureX Administrator",
    email: "admin@securex.local",
    designation: "System Administrator",
    account_status: "approved",
    is_admin: true,
    checkpost: null,
  };
}

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    officer_id: "",
    email: "",
    password: "",
    designation: "",
    checkpost_id: "1",
  });

  function updateField(event) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  function enterPrototypeAdmin() {
    onLogin(DEMO_ADMIN_TOKEN, createDemoAdmin());
  }

  async function submitForm(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isRegister = mode === "register";

      const endpoint = isRegister
        ? `${API_BASE}/auth/register`
        : `${API_BASE}/auth/login`;

      const payload = isRegister
        ? {
            full_name: form.full_name.trim(),
            officer_id: form.officer_id.trim(),
            email: form.email.trim(),
            password: form.password,
            designation: form.designation.trim(),
            checkpost_id: Number(form.checkpost_id),
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.detail;

        throw new Error(
          Array.isArray(detail)
            ? detail.map((item) => item.msg).join(", ")
            : typeof detail === "string"
              ? detail
              : "The request failed. Please check your details."
        );
      }

      if (isRegister) {
        window.alert(
          data.message ||
            "Registration submitted successfully. You can now try signing in."
        );

        setMode("login");
        setError("");

        setForm((previous) => ({
          ...previous,
          password: "",
        }));

        return;
      }

      if (!data.access_token) {
        throw new Error("The server did not return an access token.");
      }

      onLogin(data.access_token, data.officer || data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to SecureX. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-logo">
            <ShieldCheck size={30} />
          </div>

          <div>
            <h1>SecureX</h1>
            <p>Document Verification System</p>
          </div>
        </div>

        <div className="auth-brand-content">
          <span className="auth-eyebrow">
            SECURE • VERIFIED • ACCOUNTABLE
          </span>

          <h2>Trust begins with verification.</h2>

          <p>
            A unified workspace for authorized officers to review documents,
            record verification activity, and manage their assigned checkpost.
          </p>

          <div className="auth-feature">
            <ShieldCheck size={20} />
            <div>
              <strong>Controlled access</strong>
              <span>
                Officer accounts can require administrator approval.
              </span>
            </div>
          </div>

          <div className="auth-feature">
            <FileCheck size={20} />
            <div>
              <strong>Document review</strong>
              <span>Keep verification workflows organized.</span>
            </div>
          </div>
        </div>

        <p className="auth-footer">
          SecureX · Authorized personnel only
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-mobile-brand">
            <ShieldCheck size={28} />
            <strong>SecureX</strong>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">
              {mode === "login" ? "OFFICER PORTAL" : "JOIN SECUREX"}
            </span>

            <h2>
              {mode === "login" ? "Welcome back" : "Officer registration"}
            </h2>

            <p>
              {mode === "login"
                ? "Sign in to access your verification dashboard."
                : "Submit your details for administrator approval."}
            </p>
          </div>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={submitForm} className="auth-form">
            {mode === "register" && (
              <>
                <label>
                  Full name
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={updateField}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label>
                  Officer ID
                  <input
                    name="officer_id"
                    value={form.officer_id}
                    onChange={updateField}
                    placeholder="Enter your officer ID"
                    required
                  />
                </label>

                <label>
                  Designation
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={updateField}
                    placeholder="e.g. Verification Officer"
                    required
                  />
                </label>

                <label>
                  Assigned checkpost ID
                  <input
                    type="number"
                    name="checkpost_id"
                    value={form.checkpost_id}
                    onChange={updateField}
                    min="1"
                    required
                  />
                  <small>Enter an existing active checkpost ID.</small>
                </label>
              </>
            )}

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="officer@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder={
                  mode === "register"
                    ? "Create a strong password"
                    : "Enter your password"
                }
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "register" ? 12 : undefined}
                required
              />

              {mode === "register" && (
                <small>
                  Password must contain at least 12 characters.
                </small>
              )}
            </label>

            {error && (
              <div className="auth-error" role="alert">
                <AlertTriangle size={17} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in to SecureX"
                  : "Submit registration"}
            </button>
          </form>

          {mode === "login" && (
            <div style={{ marginTop: "14px" }}>
              <button
                type="button"
                className="auth-submit"
                style={{
                  background: "#475569",
                  width: "100%",
                }}
                onClick={enterPrototypeAdmin}
              >
                Enter Prototype Admin Dashboard
              </button>

              <p
                style={{
                  fontSize: "12px",
                  textAlign: "center",
                  marginTop: "8px",
                  color: "#64748b",
                }}
              >
                Local demonstration only — this bypasses backend authentication.
              </p>
            </div>
          )}

          <p className="auth-security-note">
            <ShieldCheck size={15} />
            Access is restricted to authorized personnel.
          </p>
        </div>
      </section>
    </main>
  );
}

// --------------------------------------------------
// SIDEBAR
// --------------------------------------------------

function Sidebar({
  activePage,
  setActivePage,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Document Verification", icon: FileCheck },
    { name: "Checkposts & Reports", icon: MapPin },
    { name: "Verification History", icon: History },
    { name: "Notifications", icon: Bell },
    { name: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2>SecureX</h2>
            <span>Officer workspace</span>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-section-label">WORKSPACE</p>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.name}
                className={`sidebar-link ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-secure-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure session</strong>
              <span>Officer portal</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// --------------------------------------------------
// HEADER
// --------------------------------------------------

function Header({ activePage, officer, onMenuClick }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <div className="header-breadcrumb">
            SecureX <span>/</span> {activePage}
          </div>
          <h1>{activePage}</h1>
        </div>
      </div>

      <div className="header-right">
        <div className="header-officer">
          <div className="header-avatar">
            <User size={18} />
          </div>

          <div>
            <strong>
              {officer?.full_name || officer?.name || "Officer"}
            </strong>
            <span>
              {officer?.designation || "Authorized officer"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// --------------------------------------------------
// DASHBOARD
// --------------------------------------------------

function Dashboard({ officer, setActivePage }) {
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.toLowerCase().trim();

  const showVerificationTool =
    !query ||
    "document verification".includes(query) ||
    "start a document verification".includes(query);

  return (
    <div className="dashboard-content">
      <section className="welcome-banner">
        <div>
          <span className="welcome-label">OFFICER WORKSPACE</span>
          <h2>
            Welcome, {officer?.full_name || officer?.name || "Officer"}
          </h2>
          <p>
            Review your workspace and start a document verification when
            you're ready.
          </p>
        </div>

        <div className="welcome-icon">
          <ShieldCheck size={38} />
        </div>
      </section>

      <section className="assigned-checkpost-card">
        <div className="assigned-checkpost-icon">
          <ShieldCheck size={22} />
        </div>

        <div>
          <span>YOUR ASSIGNED CHECKPOST</span>
          <h3>
            {officer?.checkpost_name ||
              officer?.checkpost?.name ||
              (officer?.checkpost_id
                ? `Checkpost ID ${officer.checkpost_id}`
                : "Assigned checkpost")}
          </h3>
          <p>
            Verification records should be associated with your assigned
            checkpost.
          </p>
        </div>

        <span className="checkpost-status">
          <span /> Assigned
        </span>
      </section>

      <section className="dashboard-section-heading">
        <div>
          <h2>Verification workspace</h2>
          <p>Quick access to your document review tools.</p>
        </div>
      </section>

      <div className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <div className="stat-icon stat-blue">
            <FileText size={22} />
          </div>
          <span className="stat-label">Total verifications</span>
          <strong>—</strong>
          <small>Live backend statistics not connected</small>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon stat-amber">
            <Clock size={22} />
          </div>
          <span className="stat-label">Pending review</span>
          <strong>—</strong>
          <small>Live backend statistics not connected</small>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon stat-green">
            <CheckCircle size={22} />
          </div>
          <span className="stat-label">Completed</span>
          <strong>—</strong>
          <small>Live backend statistics not connected</small>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon stat-red">
            <AlertTriangle size={22} />
          </div>
          <span className="stat-label">Flagged for review</span>
          <strong>—</strong>
          <small>Flags require human review</small>
        </article>
      </div>

      <section className="dashboard-tools-card">
        <div className="dashboard-tools-heading">
          <div>
            <h2>Document verification</h2>
            <p>Open the verification workspace to continue.</p>
          </div>
          <FileCheck size={25} />
        </div>

        <div className="dashboard-search">
          <Search size={18} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tools in your workspace..."
          />
        </div>

        {showVerificationTool && (
          <div className="dashboard-tool-row">
            <div className="dashboard-tool-icon">
              <Upload size={22} />
            </div>

            <div className="dashboard-tool-description">
              <strong>Start a document verification</strong>
              <span>
                Upload a document and review the extracted information.
              </span>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => setActivePage("Document Verification")}
            >
              Open workspace
            </button>
          </div>
        )}

        {query && !showVerificationTool && (
          <p className="search-empty">
            No matching quick-access tool found.
          </p>
        )}
      </section>

      <p className="dashboard-disclaimer">
        Verification counts are not yet connected to live backend data.
        Suspected mismatches should be reviewed by an authorized person.
      </p>
    </div>
  );
}

// --------------------------------------------------
// DOCUMENT VERIFICATION
// --------------------------------------------------

function DocumentVerificationPage({ officer, token }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("Identity document");
  const [holderName, setHolderName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const datasetConfig = {
    "Residence certificate": {
      dataset: residenceDataset,
      nameField: "fullName",
      numberField: "documentNumber",
      label: "Residence Certificate Registry",
    },
    "Identity document": {
      dataset: identityDataset,
      nameField: "fullName",
      numberField: "documentNumber",
      label: "Identity Reference Dataset",
    },
    "Educational certificate": {
      dataset: educationDataset,
      nameField: "studentName",
      numberField: "documentNumber",
      label: "Educational Certificate Registry",
    },
  };

  useEffect(() => {
    return () => {
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    };
  }, [file]);

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function findFieldInOCR(ocrText, value) {
    const normalizedValue = normalize(value);
    const normalizedText = normalize(ocrText);

    return Boolean(
      normalizedValue && normalizedText.includes(normalizedValue)
    );
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0];

    setError("");
    setReview(null);

    if (!selected) return;

    const extensionAllowed = /\.(pdf|jpe?g|png)$/i.test(selected.name);

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selected.type) && !extensionAllowed) {
      setError("Choose a PDF, JPG, or PNG file.");
      event.target.value = "";
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("The file is larger than 10 MB. Choose a smaller file.");
      event.target.value = "";
      return;
    }

    const isImage =
      selected.type.startsWith("image/") ||
      /\.(jpe?g|png)$/i.test(selected.name);

    const previewUrl = isImage ? URL.createObjectURL(selected) : null;

    setFile({
      raw: selected,
      name: selected.name,
      size: selected.size,
      type: selected.type,
      isImage,
      previewUrl,
    });
  }

  function removeFile() {
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }

    setFile(null);
    setReview(null);

    const input = document.getElementById("securex-document-file");

    if (input) input.value = "";
  }

  async function runPreliminaryReview(event) {
    event.preventDefault();
    setError("");
    setReview(null);

    if (!file) {
      setError("Upload a document before starting the review.");
      return;
    }

    if (holderName.trim().length < 2) {
      setError("Enter the document holder's name.");
      return;
    }

    if (!referenceNumber.trim()) {
      setError("Enter the document reference number.");
      return;
    }

    setProcessing(true);

    try {
      // 1. OCR extraction
      let ocrText = "";
      let ocrStatus = "not_run";

      if (file.isImage) {
        try {
          const result = await Tesseract.recognize(file.raw, "eng", {
            logger: (message) => {
              if (message.status === "recognizing text") {
                console.debug(
                  `SecureX OCR: ${Math.round(
                    (message.progress || 0) * 100
                  )}%`
                );
              }
            },
          });

          ocrText = result.data.text || "";
          ocrStatus = ocrText.trim() ? "completed" : "no_text";
        } catch (ocrError) {
          console.error("OCR error:", ocrError);
          ocrStatus = "failed";
        }
      } else {
        ocrStatus = "pdf_not_supported";
      }

      // 2. Mock reference dataset lookup
      const config = datasetConfig[documentType];
      const records = config?.dataset?.records || [];

      const normalizedReference = normalize(referenceNumber);
      const normalizedName = normalize(holderName);

      const matchedRecord = records.find(
        (record) =>
          normalize(record[config.numberField]) === normalizedReference
      );

      const datasetNameMatch = matchedRecord
        ? normalize(matchedRecord[config.nameField]) === normalizedName
        : false;

      // 3. Compare entered details with OCR text
      const ocrAvailable = ocrStatus === "completed";

      const nameInOCR = ocrAvailable
        ? findFieldInOCR(ocrText, holderName)
        : null;

      const referenceInOCR = ocrAvailable
        ? findFieldInOCR(ocrText, referenceNumber)
        : null;

      const recordStatus = matchedRecord?.status || null;

      // 4. Calculate preliminary match score
      const scoreBreakdown = [
        {
          title: "Reference number matches dataset",
          weight: 30,
          earned: matchedRecord ? 30 : 0,
          status: matchedRecord ? "pass" : "warning",
          detail: matchedRecord
            ? "The reference number matches a record in the selected mock dataset."
            : "No record with this reference number was found in the selected mock dataset.",
        },
        {
          title: "Holder name matches dataset",
          weight: 20,
          earned: datasetNameMatch ? 20 : 0,
          status: !matchedRecord
            ? "warning"
            : datasetNameMatch
              ? "pass"
              : "mismatch",
          detail: !matchedRecord
            ? "This check could not be performed because no matching reference record was found."
            : datasetNameMatch
              ? "The entered name matches the name in the mock reference record."
              : "The entered name does not match the name in the mock reference record.",
        },
        {
          title: "Reference number found in OCR text",
          weight: 25,
          earned: referenceInOCR === true ? 25 : 0,
          status: !ocrAvailable
            ? "warning"
            : referenceInOCR
              ? "pass"
              : "mismatch",
          detail: !ocrAvailable
            ? "Not scored because readable OCR text was unavailable."
            : referenceInOCR
              ? "The entered reference number was found in the extracted image text."
              : "The entered reference number was not found in the extracted text. OCR may have misread it.",
        },
        {
          title: "Holder name found in OCR text",
          weight: 25,
          earned: nameInOCR === true ? 25 : 0,
          status: !ocrAvailable
            ? "warning"
            : nameInOCR
              ? "pass"
              : "mismatch",
          detail: !ocrAvailable
            ? "Not scored because readable OCR text was unavailable."
            : nameInOCR
              ? "The entered holder name was found in the extracted image text."
              : "The entered holder name was not found in the extracted text. OCR may have misread it.",
        },
      ];

      const matchScore = scoreBreakdown.reduce(
        (total, item) => total + item.earned,
        0
      );

      const scoreColor =
        matchScore >= 80
          ? "#15803d"
          : matchScore >= 50
            ? "#b45309"
            : "#b91c1c";

      // 5. Build the review checklist
      const checks = [
        {
          title: "File selected",
          status: "info",
          detail: `${file.name} was selected successfully.`,
        },
        {
          title: "OCR text extraction",
          status: ocrAvailable ? "pass" : "warning",
          detail: ocrAvailable
            ? "Text was extracted from the image. OCR may make mistakes."
            : ocrStatus === "failed"
              ? "OCR could not process this image. Manual review is required."
              : ocrStatus === "pdf_not_supported"
                ? "PDF text extraction is not implemented in this prototype."
                : "No readable text was found in the image.",
        },
        {
          title: "Reference dataset lookup",
          status: matchedRecord ? "pass" : "warning",
          detail: matchedRecord
            ? `The reference number matches a record in the mock ${config.label}.`
            : `No matching reference number was found in the mock ${config.label}.`,
        },
        {
          title: "Holder name comparison",
          status: matchedRecord
            ? datasetNameMatch
              ? "pass"
              : "mismatch"
            : "warning",
          detail: matchedRecord
            ? datasetNameMatch
              ? "The entered holder name matches the reference record."
              : "The entered name does not match the name in the reference record."
            : "A comparison against the reference dataset was not possible.",
        },
        {
          title: "Reference number in document image",
          status: !ocrAvailable
            ? "warning"
            : referenceInOCR
              ? "pass"
              : "mismatch",
          detail: !ocrAvailable
            ? "Could not compare the reference number with OCR text."
            : referenceInOCR
              ? "The entered reference number was found in the extracted text."
              : "The entered reference number was not found in OCR text. OCR may have misread it.",
        },
        {
          title: "Holder name in document image",
          status: !ocrAvailable
            ? "warning"
            : nameInOCR
              ? "pass"
              : "mismatch",
          detail: !ocrAvailable
            ? "Could not compare the holder name with OCR text."
            : nameInOCR
              ? "The entered name was found in the extracted text."
              : "The entered name was not found in OCR text. Check the image manually.",
        },
        {
          title: "Reference record status",
          status: !matchedRecord
            ? "warning"
            : recordStatus === "revoked"
              ? "mismatch"
              : recordStatus === "valid"
                ? "pass"
                : "warning",
          detail: !matchedRecord
            ? "No reference record was available to check."
            : recordStatus === "revoked"
              ? "The mock reference dataset marks this record as revoked."
              : recordStatus === "valid"
                ? "The mock reference dataset marks this record as valid; this is not official confirmation."
                : `The dataset status is '${recordStatus}'. Manual review is required.`,
        },
      ];

      // 6. Determine preliminary outcome
      const hasMismatch = checks.some(
        (check) => check.status === "mismatch"
      );

      const hasWarnings = checks.some(
        (check) => check.status === "warning"
      );

      const outcome = hasMismatch
        ? "FLAGGED_FOR_MANUAL_REVIEW"
        : hasWarnings
          ? "REQUIRES_MANUAL_REVIEW"
          : "PRELIMINARY_CHECKS_COMPLETED";

      // 7. Build the preliminary review report
      const reviewResult = {
        id: `SX-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toLocaleString(),
        filename: file.name,
        documentType,
        datasetName: config.label,
        checks,
        outcome,
        ocrText,
        ocrStatus,
        matchScore,
        scoreColor,
        scoreBreakdown,
        matchedRecord: matchedRecord
          ? {
              recordId: matchedRecord.recordId,
              documentNumber: matchedRecord[config.numberField],
              holderName: matchedRecord[config.nameField],
              status: matchedRecord.status,
            }
          : null,
        historySaved: false,
        historyReference: null,
      };

      setReview(reviewResult);

      // Save minimal report metadata to backend history.
      // Ensure the backend CreateHistoryRequest schema matches this payload.
      if (token && token !== DEMO_ADMIN_TOKEN) {
        try {
          const historyResponse = await fetch(`${API_BASE}/history`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              document_type: documentType,
              original_filename: file.name,
              status: outcome,
              review_notes: notes.trim() || null,
            }),
          });

          const historyData = await historyResponse
            .json()
            .catch(() => ({}));

          if (!historyResponse.ok) {
            const detail = historyData.detail;

            throw new Error(
              Array.isArray(detail)
                ? detail.map((item) => item.msg).join(", ")
                : typeof detail === "string"
                  ? detail
                  : "The report was created, but saving to history failed."
            );
          }

          setReview((previous) =>
            previous
              ? {
                  ...previous,
                  historySaved: true,
                  historyReference:
                    historyData.reference_id ||
                    historyData.record?.reference_id ||
                    historyData.verification_number ||
                    historyData.id ||
                    null,
                }
              : previous
          );

          setError("");
        } catch (saveError) {
          console.error("History save error:", saveError);

          setError(
            `The preliminary review was completed, but saving to backend history failed: ${
              saveError.message || "Backend unavailable."
            }`
          );
        }
      } else {
        setError(
          "The preliminary review is complete, but prototype mode does not save reports to backend history. Sign in with a real officer account to save it."
        );
      }
    } catch (reviewError) {
      console.error("Review error:", reviewError);
      setError(
        "The review could not be completed. Check the file and try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  function resetReview() {
    removeFile();
    setHolderName("");
    setReferenceNumber("");
    setNotes("");
    setError("");
    setReview(null);
    setDocumentType("Identity document");
  }

  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="verification-page">
      <section className="verification-intro">
        <div className="verification-intro-icon">
          <FileCheck size={27} />
        </div>

        <div>
          <span className="verification-eyebrow">
            DOCUMENT REVIEW WORKSPACE
          </span>
          <h2>Document Verification</h2>
          <p>
            Extract text from images and compare entered details with
            the project's mock reference datasets.
          </p>
        </div>
      </section>

      <div className="verification-layout">
        <form
          className="verification-card"
          onSubmit={runPreliminaryReview}
        >
          <div className="verification-card-heading">
            <div>
              <h3>1. Upload document</h3>
              <p>PDF, JPG, PNG · Maximum size: 10 MB</p>
            </div>
            <Upload size={22} />
          </div>

          <label
            className={`verification-dropzone ${file ? "has-file" : ""}`}
            htmlFor="securex-document-file"
          >
            <input
              id="securex-document-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={chooseFile}
            />

            <div className="verification-upload-icon">
              {file?.type === "application/pdf" ? (
                <FileText size={27} />
              ) : (
                <Upload size={27} />
              )}
            </div>

            <strong>
              {file
                ? "Choose a different file"
                : "Click to select a document"}
            </strong>

            <span>
              {file
                ? file.name
                : "Select a PDF, JPG, or PNG from your device"}
            </span>
          </label>

          {file && (
            <div className="verification-file-card">
              <div className="verification-file-icon">
                {file.isImage ? (
                  <FileImage size={23} />
                ) : (
                  <FileText size={23} />
                )}
              </div>

              <div className="verification-file-info">
                <strong>{file.name}</strong>
                <span>
                  {formatFileSize(file.size)} · {file.type || "Document"}
                </span>
              </div>

              <button
                type="button"
                className="verification-icon-button"
                onClick={removeFile}
                aria-label="Remove selected document"
                disabled={processing}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          {file?.previewUrl && (
            <div className="verification-preview">
              <span>Image preview</span>
              <img
                src={file.previewUrl}
                alt="Selected document preview"
              />
            </div>
          )}

          {file && !file.isImage && (
            <div className="verification-pdf-note">
              <FileText size={19} />
              PDF is accepted for upload, but PDF OCR is not yet supported.
            </div>
          )}

          <div className="verification-divider" />

          <div className="verification-card-heading">
            <div>
              <h3>2. Document details</h3>
              <p>
                Select the category and enter the details printed on the document.
              </p>
            </div>
          </div>

          <label className="verification-field">
            Document category
            <select
              value={documentType}
              onChange={(event) => {
                setDocumentType(event.target.value);
                setReview(null);
              }}
            >
              <option>Identity document</option>
              <option>Residence certificate</option>
              <option>Educational certificate</option>
            </select>
          </label>

          <label className="verification-field">
            Document holder's name
            <input
              value={holderName}
              onChange={(event) => setHolderName(event.target.value)}
              placeholder="Enter the name printed on the document"
              autoComplete="off"
              required
            />
          </label>

          <label className="verification-field">
            Document/reference number
            <input
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="Enter the reference number"
              autoComplete="off"
              required
            />
          </label>

          <label className="verification-field">
            Officer notes <span className="optional-label">Optional</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Record observations for manual review..."
              rows={3}
            />
          </label>

          {error && (
            <div className="verification-error" role="alert">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="verification-actions">
            <button
              type="button"
              className="verification-secondary-button"
              onClick={resetReview}
              disabled={processing}
            >
              <RotateCcw size={17} />
              Reset
            </button>

            <button
              type="submit"
              className="verification-primary-button"
              disabled={processing}
            >
              <ShieldCheck size={18} />
              {processing
                ? "Analyzing document..."
                : "Run preliminary review"}
            </button>
          </div>

          <p className="verification-private-note">
            <ShieldCheck size={15} />
            The selected document and OCR processing stay in the browser.
            Only limited report metadata is sent to backend history.
          </p>
        </form>

        <aside className="verification-side-column">
          <section className="verification-card verification-guidance">
            <div className="verification-card-heading">
              <div>
                <h3>Review checklist</h3>
                <p>Checks to support an authorized officer.</p>
              </div>
              <CheckCircle size={22} />
            </div>

            <div className="verification-checklist-item">
              <span className="checklist-number">01</span>
              <div>
                <strong>OCR text extraction</strong>
                <p>Extract readable text from a JPG or PNG image.</p>
              </div>
            </div>

            <div className="verification-checklist-item">
              <span className="checklist-number">02</span>
              <div>
                <strong>Reference lookup</strong>
                <p>
                  Compare the reference number with the selected mock dataset.
                </p>
              </div>
            </div>

            <div className="verification-checklist-item">
              <span className="checklist-number">03</span>
              <div>
                <strong>Manual confirmation</strong>
                <p>
                  Confirm through an official source before making a decision.
                </p>
              </div>
            </div>
          </section>

          {review && (
            <section
              className="verification-card verification-results"
              aria-live="polite"
            >
              <div className="verification-card-heading">
                <div>
                  <h3>Preliminary review report</h3>
                  <p>Reference: {review.id}</p>
                </div>
                <Clock size={21} />
              </div>

              <div
                className="verification-notice compact"
                style={{ marginBottom: "16px" }}
                role="status"
              >
                <Info size={18} />
                <p>
                  {review.historySaved
                    ? `Saved to backend history${
                        review.historyReference
                          ? ` — reference: ${review.historyReference}`
                          : ""
                      }.`
                    : token === DEMO_ADMIN_TOKEN
                      ? "Prototype mode: this report is not saved to backend history."
                      : "History saving has not been confirmed. Check the message above and verify your backend connection."}
                </p>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.07em",
                        color: "#64748b",
                        marginBottom: "5px",
                      }}
                    >
                      PRELIMINARY MATCH SCORE
                    </span>

                    <strong
                      style={{
                        fontSize: "32px",
                        lineHeight: 1.2,
                        color: review.scoreColor,
                      }}
                    >
                      {review.matchScore}
                      <span style={{ fontSize: "18px" }}>/100</span>
                    </strong>
                  </div>

                  <span
                    style={{
                      padding: "7px 10px",
                      borderRadius: "20px",
                      background:
                        review.matchScore >= 80
                          ? "#dcfce7"
                          : review.matchScore >= 50
                            ? "#fef3c7"
                            : "#fee2e2",
                      color: review.scoreColor,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {review.matchScore >= 80
                      ? "High match"
                      : review.matchScore >= 50
                        ? "Partial match"
                        : "Low match"}
                  </span>
                </div>

                <div
                  style={{
                    height: "9px",
                    width: "100%",
                    background: "#e2e8f0",
                    borderRadius: "99px",
                    overflow: "hidden",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${review.matchScore}%`,
                      background: review.scoreColor,
                      borderRadius: "99px",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: 1.6,
                  }}
                >
                  This score measures matching fields only. It is not a
                  probability of authenticity, and it does not establish that
                  a document is genuine.
                </p>

                <div
                  style={{
                    marginTop: "18px",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "12px",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "13px",
                      marginBottom: "10px",
                    }}
                  >
                    Score breakdown
                  </strong>

                  {review.scoreBreakdown.map((item) => (
                    <div
                      key={item.title}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "9px 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#334155",
                          }}
                        >
                          {item.title}
                        </span>

                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            lineHeight: 1.5,
                            color: "#64748b",
                            marginTop: "3px",
                          }}
                        >
                          {item.detail}
                        </span>
                      </div>

                      <strong
                        style={{
                          whiteSpace: "nowrap",
                          fontSize: "12px",
                          color:
                            item.earned === item.weight
                              ? "#15803d"
                              : "#64748b",
                        }}
                      >
                        {item.earned}/{item.weight}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="verification-result-banner">
                {review.outcome === "FLAGGED_FOR_MANUAL_REVIEW" ? (
                  <AlertTriangle size={21} />
                ) : review.outcome === "REQUIRES_MANUAL_REVIEW" ? (
                  <Info size={21} />
                ) : (
                  <CheckCircle size={21} />
                )}

                <div>
                  <strong>
                    {review.outcome === "FLAGGED_FOR_MANUAL_REVIEW"
                      ? "Discrepancy detected"
                      : review.outcome === "REQUIRES_MANUAL_REVIEW"
                        ? "Manual review required"
                        : "Preliminary checks completed"}
                  </strong>
                  <span>
                    This report is not an authenticity verdict.
                  </span>
                </div>
              </div>

              <div className="verification-result-meta">
                <span>File</span>
                <strong>{review.filename}</strong>

                <span>Document category</span>
                <strong>{review.documentType}</strong>

                <span>Reference dataset</span>
                <strong>{review.datasetName} (mock data)</strong>

                <span>Reviewed at</span>
                <strong>{review.createdAt}</strong>

                <span>Officer</span>
                <strong>
                  {officer?.full_name || officer?.name || "Officer"}
                </strong>
              </div>

              {review.matchedRecord && (
                <div className="verification-officer-notes">
                  <strong>Matching mock record</strong>
                  <p>Record ID: {review.matchedRecord.recordId}</p>
                  <p>Holder: {review.matchedRecord.holderName}</p>
                  <p>
                    Reference: {review.matchedRecord.documentNumber}
                  </p>
                  <p>Status: {review.matchedRecord.status}</p>
                </div>
              )}

              <div className="verification-result-checks">
                {review.checks.map((check) => (
                  <div
                    className="verification-result-check"
                    key={check.title}
                  >
                    {check.status === "pass" ? (
                      <CheckCircle size={18} />
                    ) : check.status === "mismatch" ? (
                      <AlertTriangle size={18} />
                    ) : check.status === "warning" ? (
                      <Info size={18} />
                    ) : (
                      <FileCheck size={18} />
                    )}

                    <div>
                      <strong>{check.title}</strong>
                      <span>{check.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              {review.ocrText && (
                <details className="verification-officer-notes">
                  <summary>View extracted OCR text</summary>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      fontSize: "12px",
                    }}
                  >
                    {review.ocrText}
                  </pre>
                </details>
              )}

              {notes.trim() && (
                <div className="verification-officer-notes">
                  <strong>Officer notes</strong>
                  <p>{notes}</p>
                </div>
              )}

              <div className="verification-notice compact">
                <Info size={18} />
                <p>
                  These reference records are demonstration data, not an
                  official registry. OCR can misread text, and a dataset
                  match does not prove that a document is genuine.
                </p>
              </div>
            </section>
          )}

          <section className="verification-notice">
            <Info size={21} />
            <div>
              <strong>Preliminary review only</strong>
              <p>
                A file preview, OCR result, or mock dataset match cannot
                establish authenticity. Use an authorized verification
                source before making a final decision.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

// --------------------------------------------------
// PLACEHOLDER PAGES
// --------------------------------------------------

function PlaceholderPage({ title }) {
  const pageDetails = {
    Settings: {
      description: "Account and workspace settings.",
      icon: SettingsIcon,
    },
  };

  const details = pageDetails[title] || {
    description: "This workspace is being prepared.",
    icon: FileText,
  };

  const Icon = details.icon;

  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Icon size={30} />
      </div>
      <h2>{title}</h2>
      <p>{details.description}</p>
    </div>
  );
}

// --------------------------------------------------
// MAIN APP AND SESSION RESTORATION
// --------------------------------------------------

export default function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [officer, setOfficer] = useState(null);

  const [checkingSession, setCheckingSession] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY))
  );

  const [sessionError, setSessionError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setOfficer(null);
        setCheckingSession(false);
        return;
      }

      if (token === DEMO_ADMIN_TOKEN) {
        if (!cancelled) {
          setOfficer(createDemoAdmin());
          setSessionError("");
          setCheckingSession(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Your session has expired. Please sign in again."
          );
        }

        if (!cancelled) {
          setOfficer(data.officer || data);
          setSessionError("");
        }
      } catch (err) {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setOfficer(null);
          setSessionError(err.message || "Please sign in again.");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleLogin(accessToken, officerData) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setOfficer(officerData || null);
    setSessionError("");
    setCheckingSession(false);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOfficer(null);
    setActivePage("Dashboard");
    setMobileOpen(false);
    setCheckingSession(false);
    setSessionError("");
  }

  if (checkingSession) {
    return (
      <div className="securex-loading">
        <div className="securex-loading-logo">
          <ShieldCheck size={30} />
        </div>
        <h2>SecureX</h2>
        <p>Restoring your secure session...</p>
      </div>
    );
  }

  if (!token || !officer) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} />
        {sessionError && (
          <div className="session-error-message" role="status">
            {sessionError}
          </div>
        )}
      </>
    );
  }

  if (officer.is_admin === true) {
    return (
      <AdminDashboard
        token={token}
        admin={officer}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="securex-app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="dashboard-main">
        <Header
          activePage={activePage}
          officer={officer}
          onMenuClick={() => setMobileOpen(true)}
        />

        {activePage === "Dashboard" ? (
          <Dashboard
            officer={officer}
            setActivePage={setActivePage}
          />
        ) : activePage === "Document Verification" ? (
          <DocumentVerificationPage
            officer={officer}
            token={token}
          />
        ) : activePage === "Checkposts & Reports" ? (
          <Checkposts
            token={token}
            officer={officer}
          />
        ) : activePage === "Verification History" ? (
          <VerificationHistory token={token} />
        ) : activePage === "Notifications" ? (
          <Notifications
            token={token}
            officer={officer}
          />
        ) : activePage === "Settings" ? (
          <SettingsPage
            officer={officer}
            token={token}
            onLogout={handleLogout}
          />
        ) : (
          <PlaceholderPage title={activePage} />
        )}
      </main>
    </div>
  );
}
