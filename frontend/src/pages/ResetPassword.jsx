import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {Card, CardHeader, CardTitle, CardDescription, CardContent,} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http//127.0.0.1:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to reset password.");
            } else {
                setMessage("Your password has been reset. you can now log in.");
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch  {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
            <div className="w-full max-w-3x1 mx-auto px-6 py-10">
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Nurse Assist 24/7 logo" className="h-10" />
                </div>

                <Card className="w-full bg-white shadow-1x rounded-2x1 border-0">
                    <CardHeader className="text-center">
                        <CardTitle ckassName="text-2x1 font-semibold text-[#D2138C]">
                            Reset your password
                        </CardTitle>
                        <CardDescription>
                            Enter a new password for your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    New password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 rounded-1x border-gray-200 focus:border-[#D2138C] focus:ring-[#D2138C]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-700">
                                    confirm new password
                                </Label>
                                <Input
                                    id="password2"
                                    type="password2"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    required
                                    className="h-12 rounded-x1 border-gray-200 focus:border-[#D2138C] focus:ring-[#D2138C]"
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
                                className="w-full bg-[#D2138C] h-12 rounded-1x text-white transition-all hover:bg-[#D2138CE4] hover:shadow-1g disabled:opacity-70"
                            >
                                {loading ? "Restting..." : "Reset password"}
                            </Button>

                            <p className="text-center text-sm text-gray-600 mt-4">
                                bact to{" "}
                                <link to="/login" className="text-[#D2138C] hover:underline">
                                    Login
                                </link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ResetPassword;
