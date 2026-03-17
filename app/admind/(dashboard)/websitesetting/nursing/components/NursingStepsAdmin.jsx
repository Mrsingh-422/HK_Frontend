"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function NursingStepsAdmin() {
    const { saveNursingStepsData } = useAdminContext();
    const { getNursingStepsData } = useGlobalContext();

    const [formData, setFormData] = useState({
        headerTag: "",
        mainTitle: "",
        steps: [
            { title: "", desc: "" },
            { title: "", desc: "" },
            { title: "", desc: "" }
        ]
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchStepsContent();
    }, []);

    const fetchStepsContent = async () => {
        try {
            const res = await getNursingStepsData();
            if (res?.success && res?.data) {
                setHasData(true);
                setFormData(res.data);
            }
        } catch (err) {
            console.error("Error fetching steps:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...formData.steps];
        updatedSteps[index][field] = value;
        setFormData({ ...formData, steps: updatedSteps });
    };

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
            await saveNursingStepsData(formData);
            setSuccess(
                hasData
                    ? "Nursing steps updated successfully!"
                    : "Nursing steps added successfully!"
            );
            fetchStepsContent();
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
                        Manage "How It Works" Section
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
                        {/* Header Section */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Header Tag</label>
                            <input
                                type="text"
                                name="headerTag"
                                placeholder="e.g. Step-By-Step"
                                required
                                value={formData.headerTag}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="e.g. How It Works"
                                required
                                value={formData.mainTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Steps Grid - Styled like Action Cards in reference */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 mb-3 block">Step Details</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                {formData.steps.map((step, index) => (
                                    <div key={index} className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-[#08B36A] uppercase tracking-wider">
                                            Step 0{index + 1}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Step Title"
                                            value={step.title}
                                            onChange={(e) => handleStepChange(index, "title", e.target.value)}
                                            className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                        />
                                        <textarea
                                            placeholder="Step Description"
                                            rows={3}
                                            value={step.desc}
                                            onChange={(e) => handleStepChange(index, "desc", e.target.value)}
                                            className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Update Nursing Steps"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default NursingStepsAdmin;