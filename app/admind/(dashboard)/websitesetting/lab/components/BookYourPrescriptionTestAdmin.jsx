"use client";

import React, { useState, useEffect } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function BookYourPrescriptionTestAdmin() {
  const { savePrescriptionPageData } = useAdminContext();
  const { getPrescriptionPageData } = useGlobalContext();

  const [formData, setFormData] = useState({
    miniTitle: "",
    mainTitle: "",
    bulkTitle: "",
    bulkDescription: "",
    mainDescription: "",
    badgeText: "",
    images: [],
  });

  const [previews, setPreviews] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ================= FETCH & PREFILL =================
  useEffect(() => {
    fetchPrescriptionData();
  }, []);

  const fetchPrescriptionData = async () => {
    try {
      const res = await getPrescriptionPageData();

      if (res?.success && res?.data) {
        const data = res.data;

        setHasData(true);

        setFormData({
          miniTitle: data.miniTitle || "",
          mainTitle: data.mainTitle || "",
          bulkTitle: data.bulkTitle || "",
          bulkDescription: data.bulkDescription || "",
          mainDescription: data.mainDescription || "",
          badgeText: data.badgeText || "",
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
      data.append("bulkTitle", formData.bulkTitle);
      data.append("bulkDescription", formData.bulkDescription);
      data.append("mainDescription", formData.mainDescription);
      data.append("badgeText", formData.badgeText);

      formData.images.forEach((img) => {
        data.append("images", img);
      });

      await savePrescriptionPageData(data);

      setSuccess(
        hasData
          ? "Prescription section updated successfully!"
          : "Prescription section added successfully!"
      );

      fetchPrescriptionData();
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
            Manage Prescription Test Section
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
              placeholder="Mini Title"
              required
              value={formData.miniTitle}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <input
              type="text"
              name="mainTitle"
              placeholder="Main Title"
              required
              value={formData.mainTitle}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <input
              type="text"
              name="badgeText"
              placeholder="Badge Text (Lab Name)"
              required
              value={formData.badgeText}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <input
              type="text"
              name="bulkTitle"
              placeholder="Bulk Section Title"
              required
              value={formData.bulkTitle}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <textarea
              name="mainDescription"
              placeholder="Main Description"
              rows={3}
              required
              value={formData.mainDescription}
              onChange={handleChange}
              className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <textarea
              name="bulkDescription"
              placeholder="Bulk Section Description"
              rows={3}
              required
              value={formData.bulkDescription}
              onChange={handleChange}
              className="md:col-span-2 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Carousel Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                className="w-full p-3 border rounded-lg"
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
              className={`md:col-span-2 py-3 rounded-lg text-white shadow-md font-medium transition-all ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#08B36A] hover:bg-[#079a5c]"
                }`}
            >
              {loading ? "Processing..." : "Save Prescription Section"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default BookYourPrescriptionTestAdmin;