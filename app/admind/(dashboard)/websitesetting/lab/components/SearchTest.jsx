"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function SearchTestAdmin() {
    const { saveSearchTestData } = useAdminContext();
    const { getSearchTestData } = useGlobalContext();

    const [formData, setFormData] = useState({
        miniTitle: "",
        mainTitle: "",
        description: "",
        searchLabel: ""
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchSearchData();
    }, []);

    const fetchSearchData = async () => {
        try {
            const res = await getSearchTestData();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    miniTitle: data.miniTitle || "",
                    mainTitle: data.mainTitle || "",
                    description: data.description || "",
                    searchLabel: data.searchLabel || ""
                });
            }
        } catch (err) {
            console.log(err);
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
            await saveSearchTestData(formData);

            setSuccess(
                hasData
                    ? "Search page section updated successfully!"
                    : "Search page section added successfully!"
            );

            fetchSearchData();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Manage Search Test Page
                    </h2>

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300 font-medium">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300 font-medium">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Mini Title (Verification Tag)</label>
                            <input
                                type="text"
                                name="miniTitle"
                                placeholder="e.g. 100% Verified Labs"
                                required
                                value={formData.miniTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Search Input Label</label>
                            <input
                                type="text"
                                name="searchLabel"
                                placeholder="e.g. Find your diagnostics.."
                                required
                                value={formData.searchLabel}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Main Heading</label>
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="e.g. Search Test By Habits!"
                                required
                                value={formData.mainTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Description Text</label>
                            <textarea
                                name="description"
                                placeholder="Enter the detailed description for the page..."
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`md:col-span-2 py-3.5 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save Page Content"}
                        </button>

                    </form>

                    {/* Footer Note logic aligned with reference clean layout */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                            Changes will be reflected immediately on the public "Book Lab Test" page.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SearchTestAdmin;