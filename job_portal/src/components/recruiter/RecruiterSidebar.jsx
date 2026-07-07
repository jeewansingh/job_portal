import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../styles/RecruiterSidebar.css";

const navItems = [
  { label: "Dashboard", to: "/recruiter/dashboard" },
  { label: "Post Job", to: "/recruiter/post-job" },
  { label: "Manage Jobs", to: "/recruiter/manage-jobs" },
  { label: "Applications", to: "/recruiter/applications" },
  { label: "Profile", to: "/recruiter/profile" },
];

export default function RecruiterSidebar({ activeItem, label = "Recruiter Console" }) {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/recruiter/login");
  };

  return (
    <aside className="recruiter-sidebar">
      <Link to="/recruiter/dashboard" className="recruiter-sidebar__brand">
        <span className="recruiter-sidebar__brand-mark">R</span>
        <span>
          <strong>CareerHub</strong>
          <small>{label}</small>
        </span>
      </Link>

      <nav className="recruiter-sidebar__nav" aria-label="Recruiter navigation">
        {navItems.map((item) =>
          item.future ? (
            <a
              key={item.label}
              href={item.to}
              className={`recruiter-sidebar__link recruiter-sidebar__link--future${
                activeItem === item.label ? " recruiter-sidebar__link--active" : ""
              }`}
              aria-current={activeItem === item.label ? "page" : undefined}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className={`recruiter-sidebar__link${
                activeItem === item.label ? " recruiter-sidebar__link--active" : ""
              }`}
              aria-current={activeItem === item.label ? "page" : undefined}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      <button type="button" className="recruiter-sidebar__logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
