'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaBuilding, FaMapMarkerAlt, FaPills, FaCamera, 
    FaSave, FaClock, FaCheckCircle, FaInfoCircle, FaFileContract,
    FaPhoneAlt, FaPlus, FaTimes, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI'; 
import { useUserContext } from '@/app/context/UserContext';

export default function PharmacyProfile() {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Staged request state: stores pending or rejected staging records
    const [stagedRequest, setStagedRequest] = useState(null);

    const [profile, setProfile] = useState({
        name: '',
        about: '',
        country: '', 
        state: '',   
        city: '',    
        address: '',
        isHomeDeliveryAvailable: 'false',
        isRapidServiceAvailable: 'false',
        isInsuranceAccepted: 'false',
        acceptedInsurances: [], 
        is24x7: 'false',
        lat: '',
        lng: '',
        alternatePhone: ''
    });

    const [newInsurance, setNewInsurance] = useState('');

    const [verificationDocs, setVerificationDocs] = useState({
        gstNumber: '',
        drugLicenseType: 'Retail',
        issuingAuthority: '',
        pharmacyImages: [],
        pharmacyCertificates: [],
        pharmacyLicenses: [],
        gstCertificates: [],
        drugLicenses: [],
        otherCertificates: []
    });

    const [previews, setPreviews] = useState({ 
        profile: null
    });

    const [files, setFiles] = useState({
        profileImage: null
    });

    const getAllCountriesRef = useRef(getAllCountries);
    const getStatesByCountryRef = useRef(getStatesByCountry);
    const getCitiesByStateRef = useRef(getCitiesByState);

    useEffect(() => {
        getAllCountriesRef.current = getAllCountries;
        getStatesByCountryRef.current = getStatesByCountry;
        getCitiesByStateRef.current = getCitiesByState;
    }, [getAllCountries, getStatesByCountry, getCitiesByState]);

    const getDisplayName = (list, val) => {
        if (!val) return 'Not Set';
        if (!list || list.length === 0) return val; 
        const item = list.find(i => (i.id || i._id || i.name) === val || i.name === val);
        return item ? item.name : val;
    };

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

    const fetchStates = async (countryId) => {
        if (!countryId) return;
        try {
            if (getStatesByCountryRef.current) {
                const data = await getStatesByCountryRef.current(countryId);
                setStates(data || []);
            }
        } catch (err) {
            console.error("Failed to load states:", err);
        }
    };

    const fetchCities = async (stateId) => {
        if (!stateId) return;
        try {
            if (getCitiesByStateRef.current) {
                const data = await getCitiesByStateRef.current(stateId);
                setCities(data || []);
            }
        } catch (err) {
            console.error("Failed to load cities:", err);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeData = async () => {
            setFetching(true);
            let loadedCountries = [];

            // 1. Fetch countries
            try {
                if (getAllCountriesRef.current) {
                    const data = await getAllCountriesRef.current();
                    loadedCountries = data || [];
                    if (isMounted) setCountries(loadedCountries);
                }
            } catch (err) {
                console.error("Failed to load countries during mount:", err);
            }

            // 2. Fetch profile update staging status
            try {
                const statusRes = await PharmacyVendorAPI.getPharmacyProfileUpdateStatus();
                if (statusRes && statusRes.success && isMounted) {
                    setStagedRequest(statusRes.data);
                }
            } catch (err) {
                console.error("Failed to load profile update status:", err);
            }

            // 3. Fetch current profile data
            try {
                const res = await PharmacyVendorAPI.getPharmacyProfile();
                if (res && res.success && isMounted) {
                    const data = res.data;
                    
                    let parsedInsurances = [];
                    if (data.acceptedInsurances) {
                        try {
                            parsedInsurances = typeof data.acceptedInsurances === 'string' 
                                ? JSON.parse(data.acceptedInsurances) 
                                : data.acceptedInsurances;
                        } catch (e) {
                            parsedInsurances = [];
                        }
                    }

                    const countryVal = data.country || '';
                    const stateVal = data.state || '';
                    const cityVal = data.city || '';

                    setProfile({
                        name: data.name || '',
                        about: data.about || '',
                        country: countryVal,
                        state: stateVal,
                        city: cityVal,
                        address: data.address || '',
                        isHomeDeliveryAvailable: String(data.isHomeDeliveryAvailable ?? 'false'),
                        isRapidServiceAvailable: String(data.isRapidServiceAvailable ?? 'false'),
                        isInsuranceAccepted: String(data.isInsuranceAccepted ?? 'false'),
                        acceptedInsurances: Array.isArray(parsedInsurances) ? parsedInsurances : [],
                        is24x7: String(data.is24x7 ?? 'false'),
                        lat: data.location?.lat || data.lat || '',
                        lng: data.location?.lng || data.lng || '',
                        alternatePhone: data.alternatePhone || ''
                    });

                    setVerificationDocs({
                        gstNumber: data.documents?.gstNumber || '', 
                        drugLicenseType: data.documents?.drugLicenseType || 'Retail',
                        issuingAuthority: data.documents?.issuingAuthority || '',
                        pharmacyImages: data.documents?.pharmacyImages || [],
                        pharmacyCertificates: data.documents?.pharmacyCertificates || [],
                        pharmacyLicenses: data.documents?.pharmacyLicenses || [],
                        gstCertificates: data.documents?.gstCertificates || [],
                        drugLicenses: data.documents?.drugLicenses || [],
                        otherCertificates: data.documents?.otherCertificates || []
                    });

                    setPreviews({
                        profile: data.profileImage || null
                    });

                    // Sequential fetch for states based on country name
                    if (countryVal && loadedCountries.length > 0) {
                        const matchedCountry = loadedCountries.find(
                            c => c.name?.toLowerCase() === countryVal.toLowerCase() || (c.id || c._id) === countryVal
                        );
                        if (matchedCountry) {
                            const countryId = matchedCountry.id || matchedCountry._id;
                            try {
                                if (getStatesByCountryRef.current) {
                                    const statesData = await getStatesByCountryRef.current(countryId);
                                    const loadedStates = statesData || [];
                                    if (isMounted) {
                                        setStates(loadedStates);

                                        // Sequential fetch for cities based on state name
                                        if (stateVal && loadedStates.length > 0) {
                                            const matchedState = loadedStates.find(
                                                s => s.name?.toLowerCase() === stateVal.toLowerCase() || (s.id || s._id) === stateVal
                                            );
                                            if (matchedState) {
                                                const stateId = matchedState.id || matchedState._id;
                                                if (getCitiesByStateRef.current) {
                                                    const citiesData = await getCitiesByStateRef.current(stateId);
                                                    if (isMounted) setCities(citiesData || []);
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (err) {
                                console.error("Failed to load states sequentially during mount:", err);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load profile details:", err);
                toast.error("Failed to load profile");
            } finally {
                if (isMounted) setFetching(false);
            }
        };

        initializeData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "country") {
            const matchedCountry = countries.find(c => c.name === value);
            setProfile(prev => ({ ...prev, country: value, state: "", city: "" }));
            setStates([]);
            setCities([]);
            if (matchedCountry) {
                const countryId = matchedCountry.id || matchedCountry._id;
                fetchStates(countryId);
            }
        } else if (name === "state") {
            const matchedState = states.find(s => s.name === value);
            setProfile(prev => ({ ...prev, state: value, city: "" }));
            setCities([]);
            if (matchedState) {
                const stateId = matchedState.id || matchedState._id;
                fetchCities(stateId);
            }
        } else if (name === "city") {
            setProfile(prev => ({ ...prev, city: value }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, key) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        setFiles(prev => ({ ...prev, [key]: selectedFiles[0] }));
        const singlePreview = URL.createObjectURL(selectedFiles[0]);
        setPreviews(prev => ({ 
            ...prev, 
            profile: singlePreview 
        }));
    };

    const addInsuranceToken = () => {
        if (newInsurance.trim() && !profile.acceptedInsurances.includes(newInsurance.trim())) {
            setProfile(prev => ({
                ...prev,
                acceptedInsurances: [...prev.acceptedInsurances, newInsurance.trim()]
            }));
            setNewInsurance('');
        }
    };

    const removeInsuranceToken = (indexToRemove) => {
        setProfile(prev => ({
            ...prev,
            acceptedInsurances: prev.acceptedInsurances.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            const allowedFields = [
                'name', 'about', 'country', 'state', 'city', 'address', 
                'isHomeDeliveryAvailable', 'isRapidServiceAvailable', 
                'isInsuranceAccepted', 'is24x7', 'alternatePhone', 'lat', 'lng'
            ];

            allowedFields.forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });

            formData.append('acceptedInsurances', JSON.stringify(profile.acceptedInsurances));
            
            if (files.profileImage instanceof File) {
                formData.append('profileImage', files.profileImage);
            }

            const res = await PharmacyVendorAPI.updatePharmacyProfile(formData);

            if (res.success) {
                // Show successful submission message to admin review
                toast.success(res.message || "Profile updates submitted to Admin for review.");
                // Store staging information returned from endpoint
                setStagedRequest(res.data);
            } else {
                toast.error(res.message || "Update failed");
            }
        } catch (err) {
            console.error("Submit Error:", err);
            toast.error(err.response?.data?.message || "Internal Server Error. Please verify fields.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold text-gray-500">Loading Pharmacy Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* 1. Staged Update Status Warnings and Notices */}
                {stagedRequest && stagedRequest.status === 'Pending' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <FaClock className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Profile Updates Pending Admin Review</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                You submitted profile modifications on {new Date(stagedRequest.createdAt).toLocaleDateString()}. 
                                These updates will not display publicly until approved by an administrator. You can still modify fields below to submit a new revision request.
                            </p>
                        </div>
                    </div>
                )}

                {stagedRequest && stagedRequest.status === 'Rejected' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <FaExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-sm">Previous Update Request Rejected</h4>
                            <p className="text-xs text-red-700 mt-1">
                                Your update request was rejected. <strong className="text-red-900">Reason:</strong> {stagedRequest.rejectionReason || "No explicit reason was provided."}
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-medium">
                                Please review and correct your information below, then resubmit for approval.
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
                                    <FaPills className="w-full h-full p-8 text-gray-300" />
                                )}
                            </div>
                            <label className="absolute bottom-1 right-1 bg-[#08B36A] p-2 rounded-full text-white cursor-pointer hover:scale-110 transition-transform shadow-md">
                                <FaCamera size={16} />
                                <input type="file" hidden onChange={(e) => handleFileChange(e, 'profileImage')} accept="image/*" />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-800">{profile.name || "Pharmacy Profile"}</h1>
                            <p className="text-gray-500 font-medium text-sm">Manage your pharmacy storefront details and features</p>
                        </div>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-[#08B36A] text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg">
                            {loading ? "Saving..." : <><FaSave /> Save Profile</>}
                        </button>
                    </div>

                    {/* Summary Bar */}
                    <div className="bg-[#1e3a8a] rounded-2xl p-6 text-white shadow-lg border-l-8 border-[#08B36A]">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <FaInfoCircle className="text-[#08B36A]" /> Regional Summary
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SummaryItem label="Country" value={getDisplayName(countries, profile.country)} />
                                    <SummaryItem label="State" value={getDisplayName(states, profile.state)} />
                                    <SummaryItem label="City" value={getDisplayName(cities, profile.city)} />
                                    <SummaryItem label="Delivery" value={profile.isHomeDeliveryAvailable === 'true' ? 'Available' : 'No'} />
                                </div>
                            </div>
                            <div className="flex flex-wrap md:flex-col gap-2 justify-center">
                                {profile.isHomeDeliveryAvailable === 'true' && (
                                    <Badge icon={<FaCheckCircle/>} text="HOME DELIVERY" color="green" />
                                )}
                                {profile.is24x7 === 'true' && (
                                    <Badge icon={<FaClock/>} text="24/7 OPEN" color="blue" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Details */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaBuilding className="text-[#08B36A]" /> Pharmacy Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pharmacy Name</label>
                                        <input name="name" value={profile.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">About Us</label>
                                        <textarea name="about" value={profile.about} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
                                    
                                    <SelectField label="Country" name="country" value={profile.country} options={countries} onChange={handleInputChange} />
                                    <SelectField label="State" name="state" value={profile.state} options={states} onChange={handleInputChange} disabled={!profile.country} />
                                    <SelectField label="City" name="city" value={profile.city} options={cities} onChange={handleInputChange} disabled={!profile.state} />
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                                            <FaPhoneAlt size={12} className="text-gray-400" /> Alternate Phone
                                        </label>
                                        <input name="alternatePhone" value={profile.alternatePhone} onChange={handleInputChange} placeholder="e.g. +919876543210" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
                                </div>
                            </div>

                            {/* Insurance Support Configuration */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaShieldAlt className="text-[#08B36A]" /> Insurance Schemes
                                </h3>
                                <div className="space-y-4">
                                    <ServiceToggle label="Accept Insurance Schemes?" name="isInsuranceAccepted" value={profile.isInsuranceAccepted} onChange={handleInputChange} />
                                    
                                    {profile.isInsuranceAccepted === 'true' && (
                                        <div className="pt-2 space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Supported Insurance Providers</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={newInsurance} 
                                                    onChange={(e) => setNewInsurance(e.target.value)} 
                                                    placeholder="Enter insurance company name" 
                                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" 
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={addInsuranceToken} 
                                                    className="px-4 py-2.5 bg-[#1e3a8a] text-white rounded-xl hover:bg-blue-800 transition-colors flex items-center gap-1 font-bold text-sm"
                                                >
                                                    <FaPlus size={12} /> Add
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {profile.acceptedInsurances.map((ins, index) => (
                                                    <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-lg border border-gray-200">
                                                        {ins}
                                                        <button type="button" onClick={() => removeInsuranceToken(index)} className="text-red-500 hover:text-red-700 font-bold">
                                                            <FaTimes size={10} />
                                                        </button>
                                                    </span>
                                                ))}
                                                {profile.acceptedInsurances.length === 0 && (
                                                    <span className="text-xs text-gray-400 italic">No insurance providers added yet.</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#08B36A]" /> Map & Address
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                                        <input name="address" value={profile.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Latitude</label>
                                            <input name="lat" value={profile.lat} onChange={handleInputChange} placeholder="Latitude" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-1">Longitude</label>
                                            <input name="lng" value={profile.lng} onChange={handleInputChange} placeholder="Longitude" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6">Service Settings</h3>
                                <div className="space-y-4">
                                    <ServiceToggle label="Home Delivery" name="isHomeDeliveryAvailable" value={profile.isHomeDeliveryAvailable} onChange={handleInputChange} />
                                    <ServiceToggle label="24/7 Pharmacy" name="is24x7" value={profile.is24x7} onChange={handleInputChange} />
                                    <ServiceToggle label="Rapid Service Available" name="isRapidServiceAvailable" value={profile.isRapidServiceAvailable} onChange={handleInputChange} />
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
                                    These registration and verification items are locked to maintain profile status and cannot be edited.
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
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase">Issuing Authority</span>
                                        <span className="text-sm font-bold text-gray-700">{verificationDocs.issuingAuthority || 'Not Provided'}</span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-4">
                                    <ReadOnlyDocumentDisplay label="Pharmacy Store Images" paths={verificationDocs.pharmacyImages} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="Drug Licenses" paths={verificationDocs.drugLicenses} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="GST Certificates" paths={verificationDocs.gstCertificates} formatImagePath={formatImagePath} />
                                    <ReadOnlyDocumentDisplay label="Pharmacy Certificates" paths={verificationDocs.pharmacyCertificates} formatImagePath={formatImagePath} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="bg-white/10 p-3 rounded-xl border border-white/5">
            <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">{label}</p>
            <p className="font-bold text-sm truncate">{value || 'Not Set'}</p>
        </div>
    );
}

function Badge({ icon, text, color }) {
    const styles = color === 'green' 
        ? "bg-green-500/20 text-green-400 border-green-500/30" 
        : "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black border ${styles}`}>
            {icon} {text}
        </span>
    );
}

function SelectField({ label, name, value, options, onChange, disabled }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <select 
                name={name} 
                value={value} 
                onChange={onChange} 
                disabled={disabled} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] bg-white disabled:bg-gray-50 text-gray-800"
            >
                <option value="">Select {label}</option>
                {options.map((opt, i) => {
                    const optVal = opt.name || opt.id || opt._id;
                    return (
                        <option key={opt.id || opt._id || i} value={optVal}>
                            {opt.name}
                        </option>
                    );
                })}
            </select>
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