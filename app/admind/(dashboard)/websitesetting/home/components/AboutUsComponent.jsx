"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function AboutUsComponent() {
    const { saveAboutUsContent } = useAdminContext();
    const { getAboutUsContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        workDescription: "",
        missionDescription: "",
        achievementDescription: "",
        images: [],
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        try {
            const res = await getAboutUsContent();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    workDescription: data.workDescription || "",
                    missionDescription: data.missionDescription || "",
                    achievementDescription: data.achievementDescription || "",
                    images: [],
                });

                // ✅ Add multer upload path here
                const imageUrls = (data.images || []).map(
                    (img) => `${API_URL}${img}`
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

            data.append("title", formData.title);
            data.append("subtitle", formData.subtitle);
            data.append("workDescription", formData.workDescription);
            data.append("missionDescription", formData.missionDescription);
            data.append("achievementDescription", formData.achievementDescription);

            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveAboutUsContent(data);

            setSuccess(
                hasData
                    ? "About section updated successfully!"
                    : "About section added successfully!"
            );

            fetchAbout();
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
                        Manage About Us Section
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
                            name="title"
                            placeholder="Title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />

                        <input
                            type="text"
                            name="subtitle"
                            placeholder="Subtitle"
                            required
                            value={formData.subtitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />

                        <textarea
                            name="workDescription"
                            rows={4}
                            placeholder="Work Description"
                            required
                            value={formData.workDescription}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />

                        <textarea
                            name="missionDescription"
                            rows={4}
                            placeholder="Mission Description"
                            required
                            value={formData.missionDescription}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />

                        <textarea
                            name="achievementDescription"
                            rows={4}
                            placeholder="Achievement Description"
                            required
                            value={formData.achievementDescription}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                        />

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                            className="md:col-span-2 p-3 border rounded-lg"
                        />

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
                            className={`md:col-span-2 py-3 rounded-lg text-white shadow-md ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save About Section"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AboutUsComponent;