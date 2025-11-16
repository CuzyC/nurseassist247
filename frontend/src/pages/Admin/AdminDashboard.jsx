import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./components/pages/Dashboard";
import SDA_Log from "./components/pages/SDA_Log";
import ManageAdmins from "./components/pages/ManageUsers";

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pageConfig = {
    dashboard: { title: "Dashboard", component: Dashboard },
    sda_log: { title: "SDA Activity Log", component: SDA_Log, },
    admins: { title: "Users", component: ManageAdmins },
  };

  const { component: CurrentPageComponent, title: pageTitle } =
    pageConfig[currentPage] || pageConfig.dashboard;

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar on the left */}
      <aside className="fixed top-0 left-0 h-full w-74 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-0 md:ml-74 min-w-0">
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
