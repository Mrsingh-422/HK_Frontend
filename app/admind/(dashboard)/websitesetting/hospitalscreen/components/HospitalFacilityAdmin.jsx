"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAdminContext } from "@/app/context/AdminContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { FaPlus, FaTrash } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function HospitalFacilityAdmin() {
  const { saveHospitalFacilityData } = useAdminContext();
  const { getHospitalFacilityData } = useGlobalContext();

  // Refs for file inputs
  const carouselRef = useRef(null);

  const [formData, setFormData] = useState({
    tagline: "",
    titlePart1: "",
    titlePart2: "",
    description: "",
    badgeText: "Qualified Staff",
    images: [], // File objects
    partners: [{ name: "", logo: null }],
  });

  const [previews, setPreviews] = useState([]); // For carousel
  const [partnerPreviews, setPartnerPreviews] = useState([]); // For partner logos
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ================= FETCH & PREFILL =================
  useEffect(() => {
    fetchHospitalFacilityContent();
  }, []);

  const fetchHospitalFacilityContent = async () => {
    try {
      const res = await getHospitalFacilityData();

      if (res?.success && res?.data) {
        const data = res.data;
        setHasData(true);

        setFormData({
          tagline: data.tagline || "",
          titlePart1: data.titlePart1 || "",
          titlePart2: data.titlePart2 || "",
          description: data.description || "",
          badgeText: data.badgeText || "Qualified Staff",
          images: [], // Reset local file state
          partners: data.partners || [{ name: "", logo: null }],
        });

        // Map Carousel Images with API_URL prefix
        const carouselUrls = (data.images || []).map((img) =>
          img.startsWith("http") ? img : `${API_URL}${img}`
        );
        setPreviews(carouselUrls);

        // Map Partner Logos with API_URL prefix
        const pPreviews = (data.partners || []).map((p) =>
          p.logo ? (p.logo.startsWith("http") ? p.logo : `${API_URL}${p.logo}`) : null
        );
        setPartnerPreviews(pPreviews);
      }
    } catch (err) {
      console.error("Error fetching facility data:", err);
    }
  };

  // ================= HANDLE INPUTS =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCarouselFiles = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeCarouselImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, idx) => idx !== index),
    });
    setPreviews(previews.filter((_, idx) => idx !== index));
  };

  // Partner Handlers
  const handlePartnerChange = (index, field, value) => {
    const updated = [...formData.partners];
    updated[index][field] = value;
    setFormData({ ...formData, partners: updated });
  };

  const handlePartnerLogo = (index, file) => {
    if (!file) return;
    const updated = [...formData.partners];
    updated[index].logo = file;
    setFormData({ ...formData, partners: updated });

    const previewUrl = URL.createObjectURL(file);
    const updatedPreviews = [...partnerPreviews];
    updatedPreviews[index] = previewUrl;
    setPartnerPreviews(updatedPreviews);
  };

  const addPartner = () => {
    setFormData({
      ...formData,
      partners: [...formData.partners, { name: "", logo: null }],
    });
    setPartnerPreviews([...partnerPreviews, null]);
  };

  const removePartner = (index) => {
    setFormData({
      ...formData,
      partners: formData.partners.filter((_, idx) => idx !== index),
    });
    setPartnerPreviews(partnerPreviews.filter((_, idx) => idx !== index));
  };

  // ================= SAVE (SUBMIT) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const data = new FormData();
      data.append("tagline", formData.tagline);
      data.append("titlePart1", formData.titlePart1);
      data.append("titlePart2", formData.titlePart2);
      data.append("description", formData.description);
      data.append("badgeText", formData.badgeText);

      // Process Carousel Images
      formData.images.forEach((img) => {
        data.append("images", img);
      });

      // Process Partners
      formData.partners.forEach((partner, index) => {
        data.append(`partnerNames`, partner.name);
        if (partner.logo instanceof File) {
          data.append("partnerLogos", partner.logo);
        } else if (typeof partner.logo === "string") {
          data.append(`existingPartnerLogos`, partner.logo);
          data.append(`partnerLogoStatus`, "existing");
        } else {
          data.append(`partnerLogoStatus`, "empty");
        }
      });

      await saveHospitalFacilityData(data);

      setSuccess(
        hasData
          ? "Hospital facilities updated successfully!"
          : "Hospital facilities added successfully!"
      );

      fetchHospitalFacilityContent();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
        <div className="bg-white w-full max-w-5xl rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Manage Hospital Facilities</h2>

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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Badge Text</label>
              <input
                type="text"
                name="badgeText"
                value={formData.badgeText}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Title Part 1</label>
              <input
                type="text"
                name="titlePart1"
                value={formData.titlePart1}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Title Part 2 (Green)</label>
              <input
                type="text"
                name="titlePart2"
                value={formData.titlePart2}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
              />
            </div>

            {/* Carousel Section */}
            <div className="md:col-span-2 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Carousel Images</h3>
                <input
                  type="file"
                  multiple
                  hidden
                  ref={carouselRef}
                  onChange={handleCarouselFiles}
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={() => carouselRef.current.click()}
                  className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <FaPlus /> Upload Multiple
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl border bg-gray-50 overflow-hidden group">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removeCarouselImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`md:col-span-2 py-3 rounded-lg text-white font-medium transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#08B36A] hover:bg-[#079a5c]"
              }`}
            >
              {loading ? "Processing..." : "Save Hospital Facility Content"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default HospitalFacilityAdmin;