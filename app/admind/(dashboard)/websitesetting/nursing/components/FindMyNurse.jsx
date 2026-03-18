"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function NursePageAdmin() {
    const { saveNursePageData } = useAdminContext();
    const { getNursePageData } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTag: "",
        mainTitle: "",
        description: "",
        searchLabel: "",
        searchPlaceholder: ""
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchNurseContent();
    }, []);

    const fetchNurseContent = async () => {
        try {
            const res = await getNursePageData();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    headerTag: data.headerTag || "",
                    mainTitle: data.mainTitle || "",
                    description: data.description || "",
                    searchLabel: data.searchLabel || "",
                    searchPlaceholder: data.searchPlaceholder || ""
                });
            }
        } catch (err) {
            console.error("Error fetching nurse data:", err);
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
            await saveNursePageData(formData);

            setSuccess(
                hasData
                    ? "Nurse page updated successfully!"
                    : "Nurse page added successfully!"
            );

            fetchNurseContent();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Manage Nurse Page Content
                    </h2>

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300 text-sm">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Hero Section */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Header Tagline</label>
                            <input
                                type="text"
                                name="headerTag"
                                placeholder="e.g. Book Your Personal Home Services"
                                required
                                value={formData.headerTag}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="e.g. Find My Nurse!"
                                required
                                value={formData.mainTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Description Text</label>
                            <textarea
                                name="description"
                                placeholder="Description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Search Settings */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Search Label</label>
                            <input
                                type="text"
                                name="searchLabel"
                                placeholder="Search Label"
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
                                placeholder="Search Placeholder"
                                value={formData.searchPlaceholder}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save Nurse Page Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default NursePageAdmin;