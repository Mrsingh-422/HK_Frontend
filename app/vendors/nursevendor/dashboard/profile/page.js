"use client";

import React, { useState, useEffect } from 'react';
import NurseAPI from '@/app/services/NurseAPI';
import { 
    Camera, Mail, Phone, MapPin, Briefcase, Save, Loader2, 
    FileText, CheckCircle, Info, Globe, Navigation, CreditCard,
    Clock, AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast'; 
import { useUserContext } from '@/app/context/UserContext'; 

const ProfilePage = () => {
    // Gracefully handle undefined context if the provider is missing
    const userContext = useUserContext() || {};
    const { getAllCountries, getStatesByCountry, getCitiesByState } = userContext;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Dropdown Data
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Staged request status state
    const [stagedRequest, setStagedRequest] = useState(null);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',          // Read-only on UI
        phone: '',          // Read-only on UI
        alternatePhone: '', // Updatable
        password: '',       // Updatable (optional)
        gender: '',
        experienceYears: '',
        speciality: '',
        about: '',
        address: '',
        city: '',    
        state: '',   
        country: '', 
        lat: '',            // Read-only coordinates
        lng: '',            // Read-only coordinates
        profileStatus: '',
        
        // Bank details fields
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        accountType: 'Savings',
        isVerifiedBank: false
    });

    // Read-only previews/documents loaded from GET
    const [previews, setPreviews] = useState({
        profile: null,
        nursingCertificates: [],
        licensePhotos: [],
        gstCertificates: [],
        experienceCertificates: [],
        otherCertificates: []
    });

    // Handle profile image file separate state
    const [profileImageFile, setProfileImageFile] = useState(null);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${BACKEND_URL}/${cleanPath}`;
    };

    const getDocSrc = (doc) => {
        if (!doc) return "";
        if (typeof doc === 'string') return doc;
        return doc.path || doc.url || "";
    };

    const findIdByName = (list, name) => {
        if (!list || !Array.isArray(list)) return name;
        const item = list.find(i => i.name === name || i.id === name || i._id === name);
        return item ? (item.id || item._id) : name;
    };

    const getSelectedName = (list, idOrName) => {
        if (!list || !Array.isArray(list)) return idOrName;
        const found = list.find(item => item.id === idOrName || item._id === idOrName || item.name === idOrName);
        return found ? found.name : idOrName;
    };

    const fetchProfile = async () => {
        try {
            // 1. Fetch profile update staging status
            try {
                const statusRes = await NurseAPI.getNurseProfileUpdateStatus();
                if (statusRes && statusRes.success) {
                    setStagedRequest(statusRes.data);
                }
            } catch (err) {
                console.error("Failed loading profile update status:", err);
            }

            // 2. Fetch the nurse profile
            const res = await NurseAPI.getNurseProfile();
            if (res.success) {
                const d = res.data;
                
                setProfile({
                    name: d.name || '',
                    email: d.email || '',
                    phone: d.phone || '',
                    alternatePhone: d.alternatePhone || '',
                    password: '', 
                    gender: d.gender || '',
                    experienceYears: d.experienceYears || '',
                    speciality: d.speciality || '',
                    about: d.about || '',
                    address: d.address || '',
                    city: d.city || '',
                    state: d.state || '',
                    country: d.country || '',
                    lat: d.location?.lat || '',
                    lng: d.location?.lng || '',
                    profileStatus: d.profileStatus || '',
                    
                    bankName: d.bankDetails?.bankName || '',
                    accountHolderName: d.bankDetails?.accountHolderName || '',
                    accountNumber: d.bankDetails?.accountNumber || '',
                    ifscCode: d.bankDetails?.ifscCode || '',
                    upiId: d.bankDetails?.upiId || '',
                    accountType: d.bankDetails?.accountType || 'Savings',
                    isVerifiedBank: d.bankDetails?.isVerified || false
                });

                setPreviews({
                    profile: d.profileImage || null,
                    nursingCertificates: d.documents?.nursingCertificates || [],
                    licensePhotos: d.documents?.licensePhotos || [],
                    gstCertificates: d.documents?.gstCertificates || [],
                    experienceCertificates: d.documents?.experienceCertificates || [],
                    otherCertificates: d.documents?.otherCertificates || []
                });

                // Isolate geography fetch in its own try/catch to avoid crashing profile display
                let countryList = [];
                try {
                    if (getAllCountries) {
                        countryList = await getAllCountries();
                    }
                } catch (countryError) {
                    console.warn("Geography dropdown context failed. Falling back to text input inputs:", countryError);
                }
                setCountries(countryList || []);

                if (d.country && countryList.length > 0) {
                    const cId = findIdByName(countryList, d.country);
                    if (cId) {
                        let stateList = [];
                        try {
                            if (getStatesByCountry) {
                                stateList = await getStatesByCountry(cId);
                            }
                        } catch (stateError) {
                            console.warn("Failed to retrieve state list options:", stateError);
                        }
                        setStates(stateList || []);
                        
                        const sId = findIdByName(stateList, d.state);
                        if (sId && stateList.length > 0) {
                            let cityList = [];
                            try {
                                if (getCitiesByState) {
                                    cityList = await getCitiesByState(sId);
                                }
                            } catch (cityError) {
                                console.warn("Failed to retrieve city list options:", cityError);
                            }
                            setCities(cityList || []);
                            
                            const cityId = findIdByName(cityList, d.city);
                            
                            setProfile(prev => ({
                                ...prev,
                                country: cId,
                                state: sId,
                                city: cityId || d.city
                            }));
                        } else {
                            setProfile(prev => ({ ...prev, country: cId }));
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Critical error in fetchProfile sequence:", error);
            toast.error("Failed to load profile data");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        if (name === "country") {
            setProfile(prev => ({ ...prev, country: value, state: '', city: '' }));
            setStates([]); 
            setCities([]);
            if (value && getStatesByCountry) {
                try {
                    const data = await getStatesByCountry(value);
                    setStates(data || []);
                } catch (err) {
                    console.warn("Failed loading states for selected country:", err);
                }
            }
        } else if (name === "state") {
            setProfile(prev => ({ ...prev, state: value, city: '' }));
            setCities([]);
            if (value && getCitiesByState) {
                try {
                    const data = await getCitiesByState(value);
                    setCities(data || []);
                } catch (err) {
                    console.warn("Failed loading cities for selected state:", err);
                }
            }
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Resolve selected dropdown IDs or handle text inputs if dropdowns failed to load
            const countryName = countries.length > 0 ? getSelectedName(countries, profile.country) : profile.country;
            const stateName = states.length > 0 ? getSelectedName(states, profile.state) : profile.state;
            const cityName = cities.length > 0 ? getSelectedName(cities, profile.city) : profile.city;

            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }
            
            // 1. Core Profile Details
            formData.append('name', profile.name);
            formData.append('alternatePhone', profile.alternatePhone);
            formData.append('gender', profile.gender);
            formData.append('experienceYears', profile.experienceYears);
            formData.append('speciality', profile.speciality);
            formData.append('about', profile.about);
            formData.append('address', profile.address);
            formData.append('city', cityName);
            formData.append('state', stateName);
            formData.append('country', countryName);

            // 2. Password updates (if handled on backend, otherwise backend strips it per staged routing policy)
            if (profile.password && profile.password.trim() !== '') {
                formData.append('password', profile.password);
            }

            // 3. Geolocation coordinates
            if (profile.lat) {
                formData.append('location[lat]', profile.lat);
            }
            if (profile.lng) {
                formData.append('location[lng]', profile.lng);
            }

            // 4. Bank Information fields
            formData.append('bankDetails[bankName]', profile.bankName);
            formData.append('bankDetails[accountHolderName]', profile.accountHolderName);
            formData.append('bankDetails[accountNumber]', profile.accountNumber);
            formData.append('bankDetails[ifscCode]', profile.ifscCode);
            formData.append('bankDetails[upiId]', profile.upiId);
            formData.append('bankDetails[accountType]', profile.accountType);

            const res = await NurseAPI.updateNurseProfile(formData);
            if (res.success) {
                toast.success(res.message || "Profile updates submitted to Admin for review.");
                // Update staging request tracking hook
                setStagedRequest(res.data);
                setProfileImageFile(null);
            } else {
                toast.error(res.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error("Error submitting updated details:", error);
            toast.error("Error updating profile");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-[#08B36A] w-12 h-12" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Pending Staged Profile Update Banner */}
                {stagedRequest && stagedRequest.status === 'Pending' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                        <Clock className="text-amber-500 mt-1 flex-shrink-0 animate-pulse" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Modification Request Pending Review</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                An update to this profile was submitted on {new Date(stagedRequest.createdAt).toLocaleDateString()}. 
                                Your current verified details will remain unchanged in public listings until an administrator reviews and approves this request.
                            </p>
                        </div>
                    </div>
                )}

                {/* Rejected Staged Profile Update Banner */}
                {stagedRequest && stagedRequest.status === 'Rejected' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                        <AlertTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Update Proposal Rejected</h4>
                            <p className="text-xs text-red-700 mt-1">
                                Your modification request was not approved. <strong className="text-red-900">Reason:</strong> {stagedRequest.rejectionReason || "No details provided."}
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-semibold">
                                Please correct the details below and resubmit.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Header Section */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50">
                                <img 
                                    src={formatImagePath(previews.profile) || "https://via.placeholder.com/150"} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <label className="absolute -bottom-2 -right-2 bg-[#08B36A] p-2.5 rounded-2xl text-white cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                                <Camera size={18} />
                                <input type="file" hidden onChange={handleProfileImageChange} accept="image/*" />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{profile.name || "Nurse Provider"}</h1>
                                <span className="bg-green-50 text-[#08B36A] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 w-fit self-center">
                                    {profile.profileStatus || "Pending"}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-sm mt-1">ID: {profile.email} • {profile.experienceYears || 0} Years Experience</p>
                        </div>
                        <button type="submit" disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#08B36A] text-white font-black rounded-[1.25rem] hover:bg-[#069c5c] transition-all shadow-xl shadow-green-100 uppercase tracking-widest text-xs">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="bg-[#1e3a8a] rounded-[2rem] p-6 text-white shadow-xl border-l-[12px] border-[#08B36A] flex flex-wrap gap-4 justify-between">
                        <StatBox label="Role" value="Professional Nurse" icon={<Briefcase size={14}/>} />
                        <StatBox label="Region" value={profile.city ? `${getSelectedName(cities, profile.city)}, ${getSelectedName(states, profile.state)}` : 'Not Set'} icon={<Globe size={14}/>} />
                        <StatBox label="Rating" value="5.0 New" icon={<CheckCircle size={14}/>} />
                        <StatBox label="Status" value="Active" icon={<Info size={14}/>} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Personal Info */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-8 flex items-center gap-3 uppercase tracking-wider">
                                    <Info className="text-[#08B36A]" size={20} /> Personal Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="Full Name" name="name" value={profile.name} onChange={handleInputChange} />
                                    <FormInput label="Email Address (Read Only)" name="email" value={profile.email} readOnly className="bg-gray-100 cursor-not-allowed opacity-75" />
                                    <FormInput label="Phone Number (Read Only)" name="phone" value={profile.phone} readOnly className="bg-gray-100 cursor-not-allowed opacity-75" />
                                    <FormInput label="Alternate Phone" name="alternatePhone" value={profile.alternatePhone} onChange={handleInputChange} placeholder="e.g. +919999888877" />
                                    <FormInput label="New Password (Optional)" name="password" type="password" value={profile.password} onChange={handleInputChange} placeholder="Leave blank to preserve current" />
                                    
                                    <FormSelect 
                                        label="Gender" 
                                        name="gender" 
                                        value={profile.gender} 
                                        options={[
                                            { id: 'Male', name: 'Male' }, 
                                            { id: 'Female', name: 'Female' }, 
                                            { id: 'Other', name: 'Other' }
                                        ]} 
                                        onChange={handleInputChange} 
                                    />
                                    
                                    <FormSelect 
                                        label="Speciality" 
                                        name="speciality" 
                                        value={profile.speciality} 
                                        options={[
                                            { id: 'Home Care Nurse', name: 'Home Care Nurse' },
                                            { id: 'Cancer Care Nurse', name: 'Cancer Care Nurse' },
                                            { id: 'ICU Care Nurse', name: 'ICU Care Nurse' },
                                            { id: 'Complete Care Nurse', name: 'Complete Care Nurse' }
                                        ]} 
                                        onChange={handleInputChange} 
                                    />

                                    <FormInput label="Experience Years" name="experienceYears" type="number" value={profile.experienceYears} onChange={handleInputChange} />

                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">About / Bio</label>
                                        <textarea name="about" value={profile.about} onChange={handleInputChange} rows={4} className="w-full px-6 py-4 rounded-2xl border border-gray-100 outline-none focus:border-[#08B36A] bg-gray-50 font-medium text-gray-700 placeholder:text-gray-300" placeholder="Describe your nursing experience..." />
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details Section */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-8 flex items-center gap-3 uppercase tracking-wider">
                                    <CreditCard className="text-[#08B36A]" size={20} /> Bank Credentials
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="Bank Name" name="bankName" value={profile.bankName} onChange={handleInputChange} placeholder="e.g. HDFC Bank" />
                                    <FormInput label="Account Holder Name" name="accountHolderName" value={profile.accountHolderName} onChange={handleInputChange} placeholder="e.g. Jane Doe" />
                                    <FormInput label="Account Number" name="accountNumber" value={profile.accountNumber} onChange={handleInputChange} placeholder="e.g. 5010045612345" />
                                    <FormInput label="IFSC Code" name="ifscCode" value={profile.ifscCode} onChange={handleInputChange} placeholder="e.g. HDFC0001234" />
                                    <FormInput label="UPI ID" name="upiId" value={profile.upiId} onChange={handleInputChange} placeholder="e.g. janedoe@upi" />
                                    
                                    <FormSelect 
                                        label="Account Type" 
                                        name="accountType" 
                                        value={profile.accountType} 
                                        options={[
                                            { id: 'Savings', name: 'Savings' }, 
                                            { id: 'Current', name: 'Current' }
                                        ]} 
                                        onChange={handleInputChange} 
                                    />
                                    
                                    <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${profile.isVerifiedBank ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                            {profile.isVerifiedBank ? "✓ Verified payout account" : "⚠ pending verification status"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Area (Auto-Fallbacks added) */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-8 flex items-center gap-3 uppercase tracking-wider">
                                    <Navigation className="text-[#08B36A]" size={20} /> Service Area
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {countries && countries.length > 0 ? (
                                        <FormSelect label="Country" name="country" value={profile.country} options={countries} onChange={handleInputChange} />
                                    ) : (
                                        <FormInput label="Country" name="country" value={profile.country} onChange={handleInputChange} placeholder="e.g. India" />
                                    )}

                                    {states && states.length > 0 ? (
                                        <FormSelect label="State" name="state" value={profile.state} options={states} onChange={handleInputChange} disabled={!profile.country} />
                                    ) : (
                                        <FormInput label="State" name="state" value={profile.state} onChange={handleInputChange} placeholder="e.g. Punjab" />
                                    )}

                                    {cities && cities.length > 0 ? (
                                        <FormSelect label="City" name="city" value={profile.city} options={cities} onChange={handleInputChange} disabled={!profile.state} />
                                    ) : (
                                        <FormInput label="City" name="city" value={profile.city} onChange={handleInputChange} placeholder="e.g. Ludhiana" />
                                    )}
                                    
                                    <div className="md:col-span-3">
                                        <FormInput label="Detailed Address" name="address" value={profile.address} onChange={handleInputChange} />
                                    </div>
                                    <FormInput label="Latitude (Read Only)" name="lat" value={profile.lat} readOnly className="bg-gray-100 cursor-not-allowed opacity-75" />
                                    <FormInput label="Longitude (Read Only)" name="lng" value={profile.lng} readOnly className="bg-gray-100 cursor-not-allowed opacity-75" />
                                </div>
                            </div>
                        </div>

                        {/* Document Sidebar (Read-only fetched on GET) */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-6 flex items-center gap-3 uppercase tracking-wider">
                                    <FileText className="text-[#08B36A]" size={20} /> Documents (Read-Only)
                                </h3>
                                <div className="space-y-6">
                                    <ReadOnlyFileBox label="Nursing Certificates" previews={previews.nursingCertificates} getDocSrc={getDocSrc} formatImagePath={formatImagePath} />
                                    <ReadOnlyFileBox label="License Photos" previews={previews.licensePhotos} getDocSrc={getDocSrc} formatImagePath={formatImagePath} />
                                    <ReadOnlyFileBox label="GST Certificates" previews={previews.gstCertificates} getDocSrc={getDocSrc} formatImagePath={formatImagePath} />
                                    <ReadOnlyFileBox label="Experience Certificates" previews={previews.experienceCertificates} getDocSrc={getDocSrc} formatImagePath={formatImagePath} />
                                    <ReadOnlyFileBox label="Other Certificates" previews={previews.otherCertificates} getDocSrc={getDocSrc} formatImagePath={formatImagePath} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Reusable Components
function FormInput({ label, className = "", ...props }) {
    return (
        <div className="w-full">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
            <input {...props} className={`w-full px-6 py-4 rounded-2xl border border-gray-100 outline-none focus:border-[#08B36A] bg-gray-50 font-bold text-gray-700 transition-all ${className}`} />
        </div>
    );
}

function FormSelect({ label, options = [], ...props }) {
    return (
        <div className="w-full">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
            <select {...props} className="w-full px-5 py-4 rounded-2xl border border-gray-100 outline-none focus:border-[#08B36A] bg-gray-50 font-bold text-gray-700 disabled:opacity-50 appearance-none">
                <option value="">Select {label}</option>
                {options && options.map((opt, i) => (
                    <option key={opt.id || opt._id || i} value={opt.id || opt._id || opt.name}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function StatBox({ label, value, icon }) {
    return (
        <div className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm min-w-[140px]">
            <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest flex items-center gap-1">
                {icon} {label}
            </p>
            <p className="font-bold text-sm truncate">{value || 'Not Set'}</p>
        </div>
    );
}

// Read-only visualization for uploaded items (exclusively from GET response)
function ReadOnlyFileBox({ label, previews = [], getDocSrc, formatImagePath }) {
    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
            
            {previews && previews.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                    {previews.map((src, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <img src={formatImagePath(getDocSrc(src))} alt="doc" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-xs text-gray-400 italic">No document uploaded</div>
            )}
        </div>
    );
}

export default ProfilePage;