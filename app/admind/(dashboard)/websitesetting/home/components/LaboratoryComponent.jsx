"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function LaboratoryComponent() {
    const { saveLaboratoryContent } = useAdminContext();
    const { getLaboratoryContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        introduction: "",
        images: [],
    });

    const [previews, setPreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ✅ Fetch Existing Content
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getLaboratoryContent();

                if (response?.success && response?.data) {
                    const data = response.data;

                    setFormData((prev) => ({
                        ...prev,
                        title: data.title || "",
                        subtitle: data.subtitle || "",
                        introduction: data.introduction || "",
                    }));

                    const backendImages = (data.images || []).map(
                        (img) => `${API_URL}${img}`
                    );

                    setExistingImages(backendImages);
                    setPreviews(backendImages);
                }
            } catch (err) {
                console.error("Error fetching introduction content", err);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Add new images without removing old ones
    const handleImages = (e) => {
        const files = Array.from(e.target.files);

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
        }));

        const previewUrls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews((prev) => [...prev, ...previewUrls]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("subtitle", formData.subtitle);
            data.append("introduction", formData.introduction);

            formData.images.forEach((image) => {
                data.append("images", image);
            });

            const response = await saveLaboratoryContent(data);

            if (response?.success) {
                setSuccess("Laboratory section saved successfully!");

                // Refetch updated content
                const updated = await getLaboratoryContent();

                if (updated?.success && updated?.data) {
                    const data = updated.data;

                    const backendImages = (data.images || []).map(
                        (img) => `${API_URL}${img}`
                    );

                    setExistingImages(backendImages);
                    setPreviews(backendImages);
                }

                setFormData((prev) => ({
                    ...prev,
                    images: [],
                }));
            } else {
                setError(response?.message || "Something went wrong!");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Add Laboratory Section
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

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter main title"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                required
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="Enter subtitle"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Introduction</label>
                            <textarea
                                name="introduction"
                                required
                                rows={6}
                                value={formData.introduction}
                                onChange={handleChange}
                                placeholder="Enter full introduction description"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">
                                Upload Images (Multiple)
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full mt-1 p-3 border rounded-lg"
                            />
                        </div>

                        {previews.length > 0 && (
                            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {previews.map((src, index) => (
                                    <img
                                        key={index}
                                        src={src}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-lg border"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="md:col-span-2 mt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg shadow-md transition text-white ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#08b369d6]"
                                    }`}
                            >
                                {loading ? "Saving..." : "Save Introduction Section"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}

export default LaboratoryComponent;