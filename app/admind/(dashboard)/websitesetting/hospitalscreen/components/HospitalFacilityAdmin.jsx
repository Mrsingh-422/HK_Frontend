"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function HospitalFacilityAdmin() {
    const { saveHospitalFacilityData } = useAdminContext();
    const { getHospitalFacilityData } = useGlobalContext();

    const [formData, setFormData] = useState({
        tagline: "",
        titlePart1: "",
        titlePart2: "",
        description: "",
        badgeText: "Qualified Staff",
        carouselImages: [""],
        partners: [{ name: "", logo: "" }]
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchHospitalFacilityContent();
    }, []);

    const fetchHospitalFacilityContent = async () => {
        try {
            const res = await getHospitalFacilityData();
            if (res?.data) {
                setHasData(true);
                setFormData({
                    tagline: res.data.tagline || "",
                    titlePart1: res.data.titlePart1 || "",
                    titlePart2: res.data.titlePart2 || "",
                    description: res.data.description || "",
                    badgeText: res.data.badgeText || "Qualified Staff",
                    carouselImages: res.data.carouselImages || [""],
                    partners: res.data.partners || [{ name: "", logo: "" }]
                });
            }
        } catch (err) {
            console.log("Error fetching facility data:", err);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Carousel Image Handlers
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
            carouselImages: formData.carouselImages.filter((_, idx) => idx !== index)
        });
    };

    // Partner Handlers
    const handlePartnerChange = (index, field, value) => {
        const updated = [...formData.partners];
        updated[index][field] = value;
        setFormData({ ...formData, partners: updated });
    };

    const addPartner = () => {
        setFormData({
            ...formData,
            partners: [...formData.partners, { name: "", logo: "" }]
        });
    };

    const removePartner = (index) => {
        setFormData({
            ...formData,
            partners: formData.partners.filter((_, idx) => idx !== index)
        });
    };

    // ================= SAVE =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            await saveHospitalFacilityData(formData);
            setSuccess(
                hasData
                    ? "Hospital facilities updated successfully!"
                    : "Hospital facilities added successfully!"
            );
            fetchHospitalFacilityContent();
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
                    Manage Hospital Facilities Section
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

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Header Info */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Tagline</label>
                        <input
                            type="text"
                            name="tagline"
                            placeholder="e.g. OUR FACILITIES"
                            value={formData.tagline}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Image Badge Text</label>
                        <input
                            type="text"
                            name="badgeText"
                            placeholder="e.g. Qualified Staff"
                            value={formData.badgeText}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Title Part 1 (Regular)</label>
                        <input
                            type="text"
                            name="titlePart1"
                            value={formData.titlePart1}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Title Part 2 (Emerald Focus)</label>
                        <input
                            type="text"
                            name="titlePart2"
                            value={formData.titlePart2}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Carousel Images Section */}
                    <div className="md:col-span-2 border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Carousel Images</h3>
                            <button 
                                type="button" 
                                onClick={addImage} 
                                className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                            >
                                <FaPlus /> Add Image
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.carouselImages.map((img, i) => (
                                <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <input 
                                        value={img} 
                                        onChange={(e) => handleImageChange(i, e.target.value)} 
                                        placeholder="Image URL"
                                        className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(i)} 
                                        className="bg-red-50 text-red-500 p-2.5 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Partners Section */}
                    <div className="md:col-span-2 border-t pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Trusted Partners</h3>
                            <button 
                                type="button" 
                                onClick={addPartner} 
                                className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                            >
                                <FaPlus /> Add Partner
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.partners.map((partner, i) => (
                                <div key={i} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Partner Name</label>
                                        <input 
                                            value={partner.name} 
                                            onChange={(e) => handlePartnerChange(i, "name", e.target.value)} 
                                            className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo URL</label>
                                        <input 
                                            value={partner.logo} 
                                            onChange={(e) => handlePartnerChange(i, "logo", e.target.value)} 
                                            className="p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400 bg-white" 
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removePartner(i)} 
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTrash size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                        }`}
                    >
                        {loading ? "Processing..." : "Save Hospital Facility Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default HospitalFacilityAdmin;