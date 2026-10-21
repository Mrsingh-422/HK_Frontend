'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {
  FaHospital, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, 
  FaRegIdCard, FaClock, FaCheckCircle, FaExclamationTriangle, 
  FaTimes, FaGlobe, FaMap, FaBuilding, FaSpinner,
  FaFileAlt, FaEdit, FaCreditCard, FaShieldAlt, FaPlus, FaCheck
} from "react-icons/fa"
import HospitalAPI from '@/app/services/HospitalAPI';
import UserAPI from '@/app/services/UserAPI';

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

  // Available Master Insurance Companies List
  const [masterInsuranceCompanies, setMasterInsuranceCompanies] = useState([]);
  const [customInsuranceInput, setCustomInsuranceInput] = useState("");

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
    upiId: '',
    isInsuranceAccepted: false,
    acceptedInsurances: []
  });

  const fetchProfile = async () => {
    setIsFetching(true);
    try {
      // 1. Fetch profile update staging status (if implemented)
      try {
        if (HospitalAPI.getHospitalProfileUpdateStatus) {
          const statusRes = await HospitalAPI.getHospitalProfileUpdateStatus();
          if (statusRes?.success) {
            setStagedRequest(statusRes.data);
          }
        }
      } catch (err) {
        console.warn("Staged request status not found or unsupported", err);
      }

      // 2. Fetch primary active profile
      const response = await HospitalAPI.getHospitalProfile();
      if (response?.success) {
        setHospitalData(response.data.hospital);
      }

      // 3. Fetch Master Insurance list for dropdown selection
      try {
        const insRes = await UserAPI.getUserHealthInsuranses();
        const rawList = insRes?.data || [];
        // Extract unique insurance / provider names
        const names = [...new Set(rawList.map(item => item.insuranceName || item.provider).filter(Boolean))];
        setMasterInsuranceCompanies(names);
      } catch (err) {
        console.error("Failed to load master insurance companies list", err);
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
      upiId: hospitalData?.bankDetails?.upiId || '',
      isInsuranceAccepted: Boolean(hospitalData?.isInsuranceAccepted),
      acceptedInsurances: Array.isArray(hospitalData?.acceptedInsurances) ? [...hospitalData.acceptedInsurances] : []
    });
    setCustomInsuranceInput("");
    setIsEditModalOpen(true);
  };

  const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Insurance checkbox / tag toggle handler
  const handleToggleInsurance = (insuranceName) => {
    setFormData((prev) => {
      const exists = prev.acceptedInsurances.includes(insuranceName);
      return {
        ...prev,
        acceptedInsurances: exists
          ? prev.acceptedInsurances.filter((item) => item !== insuranceName)
          : [...prev.acceptedInsurances, insuranceName]
      };
    });
  };

  const handleAddCustomInsurance = () => {
    const trimmed = customInsuranceInput.trim();
    if (!trimmed) return;
    if (!formData.acceptedInsurances.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        acceptedInsurances: [...prev.acceptedInsurances, trimmed]
      }));
    }
    setCustomInsuranceInput("");
  };

  const handleRemoveInsurance = (nameToRemove) => {
    setFormData(prev => ({
      ...prev,
      acceptedInsurances: prev.acceptedInsurances.filter(item => item !== nameToRemove)
    }));
  };

  // Submit Update Profile Details
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    // JSON Payload matches the endpoint spec:
    // PUT /api/auth/hospital/profile/update
    const payload = {
      name: formData.name,
      address: formData.address,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      zipCode: formData.zipCode,
      type: formData.type,
      alternatePhone: formData.alternatePhone,
      location: {
        lat: formData.lat ? Number(formData.lat) : undefined,
        lng: formData.lng ? Number(formData.lng) : undefined
      },
      bankDetails: {
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        upiId: formData.upiId
      },
      isInsuranceAccepted: Boolean(formData.isInsuranceAccepted),
      acceptedInsurances: formData.isInsuranceAccepted ? formData.acceptedInsurances : []
    };

    try {
      const res = await HospitalAPI.updateHospitalProfile(payload);
      if (res.success) {
        alert(res.message || "Profile and Insurance acceptance updated successfully.");
        if (res.data?.status) {
          setStagedRequest(res.data);
        }
        setIsEditModalOpen(false);
        fetchProfile(); 
      } else {
        alert(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert(error?.response?.data?.message || "An error occurred while updating.");
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
  const addressParts = [hospitalData?.address, city, state, country].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : "Not Provided";

  const name = hospitalData?.name || "N/A";
  const email = hospitalData?.email || "N/A";
  const phone = hospitalData?.phone || "N/A";
  const alternatePhone = hospitalData?.alternatePhone || "Not Configured";
  const type = hospitalData?.type || "N/A";
  const status = hospitalData?.profileStatus || "Pending";
  const isInsuranceAccepted = Boolean(hospitalData?.isInsuranceAccepted);
  const acceptedInsurances = hospitalData?.acceptedInsurances || [];
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
                Your profile changes submitted on {new Date(stagedRequest.createdAt || Date.now()).toLocaleDateString()} are awaiting admin review. 
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
                Please correct your records using the &quot;Edit Profile&quot; dashboard below and re-submit.
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
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                      isInsuranceAccepted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      <FaShieldAlt size={12} /> {isInsuranceAccepted ? 'Cashless / TPA Active' : 'No Insurance Accepted'}
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

        {/* --- INSURANCE & TPA POLICY ACCEPTANCE DISPLAY --- */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isInsuranceAccepted ? 'bg-emerald-50 text-[#08B36A]' : 'bg-gray-100 text-gray-400'}`}>
                <FaShieldAlt size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Health Insurance & TPA Desk Acceptance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Defines whether your hospital supports cashless mediclaim policies and government schemes.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border ${
                isInsuranceAccepted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                {isInsuranceAccepted ? 'Accepted' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="pt-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Accepted Insurance Companies & Schemes</h4>
            {isInsuranceAccepted && acceptedInsurances.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {acceptedInsurances.map((ins, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200/80 shadow-sm"
                  >
                    <FaCheckCircle className="text-[#08B36A] text-[11px]" /> {ins}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                {isInsuranceAccepted 
                  ? "No specific insurance providers selected yet. Click 'Edit Profile' to choose accepted insurers." 
                  : "Insurance claims and cashless pre-authorizations are not currently enabled for this hospital."}
              </p>
            )}
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
              <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><FaEdit className="text-[#08B36A]"/> Edit Profile & Insurance Settings</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-8">
              
              {/* INSURANCE ACCEPTANCE SECTION */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                      <FaShieldAlt className="text-[#08B36A]" /> Accept Health Insurance / TPA
                    </h3>
                    <p className="text-xs text-gray-500">Enable this if your hospital processes cashless claims for insured patients.</p>
                  </div>
                  
                  {/* Switch Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isInsuranceAccepted} 
                      onChange={(e) => setFormData(prev => ({ ...prev, isInsuranceAccepted: e.target.checked }))} 
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08B36A]"></div>
                  </label>
                </div>

                {formData.isInsuranceAccepted && (
                  <div className="pt-4 border-t border-emerald-100/70 space-y-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Select Approved Providers & Schemes
                    </label>

                    {/* Pre-populated master list toggles */}
                    <div className="flex flex-wrap gap-2">
                      {masterInsuranceCompanies.map((nameStr, idx) => {
                        const isSelected = formData.acceptedInsurances.includes(nameStr);
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleToggleInsurance(nameStr)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {isSelected && <FaCheck size={10} />}
                            {nameStr}
                          </button>
                        );
                      })}
                    </div>

                    {/* Add Custom / Other Insurance scheme input */}
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Add Other Company / State TPA</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customInsuranceInput}
                          onChange={(e) => setCustomInsuranceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomInsurance();
                            }
                          }}
                          placeholder="e.g. RGHS, Ayushman Bharat, Reliance General"
                          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#08B36A]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomInsurance}
                          className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1"
                        >
                          <FaPlus size={10} /> Add
                        </button>
                      </div>
                    </div>

                    {/* Selected Badges Preview */}
                    {formData.acceptedInsurances.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase">Currently Selected ({formData.acceptedInsurances.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.acceptedInsurances.map((item, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-emerald-200 text-emerald-800"
                            >
                              {item}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveInsurance(item)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <FaTimes size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

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
                    <input type="text" name="upiId" value={formData.upiId} onChange={handleTextChange} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all font-medium text-gray-800" placeholder="e.g. fortishospital@upi"/>
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