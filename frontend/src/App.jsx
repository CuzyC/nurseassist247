// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Client/pages/Home";
import Properties from "./pages/Client/pages/Properties";
import PropertyDetails from "./pages/Client/pages/PropertyDetails";
import Contact from "./pages/Client/pages/Contact";
import Enquire from "./pages/Client/pages/Enquire";
import CheckAccommodationForm from "./pages/Client/CheckAccommodationForm";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./components/Login";
import NotFound from "./pages/NotFound";

import SDAOwnerPortal from "./pages/SDA_Owner/Portal";
import SdaRegister from "./pages/SDA_Owner/SdaRegister";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ListYourProperty from "./pages/Client/pages/ListYourProperty";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public client side */}
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id/:slug" element={<PropertyDetails />} />
        <Route path="/properties/:id/:slug/enquire" element={<Enquire />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/check-availability"
          element={<CheckAccommodationForm />}
        />
        <Route path="/list-your-property" element={<ListYourProperty />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />

        {/* Admin side */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Owner", "Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* SDA owner side */}
        <Route
          path="/sdaowner/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SDA Owner"]}>
              <SDAOwnerPortal />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />

        {/* SDA Partner auth */}
        <Route path="/register" element={<SdaRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
