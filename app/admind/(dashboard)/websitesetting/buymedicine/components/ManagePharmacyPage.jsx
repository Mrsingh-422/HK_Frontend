"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function ManagePharmacyPage() {
    const { savePharmacyPageContent } = useAdminContext();
    const { getPharmacyPageContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        mainTitle: "",
        description: "",
        card1Title: "",
        card1Btn: "",
        card2Title: "",
        card2Btn: "",
        card3Title: "",
        card3Btn: "",
        expressTag: "",
        sidebarTitle: "",
        sidebarDescription: "",
        searchPlaceholder: ""
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchPharmacyContent();
    }, []);

    const fetchPharmacyContent = async () => {
        try {
            const res = await getPharmacyPageContent();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    mainTitle: data.mainTitle || "",
                    description: data.description || "",
                    card1Title: data.card1Title || "",
                    card1Btn: data.card1Btn || "",
                    card2Title: data.card2Title || "",
                    card2Btn: data.card2Btn || "",
                    card3Title: data.card3Title || "",
                    card3Btn: data.card3Btn || "",
                    expressTag: data.expressTag || "",
                    sidebarTitle: data.sidebarTitle || "",
                    sidebarDescription: data.sidebarDescription || "",
                    searchPlaceholder: data.searchPlaceholder || ""
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
            // Consistent with reference logic, using save context function
            await savePharmacyPageContent(formData);

            setSuccess(
                hasData
                    ? "Pharmacy page updated successfully!"
                    : "Pharmacy page added successfully!"
            );

            fetchPharmacyContent();
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
                        Manage Pharmacy Page Content
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

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {/* Hero Section */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="Main Title"
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
                                placeholder="Description"
                                rows={3}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Action Cards Grid */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Card 1 (Title/Btn)</label>
                                <input type="text" name="card1Title" placeholder="Title" value={formData.card1Title} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                                <input type="text" name="card1Btn" placeholder="Button Text" value={formData.card1Btn} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Card 2 (Title/Btn)</label>
                                <input type="text" name="card2Title" placeholder="Title" value={formData.card2Title} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                                <input type="text" name="card2Btn" placeholder="Button Text" value={formData.card2Btn} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Card 3 (Title/Btn)</label>
                                <input type="text" name="card3Title" placeholder="Title" value={formData.card3Title} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                                <input type="text" name="card3Btn" placeholder="Button Text" value={formData.card3Btn} onChange={handleChange} className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" />
                            </div>
                        </div>

                        {/* Sidebar/Tag Section */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Express Tag</label>
                            <input
                                type="text"
                                name="expressTag"
                                placeholder="Express Tag"
                                value={formData.expressTag}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Sidebar Title</label>
                            <input
                                type="text"
                                name="sidebarTitle"
                                placeholder="Sidebar Title"
                                value={formData.sidebarTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Sidebar Description</label>
                            <input
                                type="text"
                                name="sidebarDescription"
                                placeholder="Sidebar Description"
                                value={formData.sidebarDescription}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Search Bar Placeholder</label>
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
                            {loading ? "Processing..." : "Save Pharmacy Page Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default ManagePharmacyPage;