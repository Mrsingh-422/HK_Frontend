"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLogin() {
    const { loginAsAdmin, admin, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        // FIXED: Better handling of redirect
        if (!loading) {
            if (admin) {
                // Check if it's superadmin or regular admin
                if (admin.role === "superadmin" || admin.role === "subadmin") {
                    router.push("/admind");
                } else {
                    // Handle unauthorized admin role
                    setLoginError("Unauthorized access");
                }
            }
        }
    }, [admin, loading, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");

        try {
            const response = await loginAsAdmin({ email, password });
        } catch (err) {
            setLoginError(err || "Login failed. Please check your credentials.");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // If already logged in as admin, show nothing (redirecting)
    if (admin) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Admin Login
                </h2>

                {/* Error Message */}
                {loginError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {loginError}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition duration-300 shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {/* Forgot Password Link (optional) */}
                <div className="text-center mt-4">
                    <button
                        onClick={() => router.push('/forgot-password')}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition"
                    >
                        Forgot Password?
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Secure Admin Access Panel
                </p>
            </div>
        </div>
    );
}