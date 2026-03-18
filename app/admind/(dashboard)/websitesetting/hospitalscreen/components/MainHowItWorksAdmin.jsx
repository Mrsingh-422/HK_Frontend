"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function MainHowItWorksAdmin() {
    const { saveMainHowItWorksData } = useAdminContext();
    const { getMainHowItWorksData } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTitle: "How it Works",
        steps: [
            { title: "", desc: "" },
            { title: "", desc: "" },
            { title: "", desc: "" }
        ],
        partners: [
            { name: "" }, { name: "" }, { name: "" }, { name: "" }, { name: "" }
        ]
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchHowItWorksContent();
    }, []);

    const fetchHowItWorksContent = async () => {
        try {
            const res = await getMainHowItWorksData();
            if (res?.data) {
                setHasData(true);
                setFormData(res.data);
            }
        } catch (err) {
            console.error("Error fetching content:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...formData.steps];
        updatedSteps[index][field] = value;
        setFormData({ ...formData, steps: updatedSteps });
    };

    const handlePartnerChange = (index, value) => {
        const updatedPartners = [...formData.partners];
        updatedPartners[index].name = value;
        setFormData({ ...formData, partners: updatedPartners });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveMainHowItWorksData(formData);

            setSuccess(
                hasData
                    ? "How It Works content updated successfully!"
                    : "How It Works content added successfully!"
            );

            fetchHowItWorksContent();
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
                    Manage "How It Works" Section
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    {/* Header Title Section */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Header Title</label>
                        <input
                            value={formData.headerTitle}
                            onChange={(e) => setFormData({ ...formData, headerTitle: e.target.value })}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            placeholder="e.g. How it Works"
                        />
                    </div>

                    {/* 3 Steps Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">3 Steps Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3">
                                    <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Step 0{index + 1}</p>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Step Title</label>
                                        <input
                                            value={step.title}
                                            onChange={(e) => handleStepChange(index, "title", e.target.value)}
                                            className="w-full border p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                            placeholder="Title"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Step Description</label>
                                        <textarea
                                            value={step.desc}
                                            onChange={(e) => handleStepChange(index, "desc", e.target.value)}
                                            className="w-full border p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                            rows={3}
                                            placeholder="Description"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Partners Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Partners Names</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {formData.partners.map((partner, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Partner {index + 1}</label>
                                    <input
                                        value={partner.name}
                                        onChange={(e) => handlePartnerChange(index, e.target.value)}
                                        className="w-full border p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                        placeholder="Name"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                    >
                        {loading ? "Processing..." : "Save How It Works Section"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default MainHowItWorksAdmin;