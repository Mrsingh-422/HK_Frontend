"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function AboutLabAdmin() {
    const { saveAboutLabContent } = useAdminContext();
    const { getAboutLabContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        subtitle: "",
        title: "",
        description: "",
        skills: [{ name: "", percentage: 50 }],
        images: []
    });

    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchAboutLab();
    }, []);

    const fetchAboutLab = async () => {
        try {
            const res = await getAboutLabContent();

            if (res?.success && res?.data) {
                const data = res.data;

                setHasData(true);

                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    description: data.description || "",
                    skills: data.skills || [{ name: "", percentage: 50 }],
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

    // ================= SKILLS HELPERS =================
    const addSkill = () => {
        setFormData({
            ...formData,
            skills: [...formData.skills, { name: "", percentage: 50 }]
        });
    };

    const removeSkill = (idx) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((_, i) => i !== idx)
        });
    };

    const handleSkillChange = (idx, field, value) => {
        const updated = [...formData.skills];
        updated[idx][field] = value;
        setFormData({ ...formData, skills: updated });
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
            data.append("skills", JSON.stringify(formData.skills));

            formData.images.forEach((img) => {
                data.append("images", img);
            });

            await saveAboutLabContent(data);

            setSuccess(
                hasData
                    ? "About Lab section updated successfully!"
                    : "About Lab section added successfully!"
            );

            fetchAboutLab();
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
                        Manage About Lab Section
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
                            <label className="text-sm font-medium text-gray-600">Main Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Empowering Health Through Innovation"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                placeholder="e.g. About Our Laboratory"
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
                                placeholder="Detailed lab description..."
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        {/* Skills Management */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-700">Skills & Progress</h3>
                                <button
                                    type="button"
                                    onClick={addSkill}
                                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-100 border border-emerald-200 transition-all"
                                >
                                    <FaPlus size={12} /> Add Skill
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Skill Name (e.g. Accurate Results)"
                                                required
                                                value={skill.name}
                                                onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                                                className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                                            />
                                        </div>
                                        <div className="w-full md:w-64 flex gap-3 items-center">
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={skill.percentage}
                                                onChange={(e) => handleSkillChange(idx, 'percentage', e.target.value)}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <span className="text-sm font-bold text-emerald-600 w-12 text-right">{skill.percentage}%</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(idx)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Lab Carousel Images</label>
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
                            {loading ? "Processing..." : "Save About Lab Content"}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default AboutLabAdmin;