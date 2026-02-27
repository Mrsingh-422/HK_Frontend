"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaTrash, FaEdit, FaTimes } from "react-icons/fa";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function ArticlesComponent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  // Extracting functions from Context
  // Note: Ensure these names match your AdminContext/GlobalContext exactly
  const { addArticle, updateArticle, deleteArticle } = useAdminContext();
  const { getArticlesContent } = useGlobalContext();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [articles, setArticles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  /* ================= FETCH ARTICLES ================= */
  const fetchArticles = async () => {
    try {
      const data = await getArticlesContent();
      if (data) {
        setArticles(data);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
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
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await deleteArticle(id);
      if (res) {
        setSuccess("Article deleted successfully!");
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete article");
    }
  };

  /* ================= EDIT (Prepare Form) ================= */
  const handleEdit = (article) => {
    setEditId(article._id);
    setFormData({
      title: article.title,
      description: article.description,
      image: null,
    });

    // Handle Multer image path
    const imageUrl = article.image?.startsWith("http")
      ? article.image
      : `${API_URL}/${article.image}`;

    setPreview(imageUrl);
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
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.image) {
        data.append("image", formData.image);
      }

      let response;
      if (editId) {
        response = await updateArticle(editId, data);
        setSuccess("Article updated successfully!");
      } else {
        response = await addArticle(data);
        setSuccess("Article added successfully!");
      }

      if (response) {
        fetchArticles();
        // Reset Form
        setFormData({ title: "", description: "", image: null });
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
    fetchArticles();
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchArticles();
    }
  }, [showModal]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">
              {editId ? "Edit Article" : "Add New Article"}
            </h2>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              View All Articles
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
              <label className="text-sm text-gray-600">Article Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter article title"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Short Description</label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter article content/description"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#08B36A]"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Article Image</label>
              <input
                type="file"
                accept="image/*"
                required={!editId}
                onChange={handleImage}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>

            {preview && (
              <div className="flex justify-center mt-2">
                <div className="relative w-64 h-40 rounded-xl overflow-hidden border">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-lg shadow-md transition text-white ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#08B36A] hover:bg-[#07a15f]"
                  }`}
              >
                {loading ? "Saving..." : editId ? "Update Article" : "Add Article"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({ title: "", description: "", image: null });
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
              <h3 className="text-xl font-semibold">Manage Articles</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {articles.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No articles found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {articles.map((article) => {
                  const imgSrc = article.image?.startsWith("http")
                    ? article.image
                    : `${API_URL}/${article.image}`;

                  return (
                    <div key={article._id} className="border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-gray-50">
                      <div className="relative w-32 h-20 flex-shrink-0">
                        <Image
                          src={imgSrc}
                          alt={article.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h4 className="font-semibold text-lg line-clamp-1">{article.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="bg-yellow-500 text-white p-2 px-4 rounded-lg hover:bg-yellow-600 transition flex items-center gap-2"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="bg-red-500 text-white p-2 px-4 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <FaTrash /> Delete
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

export default ArticlesComponent;