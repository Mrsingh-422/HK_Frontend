"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function ManageResearchSection() {
    const { saveResearchContent } = useAdminContext();
    const { getResearchContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        phone1: "",
        phone2: "",
        buttonText: "",
        features: [""],
        images: []
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchResearchData();
    }, []);

    const fetchResearchData = async () => {
        try {
            const res = await getResearchContent();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    description: data.description || "",
                    phone1: data.phone1 || "",
                    phone2: data.phone2 || "",
                    buttonText: data.buttonText || "",
                    features: data.features || [""],
                    images: [],
                });

                // Add multer upload path logic
                const imageUrls = (data.images || []).map(
                    (img) => img.startsWith('http') ? img : `${API_URL}${img}`
                );

                setPreviews(imageUrls);
            }
        } catch (err) {
            console.log(err);
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

        const previewUrls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(previewUrls);
    };

    // ================= FEATURE HELPERS =================
    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, ""]
        });
    };

    const removeFeature = (idx) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== idx)
        });
    };

    const handleFeatureChange = (idx, val) => {
        const updated = [...formData.features];
        updated[idx] = val;
        setFormData({ ...formData, features: updated });
    };

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();

            data.append("title", formData.title);
            data.append("subtitle", formData.subtitle);
            data.append("description", formData.description);
            data.append("phone1", formData.phone1);
            data.append("phone2", formData.phone2);
            data.append("buttonText", formData.buttonText);
            data.append("features", JSON.stringify(formData.features));

            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveResearchContent(data);

            setSuccess(
                hasData
                    ? "Research section updated successfully!"
                    : "Research section added successfully!"
            );

            fetchResearchData();
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
                        Manage Research & Verify Section
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
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Section Title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                placeholder="Section Subtitle"
                                required
                                value={formData.subtitle}
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

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Phone 1</label>
                            <input
                                type="text"
                                name="phone1"
                                placeholder="Primary Phone"
                                required
                                value={formData.phone1}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Phone 2 (Optional)</label>
                            <input
                                type="text"
                                name="phone2"
                                placeholder="Secondary Phone"
                                value={formData.phone2}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">CTA Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                placeholder="e.g. Learn More"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Features Management */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Features List</h3>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-100 border border-emerald-200 transition-all"
                                >
                                    <FaPlus size={12} /> Add Point
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.features.map((f, i) => (
                                    <div key={i} className="flex gap-2 items-center group">
                                        <input
                                            type="text"
                                            value={f}
                                            placeholder="Feature point..."
                                            onChange={(e) => handleFeatureChange(i, e.target.value)}
                                            className="flex-1 p-3 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(i)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Carousel Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full p-3 border rounded-lg bg-white"
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
                            className={`md:col-span-2 py-3.5 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save Research Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default ManageResearchSection;