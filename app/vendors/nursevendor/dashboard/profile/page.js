"use client";

import React, { useState, useEffect } from 'react';
import NurseAPI from '@/app/services/NurseAPI';
import { 
    Camera, Mail, Phone, MapPin, Briefcase, Save, Loader2, 
    FileText, CheckCircle, Info, Globe, Navigation, UploadCloud 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserContext } from '@/app/context/UserContext'; 

const ProfilePage = () => {
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Dropdown Data
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        about: '',
        experienceYears: '',
        country: '', // Stored as ID/Name for dropdown
        state: '',   // Stored as ID/Name for dropdown
        city: '',    // Stored as ID/Name for dropdown
        address: '',
        lat: '',
        lng: '',
        phone: '',
        profileStatus: ''
    });

    const [previews, setPreviews] = useState({
        profile: null,
        nursingCertificates: [],
        licensePhotos: [],
        gstCertificates: [],
        experienceCertificates: [],
        otherCertificates: []
    });

    const [files, setFiles] = useState({
        profileImage: null,
        nursingCertificates: [],
        licensePhotos: [],
        gstCertificates: [],
        experienceCertificates: [],
        otherCertificates: []
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${BACKEND_URL}/${cleanPath}`;
    };

    // Helper to find ID by Name (since your API returns "India" instead of an ID)
    const findIdByName = (list, name) => {
        const item = list.find(i => i.name === name || i.id === name || i._id === name);
        return item ? (item.id || item._id) : name;
    };

    const fetchProfile = async () => {
        try {
            const res = await NurseAPI.getNurseProfile();
            if (res.success) {
                const d = res.data;
                
                // Set initial profile state
                setProfile({
                    name: d.name || '',
                    email: d.email || '',
                    about: d.about || '',
                    experienceYears: d.experienceYears || '',
                    country: d.country || '',
                    state: d.state || '',
                    city: d.city || '',
                    address: d.address || '',
                    lat: d.location?.lat || '',
                    lng: d.location?.lng || '',
                    phone: d.phone || '',
                    profileStatus: d.profileStatus || ''
                });

                // Load initial previews from documents object
                setPreviews({
                    profile: d.profileImage || null,
                    nursingCertificates: d.documents?.nursingCertificates || [],
                    licensePhotos: d.documents?.licensePhotos || [],
                    gstCertificates: d.documents?.gstCertificates || [],
                    experienceCertificates: d.documents?.experienceCertificates || [],
                    otherCertificates: d.documents?.otherCertificates || []
                });

                // Handle Cascading Dropdowns for existing data
                if (d.country) {
                    const countryList = await getAllCountries();
                    setCountries(countryList);
                    const cId = findIdByName(countryList, d.country);
                    
                    if (cId) {
                        const stateList = await getStatesByCountry(cId);
                        setStates(stateList);
                        const sId = findIdByName(stateList, d.state);
                        
                        if (sId) {
                            const cityList = await getCitiesByState(sId);
                            setCities(cityList);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch profile data");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        if (name === "country") {
            setStates([]); setCities([]);
            const data = await getStatesByCountry(value);
            setStates(data || []);
        }
        if (name === "state") {
            setCities([]);
            const data = await getCitiesByState(value);
            setCities(data || []);
        }
    };

    const handleFileChange = (e, key, isMultiple = false) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        if (isMultiple) {
            setFiles(prev => ({ ...prev, [key]: selectedFiles }));
            const localPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, [key]: localPreviews }));
        } else {
            setFiles(prev => ({ ...prev, [key]: selectedFiles[0] }));
            setPreviews(prev => ({ 
                ...prev, 
                [key === 'profileImage' ? 'profile' : key]: URL.createObjectURL(selectedFiles[0]) 
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Text fields
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('about', profile.about);
            formData.append('experienceYears', profile.experienceYears);
            formData.append('city', profile.city);
            formData.append('state', profile.state);
            formData.append('country', profile.country);
            formData.append('address', profile.address);
            formData.append('lat', profile.lat);
            formData.append('lng', profile.lng);

            // Single Image
            if (files.profileImage) {
                formData.append('profileImage', files.profileImage);
            }

            // Multi Documents
            const docKeys = ['nursingCertificates', 'licensePhotos', 'gstCertificates', 'experienceCertificates', 'otherCertificates'];
            docKeys.forEach(key => {
                if (files[key] && files[key].length > 0) {
                    files[key].forEach(file => formData.append(key, file));
                }
            });

            const res = await NurseAPI.updateNurseProfile(formData);
            if (res.success) {
                toast.success("Profile successfully updated!");
                fetchProfile();
            }
        } catch (error) {
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
            <div className="max-w-6xl mx-auto">
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
                            <label className="absolute -bottom-2 -right-2 bg-[#08B36A] p-2.5 rounded-2xl text-white cursor-pointer hover:scale-110 transition-all shadow-lg border-2 border-white">
                                <Camera size={18} />
                                <input type="file" hidden onChange={(e) => handleFileChange(e, 'profileImage')} accept="image/*" />
                            </label>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{profile.name}</h1>
                                <span className="bg-green-50 text-[#08B36A] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 w-fit self-center">
                                    {profile.profileStatus}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-sm mt-1">ID: {profile.email} • {profile.experienceYears} Years Experience</p>
                        </div>
                        <button type="submit" disabled={loading} className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-[#08B36A] text-white font-black rounded-[1.25rem] hover:bg-[#069c5c] transition-all shadow-xl shadow-green-100 uppercase tracking-widest text-xs">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="bg-[#1e3a8a] rounded-[2rem] p-6 text-white shadow-xl border-l-[12px] border-[#08B36A] flex flex-wrap gap-4 justify-between">
                        <StatBox label="Role" value="Professional Nurse" icon={<Briefcase size={14}/>} />
                        <StatBox label="Region" value={`${profile.city}, ${profile.state}`} icon={<Globe size={14}/>} />
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
                                    <FormInput label="Full Service Name" name="name" value={profile.name} onChange={handleInputChange} />
                                    <FormInput label="Phone Number" name="phone" value={profile.phone} readOnly className="bg-gray-100 cursor-not-allowed" />
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">About / Bio</label>
                                        <textarea name="about" value={profile.about} onChange={handleInputChange} rows={4} className="w-full px-6 py-4 rounded-2xl border border-gray-100 outline-none focus:border-[#08B36A] bg-gray-50 font-medium text-gray-700 placeholder:text-gray-300" placeholder="Describe your nursing experience..." />
                                    </div>
                                    <FormInput label="Experience Years" name="experienceYears" type="number" value={profile.experienceYears} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Service Area */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-8 flex items-center gap-3 uppercase tracking-wider">
                                    <Navigation className="text-[#08B36A]" size={20} /> Service Area
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <FormSelect label="Country" name="country" value={profile.country} options={countries} onChange={handleInputChange} />
                                    <FormSelect label="State" name="state" value={profile.state} options={states} onChange={handleInputChange} disabled={!profile.country} />
                                    <FormSelect label="City" name="city" value={profile.city} options={cities} onChange={handleInputChange} disabled={!profile.state} />
                                    
                                    <div className="md:col-span-3">
                                        <FormInput label="Detailed Address" name="address" value={profile.address} onChange={handleInputChange} />
                                    </div>
                                    <FormInput label="Latitude" name="lat" value={profile.lat} onChange={handleInputChange} />
                                    <FormInput label="Longitude" name="lng" value={profile.lng} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        {/* Document Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-[#1e3a8a] mb-6 flex items-center gap-3 uppercase tracking-wider">
                                    <FileText className="text-[#08B36A]" size={20} /> Documents
                                </h3>
                                <div className="space-y-6">
                                    <FileBox label="Nursing Certificates" previews={previews.nursingCertificates} onChange={(e) => handleFileChange(e, 'nursingCertificates', true)} formatImagePath={formatImagePath} />
                                    <FileBox label="License Photos" previews={previews.licensePhotos} onChange={(e) => handleFileChange(e, 'licensePhotos', true)} formatImagePath={formatImagePath} />
                                    <FileBox label="GST Certificates" previews={previews.gstCertificates} onChange={(e) => handleFileChange(e, 'gstCertificates', true)} formatImagePath={formatImagePath} />
                                    <FileBox label="Experience Certificates" previews={previews.experienceCertificates} onChange={(e) => handleFileChange(e, 'experienceCertificates', true)} formatImagePath={formatImagePath} />
                                    <FileBox label="Other Certificates" previews={previews.otherCertificates} onChange={(e) => handleFileChange(e, 'otherCertificates', true)} formatImagePath={formatImagePath} />
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

function FormSelect({ label, options, ...props }) {
    return (
        <div className="w-full">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
            <select {...props} className="w-full px-5 py-4 rounded-2xl border border-gray-100 outline-none focus:border-[#08B36A] bg-gray-50 font-bold text-gray-700 disabled:opacity-50 appearance-none">
                <option value="">Select {label}</option>
                {options.map((opt, i) => (
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

function FileBox({ label, onChange, previews = [], formatImagePath }) {
    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-100 rounded-2xl hover:border-[#08B36A] hover:bg-green-50/50 cursor-pointer transition-all group">
                <UploadCloud className="text-gray-300 mb-1 group-hover:text-[#08B36A] transition-colors" />
                <span className="text-[10px] text-gray-500 font-black uppercase">Upload</span>
                <input type="file" hidden multiple onChange={onChange} />
            </label>

            {previews && previews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {previews.map((src, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                            <img src={formatImagePath(src)} alt="doc" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;