'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaBuilding, FaMapMarkerAlt, FaFlask, FaCamera, 
    FaSave, FaClock, FaTimes, FaInfoCircle, 
    FaCheckCircle, FaPhoneAlt, FaPlus,
    FaFileContract, FaSignature, FaAward,
    FaExclamationTriangle
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import LabVendorAPI from '@/app/services/LabVendorAPI';
import { useUserContext } from '@/app/context/UserContext';

export default function LabProfile() {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Geo-Location States
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    
    // Insurance Master List State
    const [insuranceMasterList, setInsuranceMasterList] = useState([]);

    // Staged request status state
    const [stagedRequest, setStagedRequest] = useState(null);

    // Profile Details State
    const [profile, setProfile] = useState({
        name: '',
        about: '',
        country: '', 
        state: '',   
        city: '',    
        address: '',
        isHomeCollectionAvailable: 'false',
        isRapidServiceAvailable: 'false',
        isInsuranceAccepted: 'false',
        is24x7: 'false',
        lat: '',
        lng: '',
        acceptedInsurances: [], 
        alternatePhone: '',
        nablNumber: '' // Added for NABL accreditation
    });

    // Verification-only details
    const [verificationDocs, setVerificationDocs] = useState({
        gstNumber: '',
        drugLicenseType: 'Retail',
        labImages: [],
        gallery: [],
        labCertificates: [],
        labLicenses: [] 
    });

    // States for image previews
    const [previews, setPreviews] = useState({ 
        profile: null,
        signature: null // Added for Signature preview
    });

    // Actual File objects for upload
    const [files, setFiles] = useState({
        profileImage: null,
        signatureImage: null // Added for Signature file
    });

    // Helper to find Display Names for Country/State/City
    const getDisplayName = (list, id) => {
        if (!id || !list) return 'Not Set';
        const item = list.find(i => (i.id || i._id || i.name) == id);
        return item ? item.name : id;
    };

    // Helper to format image URL correctly
    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace('public/', '');
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

    // ================= FETCH GEO LOGIC =================
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await getAllCountries();
                setCountries(data || []);
            } catch {
                console.error("Failed to load countries");
            }
        };
        fetchCountries();
    }, [getAllCountries]);

    const fetchStates = async (countryId) => {
        if (!countryId) return;
        try {
            const data = await getStatesByCountry(countryId);
            setStates(data || []);
        } catch {
            console.error("Failed to load states");
        }
    };

    const fetchCities = async (stateId) => {
        if (!stateId) return;
        try {
            const data = await getCitiesByState(stateId);
            setCities(data || []);
        } catch {
            console.error("Failed to load cities");
        }
    };

    // ================= FETCH INSURANCE MASTER LIST =================
    useEffect(() => {
        const fetchInsurances = async () => {
            try {
                const res = await LabVendorAPI.getInsuranceList();
                if (res.success) {
                    setInsuranceMasterList(res.data || []);
                }
            } catch (err) {
                console.error("Failed to load insurance list", err);
            }
        };
        fetchInsurances();
    }, []);

    // ================= LOAD PROFILE =================
    const loadProfile = async () => {
        try {
            // 1. Fetch profile update staging status
            try {
                const statusRes = await LabVendorAPI.getLabProfileUpdateStatus();
                if (statusRes && statusRes.success) {
                    setStagedRequest(statusRes.data);
                }
            } catch (err) {
                console.error("Failed loading staged profile status:", err);
            }

            // 2. Fetch primary active profile
            const res = await LabVendorAPI.getLabProfile();
            if (res.success) {
                const data = res.data;

                // Safely parse incoming insurances
                let parsedInsurances = [];
                if (data.acceptedInsurances) {
                    try {
                        parsedInsurances = typeof data.acceptedInsurances === 'string'
                            ? JSON.parse(data.acceptedInsurances)
                            : data.acceptedInsurances;
                    } catch (e) {
                        parsedInsurances = String(data.acceptedInsurances).split(',').map(i => i.trim()).filter(Boolean);
                    }
                }

                setProfile({
                    name: data.name || '',
                    about: data.about || '',
                    country: data.country || '', 
                    state: data.state || '',
                    city: data.city || '',
                    address: data.address || '',
                    isHomeCollectionAvailable: String(data.isHomeCollectionAvailable ?? 'false'),
                    isRapidServiceAvailable: String(data.isRapidServiceAvailable ?? 'false'),
                    isInsuranceAccepted: String(data.isInsuranceAccepted ?? 'false'),
                    is24x7: String(data.is24x7 ?? 'false'),
                    lat: data.location?.lat || data.lat || '',
                    lng: data.location?.lng || data.lng || '',
                    acceptedInsurances: Array.isArray(parsedInsurances) ? parsedInsurances : [],
                    alternatePhone: data.alternatePhone || '',
                    nablNumber: data.documents?.nablNumber || data.nablNumber || '' // Set NABL Number
                });

                if (data.country) fetchStates(data.country);
                if (data.state) fetchCities(data.state);

                setVerificationDocs({
                    gstNumber: data.documents?.gstNumber || '', 
                    drugLicenseType: data.documents?.drugLicenseType || 'Retail', 
                    labImages: data.documents?.labImages || [],
                    gallery: data.gallery || [],
                    labCertificates: data.documents?.labCertificates || [],
                    labLicenses: data.documents?.labLicenses || []
                });

                setPreviews({
                    profile: data.profileImage || null,
                    signature: data.signatureImage || null // Set signature image preview if available
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // ================= HANDLERS =================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        if (name === "country") {
            fetchStates(value);
            setProfile(prev => ({ ...prev, state: "", city: "" }));
        }
        if (name === "state") {
            fetchCities(value);
            setProfile(prev => ({ ...prev, city: "" }));
        }
    };

    const handleAddInsurance = (insuranceName) => {
        if (!insuranceName) return;
        if (!profile.acceptedInsurances.includes(insuranceName)) {
            setProfile(prev => ({
                ...prev,
                acceptedInsurances: [...prev.acceptedInsurances, insuranceName]
            }));
        }
    };

    const handleRemoveInsurance = (insuranceName) => {
        setProfile(prev => ({
            ...prev,
            acceptedInsurances: prev.acceptedInsurances.filter(item => item !== insuranceName)
        }));
    };

    const handleProfileImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFiles(prev => ({ ...prev, profileImage: selectedFile }));
            setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(selectedFile) }));
        }
    };

    const handleSignatureImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFiles(prev => ({ ...prev, signatureImage: selectedFile }));
            setPreviews(prev => ({ ...prev, signature: URL.createObjectURL(selectedFile) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            const selectedCountry = countries.find((c) => (c.id || c._id) == profile.country);
            const selectedState = states.find((s) => (s.id || s._id) == profile.state);
            const selectedCity = cities.find((c) => (c.id || c._id) == profile.city);

            // Allowed Request Fields according to the provided API documentation
            const allowedFields = [
                'name', 'about', 'address', 'lat', 'lng',
                'isHomeCollectionAvailable', 'isRapidServiceAvailable',
                'isInsuranceAccepted', 'is24x7', 'alternatePhone', 'nablNumber'
            ];

            // Append standard fields safely
            allowedFields.forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });

            // Append dynamic geolocation names if updated
            formData.append('country', selectedCountry?.name || profile.country);
            formData.append('state', selectedState?.name || profile.state);
            formData.append('city', selectedCity?.name || profile.city);

            // Format acceptedInsurances strictly as JSON-stringified array
            formData.append('acceptedInsurances', JSON.stringify(profile.acceptedInsurances));
            
            if (files.profileImage) {
                formData.append('profileImage', files.profileImage);
            }

            if (files.signatureImage) {
                formData.append('signatureImage', files.signatureImage);
            }

            const res = await LabVendorAPI.updateLabProfile(formData);
            if (res.success) {
                toast.success(res.message || "Profile updates submitted to Admin for review.");
                // Store newly created staging record inside local state
                setStagedRequest(res.data);
                // Clear state file variables
                setFiles({ profileImage: null, signatureImage: null });
            } else {
                toast.error(res.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during update.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold text-gray-500">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <Toaster position="top-right" /> 
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Staging Warning Alert for Pending Reviews */}
                {stagedRequest && stagedRequest.status === 'Pending' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <FaClock className="text-amber-500 mt-1 flex-shrink-0 animate-pulse" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Modifications Pending Verification</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                Your profile changes submitted on {new Date(stagedRequest.createdAt).toLocaleDateString()} are currently being reviewed by administrators. 
                                Active public listings will show your historical data until approval is granted.
                            </p>
                        </div>
                    </div>
                )}

                {/* Staging Warning Alert for Rejections */}
                {stagedRequest && stagedRequest.status === 'Rejected' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                        <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Modifications Rejected</h4>
                            <p className="text-xs text-red-700 mt-1">
                                Your recent change request could not be processed. <strong className="text-red-950">Reason:</strong> {stagedRequest.rejectionReason || "No specifics provided."}
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-semibold">
                                Please correct the corresponding values below and submit again.
                            </p>
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                                {previews.profile ? (
                                    <img src={formatImagePath(previews.profile)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <FaFlask className="w-full h-full p-8 text-gray-300" />
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 bg-[#08B36A] p-2 rounded-full text-white cursor-pointer hover:scale-110 transition-transform shadow-md">
                                <FaCamera size={16} />
                                <input type="file" hidden onChange={handleProfileImageChange} accept="image/*" />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-800">{profile.name || "Laboratory Profile"}</h1>
                            <p className="text-gray-500 font-medium text-sm">Update your laboratory details and configuration</p>
                        </div>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-[#08B36A] text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100">
                            {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                        </button>
                    </div>

                    {/* QUICK INFO SUMMARY SECTION */}
                    <div className="bg-[#1e3a8a] rounded-2xl p-6 text-white shadow-lg border-l-8 border-[#08B36A]">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <FaInfoCircle className="text-[#08B36A]" /> Regional & Contact Summary
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">Country</p>
                                        <p className="font-bold text-sm truncate">{getDisplayName(countries, profile.country)}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">State</p>
                                        <p className="font-bold text-sm truncate">{getDisplayName(states, profile.state)}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">City</p>
                                        <p className="font-bold text-sm truncate">{getDisplayName(cities, profile.city)}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">NABL ID</p>
                                        <p className="font-bold text-sm truncate" title={profile.nablNumber}>{profile.nablNumber || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap md:flex-col gap-2 justify-center">
                                {profile.isHomeCollectionAvailable === 'true' && (
                                    <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-[10px] font-black border border-green-500/30">
                                        <FaCheckCircle/> HOME COLLECTION
                                    </span>
                                )}
                                {profile.is24x7 === 'true' && (
                                    <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg text-[10px] font-black border border-blue-500/30">
                                        <FaClock/> 24/7 SERVICE
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* General Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaBuilding className="text-[#08B36A]" /> General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Lab Name</label>
                                        <input name="name" value={profile.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">About Lab</label>
                                        <textarea name="about" value={profile.about} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                                        <select name="country" value={profile.country} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium bg-white">
                                            <option value="">Select Country</option>
                                            {countries.map((c, index) => <option key={c.id || c._id || index} value={c.id || c._id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                                        <select name="state" value={profile.state} onChange={handleInputChange} disabled={!profile.country} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium bg-white disabled:bg-gray-50">
                                            <option value="">Select State</option>
                                            {states.map((s, index) => <option key={s.id || s._id || index} value={s.id || s._id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                        <select name="city" value={profile.city} onChange={handleInputChange} disabled={!profile.state} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium bg-white disabled:bg-gray-50">
                                            <option value="">Select City</option>
                                            {cities.map((ct, index) => <option key={ct.id || ct._id || index} value={ct.id || ct._id}>{ct.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                            <FaPhoneAlt size={12} className="text-gray-400" /> Alternate Phone
                                        </label>
                                        <input 
                                            name="alternatePhone" 
                                            value={profile.alternatePhone} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. +919876543211"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Accreditation & Signatures (NABL and Signature upload) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaAward className="text-[#08B36A]" /> Accreditation & Signatures
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">NABL Number</label>
                                        <input 
                                            name="nablNumber" 
                                            value={profile.nablNumber} 
                                            onChange={handleInputChange} 
                                            placeholder="e.g. MC-5949"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" 
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1.5">NABL accredited registration identifier</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pathologist Signature</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                                                {previews.signature ? (
                                                    <img src={formatImagePath(previews.signature)} alt="Signature" className="w-full h-full object-contain" />
                                                ) : (
                                                    <FaSignature className="text-gray-300 w-8 h-8" />
                                                )}
                                            </div>
                                            <div>
                                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold inline-block transition-colors">
                                                    Choose Image
                                                    <input type="file" hidden onChange={handleSignatureImageChange} accept="image/*" />
                                                </label>
                                                <p className="text-[10px] text-gray-400 mt-1">Recommended format: .png with transparent background</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Details */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#08B36A]" /> Location Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                                        <input name="address" value={profile.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Latitude</label>
                                            <input name="lat" value={profile.lat} onChange={handleInputChange} placeholder="Latitude" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Longitude</label>
                                            <input name="lng" value={profile.lng} onChange={handleInputChange} placeholder="Longitude" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6">Services Settings</h3>
                                <div className="space-y-4">
                                    <ServiceToggle label="Home Collection" name="isHomeCollectionAvailable" value={profile.isHomeCollectionAvailable} onChange={handleInputChange} />
                                    <ServiceToggle label="Rapid Service" name="isRapidServiceAvailable" value={profile.isRapidServiceAvailable} onChange={handleInputChange} />
                                    <ServiceToggle label="Accept Insurance" name="isInsuranceAccepted" value={profile.isInsuranceAccepted} onChange={handleInputChange} />
                                    <ServiceToggle label="24/7 Open" name="is24x7" value={profile.is24x7} onChange={handleInputChange} />

                                    {profile.isInsuranceAccepted === 'true' && (
                                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                                            <label className="block text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">Add Accepted Insurance</label>
                                            
                                            {/* DROPDOWN FOR SINGLE INSURANCE ADDITION */}
                                            <select 
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 font-bold outline-none focus:border-[#08B36A] bg-white cursor-pointer"
                                                value=""
                                                onChange={(e) => {
                                                    handleAddInsurance(e.target.value);
                                                    e.target.value = ""; // Reset dropdown selection immediately
                                                }}
                                            >
                                                <option value="">-- Choose Insurance to Add --</option>
                                                {insuranceMasterList
                                                    .filter(ins => !profile.acceptedInsurances.includes(ins.insuranceName))
                                                    .map((ins) => (
                                                        <option key={ins._id} value={ins.insuranceName}>
                                                            {ins.insuranceName}
                                                        </option>
                                                ))}
                                            </select>

                                            {/* SHOW SELECTIONS AS TAGS */}
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {profile.acceptedInsurances.map((ins, idx) => (
                                                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-[#08B36A]/10 border border-[#08B36A]/20 rounded text-[11px] font-bold text-[#08B36A]">
                                                        {ins}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveInsurance(ins)} 
                                                            className="text-red-500 hover:text-red-700 font-black ml-1"
                                                        >
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {profile.acceptedInsurances.length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No insurance providers added yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Verification/Registration Details Display (Read-Only) */}
                            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <h3 className="text-sm font-bold text-[#1e3a8a] flex items-center gap-1.5">
                                        <FaFileContract className="text-gray-500" /> Registry Details
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                        Read-Only
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500">
                                    These registration and licensing items are secured to maintain verification status.
                                </p>

                                <div className="space-y-3 pt-2">
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">GST Number</span>
                                        <span className="text-sm font-bold text-gray-700">{verificationDocs.gstNumber || 'Not Provided'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">Drug License Type</span>
                                        <span className="text-sm font-bold text-gray-700">{verificationDocs.drugLicenseType || 'Not Provided'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-4">
                                    <ReadOnlyDocumentDisplay label="Lab Interior Photos" paths={verificationDocs.labImages} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="Gallery Images" paths={verificationDocs.gallery} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="Certificates / Licenses" paths={verificationDocs.labCertificates} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="Lab Licenses" paths={verificationDocs.labLicenses} formatImagePath={formatImagePath} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ServiceToggle({ label, name, value, onChange }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-sm font-bold text-gray-700">{label}</span>
            <select name={name} value={value} onChange={onChange} className="bg-transparent font-black text-[#08B36A] outline-none text-xs cursor-pointer">
                <option value="true">YES</option>
                <option value="false">NO</option>
            </select>
        </div>
    );
}

function ReadOnlyDocumentDisplay({ label, paths = [], formatImagePath }) {
    if (!paths || paths.length === 0) return null;
    return (
        <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-gray-400 uppercase">{label}</span>
            <div className="flex flex-wrap gap-1.5">
                {paths.map((src, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <img src={formatImagePath(src)} alt="Verification file" className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
}