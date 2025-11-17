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
import NavBar from "../Client/components/Navigationbar";

function SdaRegister() {
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    
    if (!fullName || !username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: fullName,
        username: username,
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
      <NavBar logo={Logo} />

      {/* Main content */}
      <main>
        <div className="max-w-5xl mx-auto flex justify-center">
          <Card className="w-full max-w-xl shadow-none border-0">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-2xl font-semibold">
                Create your partner account
              </CardTitle>
              <CardDescription className="mt-2 text-gray-700">
                Enter your details to proceed with the registration.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Name</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Username</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. john_doe123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
