"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function OurNursingServicesAdmin() {
    const { saveOurNursingServicesContent } = useAdminContext();
    const { getOurNursingServicesContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        services: [""],
        carouselImages: [""]
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchServicesContent();
    }, []);

    const fetchServicesContent = async () => {
        try {
            const res = await getOurNursingServicesContent();
            if (res?.success && res?.data) {
                setHasData(true);
                setFormData({
                    title: res.data.title || "",
                    description: res.data.description || "",
                    services: res.data.services || [""],
                    carouselImages: res.data.carouselImages || [""]
                });
            }
        } catch (err) {
            console.error("Error fetching services content:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleArrayChange = (index, field, value) => {
        const updated = [...formData[field]];
        updated[index] = value;
        setFormData({ ...formData, [field]: updated });
    };

    const addArrayField = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ""] });
    };

    const removeArrayField = (field, index) => {
        const updated = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: updated });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveOurNursingServicesContent(formData);
            setSuccess(
                hasData
                    ? "Nursing services updated successfully!"
                    : "Nursing services added successfully!"
            );
            fetchServicesContent();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
                
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Manage Our Nursing Services
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
                    
                    {/* Hero Text Section */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Our Services"
                            required
                            value={formData.title}
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

                    {/* Dynamic Managers Section */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Services Manager */}
                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Checklist Services</label>
                                <button 
                                    type="button" 
                                    onClick={() => addArrayField('services')}
                                    className="flex items-center gap-1 text-[#08B36A] text-xs font-bold hover:underline"
                                >
                                    <FaPlus size={10} /> ADD SERVICE
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.services.map((service, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={service}
                                            onChange={(e) => handleArrayChange(index, 'services', e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                                            placeholder="e.g. Home Medication"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayField('services', index)}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Manager */}
                        <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Carousel Images</label>
                                <button 
                                    type="button" 
                                    onClick={() => addArrayField('carouselImages')}
                                    className="flex items-center gap-1 text-[#08B36A] text-xs font-bold hover:underline"
                                >
                                    <FaPlus size={10} /> ADD IMAGE
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.carouselImages.map((img, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={img}
                                            onChange={(e) => handleArrayChange(index, 'carouselImages', e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white"
                                            placeholder="Image URL"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayField('carouselImages', index)}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                        {loading ? "Processing..." : "Update Nursing Services Section"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default OurNursingServicesAdmin;