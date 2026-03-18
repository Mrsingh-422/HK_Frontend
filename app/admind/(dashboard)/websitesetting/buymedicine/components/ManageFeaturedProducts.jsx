"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function ManageFeaturedProducts() {
    const { saveOnlinePharmacyFeaturedProductsContent } = useAdminContext();
    const { getOnlinePharmacyFeaturedProductsContent } = useGlobalContext();

    const [formData, setFormData] = useState({
        tag: "",
        title: ""
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // ================= FETCH & PREFILL =================
    useEffect(() => {
        fetchFeaturedContent();
    }, []);

    const fetchFeaturedContent = async () => {
        try {
            const res = await getOnlinePharmacyFeaturedProductsContent();

            if (res?.success && res?.data) {
                const data = res.data;
                setHasData(true);
                setFormData({
                    tag: data.tag || "",
                    title: data.title || ""
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
            await saveOnlinePharmacyFeaturedProductsContent(formData);

            setSuccess(
                hasData
                    ? "Featured products section updated successfully!"
                    : "Featured products section added successfully!"
            );

            fetchFeaturedContent();
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
                        Manage Featured Products Header
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
                            <label className="text-sm font-medium text-gray-600">Section Tag</label>
                            <input
                                type="text"
                                name="tag"
                                placeholder="e.g. Medicines"
                                required
                                value={formData.tag}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-600">Main Heading</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Featured Products"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#08B36A] hover:bg-[#079a5c]"
                                }`}
                        >
                            {loading ? "Processing..." : "Save Header Content"}
                        </button>
                    </form>

                    {/* Pro Tip Section - Styled to match the card interior */}
                    <div className="mt-10 p-5 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Pro Tip:
                        </h4>
                        <p className="text-blue-700 text-sm leading-relaxed">
                            The medicines shown in this marquee are pulled automatically from your medicine database.
                            To change the products, go to the <strong>Medicine Inventory</strong> management page.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageFeaturedProducts;