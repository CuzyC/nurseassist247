import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./components/pages/Dashboard";
import ManageAccommodations from "./components/pages/ManageAccommodations";
import ManageAdmins from "./components/pages/ManageUsers";

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pageConfig = {
    dashboard: { title: "Admin Dashboard", component: Dashboard },
    accommodations: {
      title: "Manage Accommodations",
      component: ManageAccommodations,
    },
    admins: { title: "Manage Users", component: ManageAdmins },
  };

  const { component: CurrentPageComponent, title: pageTitle } =
    pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="flex min-h-screen bg-gray-50 lg:px-20 lg:py-4 md:px-10 md:py-3 sm:px-5 sm:py-2">
      {/* Sidebar on the left */}
      <aside className="hidden md:block text-white w-64">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          // isOpen={sidebarOpen}
          // onToggle={toggleSidebar}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 ">
        <header>
          <Header pageTitle={pageTitle} userRole="Owner" userName="Admin" />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <CurrentPageComponent />
        </main>

        {/* <footer className="text-white">
          <Footer />
        </footer> */}
      </div>
    </div>
  );
}

export default AdminDashboard;
