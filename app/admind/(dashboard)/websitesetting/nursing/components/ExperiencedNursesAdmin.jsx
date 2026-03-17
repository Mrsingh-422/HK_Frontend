"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function ExperiencedNursesAdmin() {
    const { saveExperiencedNursesData } = useAdminContext();
    const { getExperiencedNursesData } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        buttonText: "",
        footerNote: ""
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchNursesSectionContent();
    }, []);

    const fetchNursesSectionContent = async () => {
        try {
            const res = await getExperiencedNursesData();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    buttonText: data.buttonText || "",
                    footerNote: data.footerNote || ""
                });
            }
        } catch (err) {
            console.error("Error fetching section data:", err);
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
            await saveExperiencedNursesData(formData);

            setSuccess(
                hasData
                    ? "Section updated successfully!"
                    : "Section content added successfully!"
            );

            fetchNursesSectionContent();
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
                        Manage Experienced Nurses Section
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
                        {/* Title Section */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. We Have Experienced Nurses"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                            <p className="text-[11px] text-emerald-600 italic">
                                Note: Use the word "Experienced" to apply the green highlight automatically.
                            </p>
                        </div>

                        {/* Description Section */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Description</label>
                            <textarea
                                name="description"
                                placeholder="Enter section description..."
                                rows={5}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Bottom Row */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                placeholder="e.g. Hire Now"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Footer Note</label>
                            <input
                                type="text"
                                name="footerNote"
                                placeholder="e.g. Available 24/7"
                                value={formData.footerNote}
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
                            {loading ? "Processing..." : "Save Experienced Nurses Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default ExperiencedNursesAdmin;