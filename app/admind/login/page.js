"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLogin() {
    const { loginAsAdmin, admin, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!loading && admin) {
            router.push("/admind");
        }
    }, [admin, loading, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await loginAsAdmin({ email, password });
            router.push("/admind");
        } catch (err) {
            alert(err);
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
                Loading...
            </div>
        );

    if (admin && admin.role != "superadmin") return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4">

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

                <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Admin Login
                </h2>

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
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition duration-300 shadow-lg hover:shadow-emerald-500/30"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6">
                    Secure Admin Access Panel
                </p>
            </div>
        </div>
    );
}