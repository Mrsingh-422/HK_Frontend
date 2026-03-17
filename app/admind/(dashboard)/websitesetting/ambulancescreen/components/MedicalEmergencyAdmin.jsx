"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash, FaCloudUploadAlt, FaImage } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function MedicalEmergencyAdmin() {
    const { saveMedicalEmergencyData } = useAdminContext();
    const { getMedicalEmergencyData } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        highlightText: "",
        buttonText: "Book Now",
        images: [] // To hold actual File objects
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchMedicalContent();
    }, []);

    const fetchMedicalContent = async () => {
        try {
            const res = await getMedicalEmergencyData();
            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    highlightText: data.highlightText || "",
                    buttonText: data.buttonText || "Book Now",
                    images: [] // Reset files on fetch
                });

                // Set previews from existing carouselImages in DB
                const imageUrls = (data.carouselImages || []).map((img) =>
                    img.startsWith("http") ? img : `${API_URL}${img}`
                );
                setPreviews(imageUrls);
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

    const handleImages = (e) => {
        const files = Array.from(e.target.files);

        setFormData({
            ...formData,
            images: files,
        });

        // Generate temporary local URLs for previewing
        const previewUrls = files.map((file) => URL.createObjectURL(file));
        setPreviews(previewUrls);
    };

    // ================= SAVE (SUBMIT AS FORMDATA) =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();

            // Append all text fields
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("highlightText", formData.highlightText);
            data.append("buttonText", formData.buttonText);

            // Append Images (Multer expects 'carouselImages')
            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveMedicalEmergencyData(data);

            setSuccess(
                hasData
                    ? "Medical Emergency section updated successfully!"
                    : "Medical Emergency section added successfully!"
            );
            
            fetchMedicalContent();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
                
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 font-sans">
                    Manage Medical Emergency Section
                </h2>

                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300 text-sm font-medium">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Title & Highlight */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. Medical Emergency"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Highlight Text</label>
                        <input
                            type="text"
                            name="highlightText"
                            placeholder="e.g. Available Booking Online"
                            value={formData.highlightText}
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
                            required
                            placeholder="Enter detailed description..."
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Button Text */}
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

                    {/* Image Upload Area */}
                    <div className="md:col-span-2 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 mt-4">
                        <div className="flex flex-col items-center justify-center mb-4">
                            <FaCloudUploadAlt size={40} className="text-gray-400 mb-2" />
                            <p className="text-gray-600 mb-4 font-medium">Upload Carousel Images</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full p-2 bg-white border rounded-lg text-sm"
                            />
                        </div>

                        {/* Previews Grid */}
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg border bg-white overflow-hidden shadow-sm">
                                        <img src={src} alt="preview" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {previews.length === 0 && (
                            <div className="flex flex-col items-center text-gray-400 py-4 italic">
                                <FaImage size={24} className="mb-1" />
                                <p className="text-xs">No images currently selected.</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                        }`}
                    >
                        {loading ? "Processing..." : "Save Medical Emergency Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default MedicalEmergencyAdmin;