"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function HowItWorksAdmin() {
    const { saveHowItWorksContent } = useAdminContext();
    const { getHowItWorksContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        mainTitle: "",
        steps: []
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchHowItWorks();
    }, []);

    const fetchHowItWorks = async () => {
        try {
            const res = await getHowItWorksContent();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    mainTitle: data.mainTitle || "",
                    steps: data.steps || []
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    // ================= STEP HELPERS =================
    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { title: "", desc: "", iconKey: "microscope", colorKey: "blue" }]
        });
    };

    const removeStep = (index) => {
        const updated = formData.steps.filter((_, i) => i !== index);
        setFormData({ ...formData, steps: updated });
    };

    const handleStepChange = (index, field, value) => {
        const updated = [...formData.steps];
        updated[index][field] = value;
        setFormData({ ...formData, steps: updated });
    };

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();
            data.append("mainTitle", formData.mainTitle);
            data.append("steps", JSON.stringify(formData.steps));

            await saveHowItWorksContent(data);

            setSuccess(
                hasData
                    ? "How It Works section updated successfully!"
                    : "How It Works section added successfully!"
            );

            fetchHowItWorks();
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
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            Manage 'How It Works' Section
                        </h2>
                        <button
                            type="button"
                            onClick={addStep}
                            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-all border border-emerald-200"
                        >
                            <FaPlus className="text-xs" /> Add New Step
                        </button>
                    </div>

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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Section Main Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Section Main Heading</label>
                            <input
                                type="text"
                                placeholder="e.g. How it Works"
                                required
                                value={formData.mainTitle}
                                onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Steps Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="p-5 border border-gray-200 bg-gray-50 rounded-xl relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove Step"
                                    >
                                        <FaTrash size={14} />
                                    </button>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Step Title</label>
                                            <input
                                                type="text"
                                                placeholder="Step Title"
                                                required
                                                value={step.title}
                                                onChange={(e) => handleStepChange(index, "title", e.target.value)}
                                                className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                            <textarea
                                                placeholder="Step Description"
                                                required
                                                value={step.desc}
                                                onChange={(e) => handleStepChange(index, "desc", e.target.value)}
                                                rows={2}
                                                className="w-full p-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Icon</label>
                                                <select
                                                    value={step.iconKey}
                                                    onChange={(e) => handleStepChange(index, "iconKey", e.target.value)}
                                                    className="w-full p-2 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                                                >
                                                    <option value="microscope">Microscope</option>
                                                    <option value="clock">Clock</option>
                                                    <option value="vials">Vials</option>
                                                    <option value="home">Home</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Color Theme</label>
                                                <select
                                                    value={step.colorKey}
                                                    onChange={(e) => handleStepChange(index, "colorKey", e.target.value)}
                                                    className="w-full p-2 bg-white border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400"
                                                >
                                                    <option value="blue">Blue</option>
                                                    <option value="red">Red</option>
                                                    <option value="emerald">Green</option>
                                                    <option value="purple">Purple</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.steps.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                                No steps added yet. Click "Add New Step" to begin.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save How It Works Section"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default HowItWorksAdmin;