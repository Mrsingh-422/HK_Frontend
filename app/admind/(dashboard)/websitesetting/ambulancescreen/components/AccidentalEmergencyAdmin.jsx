"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function AccidentalEmergencyAdmin() {
    const { saveAccidentalEmergencyData } = useAdminContext();
    const { getAccidentalEmergencyData } = useGlobalContext();

    const [formData, setFormData] = useState({
        sectionTag: "",
        mainTitle: "",
        description: "",
        buttonText: "Book Now",
        carouselImages: []
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchEmergencyContent();
    }, []);

    const fetchEmergencyContent = async () => {
        try {
            const res = await getAccidentalEmergencyData();
            if (res?.data) {
                setHasData(true);
                setFormData({
                    sectionTag: res.data.sectionTag || "",
                    mainTitle: res.data.mainTitle || "",
                    description: res.data.description || "",
                    buttonText: res.data.buttonText || "Book Now",
                    carouselImages: res.data.carouselImages || []
                });
            }
        } catch (err) {
            console.log("Error fetching data:", err);
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
        setFormData({ 
            ...formData, 
            carouselImages: [...formData.carouselImages, ""] 
        });
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
            await saveAccidentalEmergencyData(formData);
            setSuccess(
                hasData
                    ? "Accidental Emergency section updated successfully!"
                    : "Accidental Emergency section added successfully!"
            );
            
            fetchEmergencyContent();
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
                    Manage Accidental Emergency Section
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
                    
                    {/* Tag & Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Section Tag</label>
                        <input
                            type="text"
                            name="sectionTag"
                            placeholder="e.g. ACCIDENTAL EMERGENCY"
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
                            placeholder="e.g. Immediate Help Needed?"
                            value={formData.mainTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            placeholder="Enter section description..."
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Button Settings */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Button Text</label>
                        <input
                            type="text"
                            name="buttonText"
                            value={formData.buttonText}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Image Carousel Section */}
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
                            {formData.carouselImages.map((img, index) => (
                                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <div className="flex-1">
                                        <input 
                                            value={img} 
                                            onChange={(e) => handleImageChange(index, e.target.value)} 
                                            placeholder="Enter Image URL..."
                                            className="w-full p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-400" 
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeImage(index)} 
                                        className="bg-red-50 text-red-500 p-2.5 rounded-lg hover:bg-red-100 transition-colors flex justify-center"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                            {formData.carouselImages.length === 0 && (
                                <p className="text-center text-gray-400 py-4 italic text-sm">No images added to the carousel.</p>
                            )}
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
                        {loading ? "Processing..." : "Save Accidental Emergency Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default AccidentalEmergencyAdmin;