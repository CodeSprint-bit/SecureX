
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  X,
  CalendarDays,
  ShieldCheck,
  Info,
} from "lucide-react";
import "./VerificationHistory.css";

const API_BASE = "http://127.0.0.1:8000/api";

function getRecordId(record) {
  return record.id ?? record.analysis_id ?? record.reference_id ?? record.report_id;
}

function getRecordTitle(record) {
  return (
    record.filename ||
    record.document_name ||
    record.document_type ||
    record.documentType ||
    "Untitled document"
  );
}

function getRecordDate(record) {
  const value =
    record.created_at ||
    record.createdAt ||
    record.verified_at ||
    record.timestamp ||
    record.date;

  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRecordStatus(record) {
  return String(
    record.status || record.outcome || record.review_status || "unknown"
  )
    .replaceAll("_", " ")
    .toLowerCase();
}

function getRecordRisk(record) {
  return String(
    record.risk_category || record.risk_level || record.risk || "not assessed"
  )
    .replaceAll("_", " ")
    .toLowerCase();
}

function statusClass(status) {
  if (
    status.includes("complete") ||
    status.includes("verified") ||
    status.includes("pass")
  ) return "vh-status-success";

  if (
    status.includes("flag") ||
    status.includes("mismatch") ||
    status.includes("high")
  ) return "vh-status-danger";

  if (
    status.includes("pending") ||
    status.includes("review") ||
    status.includes("inconclusive")
  ) return "vh-status-warning";

  return "vh-status-neutral";
}

function displayDate(date) {
  return date
    ? date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";
}

function extractRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.results)) return data.results;
  return null;
}

