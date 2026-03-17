"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function FindMyDoctorDashboard() {
    const { saveFindDoctorContent } = useAdminContext();
    const { getFindDoctorContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTag: "",
        titlePart1: "",
        titlePart2: "",
        description: "",
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await getFindDoctorContent();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    headerTag: data.headerTag || "",
                    titlePart1: data.titlePart1 || "",
                    titlePart2: data.titlePart2 || "",
                    description: data.description || "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            // If your backend expects JSON, send formData directly.
            // If it expects multipart (like the reference), use new FormData()
            const data = new FormData();
            data.append("headerTag", formData.headerTag);
            data.append("titlePart1", formData.titlePart1);
            data.append("titlePart2", formData.titlePart2);
            data.append("description", formData.description);

            await saveFindDoctorContent(data);

            setSuccess(
                hasData
                    ? "Find Doctor section updated successfully!"
                    : "Find Doctor section added successfully!"
            );

            fetchContent();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Manage Find My Doctor Section
                </h2>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Small Accent Tagline</label>
                        <input
                            type="text"
                            name="headerTag"
                            placeholder="e.g. 100% Secure Consultations"
                            value={formData.headerTag}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Heading (Part 1)</label>
                        <input
                            type="text"
                            name="titlePart1"
                            placeholder="e.g. Find My"
                            required
                            value={formData.titlePart1}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Accent Heading (Part 2)</label>
                        <input
                            type="text"
                            name="titlePart2"
                            placeholder="e.g. Health Specialist"
                            value={formData.titlePart2}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description Text</label>
                        <textarea
                            name="description"
                            placeholder="Write a compelling description..."
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white font-semibold shadow-md transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                    >
                        {loading ? "Processing..." : "Save Find Doctor Content"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FindMyDoctorDashboard;