"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function ReferralAmbulanceAdmin() {
    const { saveReferralPageData } = useAdminContext();
    const { getReferralPageData } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTag: "",
        mainTitle: "",
        subTitle: "",
        description: "",
        typeHeading: "",
        searchLabel: "",
        searchPlaceholder: "",
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchReferralContent();
    }, []);

    const fetchReferralContent = async () => {
        try {
            const res = await getReferralPageData();
            if (res?.data) {
                setHasData(true);
                // Destructure to remove categories from state even if they exist in DB
                const { categories, ...rest } = res.data;
                setFormData(rest);
            }
        } catch (err) {
            console.log("Error fetching data:", err);
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
            await saveReferralPageData(formData);
            setSuccess(
                hasData
                    ? "Referral page updated successfully!"
                    : "Referral page added successfully!"
            );
            
            fetchReferralContent();
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
                    Manage Referral Ambulance Content
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
                    
                    {/* Header & Subtitle Section */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Header Tag</label>
                        <input
                            type="text"
                            name="headerTag"
                            placeholder="e.g. BOOK REFERRAL AMBULANCE"
                            required
                            value={formData.headerTag}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Sub Title</label>
                        <input
                            type="text"
                            name="subTitle"
                            placeholder="e.g. 24*7 Service Available"
                            required
                            value={formData.subTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Main Content Section */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title</label>
                        <textarea
                            name="mainTitle"
                            rows={2}
                            required
                            value={formData.mainTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Settings Section */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Type Section Heading</label>
                        <input
                            type="text"
                            name="typeHeading"
                            placeholder="e.g. Select Type Of Ambulance"
                            value={formData.typeHeading}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Search Box Label</label>
                        <input
                            type="text"
                            name="searchLabel"
                            value={formData.searchLabel}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Search Placeholder</label>
                        <input
                            type="text"
                            name="searchPlaceholder"
                            value={formData.searchPlaceholder}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 mt-4 py-3 rounded-lg text-white shadow-md font-medium transition-all ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                        }`}
                    >
                        {loading ? "Processing..." : "Save Referral Page Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default ReferralAmbulanceAdmin;