export default function VerificationHistory({ token }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/history`, {
        headers: {
          ...(token && token !== "prototype-demo-token"
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail =
          typeof data.detail === "string" ? data.detail : "";

        if (response.status === 404 || response.status === 405) {
          throw new Error(
            "The backend history endpoint is not implemented yet. Add GET /api/history to load saved verification records."
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            detail || "You are not authorized to view these verification records."
          );
        }

        throw new Error(
          detail || `Unable to load history (HTTP ${response.status}).`
        );
      }

      const data = await response.json();
      const parsed = extractRecords(data);

      if (!parsed) {
        throw new Error(
          "The history API returned an unsupported response format. Expected a list of records."
        );
      }

      setRecords(parsed);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the history API. Check that the backend is running."
      );
      setRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    return records.filter((record) => {
      const id = String(getRecordId(record) ?? "").toLowerCase();
      const title = getRecordTitle(record).toLowerCase();
      const type = String(
        record.document_type || record.documentType || ""
      ).toLowerCase();
      const status = getRecordStatus(record);
      const risk = getRecordRisk(record);
      const date = getRecordDate(record);

      const matchesSearch =
        !query ||
        id.includes(query) ||
        title.includes(query) ||
        type.includes(query);

      const matchesStatus =
        statusFilter === "all" || status.includes(statusFilter);

      const matchesRisk =
        riskFilter === "all" || risk.includes(riskFilter);

      let matchesDate = true;

      if (dateFilter !== "all") {
        if (!date) {
          matchesDate = false;
        } else {
          const age = now.getTime() - date.getTime();
          const day = 24 * 60 * 60 * 1000;

          if (dateFilter === "today") {
            matchesDate = date.toDateString() === now.toDateString();
          } else if (dateFilter === "7days") {
            matchesDate = age >= 0 && age <= 7 * day;
          } else if (dateFilter === "30days") {
            matchesDate = age >= 0 && age <= 30 * day;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesRisk && matchesDate;
    });
  }, [records, search, statusFilter, riskFilter, dateFilter]);

  const stats = useMemo(() => {
    return {
      total: records.length,
      completed: records.filter((record) => {
        const status = getRecordStatus(record);
        return status.includes("complete") || status.includes("verified");
      }).length,
      review: records.filter((record) => {
        const status = getRecordStatus(record);
        return (
          status.includes("pending") ||
          status.includes("review") ||
          status.includes("inconclusive")
        );
      }).length,
      flagged: records.filter((record) => {
        const status = getRecordStatus(record);
        const risk = getRecordRisk(record);
        return (
          status.includes("flag") ||
          status.includes("mismatch") ||
          risk.includes("high")
        );
      }).length,
    };
  }, [records]);

  async function deleteRecord(record) {
    const id = getRecordId(record);

    if (id == null) {
      setError("This record has no identifier, so it cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete verification record "${getRecordTitle(record)}"? This action may be permanent.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE}/history/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            ...(token && token !== "prototype-demo-token"
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail =
          typeof data.detail === "string" ? data.detail : "";

        throw new Error(
          detail ||
            (response.status === 404 || response.status === 405
              ? "The backend delete-history endpoint is not implemented yet."
              : `Could not delete this record (HTTP ${response.status}).`)
        );
      }

      setRecords((previous) =>
        previous.filter((item) => String(getRecordId(item)) !== String(id))
      );

      setSelectedRecord((previous) =>
        previous && String(getRecordId(previous)) === String(id)
          ? null
          : previous
      );

      setNotice("Verification record deleted.");
    } catch (err) {
      setError(err.message || "Could not delete this record.");
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRiskFilter("all");
    setDateFilter("all");
  }

  return (
    <div className="verification-history-page">
      <section className="vh-heading">
        <div className="vh-heading-icon">
          <History size={25} />
        </div>
        <div className="vh-heading-copy">
          <span className="vh-eyebrow">RECORD MANAGEMENT</span>
          <h2>Verification History</h2>
          <p>
            Search previous document reviews and inspect the findings saved by
            the verification system.
          </p>
        </div>
        <button
          type="button"
          className="vh-refresh-button"
          onClick={() => loadHistory(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "vh-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      {token === "prototype-demo-token" && (
        <div className="vh-notice">
          <Info size={18} />
          <span>
            Prototype admin session detected. This page requires a real
            backend history endpoint and authorized data to display records.
          </span>
        </div>
      )}

      {error && (
        <div className="vh-error" role="alert">
          <AlertTriangle size={19} />
          <div>
            <strong>History could not be loaded</strong>
            <p>{error}</p>
            <button type="button" onClick={() => loadHistory(true)}>
              Try again
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div className="vh-success-message" role="status">
          <CheckCircle size={17} />
          {notice}
        </div>
      )}

      <section className="vh-stat-grid">
        <article className="vh-stat-card">
          <div className="vh-stat-icon vh-blue">
            <FileText size={21} />
          </div>
          <span>Total records</span>
          <strong>{loading ? "—" : stats.total}</strong>
          <small>Saved verification records</small>
        </article>

        <article className="vh-stat-card">
          <div className="vh-stat-icon vh-green">
            <CheckCircle size={21} />
          </div>
          <span>Completed</span>
          <strong>{loading ? "—" : stats.completed}</strong>
          <small>Marked completed by the system</small>
        </article>

        <article className="vh-stat-card">
          <div className="vh-stat-icon vh-amber">
            <Clock size={21} />
          </div>
          <span>Review needed</span>
          <strong>{loading ? "—" : stats.review}</strong>
          <small>Pending or inconclusive records</small>
        </article>

        <article className="vh-stat-card">
          <div className="vh-stat-icon vh-red">
            <AlertTriangle size={21} />
          </div>
          <span>Flagged</span>
          <strong>{loading ? "—" : stats.flagged}</strong>
          <small>Requires human assessment</small>
        </article>
      </section>

      <section className="vh-records-card">
        <div className="vh-records-header">
          <div>
            <h3>All verification records</h3>
            <p>
              {loading
                ? "Loading saved records..."
                : `${filteredRecords.length} of ${records.length} records`}
            </p>
          </div>
        </div>

        <div className="vh-filters">
          <label className="vh-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference, filename, or type..."
              aria-label="Search verification records"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="complete">Completed</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="review">Needs review</option>
            <option value="flag">Flagged</option>
            <option value="inconclusive">Inconclusive</option>
          </select>

          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            aria-label="Filter by risk"
          >
            <option value="all">All risk levels</option>
            <option value="low">Low risk</option>
            <option value="medium">Medium risk</option>
            <option value="high">High risk</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="not assessed">Not assessed</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter by date"
          >
            <option value="all">Any date</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>

          <button
            type="button"
            className="vh-clear-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="vh-state">
            <RefreshCw size={25} className="vh-spin" />
            <strong>Loading history</strong>
            <p>Retrieving saved records from the backend.</p>
          </div>
        ) : !error && filteredRecords.length === 0 ? (
          <div className="vh-state">
            <div className="vh-empty-icon">
              <History size={27} />
            </div>
            <strong>
              {records.length === 0
                ? "No saved verification records yet"
                : "No records match these filters"}
            </strong>
            <p>
              {records.length === 0
                ? "Once verification results are saved by the backend, they will appear here."
                : "Try changing your search or clearing the filters."}
            </p>
            {records.length > 0 && (
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="vh-table-wrap">
            <table className="vh-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Reference ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const id = getRecordId(record);
                  const status = getRecordStatus(record);
                  const risk = getRecordRisk(record);
                  const date = getRecordDate(record);

                  return (
                    <tr key={id ?? `${getRecordTitle(record)}-${index}`}>
                      <td>
                        <div className="vh-document-cell">
                          <div className="vh-document-icon">
                            <FileText size={19} />
                          </div>
                          <div>
                            <strong title={getRecordTitle(record)}>
                              {getRecordTitle(record)}
                            </strong>
                            <span>
                              {record.document_type ||
                                record.documentType ||
                                "Document type unavailable"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="vh-reference">
                        {id == null ? "Unavailable" : String(id)}
                      </td>
                      <td>
                        <div className="vh-date-cell">
                          <CalendarDays size={15} />
                          <span>{displayDate(date)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`vh-pill ${statusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <span className={`vh-pill ${statusClass(risk)}`}>
                          {risk}
                        </span>
                      </td>
                      <td>
                        <div className="vh-actions">
                          <button
                            type="button"
                            className="vh-action-button"
                            title="View record details"
                            aria-label="View record details"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            type="button"
                            className="vh-action-button vh-delete-button"
                            title="Delete record"
                            aria-label="Delete record"
                            disabled={deletingId === id}
                            onClick={() => deleteRecord(record)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="vh-disclaimer">
        <ShieldCheck size={16} />
        A history entry records a system review, not definitive proof that a
        document is authentic. Decisions should be based on authorized
        verification and human review.
      </p>

      {selectedRecord && (
        <div
          className="vh-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <section
            className="vh-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vh-modal-title"
          >
            <div className="vh-modal-header">
              <div>
                <span className="vh-eyebrow">SAVED RECORD</span>
                <h3 id="vh-modal-title">Verification details</h3>
              </div>
              <button
                type="button"
                className="vh-action-button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="vh-detail-grid">
              <span>Document</span>
              <strong>{getRecordTitle(selectedRecord)}</strong>

              <span>Reference ID</span>
              <strong>{String(getRecordId(selectedRecord) ?? "Unavailable")}</strong>

              <span>Document type</span>
              <strong>
                {selectedRecord.document_type ||
                  selectedRecord.documentType ||
                  "Unavailable"}
              </strong>

              <span>Date</span>
              <strong>{displayDate(getRecordDate(selectedRecord))}</strong>

              <span>Status</span>
              <strong>{getRecordStatus(selectedRecord)}</strong>

              <span>Risk category</span>
              <strong>{getRecordRisk(selectedRecord)}</strong>
            </div>

            {selectedRecord.findings && (
              <div className="vh-detail-section">
                <h4>Findings</h4>
                <pre>{JSON.stringify(selectedRecord.findings, null, 2)}</pre>
              </div>
            )}

            {selectedRecord.report && (
              <div className="vh-detail-section">
                <h4>Report</h4>
                <pre>{JSON.stringify(selectedRecord.report, null, 2)}</pre>
              </div>
            )}

            <div className="vh-modal-footer">
              <button
                type="button"
                className="vh-close-button"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
