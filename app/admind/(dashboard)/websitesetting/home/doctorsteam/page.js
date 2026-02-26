"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../../components/topNavbar/DashboardTopNavbar";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaPhoneAlt } from "react-icons/fa";

function Page() {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    description: "",
    facebook: "",
    twitter: "",
    phone: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("specialization", formData.specialization);
      data.append("description", formData.description);
      data.append("facebook", formData.facebook);
      data.append("twitter", formData.twitter);
      data.append("phone", formData.phone);
      data.append("image", formData.image);

      // 🔥 Replace with your backend API call
      console.log("Submitting Doctor:", formData);

      setSuccess("Doctor added successfully!");

      setFormData({
        name: "",
        specialization: "",
        description: "",
        facebook: "",
        twitter: "",
        phone: "",
        image: null,
      });

      setPreview(null);
    } catch (err) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardTopNavbar />

      <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Add Doctor
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

            {/* Doctor Name */}
            <div>
              <label className="text-sm text-gray-600">Doctor Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter doctor name"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Specialization */}
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

            {/* Description */}
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

            {/* Facebook */}
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

            {/* Twitter */}
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

            {/* Phone */}
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

            {/* Image Upload */}
            <div>
              <label className="text-sm text-gray-600">Doctor Image</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImage}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="md:col-span-2 mt-4 flex justify-center">
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

            {/* Submit */}
            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg shadow-md transition text-white ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#08B36A] hover:bg-[#08b369d6]"
                  }`}
              >
                {loading ? "Saving..." : "Add Doctor"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default Page;