"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function EmergencyFacilityAdmin() {
    const { saveEmergencyFacilityData } = useAdminContext();
    const { getEmergencyFacilityData } = useGlobalContext();

    const [formData, setFormData] = useState({
        tagline: "",
        title: "",
        description: "",
        statusText: "Active Now"
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchFacilityContent();
    }, []);

    const fetchFacilityContent = async () => {
        try {
            const res = await getEmergencyFacilityData();
            if (res?.data) {
                setHasData(true);
                setFormData({
                    tagline: res.data.tagline || "",
                    title: res.data.title || "",
                    description: res.data.description || "",
                    statusText: res.data.statusText || "Active Now"
                });
            }
        } catch (err) {
            console.log("Error fetching facility data:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveEmergencyFacilityData(formData);

            setSuccess(
                hasData
                    ? "Facility section updated successfully!"
                    : "Facility section created successfully!"
            );

            fetchFacilityContent();
            setTimeout(() => setSuccess(""), 3000);
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
                    Manage Emergency Facility Section
                </h2>

                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Tagline & Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Tagline</label>
                        <input
                            type="text"
                            name="tagline"
                            placeholder="e.g. EMERGENCY AMBULANCE FACILITY"
                            required
                            value={formData.tagline}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. 24*7 Service Available"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Full Width Description */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description Content</label>
                        <textarea
                            name="description"
                            placeholder="Enter the detailed description..."
                            rows={6}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Status Text */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Status Badge Text</label>
                        <input
                            type="text"
                            name="statusText"
                            placeholder="e.g. Active Now"
                            value={formData.statusText}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Empty div to maintain grid balance if needed, or button span */}
                    <div className="hidden md:block"></div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                    >
                        {loading ? "Processing..." : "Save Facility Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default EmergencyFacilityAdmin;