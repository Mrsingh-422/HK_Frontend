"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
        images: [],
    });

    const [previews, setPreviews] = useState([]);
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
                const data = res.data;

                setHasData(true);

                setFormData({
                    sectionTag: data.sectionTag || "",
                    mainTitle: data.mainTitle || "",
                    titleEmoji: data.titleEmoji || "👩‍⚕️",
                    subTitle: data.subTitle || "",
                    description: data.description || "",
                    uploadLabel: data.uploadLabel || "",
                    uploadBtnText: data.uploadBtnText || "",
                    images: [],
                });

                // Mapping images using the backend URL logic from reference
                const imageUrls = (data.carouselImages || []).map((img) =>
                    img.startsWith("http") ? img : `${API_URL}${img}`
                );

                setPreviews(imageUrls);
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

    const handleImages = (e) => {
        const files = Array.from(e.target.files);

        setFormData({
            ...formData,
            images: files,
        });

        const previewUrls = files.map((file) => URL.createObjectURL(file));

        setPreviews(previewUrls);
    };

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();

            data.append("sectionTag", formData.sectionTag);
            data.append("mainTitle", formData.mainTitle);
            data.append("titleEmoji", formData.titleEmoji);
            data.append("subTitle", formData.subTitle);
            data.append("description", formData.description);
            data.append("uploadLabel", formData.uploadLabel);
            data.append("uploadBtnText", formData.uploadBtnText);

            // Append images to 'carouselImages' to match backend expectation
            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveNursePrescriptionData(data);

            setSuccess(
                hasData
                    ? "Nurse prescription section updated successfully!"
                    : "Nurse prescription section added successfully!"
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
            {/* Added Top Navbar as per reference */}
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Manage Nurse Prescription Section
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

                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <input
                            type="text"
                            name="sectionTag"
                            placeholder="Section Tag (e.g. Prescription)"
                            required
                            value={formData.sectionTag}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />

                        <div className="grid grid-cols-4 gap-2">
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="Main Title"
                                required
                                value={formData.mainTitle}
                                onChange={handleChange}
                                className="col-span-3 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                            <input
                                type="text"
                                name="titleEmoji"
                                placeholder="Emoji"
                                value={formData.titleEmoji}
                                onChange={handleChange}
                                className="col-span-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-center"
                            />
                        </div>

                        <input
                            type="text"
                            name="subTitle"
                            placeholder="Sub Title"
                            required
                            value={formData.subTitle}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />

                        <input
                            type="text"
                            name="uploadLabel"
                            placeholder="Upload Label Text"
                            required
                            value={formData.uploadLabel}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />

                        <input
                            type="text"
                            name="uploadBtnText"
                            placeholder="Upload Button Text"
                            required
                            value={formData.uploadBtnText}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Carousel Images
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full p-3 border rounded-lg bg-gray-50"
                            />
                        </div>

                        {previews.length > 0 && (
                            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {previews.map((src, index) => (
                                    <img
                                        key={index}
                                        src={src}
                                        alt="preview"
                                        className="h-32 w-full object-cover rounded-lg border"
                                    />
                                ))}
                            </div>
                        )}

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