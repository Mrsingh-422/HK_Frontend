"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function LabCareAdmin() {
    const { saveLabCareContent } = useAdminContext();
    const { getLabCareContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        buttonText: "",
        statusLabel: "",
        statusValue: "",
        features: [],
        images: [],
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchLabCare();
    }, []);

    const fetchLabCare = async () => {
        try {
            const res = await getLabCareContent();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    buttonText: data.buttonText || "",
                    statusLabel: data.statusLabel || "",
                    statusValue: data.statusValue || "",
                    features: data.features || [],
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
            features: [...formData.features, { text: "", iconKey: "microscope" }]
        });
    };

    const removeFeature = (idx) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== idx)
        });
    };

    const handleFeatureChange = (idx, field, value) => {
        const updated = [...formData.features];
        updated[idx][field] = value;
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
            data.append("description", formData.description);
            data.append("buttonText", formData.buttonText);
            data.append("statusLabel", formData.statusLabel);
            data.append("statusValue", formData.statusValue);
            data.append("features", JSON.stringify(formData.features));

            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveLabCareContent(data);

            setSuccess(
                hasData
                    ? "Lab Care section updated successfully!"
                    : "Lab Care section added successfully!"
            );

            fetchLabCare();
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
                        Manage Lab Care Section
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
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Section Title</label>
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

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                placeholder="Button Text"
                                required
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Status Label</label>
                            <input
                                type="text"
                                name="statusLabel"
                                placeholder="e.g. Lab Status"
                                required
                                value={formData.statusLabel}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Status Value</label>
                            <input
                                type="text"
                                name="statusValue"
                                placeholder="e.g. Active"
                                required
                                value={formData.statusValue}
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

                        {/* Features Section */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Feature List</h3>
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-100 border border-emerald-200"
                                >
                                    <FaPlus size={12} /> Add Feature
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.features.map((f, i) => (
                                    <div key={i} className="flex gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 relative group">
                                        <select 
                                            value={f.iconKey} 
                                            onChange={(e) => handleFeatureChange(i, 'iconKey', e.target.value)}
                                            className="bg-white border rounded-lg text-sm p-2 outline-none focus:ring-2 focus:ring-emerald-400"
                                        >
                                            <option value="microscope">Microscope</option>
                                            <option value="flask">Flask</option>
                                            <option value="clock">Clock</option>
                                            <option value="heart">Heart</option>
                                            <option value="shield">Shield</option>
                                        </select>
                                        <input 
                                            type="text" 
                                            value={f.text} 
                                            onChange={(e) => handleFeatureChange(i, 'text', e.target.value)}
                                            className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400" 
                                            placeholder="Feature text" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeFeature(i)} 
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <FaTrash size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Carousel Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full p-3 border rounded-lg"
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
                            {loading ? "Processing..." : "Save Lab Care Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default LabCareAdmin;