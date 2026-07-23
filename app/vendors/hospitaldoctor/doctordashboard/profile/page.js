'use client';
import React, { useState, useEffect, useRef } from 'react';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import {
FaUser, FaEnvelope, FaPhoneAlt, FaBriefcase, FaGraduationCap,
FaCamera, FaSpinner, FaSave, FaCheckCircle,
FaExclamationTriangle, FaRegCalendarAlt, FaStethoscope, FaSignature, FaClock
} from 'react-icons/fa';

export default function DoctorProfilePage() {
    const fileInputRef = useRef(null);
    const signatureInputRef = useRef(null); // Reference for signature file upload

    // Operational Loading States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Staged request status state
    const [stagedRequest, setStagedRequest] = useState(null);

    // Profile Data States
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        speciality: '',
        qualification: '',
        experienceYears: 0,
        dutyStatus: 'On Duty',
        country: '',
        state: '',
        city: '',
        address: '',
        about: '',
        languages: '',
        alternatePhone: '',
        fees: { online: 0, clinic: 0, home: 0 },
        consultationStatus: { online: false, clinic: false, home: false }
    });

    const [specializations, setSpecializations] = useState([]);
    const [qualificationsList, setQualificationsList] = useState([]);
    const [selectedQualifications, setSelectedQualifications] = useState([]);
    
    // Image Files and Previews States
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null); // Signature preview state
    const [signatureFile, setSignatureFile] = useState(null); // Signature file state

    // Safe URL joining helper to prevent double-slashes or missing slashes
    const getFormattedImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBaseUrl}${cleanPath}`;
    };

    // Load initial profile data on page load
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [statusRes, profileRes, specRes, qualRes] = await Promise.all([
                    HospitalDoctorAPI.getProfileUpdateStatus().catch(() => ({ success: true, data: null })),
                    HospitalDoctorAPI.getProfile(),
                    HospitalDoctorAPI.getSpecializations(),
                    HospitalDoctorAPI.getQualifications().catch(() => ({ success: true, data: [] }))
                ]);

                if (statusRes && statusRes.success) {
                    setStagedRequest(statusRes.data);
                }

                if (profileRes.success) {
                    const doc = profileRes.data;
                    
                    // Parse languages safely
                    let parsedLanguagesStr = '';
                    if (doc.languages) {
                        if (typeof doc.languages === 'string') {
                            try {
                                const parsed = JSON.parse(doc.languages);
                                parsedLanguagesStr = Array.isArray(parsed) ? parsed.join(', ') : doc.languages;
                            } catch {
                                parsedLanguagesStr = doc.languages;
                            }
                        } else if (Array.isArray(doc.languages)) {
                            parsedLanguagesStr = doc.languages.join(', ');
                        }
                    }

                    setProfile({
                        name: doc.name || '',
                        email: doc.email || '',
                        phone: doc.phone || '',
                        role: doc.role || '',
                        speciality: doc.speciality || '',
                        qualification: doc.qualification || doc.qualifcation || '', 
                        experienceYears: doc.experienceYears || 0,
                        dutyStatus: doc.dutyStatus || 'On Duty',
                        country: doc.country || '',
                        state: doc.state || '',
                        city: doc.city || '',
                        address: doc.address || '',
                        about: doc.about || '',
                        languages: parsedLanguagesStr,
                        alternatePhone: doc.alternatePhone || '',
                        fees: doc.fees || { online: 0, clinic: 0, home: 0 },
                        consultationStatus: doc.consultationStatus || { online: false, clinic: false, home: false }
                    });

                    // Parse qualifications list safely
                    const rawQualifications = doc.qualification || doc.qualifcation || '';
                    const parsedQualifications = rawQualifications 
                        ? rawQualifications.split(',').map(q => q.trim()).filter(Boolean) 
                        : [];
                    setSelectedQualifications(parsedQualifications);

                    // Formats avatar preview URL smoothly
                    const imagePath = doc.profileImage || doc.profleImage;
                    if (imagePath) {
                        setAvatarPreview(getFormattedImageUrl(imagePath));
                    }

                    // Formats digital signature preview URL smoothly
                    const signatureImagePath = doc.signatureImage;
                    if (signatureImagePath) {
                        setSignaturePreview(getFormattedImageUrl(signatureImagePath));
                    }
                }

                if (specRes.success) {
                    setSpecializations(specRes.data || []);
                }

                if (qualRes.success) {
                    setQualificationsList(qualRes.data || []);
                }
            } catch (err) {
                setError(err.toString() || "Failed to sync clinical profile settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSignatureFile(file);
            setSignaturePreview(URL.createObjectURL(file));
        }
    };

    const handleToggleQualification = (qualName) => {
        setSelectedQualifications(prev => {
            if (prev.includes(qualName)) {
                return prev.filter(q => q !== qualName);
            } else {
                return [...prev, qualName];
            }
        });
    };

    const handleDutyStatusChange = async (e) => {
        const nextStatus = e.target.value;
        try {
            setSaving(true);
            const response = await HospitalDoctorAPI.toggleDutyStatus(nextStatus);
            if (response.success) {
                setProfile(prev => ({ ...prev, dutyStatus: nextStatus }));
                triggerAlert("Duty status updated successfully.");
            }
        } catch (err) {
            alert(err.toString() || "Failed to toggle duty schedule.");
        } finally {
            setSaving(false);
        }
    };

    const triggerAlert = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 4000);
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            const formData = new FormData();
            if (avatarFile) {
                formData.append('profileImage', avatarFile); 
            }
            if (signatureFile) {
                formData.append('signatureImage', signatureFile); // Append digital signature file
            }
            
            formData.append('name', profile.name);
            formData.append('speciality', profile.speciality);
            
            const compiledQualifications = selectedQualifications.join(', ');
            formData.append('qualification', compiledQualifications);
            
            formData.append('experienceYears', profile.experienceYears);
            formData.append('country', profile.country);
            formData.append('state', profile.state);
            formData.append('city', profile.city);
            formData.append('address', profile.address);
            formData.append('about', profile.about);
            formData.append('alternatePhone', profile.alternatePhone);

            // Handle languages string formatting to a JSON list
            const languagesArray = profile.languages
                ? profile.languages.split(',').map(lang => lang.trim()).filter(Boolean)
                : [];
            formData.append('languages', JSON.stringify(languagesArray));

            formData.append('fees', JSON.stringify(profile.fees));
            formData.append('consultationStatus', JSON.stringify(profile.consultationStatus));

            const response = await HospitalDoctorAPI.updateProfile(formData);
            if (response.success) {
                triggerAlert(response.message || "Your profile changes have been submitted to Admin for review!");
                setStagedRequest(response.data);
                // Clear state file variables
                setAvatarFile(null);
                setSignatureFile(null);
            }
        } catch (err) {
            setError(err.toString() || "An error occurred while compiling updates.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <FaSpinner className="text-4xl text-emerald-500 animate-spin" />
                <p className="text-slate-400 text-sm mt-3 font-semibold">Synchronizing roster profile...</p>
            </div>
        );
    }

    const availableQualifications = qualificationsList.length > 0 
        ? qualificationsList 
        : ['MBBS', 'MD Cardiology', 'MS General Surgery', 'DM Neurologist'];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-slate-50/30 rounded-3xl space-y-6">
            
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Profile Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure your online presence, qualifications, and active shift availability</p>
                </div>
            </div>

            {/* Pending Staged Profile Update Banner */}
            {stagedRequest && stagedRequest.status === 'Pending' && (
                <div className="p-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
                    <FaClock className="text-amber-500 mt-1 flex-shrink-0 animate-pulse" size={20} />
                    <div>
                        <h4 className="font-bold text-sm">Modifications Pending Verification</h4>
                        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                            Your updated profile details submitted on {new Date(stagedRequest.createdAt).toLocaleDateString()} are awaiting admin review. 
                            Your current active values will remain visible to clients and colleagues until approved.
                        </p>
                    </div>
                </div>
            )}

            {/* Rejected Staged Profile Update Banner */}
            {stagedRequest && stagedRequest.status === 'Rejected' && (
                <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
                    <FaExclamationTriangle className="text-rose-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-sm">Modifications Rejected</h4>
                        <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                            Your recent profile modification request was rejected. <strong className="text-rose-950">Reason:</strong> {stagedRequest.rejectionReason || "No details provided."}
                        </p>
                        <p className="text-xs text-rose-600 mt-1 font-semibold">
                            Please adjust your values below and re-submit for approval.
                        </p>
                    </div>
                </div>
            )}

            {/* Notification Elements */}
            {error && (
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-800 text-sm flex items-start gap-3 shadow-sm">
                    <FaExclamationTriangle className="text-lg text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl text-emerald-800 text-sm flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top duration-300">
                    <FaCheckCircle className="text-lg text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: Visual Summary & Signature Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                        
                        {/* Status Stripe Background decoration */}
                        <div className={`absolute top-0 inset-x-0 h-2.5 ${
                            profile.dutyStatus === 'On Duty' ? 'bg-emerald-500' :
                            profile.dutyStatus === 'Busy' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />

                        {/* Interactive Avatar Container */}
                        <div 
                            className="relative group cursor-pointer mt-4" 
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current.click();
                            }}
                        >
                            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Doctor profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaUser className="text-5xl text-slate-300" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <FaCamera className="text-white text-xl" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onClick={(e) => e.stopPropagation()} 
                                onChange={handleAvatarChange} 
                            />
                        </div>

                        {/* Summary Texts */}
                        <h3 className="text-2xl font-black text-slate-800 mt-5 leading-snug">{profile.name || "Dr. Unnamed"}</h3>
                        <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-1.5 flex items-center gap-1.5 justify-center">
                            <FaStethoscope className="text-emerald-500 text-sm" />
                            {profile.speciality || "Specialization Pending"}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            <span className="px-3.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-full text-xs font-bold">{selectedQualifications.slice(0, 2).join(', ') || "No Degree listed"}{selectedQualifications.length > 2 && '...'}</span>
                            <span className="px-3.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-bold">{profile.experienceYears} Yrs Experience</span>
                        </div>

                        {/* Dynamic Shift Switcher Toggler */}
                        <div className="w-full border-t border-slate-100 mt-6 pt-6 flex flex-col items-stretch text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Shift Status</label>
                            <div className="relative">
                                <select 
                                    value={profile.dutyStatus || 'On Duty'}
                                    onChange={handleDutyStatusChange}
                                    disabled={saving}
                                    className="w-full py-3.5 pl-4 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none hover:border-slate-300 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="On Duty">On Duty (Available)</option>
                                    <option value="Off Duty">Off Duty (Unavailable)</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Busy">Busy</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Interactive Signature Upload Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-stretch text-left">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FaSignature className="text-emerald-500 text-sm" /> Digital Signature
                        </h4>
                        
                        <div 
                            className="relative group cursor-pointer w-full h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex items-center justify-center overflow-hidden transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                signatureInputRef.current.click();
                            }}
                        >
                            {signaturePreview ? (
                                <img src={signaturePreview} alt="Signature preview" className="h-full object-contain p-2 mix-blend-multiply" />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-center">
                                    <FaCamera className="text-slate-300 text-lg group-hover:text-emerald-500 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">Upload PNG Signature</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <FaCamera className="text-white text-lg" />
                            </div>
                            <input 
                                type="file" 
                                ref={signatureInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onClick={(e) => e.stopPropagation()} 
                                onChange={handleSignatureChange} 
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed">Png file with a transparent background is recommended for dynamic prescription cards.</p>
                    </div>

                </div>

                {/* RIGHT COLUMN: Detailed Settings Form */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Block A: Base Details */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                            <FaUser className="text-emerald-500 text-lg" />
                            Personal & Professional Registry
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Registered Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaUser /></span>
                                    <input 
                                        type="text" 
                                        value={profile.name || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                        placeholder="Dr. Full Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Specialization Dropdown</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaBriefcase /></span>
                                    <select 
                                        value={profile.speciality || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, speciality: e.target.value }))}
                                        className="w-full py-3.5 pl-10 pr-10 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-bold text-slate-700 focus:outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                        required
                                    >
                                        <option value="">Select Specialization</option>
                                        {specializations.map((spec) => (
                                            <option key={spec._id} value={spec.name}>{spec.name}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Roster Experience (Years)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaRegCalendarAlt /></span>
                                    <input 
                                        type="number" 
                                        value={profile.experienceYears ?? 0}
                                        onChange={(e) => setProfile(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Registered Email (Read Only)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaEnvelope /></span>
                                    <input 
                                        type="email" 
                                        value={profile.email || ''}
                                        disabled
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-100 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-500 focus:outline-none opacity-80 shadow-sm cursor-not-allowed"
                                        title="Registry emails are immutable."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Contact Number (Read Only)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaPhoneAlt /></span>
                                    <input 
                                        type="text" 
                                        value={profile.phone || ''}
                                        disabled
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-100 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-500 focus:outline-none opacity-80 shadow-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Secondary Contact Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaPhoneAlt /></span>
                                    <input 
                                        type="text" 
                                        value={profile.alternatePhone || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, alternatePhone: e.target.value }))}
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                        placeholder="Alternate contact phone number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Languages Spoken (Comma Separated)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"><FaBriefcase /></span>
                                    <input 
                                        type="text" 
                                        value={profile.languages || ''}
                                        onChange={(e) => setProfile(prev => ({ ...prev, languages: e.target.value }))}
                                        className="w-full py-3.5 pl-10 pr-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                        placeholder="e.g. English, Spanish"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">
                                    Educational Degree / Qualifications (Select Multiple)
                                </label>
                                <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl min-h-[64px] shadow-sm">
                                    {availableQualifications.map((qual) => {
                                        const qualName = typeof qual === 'object' ? qual.name : qual;
                                        const isSelected = selectedQualifications.includes(qualName);
                                        return (
                                            <button
                                                key={qualName}
                                                type="button"
                                                onClick={() => handleToggleQualification(qualName)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 select-none ${
                                                    isSelected 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isSelected && <span className="text-[10px] font-sans">✓</span>}
                                                {qualName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Block B: Professional Biography */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                            <FaGraduationCap className="text-emerald-500 text-lg" />
                            Professional Biography
                        </h2>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">About Professional Summary</label>
                            <textarea 
                                value={profile.about || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                                className="w-full py-3.5 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                placeholder="Describe your experience, clinical specialties, and patient treatment methodology..."
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Block C: Location & Physical Address */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
                            <FaBriefcase className="text-emerald-500 text-lg" />
                            Location Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Country</label>
                                <input 
                                    type="text" 
                                    value={profile.country || ''}
                                    onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                                    className="w-full py-3.5 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                    placeholder="Country"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">State</label>
                                <input 
                                    type="text" 
                                    value={profile.state || ''}
                                    onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                                    className="w-full py-3.5 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">City</label>
                                <input 
                                    type="text" 
                                    value={profile.city || ''}
                                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full py-3.5 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                    placeholder="City"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Office / Residential Address</label>
                                <input 
                                    type="text" 
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full py-3.5 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 shadow-sm"
                                    placeholder="Full street address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-sm rounded-2xl tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                            {saving ? <FaSpinner className="animate-spin text-base" /> : <FaSave className="text-base" />}
                            Save Settings
                        </button>
                    </div>

                </div>

            </form>
        </div>
    );
}