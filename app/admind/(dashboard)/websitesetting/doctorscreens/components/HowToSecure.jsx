"use client";

import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

function HowToSecureAdmin() {
    const { saveHowToSecureContent } = useAdminContext();
    const { getHowToSecureContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        header: "",
        title: "",
        items: [],
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getHowToSecureContent();
            if (res?.success && res?.data) {
                setHasData(true);
                setFormData({
                    header: res.data.header || "",
                    title: res.data.title || "",
                    items: res.data.items || [],
                });
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

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { title: "", desc: "", iconType: "heart", theme: "emerald" },
            ],
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    // ================= SAVE (AUTO CREATE / UPDATE) =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();
            data.append("header", formData.header);
            data.append("title", formData.title);
            data.append("items", JSON.stringify(formData.items));

            await saveHowToSecureContent(data);

            setSuccess(
                hasData
                    ? "Security section updated successfully!"
                    : "Security section added successfully!"
            );

            fetchData();
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
                    Manage How To Secure Section
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

                    {/* Header Text */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Small Top Header</label>
                        <input
                            type="text"
                            name="header"
                            placeholder="e.g. Safety First"
                            required
                            value={formData.header}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Main Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">Big Main Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="e.g. How To Secure!"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
                    </div>

                    {/* Items Section */}
                    <div className="md:col-span-2 mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-lg font-semibold text-gray-700">Content Cards</label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 text-sm font-bold text-[#08B36A] hover:underline"
                            >
                                <FaPlus size={12} /> Add New Card
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.items.map((item, index) => (
                                <div key={index} className="p-6 border rounded-xl bg-gray-50 relative space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FaTrash size={14} />
                                    </button>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase">Card Title</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => handleItemChange(index, "title", e.target.value)}
                                            className="p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                                            placeholder="Feature Title"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase">Description</label>
                                        <textarea
                                            value={item.desc}
                                            onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                                            className="p-2 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none resize-none h-24"
                                            placeholder="Feature description"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase">Icon</label>
                                            <select
                                                value={item.iconType}
                                                onChange={(e) => handleItemChange(index, "iconType", e.target.value)}
                                                className="p-2 border rounded-lg text-sm bg-white outline-none"
                                            >
                                                <option value="heart">Heart</option>
                                                <option value="clipboard">Clipboard</option>
                                                <option value="virus">Virus</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase">Theme</label>
                                            <select
                                                value={item.theme}
                                                onChange={(e) => handleItemChange(index, "theme", e.target.value)}
                                                className="p-2 border rounded-lg text-sm bg-white outline-none"
                                            >
                                                <option value="emerald">Green</option>
                                                <option value="red">Red</option>
                                                <option value="amber">Amber</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {formData.items.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed rounded-xl text-gray-400">
                                No cards added. Click "Add New Card" to start.
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`md:col-span-2 py-3 mt-4 rounded-lg text-white font-semibold shadow-md transition-all ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                    >
                        {loading ? "Processing..." : "Save Security Section"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default HowToSecureAdmin;
