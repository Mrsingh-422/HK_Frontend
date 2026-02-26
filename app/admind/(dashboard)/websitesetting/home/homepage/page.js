"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";

function Page() {
  const { saveHomePageContent } = useAdminContext();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    images: [],
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    setFormData({ ...formData, images: files });

    const previewUrls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);

      formData.images.forEach((image) => {
        data.append("images", image);
      });

      const response = await saveHomePageContent(data);

      if (response?.success) {
        setSuccess("Homepage content added successfully!");

        setFormData({
          title: "",
          subtitle: "",
          images: [],
        });

        setPreviews([]);
      } else {
        setError(response?.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardTopNavbar />

      <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Manage Homepage Section
          </h2>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-300">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >

            {/* Title */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              required
              value={formData.title}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
            />

            {/* Subtitle */}
            <input
              type="text"
              name="subtitle"
              placeholder="Subtitle"
              required
              value={formData.subtitle}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
            />

            {/* Image Upload */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImages}
              className="md:col-span-2 p-3 border rounded-lg"
            />

            {/* Image Preview */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 py-3 rounded-lg text-white shadow-md ${loading
                  ? "bg-gray-400"
                  : "bg-[#08B36A] hover:bg-[#079a5c]"
                }`}
            >
              {loading ? "Processing..." : "Save Homepage Section"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default Page;