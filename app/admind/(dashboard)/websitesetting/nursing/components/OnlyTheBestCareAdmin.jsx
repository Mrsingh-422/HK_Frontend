"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function OnlyTheBestCareAdmin() {
    const { saveOnlyTheBestCareData } = useAdminContext();
    const { getOnlyTheBestCareData } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        subheading: "",
        description: "",
        points: [""],
        images: [], // To hold File objects for upload
    });

    const [previews, setPreviews] = useState([]);
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
                const data = res.data;
                setHasData(true);

                setFormData({
                    title: data.title || "",
                    subheading: data.subheading || "",
                    description: data.description || "",
                    points: data.points?.length ? data.points : [""],
                    images: [],
                });

                // Mapping images using the backend URL logic from reference
                const imageUrls = (data.carouselImages || []).map((img) =>
                    img.startsWith("http") ? img : `${API_URL}${img}`
                );

                setPreviews(imageUrls);
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

    // Handle Care Points (Text Array)
    const handlePointChange = (index, value) => {
        const updatedPoints = [...formData.points];
        updatedPoints[index] = value;
        setFormData({ ...formData, points: updatedPoints });
    };

    const addPoint = () => {
        setFormData({ ...formData, points: [...formData.points, ""] });
    };

    const removePoint = (index) => {
        const updated = formData.points.filter((_, i) => i !== index);
        setFormData({ ...formData, points: updated.length ? updated : [""] });
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

            data.append("title", formData.title);
            data.append("subheading", formData.subheading);
            data.append("description", formData.description);

            // Append Points Array
            formData.points.forEach((point) => {
                data.append("points", point);
            });

            // Append images to 'carouselImages' to match backend expectation
            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveOnlyTheBestCareData(data);

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
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Manage "Best Care" Section
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

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
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

                            <div className="flex flex-col gap-2">
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
                        </div>

                        {/* Points Section */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-gray-600 uppercase">Care Points</label>
                                <button
                                    type="button"
                                    onClick={addPoint}
                                    className="flex items-center gap-1 text-[#08B36A] text-xs font-bold hover:underline"
                                >
                                    <FaPlus size={10} /> ADD POINT
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {formData.points.map((point, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            required
                                            value={point}
                                            onChange={(e) => handlePointChange(index, e.target.value)}
                                            className="flex-1 p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                                            placeholder="e.g. Care By Professionals"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePoint(index)}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Carousel Images
                            </label>
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
                            className={`py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save Care Content"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default OnlyTheBestCareAdmin;