"use client";
 
import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";
 
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
 
function DoctorsPriority() {
    const { saveDoctorsPriorityContent } = useAdminContext();
    const { getDoctorsPriorityContent } = useGlobalContext();
 
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        points: [""],
        images: [],
    });
 
    const [previews, setPreviews] = useState([]);
    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
 
    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchContent();
    }, []);
 
    const fetchContent = async () => {
        try {
            const res = await getDoctorsPriorityContent();
 
            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
 
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    points: data.points?.length ? data.points : [""],
                    images: [],
                });
 
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
 
    const handlePointChange = (index, value) => {
        const updatedPoints = [...formData.points];
        updatedPoints[index] = value;
        setFormData({ ...formData, points: updatedPoints });
    };
 
    const addPoint = () => {
        setFormData({ ...formData, points: [...formData.points, ""] });
    };
 
    const removePoint = (index) => {
        const updatedPoints = formData.points.filter((_, i) => i !== index);
        setFormData({ ...formData, points: updatedPoints.length ? updatedPoints : [""] });
    };
 
    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });
 
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
            data.append("description", formData.description);
            data.append("points", JSON.stringify(formData.points));
 
            formData.images.forEach((img) => {
                data.append("images", img);
            });
 
            await saveDoctorsPriorityContent(data);
 
            setSuccess(
                hasData
                    ? "Doctors Priority section updated successfully!"
                    : "Doctors Priority section added successfully!"
            );
 
            fetchContent();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
               
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                    Manage Doctors Priority Section
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
 
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                    {/* Title */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Section Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter section title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>
 
                    {/* Description */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <textarea
                            name="description"
                            placeholder="Enter section description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                        />
                    </div>
 
                    {/* Points Section */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                        <label className="text-sm font-medium text-gray-600">Key Feature Points</label>
                        {formData.points.map((point, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Point #${index + 1}`}
                                    value={point}
                                    onChange={(e) => handlePointChange(index, e.target.value)}
                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removePoint(index)}
                                    className="px-4 text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPoint}
                            className="w-fit flex items-center gap-2 text-sm font-semibold text-[#08B36A] hover:underline mt-1"
                        >
                            <FaPlus size={12} /> Add New Point
                        </button>
                    </div>
 
                    {/* Image Upload */}
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Section Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                            className="p-3 border rounded-lg w-full bg-gray-50 cursor-pointer"
                        />
                    </div>
 
                    {/* Previews */}
                    {previews.length > 0 && (
                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
 
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                        }`}
                    >
                        {loading ? "Processing..." : "Save Doctors Priority Section"}
                    </button>
                </form>
            </div>
        </div>
    );
}
 
export default DoctorsPriority;