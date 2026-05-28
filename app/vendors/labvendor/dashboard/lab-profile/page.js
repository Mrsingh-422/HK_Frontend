'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaBuilding, FaMapMarkerAlt, FaFlask, FaCamera, FaFileUpload, 
    FaSave, FaGlobe, FaShieldAlt, FaClock, FaTimes, FaInfoCircle, FaCheckCircle 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
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

    // All fields from API response included
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
        acceptedInsurances: '', 
        timingLabel: '',
        gstNumber: '', 
        drugLicenseType: 'Retail', 
    });

    // States for image previews
    const [previews, setPreviews] = useState({ 
        profile: null,
        labImages: [],
        gallery: [],
        labCertificates: [],
        labLicenses: [] 
    });

    // Actual File objects for upload
    const [files, setFiles] = useState({
        profileImage: null,
        labImages: [],
        gallery: [],
        labCertificates: [],
        labLicenses: []
    });

    // Helper to find Display Names for Country/State/City for the Summary Div
    const getDisplayName = (list, id) => {
        if (!id || !list) return 'Not Set';
        const item = list.find(i => (i.id || i._id || i.name) == id);
        return item ? item.name : id;
    };

    // Helper to format image URL correctly
    const formatImagePath = (path) => {
        if (!path) return null;
        if (path.startsWith('blob') || path.startsWith('http')) return path;
        const cleanPath = path.replace('public/', '');
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
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await LabVendorAPI.getLabProfile();
                if (res.success) {
                    const data = res.data;
                    const loadedProfile = {
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
                        lat: data.location?.lat || '',
                        lng: data.location?.lng || '',
                        acceptedInsurances: data.acceptedInsurances?.join(', ') || '',
                        timingLabel: data.timingLabel || '',
                        gstNumber: data.documents?.gstNumber || '', 
                        drugLicenseType: data.documents?.drugLicenseType || 'Retail', 
                    };
                    setProfile(loadedProfile);

                    if (data.country) fetchStates(data.country);
                    if (data.state) fetchCities(data.state);

                    setPreviews({
                        profile: data.profileImage || null,
                        labImages: data.documents?.labImages || [],
                        gallery: data.gallery || [],
                        labCertificates: data.documents?.labCertificates || [],
                        labLicenses: data.documents?.labLicenses || []
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load profile");
            } finally {
                setFetching(false);
            }
        };
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

    // Updated logic to only allow ONE insurance selection
    const handleInsuranceToggle = (insuranceName) => {
        // Just set the name directly for single selection
        setProfile(prev => ({ ...prev, acceptedInsurances: insuranceName }));
    };

    const handleFileChange = (e, key, isMultiple = false) => {
        const selectedFiles = Array.from(e.target.files);
        if (isMultiple) {
            setFiles(prev => ({ ...prev, [key]: selectedFiles }));
            const localPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, [key]: localPreviews }));
        } else {
            setFiles(prev => ({ ...prev, [key]: selectedFiles[0] }));
            setPreviews(prev => ({ ...prev, profile: URL.createObjectURL(selectedFiles[0]) }));
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

            Object.keys(profile).forEach(key => {
                if (key === 'acceptedInsurances') {
                    const insuranceArray = profile.acceptedInsurances.split(',').map(i => i.trim()).filter(i => i !== "");
                    formData.append(key, JSON.stringify(insuranceArray));
                } else if (key === 'country') {
                    formData.append('country', selectedCountry?.name || profile.country);
                } else if (key === 'state') {
                    formData.append('state', selectedState?.name || profile.state);
                } else if (key === 'city') {
                    formData.append('city', selectedCity?.name || profile.city);
                } else {
                    formData.append(key, profile[key]);
                }
            });
            
            if (files.profileImage) formData.append('profileImage', files.profileImage);
            files.labImages.forEach(file => formData.append('labImages', file));
            files.gallery.forEach(file => formData.append('gallery', file));
            files.labCertificates.forEach(file => formData.append('labCertificates', file));
            files.labLicenses.forEach(file => formData.append('labLicenses', file));

            const res = await LabVendorAPI.updateLabProfile(formData);
            if (res.success) {
                toast.success("Profile updated successfully!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold text-gray-500">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
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
                                <input type="file" hidden onChange={(e) => handleFileChange(e, 'profileImage')} accept="image/*" />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-800">{profile.name || "Laboratory Profile"}</h1>
                            <p className="text-gray-500 font-medium text-sm">Update your laboratory details and documents</p>
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
                                        <p className="text-[10px] uppercase font-black text-blue-200 mb-1 tracking-widest">Address</p>
                                        <p className="font-bold text-sm truncate" title={profile.address}>{profile.address || 'Not Set'}</p>
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
                                        <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
                                        <input name="gstNumber" value={profile.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] font-medium" />
                                    </div>
                                </div>
                            </div>

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
                                        <input name="lat" value={profile.lat} onChange={handleInputChange} placeholder="Latitude" className="px-4 py-3 rounded-xl border border-gray-200 outline-none font-medium" />
                                        <input name="lng" value={profile.lng} onChange={handleInputChange} placeholder="Longitude" className="px-4 py-3 rounded-xl border border-gray-200 outline-none font-medium" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-6">Services & Timing</h3>
                                <div className="space-y-4">
                                    <ServiceToggle label="Home Collection" name="isHomeCollectionAvailable" value={profile.isHomeCollectionAvailable} onChange={handleInputChange} />
                                    <ServiceToggle label="Rapid Service" name="isRapidServiceAvailable" value={profile.isRapidServiceAvailable} onChange={handleInputChange} />
                                    <ServiceToggle label="Accept Insurance" name="isInsuranceAccepted" value={profile.isInsuranceAccepted} onChange={handleInputChange} />
                                    <ServiceToggle label="24/7 Open" name="is24x7" value={profile.is24x7} onChange={handleInputChange} />
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-1">Timing Label</label>
                                        <input name="timingLabel" value={profile.timingLabel} onChange={handleInputChange} placeholder="Open 09:00 - 18:00" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 font-bold outline-none focus:border-[#08B36A]" />
                                    </div>

                                    {profile.isInsuranceAccepted === 'true' && (
                                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <label className="block text-xs font-bold text-[#1e3a8a] mb-3 uppercase tracking-wider">Select Accepted Insurance</label>
                                            
                                            {/* DROPDOWN FOR SINGLE INSURANCE SELECTION */}
                                            <select 
                                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 font-bold outline-none focus:border-[#08B36A] bg-white cursor-pointer"
                                                value={profile.acceptedInsurances}
                                                onChange={(e) => handleInsuranceToggle(e.target.value)}
                                            >
                                                <option value="">-- Choose Insurance --</option>
                                                {insuranceMasterList.map((ins) => (
                                                    <option key={ins._id} value={ins.insuranceName}>
                                                        {ins.insuranceName}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* SHOW SELECTED INSURANCE NAME BELOW DROPDOWN */}
                                            {profile.acceptedInsurances && (
                                                <div className="mt-4 p-2.5 bg-[#08B36A]/10 border border-[#08B36A]/20 rounded-lg flex items-center gap-2">
                                                    <FaCheckCircle className="text-[#08B36A]" size={14} />
                                                    <span className="text-xs font-black text-[#08B36A] uppercase tracking-wide">
                                                        Selected: {profile.acceptedInsurances}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-2">Media & Docs</h3>
                                
                                <FileUploadBox label="Lab Interior Photos" previews={previews.labImages} onChange={(e) => handleFileChange(e, 'labImages', true)} formatImagePath={formatImagePath} />
                                <FileUploadBox label="Certificates / Licenses" previews={previews.labCertificates} onChange={(e) => handleFileChange(e, 'labCertificates', true)} formatImagePath={formatImagePath} />
                                <FileUploadBox label="Lab Licenses" previews={previews.labLicenses} onChange={(e) => handleFileChange(e, 'labLicenses', true)} formatImagePath={formatImagePath} />
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

function FileUploadBox({ label, onChange, previews = [], formatImagePath }) {
    return (
        <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase text-gray-400 mb-1 tracking-wider">{label}</label>
            <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-100 rounded-xl hover:border-[#08B36A] hover:bg-green-50/50 cursor-pointer transition-all">
                <FaFileUpload className="text-gray-300 mb-1" />
                <span className="text-[11px] text-gray-500 font-bold">Select Files</span>
                <input type="file" hidden multiple onChange={onChange} />
            </label>

            {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {previews.map((src, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img 
                                src={formatImagePath(src)} 
                                alt="preview" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}