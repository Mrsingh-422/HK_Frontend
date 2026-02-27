"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaTimes, FaChevronDown } from "react-icons/fa";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

function FAQComponent() {
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
    });

    // Extracting functions from Context
    // Ensure these match your actual context function names
    const { addFAQ, updateFAQ, deleteFAQ } = useAdminContext();
    const { getFAQContent } = useGlobalContext();

    const [faqs, setFaqs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null); // For the preview accordion

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    /* ================= FETCH DATA ================= */
    const fetchFAQs = async () => {
        try {
            const data = await getFAQContent();
            if (data) {
                setFaqs(data);
            }
        } catch (err) {
            console.error("Error fetching FAQs:", err);
        }
    };

    /* ================= HANDLE INPUT ================= */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this FAQ?")) return;

        try {
            const res = await deleteFAQ(id);
            if (res) {
                setSuccess("FAQ deleted successfully!");
                fetchFAQs();
            }
        } catch (err) {
            console.error(err);
            setError("Failed to delete FAQ");
        }
    };

    /* ================= EDIT (Prepare Form) ================= */
    const handleEdit = (faq) => {
        setEditId(faq._id);
        setFormData({
            question: faq.question,
            answer: faq.answer,
        });
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
            let response;
            if (editId) {
                response = await updateFAQ(editId, formData);
                setSuccess("FAQ updated successfully!");
            } else {
                response = await addFAQ(formData);
                setSuccess("FAQ added successfully!");
            }

            if (response) {
                fetchFAQs();
                // Reset Form
                setFormData({ question: "", answer: "" });
                setEditId(null);
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    /* ================= TOGGLE ACCORDION ================= */
    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchFAQs();
        }
    }, [showModal]);

    return (
        <>
            <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
                <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            {editId ? "Edit FAQ" : "Add New FAQ"}
                        </h2>

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            View All FAQs
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
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="text-sm text-gray-600">Question</label>
                            <input
                                type="text"
                                name="question"
                                required
                                value={formData.question}
                                onChange={handleChange}
                                placeholder="e.g. What are your opening hours?"
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Answer</label>
                            <textarea
                                name="answer"
                                rows={5}
                                required
                                value={formData.answer}
                                onChange={handleChange}
                                placeholder="Provide a detailed answer..."
                                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
                            />
                        </div>

                        <div className="mt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3 rounded-lg shadow-md transition text-white ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#08B36A] hover:bg-[#07a15f]"
                                    }`}
                            >
                                {loading ? "Saving..." : editId ? "Update FAQ" : "Add FAQ"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(null);
                                        setFormData({ question: "", answer: "" });
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
                            <h3 className="text-xl font-semibold">Existing FAQs</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-red-500 transition"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {faqs.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No FAQs found.</p>
                        ) : (
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={faq._id} className="border rounded-xl p-4 bg-gray-50">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="text-[#08B36A]">Q:</span> {faq.question}
                                                </h4>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <span className="font-bold text-[#08B36A]">A:</span> {faq.answer}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(faq)}
                                                    className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq._id)}
                                                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
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

export default FAQComponent;