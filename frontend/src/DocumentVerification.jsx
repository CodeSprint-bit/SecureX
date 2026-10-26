import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  X,
  Search,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle,
  Clock,
} from "lucide-react";

import "./DocumentVerification.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DOCUMENT_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Driving Licence",
  "Voter ID",
  "Other",
];

export default function DocumentVerification() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("Aadhaar Card");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [reviewStarted, setReviewStarted] = useState(false);

  useEffect(() => {
    if (!file) return undefined;

    const objectUrl = URL.createObjectURL(file);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function selectFile(selectedFile) {
    setError("");
    setReviewStarted(false);

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        "Unsupported file format. Upload a PDF, JPG, PNG, or WebP image."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less.");
      return;
    }

    setFile(selectedFile);
  }

  function handleFileInput(event) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    selectFile(event.dataTransfer.files?.[0]);
  }

  function removeFile() {
    setFile(null);
    setError("");
    setReviewStarted(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function startReview(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload a document first.");
      return;
    }

    // This is a frontend demonstration only.
    // No OCR, tampering detection, or official database verification runs here.
    setReviewStarted(true);
  }

  function resetForm() {
    setFile(null);
    setDocumentType("Aadhaar Card");
    setReferenceNumber("");
    setNotes("");
    setError("");
    setReviewStarted(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const isImage = file?.type.startsWith("image/");
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="verification-page">
      <div className="verification-page-heading">
        <div>
          <span className="verification-eyebrow">
            SECUREX / DOCUMENT SERVICES
          </span>

          <h2>Document Verification</h2>

          <p>
            Upload a document and prepare it for verification and manual
            review.
          </p>
        </div>

        <div className="verification-prototype-badge">
          <ShieldCheck size={17} />
          Prototype mode
        </div>
      </div>

      <div className="verification-info-banner">
        <AlertTriangle size={21} />

        <div>
          <strong>Important verification notice</strong>
          <p>
            This prototype does not confirm document authenticity or detect
            tampering. A real verification result requires a connected
            verification service and, where appropriate, an authorized
            manual review.
          </p>
        </div>
      </div>

      <div className="verification-layout">
        <section className="verification-card">
          <div className="verification-card-heading">
            <div className="verification-heading-icon">
              <Upload size={21} />
            </div>

            <div>
              <h3>Upload document</h3>
              <p>Select the document you want to review.</p>
            </div>
          </div>

          <form onSubmit={startReview}>
            <div
              className={`verification-dropzone ${
                file ? "has-file" : ""
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                hidden
              />

              {!file ? (
                <>
                  <div className="verification-upload-icon">
                    <Upload size={29} />
                  </div>

                  <h4>Drop your document here</h4>

                  <p>or select a file from your computer</p>

                  <button
                    type="button"
                    className="verification-secondary-button"
                    onClick={() => inputRef.current?.click()}
                  >
                    Browse files
                  </button>

                  <span className="verification-file-hint">
                    PDF, JPG, PNG, or WebP · Maximum 10 MB
                  </span>
                </>
              ) : (
                <div className="verification-selected-file">
                  <div className="verification-file-icon">
                    {isImage ? (
                      <ImageIcon size={27} />
                    ) : (
                      <FileText size={27} />
                    )}
                  </div>

                  <div className="verification-file-information">
                    <strong>{file.name}</strong>
                    <span>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                      {file.type === "application/pdf" ? "PDF" : "Image"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="verification-icon-button"
                    onClick={removeFile}
                    aria-label="Remove selected document"
                    title="Remove document"
                  >
                    <X size={19} />
                  </button>
                </div>
              )}
            </div>

            <div className="verification-form-fields">
              <label>
                Document type
                <select
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Reference number
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  placeholder="Enter reference number (optional)"
                  maxLength={100}
                />
                <small>
                  Avoid entering unnecessary sensitive personal information.
                </small>
              </label>

              <label>
                Review notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter any details relevant to the review..."
                  rows={3}
                  maxLength={1000}
                />
              </label>
            </div>

            {error && (
              <div className="verification-error" role="alert">
                <AlertTriangle size={17} />
                <span>{error}</span>
              </div>
            )}

            <div className="verification-form-actions">
              <button
                type="button"
                className="verification-reset-button"
                onClick={resetForm}
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                type="submit"
                className="verification-primary-button"
              >
                <Search size={17} />
                Prepare review
              </button>
            </div>
          </form>
        </section>

        <aside className="verification-card verification-preview-card">
          <div className="verification-card-heading">
            <div className="verification-heading-icon">
              <FileCheck size={21} />
            </div>

            <div>
              <h3>Document preview</h3>
              <p>Review the uploaded file before proceeding.</p>
            </div>
          </div>

          {!file ? (
            <div className="verification-empty-preview">
              <div>
                <FileText size={37} />
              </div>

              <strong>No document selected</strong>

              <p>
                Your selected document will appear here when a preview is
                available.
              </p>
            </div>
          ) : (
            <div className="verification-preview-content">
              {isImage ? (
                <img
                  src={previewUrl}
                  alt="Preview of uploaded document"
                  className="verification-image-preview"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title="Uploaded PDF preview"
                  className="verification-pdf-preview"
                />
              )}

              <div className="verification-preview-details">
                <span>DOCUMENT TYPE</span>
                <strong>{documentType}</strong>

                <span>FILE NAME</span>
                <strong className="verification-preview-filename">
                  {file.name}
                </strong>

                <span>REFERENCE</span>
                <strong>{referenceNumber || "Not provided"}</strong>
              </div>
            </div>
          )}

          <div className="verification-preview-footer">
            <ShieldCheck size={17} />
            <span>
              Files are selected locally in this browser. This page does not
              upload them to a verification server.
            </span>
          </div>
        </aside>
      </div>

      {reviewStarted && (
        <section className="verification-result-card">
          <div className="verification-result-icon">
            <CheckCircle size={25} />
          </div>

          <div className="verification-result-content">
            <span className="verification-eyebrow">
              REVIEW PREPARATION COMPLETE
            </span>

            <h3>Document ready for review</h3>

            <p>
              Your document details have been prepared in the frontend.
              Authenticity, expiry, and tampering checks have not been run.
            </p>

            <div className="verification-result-grid">
              <div>
                <span>Document type</span>
                <strong>{documentType}</strong>
              </div>

              <div>
                <span>Review status</span>
                <strong className="verification-status-pending">
                  <Clock size={15} />
                  Awaiting real verification
                </strong>
              </div>

              <div>
                <span>Reference number</span>
                <strong>{referenceNumber || "Not provided"}</strong>
              </div>
            </div>

            {notes.trim() && (
              <div className="verification-notes-result">
                <strong>Review notes</strong>
                <p>{notes}</p>
              </div>
            )}

            <div className="verification-demo-warning">
              <AlertTriangle size={17} />
              <span>
                Demo only: no authenticity verdict has been produced.
                Connect a backend verification service to perform real
                checks.
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}