'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaHospital, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, 
  FaRegIdCard, FaClock, FaCheckCircle, FaExclamationTriangle, 
  FaTimes, FaGlobe, FaMap, FaBuilding, FaSpinner,
  FaFileAlt, FaEdit, FaCreditCard
} from "react-icons/fa"
import HospitalAPI from '@/app/services/HospitalAPI';

export default function HospitalProfilePage() {
  const { loading: authLoading } = useAuth();
  const [hospitalData, setHospitalData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  
  // Modals & Interactivity States
  const [zoomedImage, setZoomedImage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Staged request status state
  const [stagedRequest, setStagedRequest] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '', 
    address: '', 
    country: '',
    state: '', 
    city: '',
    zipCode: '',
    type: 'Private',
    alternatePhone: '',
    lat: '',
    lng: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      // 1. Fetch profile update staging status
      const statusRes = await HospitalAPI.getHospitalProfileUpdateStatus();
      if (statusRes && statusRes.success) {
        setStagedRequest(statusRes.data);
      }

      // 2. Fetch primary active profile
      const response = await HospitalAPI.getHospitalProfile();
      if (response.success) {
        setHospitalData(response.data.hospital);
      }
    } catch (error) {
      console.error("Error fetching hospital profile", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Modal Open Handler (populating text fields)
  const openEditModal = () => {
    setFormData({
      name: hospitalData?.name || '',
      address: hospitalData?.address || '',
      country: hospitalData?.country || '',
      state: hospitalData?.state || '',
      city: hospitalData?.city || '',
      zipCode: hospitalData?.zipCode || '',
      type: hospitalData?.type || 'Private',
      alternatePhone: hospitalData?.alternatePhone || '',
      lat: hospitalData?.location?.lat || '',
      lng: hospitalData?.location?.lng || '',
      bankName: hospitalData?.bankDetails?.bankName || '',
      accountHolderName: hospitalData?.bankDetails?.accountHolderName || '',
      accountNumber: hospitalData?.bankDetails?.accountNumber || '',
      ifscCode: hospitalData?.bankDetails?.ifscCode || '',
      upiId: hospitalData?.bankDetails?.upiId || ''
    });
    setIsEditModalOpen(true);
  };

  const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Submit Update Profile Details Only (Excluded registration documents)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('address', formData.address);
    dataToSend.append('country', formData.country);
    dataToSend.append('state', formData.state);
    dataToSend.append('city', formData.city);
    dataToSend.append('zipCode', formData.zipCode);
    dataToSend.append('type', formData.type);
    dataToSend.append('alternatePhone', formData.alternatePhone);
    
    // Append coordinates map using backend bracket notation
    if (formData.lat) dataToSend.append('location[lat]', String(formData.lat));
    if (formData.lng) dataToSend.append('location[lng]', String(formData.lng));

    // Append nested bankDetails credentials
    dataToSend.append('bankDetails[bankName]', formData.bankName);
    dataToSend.append('bankDetails[accountHolderName]', formData.accountHolderName);
    dataToSend.append('bankDetails[accountNumber]', formData.accountNumber);
    dataToSend.append('bankDetails[ifscCode]', formData.ifscCode);
    dataToSend.append('bankDetails[upiId]', formData.upiId);

    try {
      const res = await HospitalAPI.updateHospitalProfile(dataToSend);
      if (res.success) {
        alert(res.message || "Profile updates submitted to Admin for review. Your profile will update once approved.");
        // Store newly created staging record inside local state
        setStagedRequest(res.data);
        setIsEditModalOpen(false);
        fetchProfile(); 
      } else {
        alert(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert("An error occurred while updating.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (zoomedImage || isEditModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; }
  }, [zoomedImage, isEditModalOpen]);

  if (authLoading || isFetching) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
    </div>
  );

  // --- Data Extraction & Formatting ---
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "";
  const profileImage = hospitalData?.hospitalImage?.[0] ? `${backendUrl}${hospitalData.hospitalImage[0]}` : null;
  const licenseImage = hospitalData?.licenseDocument?.[0] ? `${backendUrl}${hospitalData.licenseDocument[0]}` : null;
  const otherDocs = hospitalData?.otherDocuments || [];
  
  const city = hospitalData?.city || "";
  const state = hospitalData?.state || "";
  const country = hospitalData?.country || "";
  const addressParts = [city, state, country].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "Not Provided";

  const name = hospitalData?.name || "N/A";
  const email = hospitalData?.email || "N/A";
  const phone = hospitalData?.phone || "N/A";
  const alternatePhone = hospitalData?.alternatePhone || "Not Configured";
  const type = hospitalData?.type || "N/A";
  const status = hospitalData?.profileStatus || "Pending";
  const joinedDate = hospitalData?.createdAt 
    ? new Date(hospitalData.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "N/A";

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* --- STAGED PROFILE UPDATE BANNERS --- */}
        {stagedRequest && stagedRequest.status === 'Pending' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
            <FaClock className="text-amber-500 mt-1 flex-shrink-0 animate-pulse" size={20} />
            <div>
              <h4 className="font-bold text-sm">Modifications Pending Verification</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Your profile changes submitted on {new Date(stagedRequest.createdAt).toLocaleDateString()} are awaiting admin review. 
                Your active public page details will remain visible as they are until the request has been verified and approved.
              </p>
            </div>
          </div>
        )}

        {stagedRequest && stagedRequest.status === 'Rejected' && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
            <FaExclamationTriangle className="text-rose-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-bold text-sm">Modifications Rejected</h4>
              <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                Your recent profile modification request was rejected. <strong className="text-rose-950">Reason:</strong> {stagedRequest.rejectionReason || "No details provided."}
              </p>
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                Please correct your records using the "Edit Profile" dashboard below and re-submit.
              </p>
            </div>
          </div>
        )}
        
        {/* --- HERO HEADER SECTION --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="h-36 bg-gradient-to-r from-[#08B36A] via-emerald-500 to-teal-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          </div>
          
          <div className="px-6 sm:px-10 pb-8">
            <div className="relative flex flex-col sm:flex-row sm:items-end -mt-16 gap-6 justify-between">
              
              <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
                {/* Profile Avatar */}
                <div 
                  className={`w-32 h-32 rounded-[1.5rem] bg-white p-1.5 shadow-lg shrink-0 relative group ${profileImage ? 'cursor-pointer' : ''}`}
                  onClick={() => profileImage && setZoomedImage(profileImage)}
                >
                  <div className="w-full h-full rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Hospital Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <FaHospital className="text-gray-300 text-6xl" />
                    )}
                  </div>
                </div>

                {/* Name & Badges */}
                <div className="space-y-2 pb-1">
                  <h1 className="text-3xl font-extrabold text-gray-800 capitalize tracking-tight">{name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                      status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {status === 'Approved' ? <FaCheckCircle size={14} /> : <FaExclamationTriangle size={14} />}
                      {status}
                    </span>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 flex items-center gap-1.5 shadow-sm">
                      <FaBuilding size={12} /> {type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button 
                onClick={openEditModal}
                className="bg-white border-2 border-gray-100 text-gray-700 px-6 py-2.5 rounded-2xl font-bold hover:border-[#08B36A] hover:text-[#08B36A] hover:shadow-lg hover:shadow-green-500/10 transition-all flex items-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* --- INFO GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Contact & Location */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col gap-8">
            
            {/* Contact Section */}
            <div>
              <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                <FaPhoneAlt className="text-[#08B36A]" /> Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email (Read-Only)</p>
                  <p className="text-sm font-semibold text-gray-800 truncate" title={email}>{email}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone (Read-Only)</p>
                  <p className="text-sm font-semibold text-gray-800">{phone}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alternate Phone</p>
                  <p className="text-sm font-semibold text-gray-800">{alternatePhone}</p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

            {/* Location Section */}
            <div>
              <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#08B36A]" /> Location Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Address</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{fullAddress}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm"><FaBuilding size={12}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">City</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{city || "N/A"}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm"><FaMap size={12}/></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">State</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{state || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Account & Documents */}
          <div className="flex flex-col gap-6">
            
            {/* System Info */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center gap-2">
                <FaClock className="text-[#08B36A]" /> Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100/50">
                  <p className="text-[11px] font-bold text-green-600/70 uppercase tracking-wider mb-1">Date Joined</p>
                  <p className="text-sm font-bold text-green-900">{joinedDate}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</p>
                  <p className="text-sm font-bold text-gray-800 capitalize">{hospitalData?.role || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Documents Grid (Strictly Read-Only) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex-1 font-sans">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <FaRegIdCard className="text-[#08B36A]" /> Verification Records
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                  Read-Only
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* License Document */}
                <div 
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 ${licenseImage ? 'border-transparent cursor-pointer shadow-md' : 'border-dashed border-gray-200 bg-gray-50'}`}
                  onClick={() => licenseImage && setZoomedImage(licenseImage)}
                >
                  {licenseImage ? (
                    <>
                      <img src={licenseImage} alt="License" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5"><FaRegIdCard/> License</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <FaRegIdCard size={24} className="mb-2 opacity-50" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">No License Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Map Any Other Documents from API */}
                {otherDocs.length > 0 && otherDocs.map((doc, idx) => {
                  const docUrl = `${backendUrl}${doc}`;
                  return (
                    <div 
                      key={idx}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent cursor-pointer shadow-md"
                      onClick={() => setZoomedImage(docUrl)}
                    >
                      <img src={docUrl} alt={`Doc ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                        <span className="text-white text-xs font-bold flex items-center gap-1.5"><FaFileAlt/> Other Doc</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col relative">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between z-10 rounded-t-3xl">
              <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><FaEdit className="text-[#08B36A]"/> Edit Profile & Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-8">
              {/* Profile Text Fields */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <FaBuilding className="text-[#08B36A]" /> Hospital details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hospital Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Enter name"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Address</label>
                    <input type="text" name="address" required value={formData.address} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Enter address"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                    <input type="text" name="country" required value={formData.country} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Country"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                    <input type="text" name="state" required value={formData.state} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="State"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="City"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Postal / Zip Code</label>
                    <input type="text" name="zipCode" required value={formData.zipCode} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="ZIP Code"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hospital Type</label>
                    <select name="type" value={formData.type} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-bold text-gray-700 bg-white cursor-pointer">
                      <option value="Private">Private</option>
                      <option value="Govt">Govt</option>
                      <option value="Charity">Charity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alternate Phone</label>
                    <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Secondary Phone"/>
                  </div>
                </div>
              </div>

              {/* Coordinates Block */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-[#08B36A]"/> Geolocation Coordinates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Latitude</label>
                    <input type="number" step="any" name="lat" value={formData.lat} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Latitude"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Longitude</label>
                    <input type="number" step="any" name="lng" value={formData.lng} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Longitude"/>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <FaCreditCard className="text-[#08B36A]"/> Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="e.g. HDFC Bank"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                    <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Holder Name"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number</label>
                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="Account Number"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="IFSC routing code"/>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">UPI ID</label>
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="e.g. cityhospital@upi"/>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating} className="px-6 py-3 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="px-8 py-3 rounded-2xl font-bold text-white bg-[#08B36A] hover:bg-emerald-600 transition shadow-lg shadow-green-500/30 flex items-center gap-2">
                  {isUpdating ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ZOOMED IMAGE MODAL --- */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setZoomedImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors" onClick={() => setZoomedImage(null)}>
            <FaTimes size={24} />
          </button>
          <img src={zoomedImage} alt="Zoomed Fullscreen" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}