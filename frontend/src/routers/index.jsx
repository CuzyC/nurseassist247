// frontend/src/routers/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Client pages
import Home from "@/pages/Client/pages/Home";
import Properties from "@/pages/Client/pages/Properties";
import PropertyDetails from "@/pages/Client/pages/PropertyDetails";
import Enquire from "@/pages/Client/pages/Enquire";
import CheckAccommodationForm from "@/pages/Client/CheckAccommodationForm";

// Admin pages
import AdminDashboard from "@/pages/Admin/AdminDashboard";

// SDA Owner pages
import SDAOwnerPortal from "@/pages/SDA_Owner/Portal";
import SdaRegister from "@/pages/SDA_Owner/SdaRegister";

// Common components 
import Login from "@/components/Login";
import ResetPassword from "@/pages/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound";

/**
 * Public client routes
 */
export function AppRouter() {
  return (
    <Routes>
        {/* Publlic (client) routes */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id/:slug" element={<PropertyDetails />} />
        <Route path="/properties/:id/:slug/enquire" element={<Enquire />} />
        <Route
            path="/check-availability"
            element={<CheckAccommodationForm />}
        />

        {/* Login & Register*/}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SdaRegister />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Admin routes */}
        <Route
            path="/admin"
            element={
                <ProtectedRoute allowedRoles={["Owner", "Admin"]}>
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />

        {/* SDA Owner routes */}
        <Route
            path="/sda-owner"
            element={
                <ProtectedRoute allowedRoles={["SDA Owner"]}>
                    <SDAOwnerPortal />
                </ProtectedRoute>
            }
        />

        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Admin routes
 */
export function AdminRouter() {
  return (
    <Routes>
        <Route
            path="/admin"
            element={
                <ProtectedRoute allowedRoles={["Owner", "Admin"]}>
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />

        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
      

        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * SDA owner routes
 */
export function SdaOwnerRouter() {
  return (
    <Routes>
        
        <Route
            path="/admin"
            element={
                <ProtectedRoute allowedRoles={["SDA Owner"]}>
                    <SDAOwnerPortal />
                </ProtectedRoute>
            }
        />

        {/* Login and Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SdaRegister />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * RouterSelector: choose which of the above route sets to render
 * based on hostname/subdomain.
 *
 * Examples of hostnames:
 * - localhost              -> client
 * - sda-owner.localhost    -> sda-owner
 * - admin.localhost        -> admin
 *
 * This will use the left-most label before the first dot as subdomain.
 */
export default function RouterSelector() {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    // e.g. "sda-owner.localhost" -> "sda-owner"
    const subdomain = hostname.split(".")[0];

    // map subdomain -> router component
    if (subdomain === "sda-owner") {
        return <SdaOwnerRouter />;
    }

    if (subdomain === "admin") {
        return <AdminRouter />;
    }

    // default to client routes
    return <AppRouter />;
}
