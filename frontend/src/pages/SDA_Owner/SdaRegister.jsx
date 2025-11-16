import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.png";

function SdaRegister() {
  const navigate = useNavigate();

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ✅ comma -> .trim()
      const fullName = `${firstName} ${lastName}`.trim();
      const baseUsername = (
        email.split("@")[0] || `${firstName}${lastName}`
      ).replace(/\s+/g, "");

      const payload = {
        name: fullName,
        username: baseUsername,
        email,
        password,
        role: "SDA Owner",
        status: "Active",
      };

      // ✅ use Flask backend URL (port 5000)
      const res = await fetch("http://127.0.0.1:5000/api/admin/add_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // ignore JSON parse error if response isn't JSON
      }

      if (!res.ok) {
        setError(
          (data && data.message) ||
            `Request failed (${res.status}). Please try again.`
        );
        return;
      }

      console.log("Register success:", data);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top logo bar */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <img src={Logo} alt="Nurse Assist 24/7" className="h-12 w-auto" />
          <button
            type="button"
            className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-sm"
            aria-label="Help"
          >
            *
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 py-10 flex justify-center">
          <Card className="w-full max-w-xl shadow-none border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">
                Create your partner account
              </CardTitle>
              <CardDescription className="mt-2 text-gray-700">
                Enter your details to continue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

                <Button
                  type="submit"
                  className="mt-4 w-full bg-pink-600 hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign up"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-pink-600 font-medium hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default SdaRegister;
