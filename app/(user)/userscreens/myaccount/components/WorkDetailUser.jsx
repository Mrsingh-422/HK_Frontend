"use client";
import React, { useState, useEffect } from "react";
import {
    FaBriefcase, FaBuilding, FaMapMarkerAlt, FaPhoneAlt,
    FaEdit, FaTrash, FaCheck, FaTimes, FaSpinner,
    FaCity, FaMapPin, FaGlobe
} from "react-icons/fa";
import UserAPI from "@/app/services/UserAPI";

function WorkDetailUser({ work }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        companyName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        mobileNumber: ""
    });

    // Initialize/Sync form with prop data from parent
    useEffect(() => {
        if (work) {
            setFormData({
                companyName: work.companyName || "",
                address: work.address || "",
                city: work.city || "",
                state: work.state || "",
                pincode: work.pincode || "",
                mobileNumber: work.mobileNumber || ""
            });
        }
    }, [work]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // We spread formData so that companyName, address, etc., 
            // are sent at the top level of the request body
            await UserAPI.updateWorkDetailsUser({ ...formData });
            
            alert("Work details updated successfully!");
            setIsEditing(false);
            
            // Reload to sync the new data with the UserContext/Parent component
            window.location.reload(); 
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update work details. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to clear your work details?")) {
            setIsSaving(true);
            try {
                const clearedData = {
                    companyName: "",
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                    mobileNumber: ""
                };
                await UserAPI.updateWorkDetailsUser(clearedData);
                alert("Work details cleared.");
                window.location.reload();
            } catch (error) {
                console.error("Clear failed:", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <section className="mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Work Details <FaBriefcase className="text-[#08b36a]" />
                </h1>
                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-[#08b36a] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#256f47] transition-all"
                            >
                                <FaEdit /> Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                            >
                                <FaTrash />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Banner */}
                <div className="h-16 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center px-10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Professional Information
                    </p>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Company Name */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaBuilding /></span> Company Name
                        </label>
                        {isEditing ? (
                            <input
                                name="companyName"
                                type="text"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="Omninos Solutions"
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm">{work?.companyName || "—"}</p>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaPhoneAlt /></span> Business Contact
                        </label>
                        {isEditing ? (
                            <input
                                name="mobileNumber"
                                type="tel"
                                value={formData.mobileNumber}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="91XXXXXXXX"
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm">{work?.mobileNumber || "—"}</p>
                        )}
                    </div>

                    {/* Full Address */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaMapMarkerAlt /></span> Office Address
                        </label>
                        {isEditing ? (
                            <input
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="Street, Area..."
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm truncate">{work?.address || "—"}</p>
                        )}
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaCity /></span> City
                        </label>
                        {isEditing ? (
                            <input
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="Mohali"
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm">{work?.city || "—"}</p>
                        )}
                    </div>

                    {/* State */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaGlobe /></span> State
                        </label>
                        {isEditing ? (
                            <input
                                name="state"
                                type="text"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="Punjab"
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm">{work?.state || "—"}</p>
                        )}
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="text-[#08b36a]"><FaMapPin /></span> Pincode
                        </label>
                        {isEditing ? (
                            <input
                                name="pincode"
                                type="text"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-[#08b36a]"
                                placeholder="160055"
                            />
                        ) : (
                            <p className="text-gray-800 font-bold text-sm">{work?.pincode || "—"}</p>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="px-10 pb-10 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 bg-[#08b36a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#256f47] transition-all"
                        >
                            {isSaving ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Work Details
                        </button>
                        <button
                            onClick={() => { 
                                setIsEditing(false); 
                                // Reset form data to the original prop value if cancelled
                                setFormData({
                                    companyName: work.companyName || "",
                                    address: work.address || "",
                                    city: work.city || "",
                                    state: work.state || "",
                                    pincode: work.pincode || "",
                                    mobileNumber: work.mobileNumber || ""
                                });
                            }}
                            className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default WorkDetailUser;