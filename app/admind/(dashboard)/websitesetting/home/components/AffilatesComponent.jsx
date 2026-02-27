"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaPhoneAlt } from "react-icons/fa";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function AffilatesComponent() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        facebook: "",
        twitter: "",
        phone: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    /* ================= FETCH DATA ================= */
    const fetchAffiliates = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/affiliates`);
            setAffiliates(res.data);
        } catch (err) {
            console.error("Error fetching affiliates:", err);
        }
    };

    /* ================= HANDLE INPUT ================= */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* ================= HANDLE IMAGE ================= */
    const handleImage = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });

        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        if (!confirm("Are you sure you want to delete this affiliate?")) return;

        try {
            await axios.delete(`${API_URL}/api/affiliates/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchAffiliates();
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    /* ================= EDIT (Prepare Form) ================= */
    const handleEdit = (affiliate) => {
        setEditId(affiliate._id);
        setFormData({
            title: affiliate.title,
            description: affiliate.description,
            facebook: affiliate.facebook,
            twitter: affiliate.twitter,
            phone: affiliate.phone,
            image: null,
        });
        setPreview(affiliate.image);
        setShowModal(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ================= SUBMIT (Add or Update) ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("facebook", formData.facebook);
            data.append("twitter", formData.twitter);
            data.append("phone", formData.phone);
            if (formData.image) {
                data.append("image", formData.image);
            }

            if (editId) {
                // Update Logic
                await axios.put(`${API_URL}/api/affiliates/${editId}`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                setSuccess("Affiliate updated successfully!");
            } else {
                // Create Logic
                await axios.post(`${API_URL}/api/affiliates`, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                setSuccess("Affiliate added successfully!");
            }

            fetchAffiliates();

            // Reset Form
            setFormData({
                title: "",
                description: "",
                facebook: "",
                twitter: "",
                phone: "",
                image: null,
            });
            setPreview(null);
            setEditId(null);

        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showModal) {
            fetchAffiliates();
        }
    }, [showModal]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
                <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            {editId ? "Edit Service Partner" : "Add Service Partner (Affiliate)"}
                        </h2>

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            View All Affiliates
                        </button>
                    </div>

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

                    {/* ================= FORM ================= */}
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div>
                            <label className="text-sm text-gray-600">Title / Specialization</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Heart Specialist / Emergency"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter short description"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Facebook URL</label>
                            <input
                                type="text"
                                name="facebook"
                                value={formData.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/page"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Twitter URL</label>
                            <input
                                type="text"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/page"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Affiliate Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                required={!editId}
                                onChange={handleImage}
                                className="w-full mt-1 p-3 border rounded-lg"
                            />
                        </div>

                        {preview && (
                            <div className="md:col-span-2 flex justify-center mt-4">
                                <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2 mt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3 rounded-lg shadow-md text-white transition ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#07a15f]"
                                    }`}
                            >
                                {loading ? "Saving..." : editId ? "Update Affiliate" : "Add Affiliate"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ title: "", description: "", facebook: "", twitter: "", phone: "", image: null });
                                        setPreview(null);
                                    }}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[5000] p-4">
                    <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-semibold">Existing Affiliates</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {affiliates.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No affiliates found.</p>
                        ) : (
                            <div className="space-y-4">
                                {affiliates.map((item) => (
                                    <div key={item._id} className="border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-gray-50">
                                        <div className="relative w-24 h-24 flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="font-semibold text-lg">{item.title}</h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                            <div className="flex justify-center md:justify-start gap-4 mt-2 text-gray-500">
                                                {item.phone && <span className="flex items-center gap-1 text-xs"><FaPhoneAlt /> {item.phone}</span>}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default AffilatesComponent;