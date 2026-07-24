'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaUserCircle, FaBuilding, FaEnvelope, FaPhoneAlt, 
    FaMapMarkerAlt, FaCamera, FaSave, FaSpinner, FaCheckCircle,
    FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function EditProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Store profile and update status state
    const [originalProfile, setOriginalProfile] = useState(null);
    const [pendingRequest, setPendingRequest] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        stationName: '',
        captainName: '',
        email: '',
        phone: '',
        landline: '',
        country: '',
        state: '',
        city: '',
        profileImage: null 
    });

    // Image Preview State
    const [previewImage, setPreviewImage] = useState(null);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (typeof imagePath !== 'string') return URL.createObjectURL(imagePath);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
        const cleanPath = imagePath.replace(/^public\//, '');
        if (cleanPath.startsWith('http')) return cleanPath;
        return `${backendUrl}/${cleanPath}`;
    };

    const fetchProfileAndStatus = async () => {
        try {
            const res = await FireHeadAPI.getHQProfile();
            if (res.success && res.data) {
                setOriginalProfile(res.data);
                
                setFormData({
                    stationName: res.data.stationName || '',
                    captainName: res.data.captainName || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    landline: res.data.landline || '',
                    country: res.data.country || '',
                    state: res.data.state || '',
                    city: res.data.city || '',
                    profileImage: null 
                });
                
                if (res.data.profileImage) {
                    setPreviewImage(getImageUrl(res.data.profileImage));
                }
            }

            // 2. Fetch pending request profile details
            const statusRes = await FireHeadAPI.getHQProfileUpdateStatus();
            if (statusRes.success && statusRes.data && statusRes.data.status === 'Pending') {
                setPendingRequest(statusRes.data);
            } else {
                setPendingRequest(null);
            }

        } catch (error) {
            console.error("Error fetching secure Fire HQ profile flow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileAndStatus();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'profileImage' && formData[key]) {
                    submitData.append('profileImage', formData[key]); 
                } else if (formData[key] !== null && formData[key] !== undefined && key !== 'profileImage') {
                    submitData.append(key, formData[key]); 
                }
            });

            const res = await FireHeadAPI.updateHQProfile(submitData);
            
            if (res.success) {
                alert("Profile updates submitted successfully! Awaiting Admin review.");
                await fetchProfileAndStatus();
            } else {
                alert(res.message || "Failed to submit updates.");
            }
        } catch (error) {
            console.error("Error submitting profile updates:", error);
            alert("Something went wrong while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-400">
                <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                <p className="text-sm font-bold uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-800">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your Headquarter details and personal information.</p>
            </div>

            {/* --- PENDING REQUEST BANNER --- */}
            {pendingRequest && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl flex items-start gap-3 shadow-sm mb-6">
                <FaExclamationTriangle className="text-amber-500 text-lg mt-0.5 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <h4 className="text-sm font-extrabold text-amber-900">Profile Update Pending Admin Review</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Your request submitted on <span className="font-bold">{new Date(pendingRequest.createdAt).toLocaleDateString()}</span> is waiting for Admin approval. Edit fields are frozen until review completion.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ⬅️ LEFT COLUMN: Profile Overview Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center sticky top-24">
                        
                        {/* Profile Image with Upload Button */}
                        <div className="relative mb-6 group cursor-pointer">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-green-50 flex items-center justify-center">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaBuilding className="text-4xl text-[#08B36A]/50" />
                                )}
                            </div>
                            {/* Disable Overlay Upload trigger if pending request exists */}
                            {!pendingRequest && (
                                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <FaCamera className="text-white text-2xl" />
                                    <input type="file" name="profileImage" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            )}
                        </div>

                        <h2 className="text-xl font-black text-gray-800 leading-tight">
                            {formData.captainName || 'Not Set'}
                        </h2>
                        <p className="text-sm font-bold text-[#08B36A] uppercase tracking-widest mt-1">
                            {originalProfile?.role || 'Fire HQ Admin'}
                        </p>

                        {/* Status Badge */}
                        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-bold border border-green-100">
                            <FaCheckCircle /> {originalProfile?.isActive ? 'Active Account' : 'Inactive'}
                        </div>

                        <div className="w-full border-t border-gray-100 my-6"></div>

                        {/* Quick Info Items */}
                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <FaBuilding size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HQ Name</p>
                                    <p className="text-sm font-bold text-gray-700 truncate">{formData.stationName || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <FaEnvelope size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-bold text-gray-700 truncate">{formData.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="text-sm font-bold text-gray-700 truncate">
                                        {[formData.city, formData.state].filter(Boolean).join(', ') || 'Location not set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ➡️ RIGHT COLUMN: Edit Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-gray-50">
                            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                <FaUserCircle className="text-[#08B36A]" /> Update Details
                            </h2>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            
                            {/* Section 1: Professional Details */}
                            <div>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Professional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Captain Name</label>
                                        <input type="text" name="captainName" value={formData.captainName} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Headquarter / Station Name</label>
                                        <input type="text" name="stationName" value={formData.stationName} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Contact Details */}
                            <div>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 mt-8">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly
                                            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 outline-none cursor-not-allowed" title="Email cannot be changed" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Phone Number</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Landline Number</label>
                                        <input type="text" name="landline" value={formData.landline} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Location Details */}
                            <div>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 mt-8">Location Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-gray-500 mb-2 tracking-wider">Country</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} required disabled={!!pendingRequest}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all disabled:opacity-50" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Action Buttons */}
                        <div className="p-6 md:px-8 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-4">
                            <button 
                                type="button" 
                                className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                onClick={() => window.location.reload()}
                            >
                                Discard
                            </button>
                            
                            {pendingRequest ? (
                              <button 
                                type="button"
                                disabled
                                className="px-10 py-3 bg-slate-200 text-slate-400 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"
                              >
                                <FaInfoCircle /> Waiting for Admin Review
                              </button>
                            ) : (
                              <button 
                                  type="submit" 
                                  disabled={isSaving}
                                  className="px-10 py-3 bg-[#08B36A] text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                              >
                                  {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                  {isSaving ? 'Saving Changes...' : 'Save Profile'}
                              </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
          