"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaTrash, FaPlus } from "react-icons/fa";

function OnlyTheBestCareAdmin() {
    const { saveOnlyTheBestCareData } = useAdminContext();
    const { getOnlyTheBestCareData } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        subheading: "",
        description: "",
        points: [""],
        carouselImages: [""]
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchCareContent();
    }, []);

    const fetchCareContent = async () => {
        try {
            const res = await getOnlyTheBestCareData();
            if (res?.success && res?.data) {
                setHasData(true);
                setFormData({
                    title: res.data.title || "",
                    subheading: res.data.subheading || "",
                    description: res.data.description || "",
                    points: res.data.points?.length ? res.data.points : [""],
                    carouselImages: res.data.carouselImages?.length ? res.data.carouselImages : [""]
                });
            }
        } catch (err) {
            console.error("Error fetching care data:", err);
        }
    };

    // ================= HANDLE INPUTS =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleArrayChange = (index, value, field) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const addField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const removeField = (index, field) => {
        const updated = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: updated.length ? updated : [""] });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveOnlyTheBestCareData(formData);
            setSuccess(
                hasData
                    ? "Care section updated successfully!"
                    : "Care section added successfully!"
            );
            fetchCareContent();
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
                    Manage "Best Care" Section
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Hero Section */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Main Title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Sub Heading</label>
                        <input
                            type="text"
                            name="subheading"
                            placeholder="Sub Heading"
                            required
                            value={formData.subheading}
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

                    {/* Points Management */}
                    <div className="flex flex-col gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Care Points</label>
                            <button
                                type="button"
                                onClick={() => addField('points')}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                            >
                                <FaPlus size={10} /> ADD POINT
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.points.map((p, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={p}
                                        onChange={(e) => handleArrayChange(i, e.target.value, 'points')}
                                        className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                        placeholder="e.g. Care By Professionals"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeField(i, 'points')}
                                        className="text-red-400 hover:text-red-600 transition-colors p-2"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Images Management */}
                    <div className="flex flex-col gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Carousel Images</label>
                            <button
                                type="button"
                                onClick={() => addField('carouselImages')}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
                            >
                                <FaPlus size={10} /> ADD IMAGE
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.carouselImages.map((img, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={img}
                                        onChange={(e) => handleArrayChange(i, e.target.value, 'carouselImages')}
                                        className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400"
                                        placeholder="Image URL"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeField(i, 'carouselImages')}
                                        className="text-red-400 hover:text-red-600 transition-colors p-2"
                                    >
                                        <FaTrash size={14} />
                                    </button>
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
                        {loading ? "Processing..." : "Save Care Content"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OnlyTheBestCareAdmin;