import { useState } from "react";
import {
  User,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Save,
  RotateCcw,
  Info,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import "./Settings.css";

export default function Settings({ officer, token, onLogout }) {
  const [profile, setProfile] = useState({
    full_name: officer?.full_name || officer?.name || "",
    email: officer?.email || "",
    officer_id: officer?.officer_id || "",
    designation: officer?.designation || "",
    checkpost_name:
      officer?.checkpost_name ||
      officer?.checkpost?.name ||
      (officer?.checkpost_id
        ? `Checkpost ID ${officer.checkpost_id}`
        : "Not assigned"),
  });

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("securex_settings_preferences") || "{}"
      );

      return {
        notifications: saved.notifications ?? true,
        securityAlerts: saved.securityAlerts ?? true,
        compactView: saved.compactView ?? false,
      };
    } catch {
      return {
        notifications: true,
        securityAlerts: true,
        compactView: false,
      };
    }
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [saving, setSaving] = useState(false);

  function updatePreference(name) {
    setPreferences((previous) => {
      const updated = {
        ...previous,
        [name]: !previous[name],
      };

      localStorage.setItem(
        "securex_settings_preferences",
        JSON.stringify(updated)
      );

      return updated;
    });

    setMessage("");
  }

  function resetPreferences() {
    const defaults = {
      notifications: true,
      securityAlerts: true,
      compactView: false,
    };

    setPreferences(defaults);

    localStorage.setItem(
      "securex_settings_preferences",
      JSON.stringify(defaults)
    );

    setMessage("Preferences have been reset.");
    setMessageType("success");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      /*
       * This frontend saves preferences locally.
       * Profile details are displayed from the authenticated account.
       *
       * Connect this function to a backend profile-update endpoint
       * when that endpoint is implemented.
       */

      localStorage.setItem(
        "securex_settings_profile",
        JSON.stringify(profile)
      );

      setMessage(
        "Preferences saved on this browser. Profile changes have not been sent to the server."
      );
      setMessageType("success");
    } catch {
      setMessage("Unable to save settings. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const isDemoSession = token === "prototype-demo-token";

  return (
    <div className="settings-page">
      <section className="settings-intro">
        <div className="settings-intro-icon">
          <ShieldCheck size={27} />
        </div>

        <div>
          <span className="settings-eyebrow">ACCOUNT CONFIGURATION</span>
          <h2>Settings</h2>
          <p>
            Manage your account information, notification preferences,
            and security-related options.
          </p>
        </div>
      </section>

      {message && (
        <div
          className={`settings-message ${
            messageType === "error" ? "settings-message-error" : ""
          }`}
          role="status"
        >
          {messageType === "error" ? (
            <AlertTriangle size={19} />
          ) : (
            <CheckCircle size={19} />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">
              <User size={21} />
            </div>

            <div>
              <h3>Officer profile</h3>
              <p>Your account and assigned checkpost information.</p>
            </div>
          </div>

          <form onSubmit={saveProfile}>
            <label className="settings-field">
              Full name
              <input
                value={profile.full_name}
                readOnly
                aria-readonly="true"
              />
            </label>

            <label className="settings-field">
              Email address
              <input
                type="email"
                value={profile.email}
                readOnly
                aria-readonly="true"
              />
            </label>

            <label className="settings-field">
              Officer ID
              <input
                value={profile.officer_id || "Not available"}
                readOnly
                aria-readonly="true"
              />
            </label>

            <label className="settings-field">
              Designation
              <input
                value={profile.designation || "Not available"}
                readOnly
                aria-readonly="true"
              />
            </label>

            <label className="settings-field">
              Assigned checkpost
              <input
                value={profile.checkpost_name}
                readOnly
                aria-readonly="true"
              />
            </label>

            <div className="settings-readonly-note">
              <Info size={17} />
              <span>
                Profile details are read-only because a server-side
                profile-update endpoint has not been connected.
              </span>
            </div>

            <button
              type="submit"
              className="settings-primary-button"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save settings"}
            </button>
          </form>
        </section>

        <div className="settings-side-column">
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <Bell size={21} />
              </div>

              <div>
                <h3>Preferences</h3>
                <p>Configure your local workspace preferences.</p>
              </div>
            </div>

            <div className="settings-option">
              <div>
                <strong>Notifications</strong>
                <p>Enable notification preferences for this browser.</p>
              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  preferences.notifications ? "enabled" : ""
                }`}
                onClick={() => updatePreference("notifications")}
                role="switch"
                aria-checked={preferences.notifications}
                aria-label="Enable notifications"
              >
                <span />
              </button>
            </div>

            <div className="settings-option">
              <div>
                <strong>Security alerts</strong>
                <p>Keep security alert preferences enabled.</p>
              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  preferences.securityAlerts ? "enabled" : ""
                }`}
                onClick={() => updatePreference("securityAlerts")}
                role="switch"
                aria-checked={preferences.securityAlerts}
                aria-label="Enable security alerts"
              >
                <span />
              </button>
            </div>

            <div className="settings-option">
              <div>
                <strong>Compact workspace</strong>
                <p>Save your preference for a more compact layout.</p>
              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  preferences.compactView ? "enabled" : ""
                }`}
                onClick={() => updatePreference("compactView")}
                role="switch"
                aria-checked={preferences.compactView}
                aria-label="Enable compact workspace"
              >
                <span />
              </button>
            </div>

            <button
              type="button"
              className="settings-secondary-button"
              onClick={resetPreferences}
            >
              <RotateCcw size={16} />
              Reset preferences
            </button>

            <p className="settings-footnote">
              These preferences are stored in this browser. Notification
              delivery and compact layout behavior require additional
              integration to take effect throughout the application.
            </p>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-heading-icon">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h3>Session security</h3>
                <p>Information about your current session.</p>
              </div>
            </div>

            <div className="settings-security-row">
              <span>Authentication</span>
              <strong>
                {isDemoSession ? "Prototype mode" : "Authenticated session"}
              </strong>
            </div>

            <div className="settings-security-row">
              <span>Access role</span>
              <strong>
                {officer?.designation || "Officer"}
              </strong>
            </div>

            <div className="settings-security-row">
              <span>Session storage</span>
              <strong>Browser local storage</strong>
            </div>

            {isDemoSession && (
              <div className="settings-warning">
                <AlertTriangle size={18} />
                <p>
                  You are using the prototype admin session. It bypasses
                  backend authentication and must not be used for real
                  identity-document verification.
                </p>
              </div>
            )}

            <button
              type="button"
              className="settings-logout-button"
              onClick={onLogout}
            >
              <LockKeyhole size={17} />
              Sign out of SecureX
            </button>
          </section>
        </div>
      </div>

      <p className="settings-disclaimer">
        <ShieldCheck size={16} />
        SecureX settings currently manage browser-local preferences.
        Account security and server-side profile updates must be enforced
        by the backend.
      </p>
    </div>
  );
}