import { useState } from "react";
import SideBar from "./components/Sidebar";
import Header from "./components/Header";
import OwnerDashboard from "./components/pages/Dashboard";
import ManageAccommodations from "./components/pages/ManageAccommodations";
import Availability from "./components/pages/Availability";

function SDAOwnerPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pageConfig = {
    dashboard: { title: "Owner Dashboard", component: OwnerDashboard },
    accommodations: {
      title: "Manage Accommodations",
      component: ManageAccommodations,
    },
    availability: { title: "Availability", component: Availability },
  };

  const { component: CurrentPageComponent, title: pageTitle } =
    pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-74 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300
                ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0`}
      >
        <SideBar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false); // close after navigating on mobile
          }}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-74 min-w-0">
        {/* Header (with mobile menu button) */}
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <CurrentPageComponent />
        </main>
      </div>
    </div>
  );
}

export default SDAOwnerPortal;
