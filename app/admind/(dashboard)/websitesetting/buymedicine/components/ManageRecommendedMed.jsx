"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function ManageRecommendedMed() {
    const { saveRecommendedMedContent } = useAdminContext();
    const { getRecommendedMedContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        miniTitle: "",
        mainTitle: "",
        description: "",
        statusText: "",
        buttonText: "",
        images: [],
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchRecommendedMed();
    }, []);

    const fetchRecommendedMed = async () => {
        try {
            const res = await getRecommendedMedContent();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    miniTitle: data.miniTitle || "",
                    mainTitle: data.mainTitle || "",
                    description: data.description || "",
                    statusText: data.statusText || "",
                    buttonText: data.buttonText || "",
                    images: [],
                });

                // Map multer upload path logic
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

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();

            data.append("miniTitle", formData.miniTitle);
            data.append("mainTitle", formData.mainTitle);
            data.append("description", formData.description);
            data.append("statusText", formData.statusText);
            data.append("buttonText", formData.buttonText);

            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveRecommendedMedContent(data);

            setSuccess(
                hasData
                    ? "Recommended medicines updated successfully!"
                    : "Recommended medicines added successfully!"
            );

            fetchRecommendedMed();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                        Manage Recommended Medicines
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
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Mini Title</label>
                            <input
                                type="text"
                                name="miniTitle"
                                placeholder="Mini Title"
                                required
                                value={formData.miniTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="mainTitle"
                                placeholder="Main Title"
                                required
                                value={formData.mainTitle}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
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

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Status / Check Text</label>
                            <input
                                type="text"
                                name="statusText"
                                placeholder="e.g. 100% Quality Check"
                                value={formData.statusText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-600">Button Text</label>
                            <input
                                type="text"
                                name="buttonText"
                                placeholder="e.g. Shop Now"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Carousel Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImages}
                                className="w-full p-3 border rounded-lg cursor-pointer bg-gray-50"
                            />
                        </div>

                        {previews.length > 0 && (
                            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {previews.map((src, index) => (
                                    <img
                                        key={index}
                                        src={src}
                                        alt="preview"
                                        className="h-24 w-full object-cover rounded-lg border shadow-sm"
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
                            {loading ? "Processing..." : "Save Recommended Medicine Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default ManageRecommendedMed;