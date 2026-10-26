
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  ShieldCheck,
  UserRound,
  RotateCcw,
  Check,
  LockKeyhole,
  Monitor,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Eye,
  Clock,
  CheckCircle2,
  Info,
} from "lucide-react";

import "./Settings.css";

const DEFAULT_SETTINGS = {
  theme: "cyber",
  notifications: true,
  analysisAlerts: true,
  securityAlerts: true,
  compactMode: false,
};

const THEMES = [
  {
    id: "cyber",
    name: "Cyber Blue",
    description: "Classic cybersecurity interface",
    primary: "#3b82f6",
    secondary: "#06b6d4",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Clean green accents",
    primary: "#10b981",
    secondary: "#34d399",
  },
  {
    id: "purple",
    name: "Purple",
    description: "Modern purple accents",
    primary: "#8b5cf6",
    secondary: "#c084fc",
  },
  {
    id: "slate",
    name: "Slate",
    description: "Minimal professional style",
    primary: "#64748b",
    secondary: "#94a3b8",
  },
  {
    id: "light",
    name: "Light",
    description: "Bright interface",
    primary: "#2563eb",
    secondary: "#0ea5e9",
  },
];

function readSavedSettings() {
  try {
    const saved = localStorage.getItem("securex-settings");

    if (saved) {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(saved),
      };
    }
  } catch (error) {
    console.error("Unable to load settings:", error);
  }

  return DEFAULT_SETTINGS;
}

