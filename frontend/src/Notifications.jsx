import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  FileCheck,
  Clock,
  Info,
  Trash2,
  Check,
  Filter,
  Inbox,
  AlertTriangle,
  RefreshCw,
  Settings,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "security",
    title: "Security review required",
    message:
      "A document analysis requires additional human review. Open Verification History to inspect the findings.",
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    priority: "high",
  },
  {
    id: 2,
    type: "verification",
    title: "Verification completed",
    message:
      "A document review has finished. Review its findings before making a final decision.",
    time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    read: false,
    priority: "normal",
  },
  {
    id: 3,
    type: "system",
    title: "SecureX is ready",
    message:
      "Your dashboard is available. Upload a supported document to begin a verification review.",
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: "normal",
  },
];

const notificationTypes = {
  security: {
    label: "Security",
    icon: ShieldAlert,
    className: "notification-security",
  },
  verification: {
    label: "Verification",
    icon: FileCheck,
    className: "notification-verification",
  },
  system: {
    label: "System",
    icon: Info,
    className: "notification-system",
  },
};

function formatTime(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function Notifications({
  onNavigate,
  notifications: externalNotifications,
  onNotificationsChange,
}) {
  const [localNotifications, setLocalNotifications] =
    useState(initialNotifications);

  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const notifications = externalNotifications ?? localNotifications;

  function updateNotifications(updater) {
    const updated =
      typeof updater === "function"
        ? updater(notifications)
        : updater;

    if (onNotificationsChange) {
      onNotificationsChange(updated);
    } else {
      setLocalNotifications(updated);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const highPriorityCount = notifications.filter(
    (notification) =>
      notification.priority === "high" && !notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesReadStatus =
        activeFilter === "all" ||
        (activeFilter === "unread" && !notification.read) ||
        (activeFilter === "read" && notification.read);

      const matchesCategory =
        activeCategory === "all" ||
        notification.type === activeCategory;

      const search = searchText.trim().toLowerCase();

      const matchesSearch =
        !search ||
        notification.title.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search);

      return matchesReadStatus && matchesCategory && matchesSearch;
    });
  }, [
    notifications,
    activeFilter,
    activeCategory,
    searchText,
  ]);

  function markAsRead(id) {
    updateNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function markAllAsRead() {
    updateNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function deleteNotification(id) {
    updateNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }

  function clearReadNotifications() {
    updateNotifications((current) =>
      current.filter((notification) => !notification.read)
    );
  }

  function handleNotificationClick(notification) {
    markAsRead(notification.id);

    if (onNavigate && notification.type === "verification") {
      onNavigate("history");
    } else if (onNavigate && notification.type === "security") {
      onNavigate("history");
    }
  }

  return (
    <div className="notifications-page">
      {/* Page heading */}
      <header className="notifications-heading">
        <div className="notifications-heading-icon">
          <Bell size={25} />
          {unreadCount > 0 && (
            <span className="notifications-icon-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        <div className="notifications-heading-copy">
          <span className="notifications-eyebrow">
            SYSTEM CENTER
          </span>

          <h2>Notifications</h2>

          <p>
            Monitor security alerts, document reviews, and system updates.
          </p>
        </div>

        <button
          type="button"
          className="notifications-primary-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>
      </header>

      {/* Statistics */}
      <section className="notifications-stats">
        <article className="notifications-stat-card">
          <div className="notifications-stat-icon stat-blue">
            <Bell size={20} />
          </div>

          <div>
            <span>Total notifications</span>
            <strong>{notifications.length}</strong>
            <small>All available records</small>
          </div>
        </article>

        <article className="notifications-stat-card">
          <div className="notifications-stat-icon stat-amber">
            <Inbox size={20} />
          </div>

          <div>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
            <small>Awaiting your attention</small>
          </div>
        </article>

        <article className="notifications-stat-card">
          <div className="notifications-stat-icon stat-red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>High priority</span>
            <strong>{highPriorityCount}</strong>
            <small>Unread high-priority alerts</small>
          </div>
        </article>
      </section>

      {/* Notification list */}
      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <h3>Notification center</h3>
            <p>
              {filteredNotifications.length} of {notifications.length}{" "}
              notifications
            </p>
          </div>

          <button
            type="button"
            className="notifications-secondary-button"
            onClick={clearReadNotifications}
            disabled={!notifications.some((item) => item.read)}
          >
            <Trash2 size={16} />
            Clear read
          </button>
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <div className="notifications-search">
            <Filter size={17} />

            <input
              type="search"
              placeholder="Search notifications..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              aria-label="Search notifications"
            />
          </div>

          <select
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            aria-label="Filter by read status"
          >
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
            <option value="read">Read only</option>
          </select>

          <select
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            aria-label="Filter by notification category"
          >
            <option value="all">All categories</option>
            <option value="security">Security</option>
            <option value="verification">Verification</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Notification items */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
              const config =
                notificationTypes[notification.type] ??
                notificationTypes.system;

              const Icon = config.icon;

              return (
                <article
                  key={notification.id}
                  className={`notification-item ${
                    notification.read ? "is-read" : "is-unread"
                  }`}
                >
                  <div
                    className={`notification-item-icon ${config.className}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="notification-item-content">
                    <div className="notification-item-title-row">
                      <h4>{notification.title}</h4>

                      {!notification.read && (
                        <span className="notification-unread-dot" />
                      )}

                      {notification.priority === "high" && (
                        <span className="notification-priority">
                          High priority
                        </span>
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <div className="notification-item-meta">
                      <span className="notification-category">
                        {config.label}
                      </span>

                      <span className="notification-time">
                        <Clock size={13} />
                        {formatTime(notification.time)}
                      </span>
                    </div>
                  </div>

                  <div className="notification-item-actions">
                    {!notification.read && (
                      <button
                        type="button"
                        className="notification-icon-button"
                        title="Mark as read"
                        aria-label={`Mark ${notification.title} as read`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check size={17} />
                      </button>
                    )}

                    {(notification.type === "verification" ||
                      notification.type === "security") && (
                      <button
                        type="button"
                        className="notification-view-button"
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        View
                      </button>
                    )}

                    <button
                      type="button"
                      className="notification-icon-button delete-notification-button"
                      title="Delete notification"
                      aria-label={`Delete ${notification.title}`}
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="notifications-empty-state">
              <div className="notifications-empty-icon">
                <Bell size={27} />
              </div>

              <h4>No notifications found</h4>

              <p>
                {searchText ||
                activeFilter !== "all" ||
                activeCategory !== "all"
                  ? "Try changing your search or filters."
                  : "You're all caught up. New notifications will appear here."}
              </p>

              {(searchText ||
                activeFilter !== "all" ||
                activeCategory !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText("");
                    setActiveFilter("all");
                    setActiveCategory("all");
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="notifications-panel-footer">
          <Info size={15} />
          <span>
            Notifications displayed here are local demonstration data unless
            connected to a notification API.
          </span>
        </footer>
      </section>
    </div>
  );
}
