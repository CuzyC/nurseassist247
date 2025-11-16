import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/admin/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include", // to handle session cookies
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok && data.logged_in) {
                // Choose storage based on "remember me"
                const storage = rememberMe ? localStorage : sessionStorage

                // clear any old values in both storages
                localStorage.removeItem("role");
                localStorage.removeItem("username");
                sessionStorage.removeItem("role");
                sessionStorage.removeItem("username");

                // Save current login
                storage.setItem("role", data.role);
                storage.setItem("username", username)

                //(if later add a token from backend store it here too)
                // storage.setItem("authToken", data.token);

                navigate("/admin/dashboard"); // redirect to admin dashboard
            } else {
                setError(data.message || "Login Failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Failed to connect to server");
            setLoading(false);
        }
    }

    return (
        <div className='bg-gray-100 min-h-screen flex items-center justify-center'>
            <Card className="shadow-lg w-full max-w-md m-4">
                <CardHeader className="text-center">
                    {logo && (
                        <img src={logo} alt="Logo" className="object-contain" />
                    )}
                    <CardTitle className="text-lg text-[#cc1b89ff] font-semibold">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input 
                                id="username" 
                                type="text" 
                                className="mb-2" 
                                placeholder="Enter your username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password" 
                                type="password" 
                                className="mb-4" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Remember me
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}
                        
                        <Button 
                            type="submit" 
                            className="w-full rounded bg-[#D2138C] hover:bg-[#a50e6a]"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <button
                            type="button"
                            className="text-sm text-pink-600 hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;