export default function SettingsPage({
  officer,
  token,
  onLogout,
}) {
  const [settings, setSettings] = useState(readSavedSettings);
  const [activeTab, setActiveTab] = useState("appearance");
  const [savedMessage, setSavedMessage] = useState("");

  const userName =
    officer?.name ||
    officer?.full_name ||
    officer?.username ||
    "Security Officer";

  const userEmail =
    officer?.email ||
    officer?.email_address ||
    "No email available";

  const userRole =
    officer?.role ||
    officer?.designation ||
    "Authorized User";

  useEffect(() => {
    try {
      localStorage.setItem(
        "securex-settings",
        JSON.stringify(settings)
      );

      // These classes only affect the settings page.
      document.documentElement.dataset.securexTheme =
        settings.theme;
    } catch (error) {
      console.error("Unable to save settings:", error);
    }
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSavedMessage("Settings updated");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2000);
  }

  function resetSettings() {
    setSettings({ ...DEFAULT_SETTINGS });
    setSavedMessage("Default settings restored");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  }

  const tabs = [
    {
      id: "appearance",
      label: "Appearance",
      description: "Customize your interface",
      icon: Palette,
    },
    {
      id: "preferences",
      label: "Preferences",
      description: "Manage notifications",
      icon: Bell,
    },
    {
      id: "account",
      label: "Account & Security",
      description: "Your account information",
      icon: ShieldCheck,
    },
  ];

  return (
    <div
      className={`settings-page theme-${settings.theme} ${
        settings.compactMode ? "compact-mode" : ""
      }`}
    >
      <div className="settings-header">
        <div className="settings-heading">
          <div className="settings-heading-icon">
            <SettingsIcon size={25} />
          </div>

          <div>
            <div className="settings-eyebrow">
              SYSTEM CONFIGURATION
            </div>

            <h1>Settings</h1>

            <p>
              Personalize your workspace and manage your
              account preferences.
            </p>
          </div>
        </div>

        <button
          className="settings-reset-button"
          type="button"
          onClick={resetSettings}
        >
          <RotateCcw size={16} />
          <span>Reset defaults</span>
        </button>
      </div>

      {savedMessage && (
        <div className="settings-save-message" role="status">
          <CheckCircle2 size={17} />
          {savedMessage}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="settings-sidebar-label">
            GENERAL
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`settings-nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-nav-icon">
                  <Icon size={19} />
                </span>

                <span className="settings-nav-text">
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>

                {isActive && (
                  <span className="settings-nav-indicator" />
                )}
              </button>
            );
          })}

          <div className="settings-sidebar-divider" />

          <div className="settings-sidebar-label">
            ACCOUNT
          </div>

          <div className="settings-mini-profile">
            <div className="settings-avatar">
              <UserRound size={21} />
            </div>

            <div className="settings-mini-profile-info">
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </div>
          </div>

          {typeof onLogout === "function" && (
            <button
              type="button"
              className="settings-logout-button"
              onClick={onLogout}
            >
              <LogOut size={17} />
              Sign out
            </button>
          )}
        </aside>

        <main className="settings-content">
          {activeTab === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <div className="settings-section-icon">
                  <Palette size={21} />
                </div>

                <div>
                  <h2>Appearance</h2>
                  <p>
                    Choose the look and feel of your workspace.
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <h3>Color theme</h3>
                    <p>
                      Select an accent style for this settings
                      interface.
                    </p>
                  </div>

                  <Sparkles size={20} />
                </div>

                <div className="settings-theme-grid">
                  {THEMES.map((theme) => {
                    const selected =
                      settings.theme === theme.id;

                    return (
                      <button
                        key={theme.id}
                        type="button"
                        className={`settings-theme-option ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateSetting("theme", theme.id)
                        }
                        aria-pressed={selected}
                      >
                        <div
                          className={`settings-theme-preview preview-${theme.id}`}
                        >
                          <div className="preview-sidebar">
                            <span />
                            <span />
                            <span />
                          </div>

                          <div className="preview-main">
                            <span className="preview-line" />
                            <span className="preview-line short" />

                            <div className="preview-cards">
                              <span />
                              <span />
                            </div>

                            <span className="preview-button" />
                          </div>
                        </div>

                        <div className="settings-theme-details">
                          <span
                            className="settings-theme-dot"
                            style={{
                              background: theme.primary,
                            }}
                          />

                          <div className="settings-theme-name">
                            <strong>{theme.name}</strong>
                            <small>{theme.description}</small>
                          </div>

                          {selected && (
                            <span className="settings-theme-check">
                              <Check size={15} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <h3>Interface density</h3>
                    <p>
                      Adjust the spacing of settings elements.
                    </p>
                  </div>

                  <Monitor size={20} />
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <LayoutDashboard size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Compact mode</strong>
                    <span>
                      Use less spacing between interface elements.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.compactMode}
                    className={`settings-toggle ${
                      settings.compactMode ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSetting(
                        "compactMode",
                        !settings.compactMode
                      )
                    }
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="settings-info-note">
                <Info size={18} />
                <p>
                  Theme and compact-mode preferences are saved
                  locally in this browser. They do not change
                  your account on the server.
                </p>
              </div>
            </section>
          )}

          {activeTab === "preferences" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <div className="settings-section-icon">
                  <Bell size={21} />
                </div>

                <div>
                  <h2>Preferences</h2>
                  <p>
                    Control which notifications you want to see.
                  </p>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <h3>Notification preferences</h3>
                    <p>
                      Manage browser-level preferences for this
                      application.
                    </p>
                  </div>

                  <Bell size={20} />
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <Bell size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Application notifications</strong>
                    <span>
                      Enable notification preferences in SecureX.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications}
                    className={`settings-toggle ${
                      settings.notifications ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSetting(
                        "notifications",
                        !settings.notifications
                      )
                    }
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <Eye size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Analysis alerts</strong>
                    <span>
                      Show alerts for document analysis activity.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.analysisAlerts}
                    className={`settings-toggle ${
                      settings.analysisAlerts ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSetting(
                        "analysisAlerts",
                        !settings.analysisAlerts
                      )
                    }
                  >
                    <span />
                  </button>
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <ShieldCheck size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Security alerts</strong>
                    <span>
                      Show alerts related to account security.
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.securityAlerts}
                    className={`settings-toggle ${
                      settings.securityAlerts ? "on" : ""
                    }`}
                    onClick={() =>
                      updateSetting(
                        "securityAlerts",
                        !settings.securityAlerts
                      )
                    }
                  >
                    <span />
                  </button>
                </div>
              </div>

              <div className="settings-info-note">
                <Info size={18} />
                <p>
                  These switches save your preferences locally.
                  Actual email, push, or server-side notifications
                  require corresponding backend functionality.
                </p>
              </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="settings-section">
              <div className="settings-section-heading">
                <div className="settings-section-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2>Account & Security</h2>
                  <p>
                    Review your account details and session status.
                  </p>
                </div>
              </div>

              <div className="settings-account-banner">
                <div className="settings-account-avatar">
                  <UserRound size={31} />
                </div>

                <div className="settings-account-details">
                  <span className="settings-account-label">
                    SIGNED-IN ACCOUNT
                  </span>

                  <h3>{userName}</h3>
                  <p>{userEmail}</p>

                  <span className="settings-role-badge">
                    <ShieldCheck size={13} />
                    {userRole}
                  </span>
                </div>

                <div className="settings-account-status">
                  <span />
                  Session active
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <h3>Account information</h3>
                    <p>
                      Information supplied by your current login.
                    </p>
                  </div>

                  <UserRound size={20} />
                </div>

                <div className="settings-account-field">
                  <span>Full name</span>
                  <strong>{userName}</strong>
                </div>

                <div className="settings-account-field">
                  <span>Email address</span>
                  <strong>{userEmail}</strong>
                </div>

                <div className="settings-account-field">
                  <span>Role</span>
                  <strong>{userRole}</strong>
                </div>

                <div className="settings-account-field">
                  <span>Authentication</span>
                  <strong>
                    <LockKeyhole size={15} />
                    {token
                      ? "Authenticated session"
                      : "Session status not provided"}
                  </strong>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-heading">
                  <div>
                    <h3>Session security</h3>
                    <p>
                      Keep your document verification workspace secure.
                    </p>
                  </div>

                  <ShieldCheck size={20} />
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <Clock size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Current session</strong>
                    <span>
                      Your account information is shown from the
                      authenticated user object.
                    </span>
                  </div>

                  <span className="settings-status-pill">
                    Active
                  </span>
                </div>

                <div className="settings-option-row">
                  <div className="settings-option-icon">
                    <LockKeyhole size={19} />
                  </div>

                  <div className="settings-option-text">
                    <strong>Sign out</strong>
                    <span>
                      End your current application session.
                    </span>
                  </div>

                  {typeof onLogout === "function" && (
                    <button
                      type="button"
                      className="settings-inline-logout"
                      onClick={onLogout}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  )}
                </div>
              </div>

              <div className="settings-info-note">
                <Info size={18} />
                <p>
                  Password changes, active-session management,
                  and multi-factor authentication must be
                  implemented and enforced by your backend.
                  This page does not modify server-side security.
                </p>
              </div>
            </section>
          )}

          <footer className="settings-footer">
            <div className="settings-footer-brand">
              <ShieldCheck size={17} />
              <span>SecureX</span>
            </div>

            <span>
              Document Verification & Forensics Platform
            </span>

            <span className="settings-footer-version">
              Settings
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
