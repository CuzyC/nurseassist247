import { useState } from "react";
import { Link } from "react-router-dom";
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

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        setMessage(
          data.message ||
            "If that email exists, a reset link has been sent to it."
        );

        // for local testing you can log the reset link:
        if (data.reset_link) {
          console.log("Reset link:", data.reset_link);
        }
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Nurse Assist 24/7 logo" className="h-10" />
        </div>

        <Card className="w-full bg-white shadow-xl rounded-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-[#D2138C]">
              Forgot your password?
            </CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#D2138C] focus:ring-[#D2138C]"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              {message && (
                <p className="text-sm text-green-600 text-center">{message}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D2138C] h-12 rounded-xl text-white transition-all hover:bg-[#D2138CE4] hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Remembered your password?{" "}
                <Link to="/login" className="text-[#D2138C] hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;