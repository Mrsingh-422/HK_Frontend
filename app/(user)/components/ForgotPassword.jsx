"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function ForgotPassword() {
    const { forgotPassword, verifyOtp, resetPassword } = useAuth();
    const { closeModal, openModal } = useGlobalContext();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // ✅ Timer State
    const [timer, setTimer] = useState(0);

    // ✅ Countdown Effect
    useEffect(() => {
        let interval;

        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async () => {
        if (timer > 0) return; // Prevent multiple clicks

        try {
            setLoading(true);
            const res = await forgotPassword(email);
            setMessage(res.message);
            setStep(2);

            // ✅ Start 60 second timer
            setTimer(60);

        } catch (err) {
            setMessage(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const res = await verifyOtp(email, otp);
            setMessage(res.message);
            setStep(3);
        } catch (err) {
            setMessage(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (newPassword.length < 6) {
            setMessage("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await resetPassword(email, newPassword, confirmPassword);
            setMessage(res.message);

            setTimeout(() => {
                closeModal();
                openModal("login");
            }, 1500);

        } catch (err) {
            setMessage(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Format Timer (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="relative w-[380px] bg-white shadow-2xl rounded-2xl p-7 border border-gray-100">

                <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 font-extrabold text-green-700 hover:text-green-600 transition text-lg cursor-pointer"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold text-center text-gray-800 mb-1">
                    Reset Password
                </h2>

                <p className="text-center text-gray-500 text-xs mb-5">
                    {step === 1 && "Enter your email to receive OTP"}
                    {step === 2 && "Enter the OTP sent to your email"}
                    {step === 3 && "Create your new password"}
                </p>

                {message && (
                    <div className="mb-4 text-xs text-center text-green-700 bg-green-50 border border-green-100 py-2 px-3 rounded-lg">
                        {message}
                    </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            onClick={handleSendOtp}
                            disabled={loading || timer > 0}
                            className="w-full bg-[#08B36A] text-white py-2.5 text-sm rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-60"
                        >
                            {loading
                                ? "Sending..."
                                : timer > 0
                                    ? `Resend in ${formatTime(timer)}`
                                    : "Send OTP"}
                        </button>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition"
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-[#08B36A] text-white py-2.5 text-sm rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-60"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        {/* 🔥 Resend Button (Optional inside Step 2) */}
                        <button
                            onClick={handleSendOtp}
                            disabled={loading || timer > 0}
                            className="w-full text-sm text-[#08B36A] hover:underline disabled:opacity-50"
                        >
                            {timer > 0
                                ? `Resend OTP in ${formatTime(timer)}`
                                : "Resend OTP"}
                        </button>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition"
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="w-full bg-[#08B36A] text-white py-2.5 text-sm rounded-lg font-medium hover:bg-green-700 transition duration-200 disabled:opacity-60"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ForgotPassword;