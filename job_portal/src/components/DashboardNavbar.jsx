import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getDisplayName } from "../utils/profile";
import "../styles/DashboardNavbar.css";

const DEFAULT_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "Interview invited",
    message: "You have been invited for an interview for Frontend Developer.",
    time: "10m ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "Application reviewed",
    message: "Your application for Product Designer has been reviewed.",
    time: "1h ago",
    unread: true,
  },
  {
    id: "n-3",
    title: "New message",
    message: "HR from NovaTech sent you a new message.",
    time: "3h ago",
    unread: false,
  },
  {
    id: "n-4",
    title: "Shortlisted",
    message: "You are shortlisted for the UI/UX Designer role.",
    time: "1d ago",
    unread: false,
  },
  {
    id: "n-5",
    title: "Profile viewed",
    message: "Your profile was viewed by 2 recruiters today.",
    time: "2d ago",
    unread: false,
  },
];

export default function DashboardNavbar() {
  const { user, logout, updateProfile } = useUser();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState(DEFAULT_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const nextNotifications = Array.isArray(user?.notifications) && user.notifications.length
      ? user.notifications
      : DEFAULT_NOTIFICATIONS;

    setNotificationsData(nextNotifications);

    if (typeof user?.notificationCount === "number") {
      setUnreadCount(user.notificationCount);
    } else {
      setUnreadCount(nextNotifications.reduce((count, item) => count + (item.unread ? 1 : 0), 0));
    }
  }, [user?.notificationCount, user?.notifications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const notifications = useMemo(() => notificationsData, [notificationsData]);

  const markAllAsRead = () => {
    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      unread: false,
    }));

    setNotificationsData(nextNotifications);
    setUnreadCount(0);

    updateProfile({
      notificationCount: 0,
      notifications: nextNotifications,
    });
  };

  const displayName = getDisplayName(user);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav
      className={`dashboard-navbar ${scrolled ? "dashboard-navbar--scrolled" : ""}`}
    >
      <div className="dashboard-navbar__container">
        <Link to="/dashboard" className="dashboard-navbar__logo">
          <span className="dashboard-navbar__logo-icon" />
          CareerHub
        </Link>

        <ul className="dashboard-navbar__links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/recommended-jobs"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Recommended Jobs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/browse-jobs"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Browse Jobs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/my-applications"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              My Applications
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/industries"
              className={({ isActive }) =>
                `dashboard-navbar__link ${isActive ? "dashboard-navbar__link--active" : ""}`
              }
            >
              Industries
            </NavLink>
          </li>
        </ul>

        <div className="dashboard-navbar__actions">
          <div className="dashboard-navbar__notifications" ref={notificationsRef}>
            <button
              type="button"
              className="dashboard-navbar__notification-btn"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="dashboard-navbar__notification-icon">
                <path d="M12 22a2.25 2.25 0 0 0 2.18-1.7h-4.36A2.25 2.25 0 0 0 12 22Zm7-6.75V11a7 7 0 1 0-14 0v4.25L3.8 16.9a1 1 0 0 0 .7 1.71h14a1 1 0 0 0 .7-1.71L19 15.25Zm-2-1.1.78 1.1H6.22L7 14.15V11a5 5 0 1 1 10 0v4.15Z" />
              </svg>
              {unreadCount > 0 && <span className="dashboard-navbar__notification-dot" />}
            </button>

            {notificationsOpen && (
              <div className="dashboard-navbar__notification-popover" role="dialog" aria-label="Notifications">
                <div className="dashboard-navbar__notification-header">
                  <div>
                    <strong>Notifications</strong>
                    <span>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</span>
                  </div>
                  <button
                    type="button"
                    className="dashboard-navbar__notification-mark-read"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="dashboard-navbar__notification-list">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`dashboard-navbar__notification-item${
                        notification.unread ? " dashboard-navbar__notification-item--unread" : ""
                      }`}
                    >
                      <div className="dashboard-navbar__notification-item-main">
                        <span className="dashboard-navbar__notification-item-title">{notification.title}</span>
                        <p className="dashboard-navbar__notification-item-message">{notification.message}</p>
                      </div>
                      <span className="dashboard-navbar__notification-item-time">{notification.time}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/my-applications"
                  className="dashboard-navbar__notification-see-all"
                  onClick={() => setNotificationsOpen(false)}
                >
                  See all
                </Link>
              </div>
            )}
          </div>

          <Link to="/profile" className="dashboard-navbar__user">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={displayName}
                className="dashboard-navbar__avatar-img"
              />
            ) : (
              <span className="dashboard-navbar__avatar">{initial}</span>
            )}
            <span className="dashboard-navbar__username">{displayName}</span>
          </Link>
          <button
            type="button"
            className="dashboard-navbar__btn dashboard-navbar__btn--ghost"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
