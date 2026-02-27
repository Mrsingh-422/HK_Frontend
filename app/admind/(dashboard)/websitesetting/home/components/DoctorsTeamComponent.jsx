"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaPhoneAlt } from "react-icons/fa";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function DoctorsTeamComponent() {
    const [formData, setFormData] = useState({
        specialization: "",
        description: "",
        facebook: "",
        twitter: "",
        phone: "",
        image: null,
    });

    // Extracting functions from Context
    const { addDoctorInDoctorsTeam, updateDoctorInDoctorsTeam, deleteDoctorInDoctorsTeam } = useAdminContext();
    const { getDoctorTeamContent } = useGlobalContext();

    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    /* ================= FETCH DATA USING GLOBAL CONTEXT ================= */
    const fetchDoctors = async () => {
        try {
            const data = await getDoctorTeamContent();
            if (data) {
                setDoctors(data);
            }
        } catch (err) {
            console.error("Error fetching doctors:", err);
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

    /* ================= DELETE USING ADMIN CONTEXT ================= */
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this doctor?")) return;

        try {
            const res = await deleteDoctorInDoctorsTeam(id);
            if (res) {
                setSuccess("Doctor deleted successfully!");
                fetchDoctors();
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete doctor");
        }
    };

    /* ================= EDIT (Prepare Form) ================= */
    const handleEdit = (doctor) => {
        setEditId(doctor._id);
        setFormData({
            specialization: doctor.specialization,
            description: doctor.description,
            facebook: doctor.facebook,
            twitter: doctor.twitter,
            phone: doctor.phone,
            image: null,
        });

        // Handle Multer image path: check if it's already a full URL or needs prefix
        const imageUrl = doctor.image?.startsWith("http")
            ? doctor.image
            : `${API_URL}/${doctor.image}`;

        setPreview(imageUrl);
        setShowModal(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ================= SUBMIT USING ADMIN CONTEXT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        setError("");

        try {
            const data = new FormData();
            data.append("specialization", formData.specialization);
            data.append("description", formData.description);
            data.append("facebook", formData.facebook);
            data.append("twitter", formData.twitter);
            data.append("phone", formData.phone);
            if (formData.image) {
                data.append("image", formData.image);
            }

            let response;
            if (editId) {
                response = await updateDoctorInDoctorsTeam(editId, data);
                setSuccess("Doctor updated successfully!");
            } else {
                response = await addDoctorInDoctorsTeam(data);
                setSuccess("Doctor added successfully!");
            }

            if (response) {
                fetchDoctors();
                // Reset Form
                setFormData({
                    specialization: "",
                    description: "",
                    facebook: "",
                    twitter: "",
                    phone: "",
                    image: null,
                });
                setPreview(null);
                setEditId(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors(); // Initial fetch
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchDoctors();
        }
    }, [showModal]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            {editId ? "Edit Doctor Details" : "Add New Doctor"}
                        </h2>

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            View All Doctors
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

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-gray-600">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                required
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="Heart Specialist / Neurologist"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
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
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
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
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Facebook URL</label>
                            <input
                                type="text"
                                name="facebook"
                                value={formData.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/doctor"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Twitter URL</label>
                            <input
                                type="text"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/doctor"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm text-gray-600">Doctor Image</label>
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
                                className={`flex-1 py-3 rounded-lg shadow-md transition text-white ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#08b369d6]"
                                    }`}
                            >
                                {loading ? "Saving..." : editId ? "Update Doctor" : "Add Doctor"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ specialization: "", description: "", facebook: "", twitter: "", phone: "", image: null });
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
                            <h3 className="text-xl font-semibold">All Team Members</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {doctors.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No doctors found.</p>
                        ) : (
                            <div className="space-y-4">
                                {doctors.map((doctor) => {
                                    // Handle image path from Multer uploads
                                    const imgSrc = doctor.image?.startsWith("http")
                                        ? doctor.image
                                        : `${API_URL}/${doctor.image}`;

                                    return (
                                        <div key={doctor._id} className="border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-gray-50">
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <Image
                                                    src={imgSrc}
                                                    alt={doctor.specialization}
                                                    fill
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <h4 className="font-semibold text-lg">{doctor.specialization}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">{doctor.description}</p>
                                                <div className="flex justify-center md:justify-start gap-4 mt-2 text-gray-500">
                                                    {doctor.phone && <span className="flex items-center gap-1 text-xs"><FaPhoneAlt /> {doctor.phone}</span>}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(doctor)}
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doctor._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default DoctorsTeamComponent;