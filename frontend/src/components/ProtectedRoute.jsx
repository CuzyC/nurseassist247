// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import api from "../api";

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

// Helper to read from either localStorage or sessionStorage
const getStoredItem = (key) =>
  localStorage.getItem(key) || sessionStorage.getItem(key);

// Helper to write the access token back to the same storage
// where the refresh token is stored
const setAccessToken = (token) => {
  if (localStorage.getItem(REFRESH_TOKEN)) {
    localStorage.setItem(ACCESS_TOKEN, token);
  } else if (sessionStorage.getItem(REFRESH_TOKEN)) {
    sessionStorage.setItem(ACCESS_TOKEN, token);
  } else {
    // Fallback if somehow refresh token is missing
    localStorage.setItem(ACCESS_TOKEN, token);
  }
};

function ProtectedRoute({ children, allowedRoles }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [hasRoleAccess, setHasRoleAccess] = useState(true);

  // Role can come from either storage
  const role = getStoredItem("role");

  useEffect(() => {
    validateAuth().catch(() => {
      setIsAuthorized(false);
      setHasRoleAccess(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedRoles]);

  const refreshAccessToken = async () => {
    const refresh = getStoredItem(REFRESH_TOKEN);
    if (!refresh) {
      setIsAuthorized(false);
      return;
    }

    try {
      const res = await api.post(
        "/api/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${refresh}`,
          },
        }
      );

      setAccessToken(res.data.access); // save in correct storage
      setIsAuthorized(true);
    } catch (error) {
      console.log("Refresh failed:", error);
      setIsAuthorized(false);
    }
  };

  const validateAuth = async () => {
    const token = getStoredItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthorized(false);
      setHasRoleAccess(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        await refreshAccessToken();
      } else {
        setIsAuthorized(true);
      }

      // Role-based access check
      if (allowedRoles && allowedRoles.length > 0) {
        const userStr = getStoredItem("user");
        if (!userStr) {
          setHasRoleAccess(false);
          return;
        }

        const user = JSON.parse(userStr);
        const canAccess = allowedRoles.includes(user.role);
        setHasRoleAccess(canAccess);
      } else {
        setHasRoleAccess(true);
      }
    } catch (err) {
      console.log("Token decode failed:", err);
      setIsAuthorized(false);
      setHasRoleAccess(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // Not logged in or token invalid
  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  // Logged in but role not allowed
  if (!hasRoleAccess) {
    return <Navigate to="/" />;
  }

  // Everything OK
  return children;
}

export default ProtectedRoute;
