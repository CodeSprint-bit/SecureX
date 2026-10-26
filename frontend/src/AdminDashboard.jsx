import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
  LogOut,
} from "lucide-react";
import "./AdminDashboard.css";

const API = "http://127.0.0.1:8000/api";

export default function AdminDashboard({ token, admin, onLogout }) {
  const [pending, setPending] = useState([]);
  const [dashboard, setDashboard] = useState({
    total_checkposts: 0,
    active_checkposts: 0,
    total_officers: 0,
    pending_officers: 0,
    total_activities: 0,
    checkposts: [],
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : `Request failed (${response.status})`
      );
    }

    return data;
  }, [token]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all([
        request("/admin/pending-officers"),
        request("/admin/dashboard"),
      ]);

      const pendingData = results[0];
      setPending(
        Array.isArray(pendingData)
          ? pendingData
          : pendingData.officers || []
      );
      setDashboard(results[1]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function approveOfficer(officer) {
    const id = officer.officer_id;

    if (!id) {
      setError("The officer record does not contain an officer ID.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await request(
        `/admin/officers/${encodeURIComponent(id)}/approve`,
        { method: "POST" }
      );

      setNotice(`Officer ${id} approved successfully.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>
          <div>
            <strong>SecureX</strong>
            <span>Administration</span>
          </div>
        </div>

        <div className="admin-nav-label">MANAGEMENT</div>

        <div className="admin-nav-item active">
          <Activity size={18} />
          Overview
        </div>

        <div className="admin-nav-item">
          <Users size={18} />
          Officer approvals
        </div>

        <div className="admin-nav-item">
          <MapPin size={18} />
          Checkpost monitoring
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <div className="admin-avatar">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>{admin?.full_name || "Administrator"}</strong>
              <span>System administrator</span>
            </div>
          </div>

          <button className="admin-logout" onClick={onLogout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">SECUREX CONTROL CENTER</span>
            <h1>Administrator dashboard</h1>
            <p>Manage officer access and monitor checkpost activity.</p>
          </div>

          <button
            className="admin-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="admin-alert error" role="alert">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {notice && (
          <div className="admin-alert success" role="status">
            <CheckCircle2 size={18} />
            {notice}
          </div>
        )}

        <section className="admin-stats">
          <Stat
            label="Total checkposts"
            value={dashboard.total_checkposts}
            icon={<MapPin />}
          />
          <Stat
            label="Active checkposts"
            value={dashboard.active_checkposts}
            icon={<Activity />}
          />
          <Stat
            label="Registered officers"
            value={dashboard.total_officers}
            icon={<Users />}
          />
          <Stat
            label="Pending approvals"
            value={dashboard.pending_officers}
            icon={<Clock />}
          />
          <Stat
            label="Total activities"
            value={dashboard.total_activities}
            icon={<CheckCircle2 />}
          />
        </section>

        <section className="admin-panel" id="officer-approvals">
          <div className="admin-panel-heading">
            <div>
              <h2>Pending officer approvals</h2>
              <p>Review registration requests before granting access.</p>
            </div>
            <span className="admin-count">{pending.length} pending</span>
          </div>

          {loading ? (
            <div className="admin-empty">Loading officer requests...</div>
          ) : pending.length === 0 ? (
            <div className="admin-empty">
              <CheckCircle2 size={26} />
              <strong>No pending registrations</strong>
              <span>New registration requests will appear here.</span>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Officer ID</th>
                    <th>Designation</th>
                    <th>Checkpost ID</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((officer) => (
                    <tr key={officer.officer_id}>
                      <td>
                        <strong>{officer.full_name}</strong>
                        <span className="admin-cell-sub">
                          {officer.email}
                        </span>
                      </td>
                      <td>{officer.officer_id}</td>
                      <td>{officer.designation}</td>
                      <td>{officer.checkpost_id ?? "Unassigned"}</td>
                      <td>
                        <button
                          className="admin-approve"
                          onClick={() => approveOfficer(officer)}
                          disabled={busyId !== null}
                        >
                          {busyId === officer.officer_id
                            ? "Approving..."
                            : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-panel" id="checkpost-monitoring">
          <div className="admin-panel-heading">
            <div>
              <h2>Checkpost monitoring</h2>
              <p>
                Activity totals are based on records returned by the backend.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">Loading checkposts...</div>
          ) : !dashboard.checkposts?.length ? (
            <div className="admin-empty">
              <MapPin size={26} />
              <strong>No checkpost data available</strong>
              <span>
                Check that your admin dashboard API returns checkpost records.
              </span>
            </div>
          ) : (
            <div className="admin-checkpost-grid">
              {dashboard.checkposts.map((post) => (
                <article
                  className="admin-checkpost-card"
                  key={post.id}
                >
                  <div className="admin-checkpost-top">
                    <div className="admin-post-icon">
                      <MapPin size={21} />
                    </div>
                    <span
                      className={`admin-status ${
                        post.is_active ? "online" : "offline"
                      }`}
                    >
                      <span />
                      {post.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3>{post.name}</h3>
                  <p className="admin-post-location">
                    {post.location || "Location not specified"}
                  </p>

                  <div className="admin-post-metrics">
                    <div>
                      <span>Total activities</span>
                      <strong>{post.total_activities ?? 0}</strong>
                    </div>
                    <div>
                      <span>Pending review</span>
                      <strong>{post.pending_activities ?? 0}</strong>
                    </div>
                    <div>
                      <span>Assigned officers</span>
                      <strong>{post.officer_count ?? 0}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="admin-footer">
          SecureX administration · Access restricted to authorized admins
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </article>
  );
}