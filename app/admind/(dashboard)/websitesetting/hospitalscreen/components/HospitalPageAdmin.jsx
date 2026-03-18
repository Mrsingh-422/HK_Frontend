"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function HospitalPageAdmin() {
    const { saveSingleHospitalPageData } = useAdminContext();
    const { getSingleHospitalPageData } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTag: "BOOK HOSPITAL",
        mainTitle: "Find Hospital! 👩‍⚕️",
        subTitle: "A doctor who saves life of the patients by his service",
        description: "",
        searchLabel: "Find in Hospitals In Your City..",
        searchPlaceholder: "Find Your Specialist.."
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchHospitalContent();
    }, []);

    const fetchHospitalContent = async () => {
        try {
            const res = await getSingleHospitalPageData();
            if (res?.data) {
                setHasData(true);
                setFormData({
                    headerTag: res.data.headerTag || "",
                    mainTitle: res.data.mainTitle || "",
                    subTitle: res.data.subTitle || "",
                    description: res.data.description || "",
                    searchLabel: res.data.searchLabel || "",
                    searchPlaceholder: res.data.searchPlaceholder || ""
                });
            }
        } catch (err) {
            console.error("Error fetching hospital content:", err);
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
            await saveSingleHospitalPageData(formData);
            
            setSuccess(
                hasData
                    ? "Hospital page updated successfully!"
                    : "Hospital page added successfully!"
            );

            fetchHospitalContent();
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
                    Manage Hospital Search Page Content
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
                    
                    {/* Header Tags */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Header Tag</label>
                        <input
                            type="text"
                            name="headerTag"
                            placeholder="e.g. BOOK HOSPITAL"
                            value={formData.headerTag}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Sub Title (Highlight Bar)</label>
                        <input
                            type="text"
                            name="subTitle"
                            placeholder="e.g. 24*7 Service Available"
                            value={formData.subTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Main Title */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title (With Emoji)</label>
                        <input
                            type="text"
                            name="mainTitle"
                            placeholder="e.g. Find Hospital! 👩‍⚕️"
                            required
                            value={formData.mainTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            placeholder="Enter section description..."
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Search Config */}
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Search Placeholder</label>
                        <input
                            type="text"
                            name="searchPlaceholder"
                            value={formData.searchPlaceholder}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                        }`}
                    >
                        {loading ? "Processing..." : "Save Hospital Page Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default HospitalPageAdmin;