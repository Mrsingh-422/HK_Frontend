"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function NursePrescriptionAdmin() {
    const { saveNursePrescriptionData } = useAdminContext();
    const { getNursePrescriptionData } = useGlobalContext();

    const [formData, setFormData] = useState({
        sectionTag: "",
        mainTitle: "",
        titleEmoji: "👩‍⚕️",
        subTitle: "",
        description: "",
        uploadLabel: "",
        uploadBtnText: "",
        carouselImages: []
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchPrescriptionContent();
    }, []);

    const fetchPrescriptionContent = async () => {
        try {
            const res = await getNursePrescriptionData();
            if (res?.success && res?.data) {
                setHasData(true);
                setFormData(res.data);
            }
        } catch (err) {
            console.error("Error fetching prescription data:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (index, value) => {
        const updated = [...formData.carouselImages];
        updated[index] = value;
        setFormData({ ...formData, carouselImages: updated });
    };

    const addImage = () => {
        setFormData({ ...formData, carouselImages: [...formData.carouselImages, ""] });
    };

    const removeImage = (index) => {
        setFormData({
            ...formData,
            carouselImages: formData.carouselImages.filter((_, i) => i !== index)
        });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveNursePrescriptionData(formData);
            setSuccess(
                hasData
                    ? "Prescription section updated successfully!"
                    : "Prescription section added successfully!"
            );
            fetchPrescriptionContent();
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
                        Manage Nurse Prescription Section
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

                        {/* Header Row */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Section Tag</label>
                                <input
                                    type="text"
                                    name="sectionTag"
                                    placeholder="Section Tag"
                                    value={formData.sectionTag}
                                    onChange={handleChange}
                                    className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Main Title</label>
                                <input
                                    type="text"
                                    name="mainTitle"
                                    placeholder="Main Title"
                                    value={formData.mainTitle}
                                    onChange={handleChange}
                                    className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-600">Emoji</label>
                                <input
                                    type="text"
                                    name="titleEmoji"
                                    placeholder="Emoji"
                                    value={formData.titleEmoji}
                                    onChange={handleChange}
                                    className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Sub Title</label>
                            <input
                                type="text"
                                name="subTitle"
                                placeholder="Sub Title"
                                value={formData.subTitle}
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
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Upload Field Label</label>
                            <input
                                type="text"
                                name="uploadLabel"
                                placeholder="Upload Label"
                                value={formData.uploadLabel}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Button Text</label>
                            <input
                                type="text"
                                name="uploadBtnText"
                                placeholder="Button Text"
                                value={formData.uploadBtnText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Carousel Images Section */}
                        <div className="md:col-span-2 p-5 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Carousel Images
                                </label>
                                <button
                                    type="button"
                                    onClick={addImage}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm"
                                >
                                    <FaPlus size={10} /> Add Image
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {formData.carouselImages.map((img, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            value={img}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                                            placeholder="Image URL..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="bg-red-50 text-red-500 p-3 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                                {formData.carouselImages.length === 0 && (
                                    <p className="text-gray-400 text-xs text-center py-2">No images added yet.</p>
                                )}
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
                            {loading ? "Processing..." : "Save Nurse Prescription Section"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default NursePrescriptionAdmin;