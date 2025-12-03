// frontend/src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/White logo.svg";

/**
 * Props:
 * - apiUrl: string (default login endpoint)
 * - redirectMap: { Admin: "/admin", Owner: "/admin", "SDA Owner": "/sdaowner/dashboard", Client: "/" }
 * - onSuccess: function(data) => parent handles navigation or other side-effects
 * - showNav: boolean -> whether to render NavBar
 */
export default function Login({
  apiUrl = "http://127.0.0.1:5000/api/auth/login",
  redirectMap = {
    Admin: "/admin",
    Owner: "/admin",
    "SDA Owner": "/sda-owner",
    Client: "/",
  },
  onSuccess = null,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL;



  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    if (remembered) {
      const savedUsername = localStorage.getItem("rememberedUsername") || "";
      // NOTE: avoid storing password in localStorage for security reasons
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Login failed");
        setLoading(false);
        return;
      }

      // store tokens/user - prefer httpOnly cookies for refresh token in production
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user?.role ?? "");

      // store username only (do NOT store password) for Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberedUsername");
      }

      // allow parent to act on success (navigation, analytics, etc.)
      if (typeof onSuccess === "function") {
        onSuccess(data);
      } else {
        // default behavior: use redirectMap
        const role = data.user?.role;
        const path = redirectMap[role];
        if (path) {
          // if need cross-subdomain redirect, onSuccess should handle it.
          navigate(path);
        } else {
          // fallback
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#D2138C] to-[#FCE8F3] lg:bg-gradient-to-r lg:from-[#D2138C] lg:to-[#FCE8F3]">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center px-6 py-10">
          <div className="flex flex-col items-center lg:items-start justify-center space-y-4 px-4 -translate-y-8 lg:-translate-y-20">
            <img src={logo} alt="Nurse Assist logo" className="w-full max-w-2xl" />
            <div className="text-center lg:text-left lg:px-6 space-y-3 max-w-md">
              <h1 className="text-white text-2xl lg:text-4xl font-bold">
                Manage, update, and publish your SDA content effortlessly.
              </h1>
              <p className="text-white text-lg lg:text-md mt-2">
                Your central hub for managing SDA operations.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl p-4 rounded-2xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-center font-semibold text-[#D2138C]">
                  Hello there!
                </CardTitle>
                <CardDescription className="text-center">Sign in to access your account</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Username</Label>
                    <Input id="name" type="text" placeholder="e.g. johndoe" value={username} onChange={(e) => setUsername(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-[#D2138C] focus:ring-[#D2138C]" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl border-gray-200 focus:border-[#D2138C] focus:ring-[#D2138C]" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <Input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#D2138C] focus:ring-[#D2138C]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                      <span className="text-gray-600">Remember me</span>
                    </Label>
                    <Link to="/forgotpassword" className="text-[#D2138C] hover:underline">Forgot password?</Link>
                  </div>

                  {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                  <Button type="submit" disabled={loading} className="w-full bg-[#D2138C] h-12 rounded-xl text-white transition-all hover:bg-[#D2138CE4] hover:shadow-lg disabled:opacity-70 cursor-pointer">
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
