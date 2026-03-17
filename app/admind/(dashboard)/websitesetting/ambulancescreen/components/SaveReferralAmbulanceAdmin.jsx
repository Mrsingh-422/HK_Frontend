"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash, FaCloudUploadAlt, FaImage } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function SaveReferralAmbulanceAdmin() {
    const { saveReferralAmbulanceContent } = useAdminContext();
    const { getReferralAmbulanceContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        tagline: "",
        subHeader: "",
        description: "",
        buttonText: "Book Now",
        badgeText: "Inter-City Transport",
        images: [] // Array to hold File objects for Multer
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchReferralContent();
    }, []);

    const fetchReferralContent = async () => {
        try {
            const res = await getReferralAmbulanceContent();
            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);

                setFormData({
                    tagline: data.tagline || "",
                    subHeader: data.subHeader || "",
                    description: data.description || "",
                    buttonText: data.buttonText || "Book Now",
                    badgeText: data.badgeText || "Inter-City Transport",
                    images: [] // Reset local files on fetch
                });

                // Logic to handle existing image paths from server
                const imageUrls = (data.carouselImages || []).map(
                    (img) => img.startsWith('http') ? img : `${API_URL}${img}`
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

        // Generate temporary local URLs for the UI
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

            // Append text fields
            data.append("tagline", formData.tagline);
            data.append("subHeader", formData.subHeader);
            data.append("description", formData.description);
            data.append("buttonText", formData.buttonText);
            data.append("badgeText", formData.badgeText);

            // Append images (Multer expects 'carouselImages')
            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveReferralAmbulanceContent(data);

            setSuccess(
                hasData
                    ? "Referral Ambulance section updated successfully!"
                    : "Referral Ambulance section added successfully!"
            );

            fetchReferralContent();
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
                    Manage Referral Services Section
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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Main Tagline (Title)</label>
                        <input
                            type="text"
                            name="tagline"
                            required
                            value={formData.tagline}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Sub Header</label>
                        <input
                            type="text"
                            name="subHeader"
                            required
                            value={formData.subHeader}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

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

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Image Badge Text</label>
                        <input
                            type="text"
                            name="badgeText"
                            value={formData.badgeText}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* MULTIPLE IMAGE UPLOAD SECTION */}
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
                            <div className="flex flex-col items-center text-gray-400 py-6">
                                <FaImage size={24} className="mb-2" />
                                <p className="text-xs italic">No images selected for this section.</p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                    >
                        {loading ? "Processing..." : "Save Referral Section Content"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default SaveReferralAmbulanceAdmin;