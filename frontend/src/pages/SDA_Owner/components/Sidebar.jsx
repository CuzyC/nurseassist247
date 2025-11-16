// sidebar.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createPortal } from "react-dom";
import logo from "@/assets/logo.png";
import { Home, Building2, Users, LogOut } from "lucide-react";

function SideBar({ currentPage, onNavigate }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "accommodations", label: "Manage Accommodations", icon: Building2 },
    { id: "availability", label: "Availability", icon: Users },
  ];

  const handleLogout = () => {
    // TODO: clear auth, tokens, etc.
    navigate("/login");
  };

  return (
    <>
      <aside className="left-0 top-0 h-full flex flex-col bg-white border-r border-gray-200 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <img src={logo} alt="Logo" className="h-16 w-full" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = id === currentPage;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive ? "bg-[#D2138C] text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Modal rendered in a portal so it centers over the whole page */}
      {showLogout &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
              <div className="px-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Sign out?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to sign out? You will need to login again to access the admin dashboard.
                </p>
              </div>
              <div className="flex justify-end gap-3 px-6 py-5 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setShowLogout(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#D2138C] rounded-lg hover:bg-[#b01074]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default SideBar;
