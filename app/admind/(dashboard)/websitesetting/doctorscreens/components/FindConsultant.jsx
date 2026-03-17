"use client";
 
import React, { useState, useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
 
function DashboardFindConsultant() {
    const { saveFindConsultantContent } = useAdminContext();
    const { getFindConsultantContent } = useGlobalContext();
 
    const [formData, setFormData] = useState({
        miniTitle: "",
        mainTitle: "",
        subTitle: "",
        description: "",
    });
 
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
            const res = await getFindConsultantContent();
 
            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
 
                setFormData({
                    miniTitle: data.miniTitle || "",
                    mainTitle: data.mainTitle || "",
                    subTitle: data.subTitle || "",
                    description: data.description || "",
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
            data.append("subTitle", formData.subTitle);
            data.append("description", formData.description);
 
            await saveFindConsultantContent(data);
 
            setSuccess(
                hasData
                    ? "Consultant section updated successfully!"
                    : "Consultant section added successfully!"
            );
 
            fetchContent();
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
                        Manage Consultant Section
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
                            name="miniTitle"
                            placeholder="Mini Tagline (e.g. Expert Guidance)"
                            required
                            value={formData.miniTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
 
                        <input
                            type="text"
                            name="mainTitle"
                            placeholder="Main Title (e.g. Find Your Consultant)"
                            required
                            value={formData.mainTitle}
                            onChange={handleChange}
                            className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
 
                        <input
                            type="text"
                            name="subTitle"
                            placeholder="Subtitle (e.g. Professional Advice)"
                            required
                            value={formData.subTitle}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                        />
 
                        <textarea
                            name="description"
                            placeholder="Description Content"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                        />
 
                        <button
                            type="submit"
                            disabled={loading}
                            className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#079a5c]"
                            }`}
                        >
                            {loading ? "Processing..." : "Save Consultant Section"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
 
export default DashboardFindConsultant;