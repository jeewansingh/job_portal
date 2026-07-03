import DashboardNavbar from "./DashboardNavbar";
import Footer from "./Footer";
import "../styles/DashboardLayout.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <DashboardNavbar />
      <main className="dashboard-layout__main">{children}</main>
      <Footer />
    </div>
  );
}
