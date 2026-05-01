'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaBuilding, FaMapMarkerAlt, FaPills, FaCamera, FaFileUpload, 
    FaSave, FaClock, FaCheckCircle, FaInfoCircle, FaFileContract 
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

    const [profile, setProfile] = useState({
        name: '',
        about: '',
        country: '', 
        state: '',   
        city: '',    
        address: '',
        isHomeDeliveryAvailable: 'false',
        is24x7: 'false',
        lat: '',
        lng: '',
        gstNumber: '', 
        drugLicenseType: 'Retail',
        issuingAuthority: ''
    });

    const [previews, setPreviews] = useState({ 
        profile: null,
        pharmacyImages: [],
        pharmacyCertificates: [],
        pharmacyLicenses: [],
        gstCertificates: [],
        drugLicenses: [],
        otherCertificates: []
    });

    const [files, setFiles] = useState({
        profileImage: null,
        pharmacyImages: [],
        pharmacyCertificates: [],
        pharmacyLicenses: [],
        gstCertificates: [],
        drugLicenses: [],
        otherCertificates: []
    });

    const getDisplayName = (list, id) => {
        if (!id || !list) return 'Not Set';
        const item = list.find(i => (i.id || i._id || i.name) == id);
        return item ? item.name : id;
    };

    const formatImagePath = (path) => {
        if (!path) return null;
        if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
        const cleanPath = String(path).replace(/^public[\\/]/, '').replace(/\\/g, '/'); 
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

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

    const loadProfileData = async () => {
        try {
            const res = await PharmacyVendorAPI.getPharmacyProfile();
            if (res.success) {
                const data = res.data;
                setProfile({
                    name: data.name || '',
                    about: data.about || '',
                    country: data.country || '', 
                    state: data.state || '',
                    city: data.city || '',
                    address: data.address || '',
                    isHomeDeliveryAvailable: String(data.isHomeDeliveryAvailable ?? 'false'),
                    is24x7: String(data.is24x7 ?? 'false'),
                    lat: data.location?.lat || '',
                    lng: data.location?.lng || '',
                    gstNumber: data.documents?.gstNumber || '', 
                    drugLicenseType: data.documents?.drugLicenseType || 'Retail',
                    issuingAuthority: data.documents?.issuingAuthority || ''
                });

                if (data.country) fetchStates(data.country);
                if (data.state) fetchCities(data.state);

                setPreviews({
                    profile: data.profileImage || null,
                    pharmacyImages: data.documents?.pharmacyImages || [],
                    pharmacyCertificates: data.documents?.pharmacyCertificates || [],
                    pharmacyLicenses: data.documents?.pharmacyLicenses || [],
                    gstCertificates: data.documents?.gstCertificates || [],
                    drugLicenses: data.documents?.drugLicenses || [],
                    otherCertificates: data.documents?.otherCertificates || []
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
        loadProfileData();
    }, []);

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

    const handleFileChange = (e, key, isMultiple = false) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        if (isMultiple) {
            setFiles(prev => ({ ...prev, [key]: selectedFiles }));
            const localPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => ({ ...prev, [key]: localPreviews }));
        } else {
            setFiles(prev => ({ ...prev, [key]: selectedFiles[0] }));
            const singlePreview = URL.createObjectURL(selectedFiles[0]);
            setPreviews(prev => ({ 
                ...prev, 
                [key === 'profileImage' ? 'profile' : key]: singlePreview 
            }));
        }
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            // 1. Append Basic Fields (Check for null/undefined to avoid sending "null" string)
            const basicFields = ['name', 'about', 'country', 'state', 'city', 'address', 'isHomeDeliveryAvailable', 'is24x7'];
            basicFields.forEach(key => {
                if (profile[key] !== null && profile[key] !== undefined) {
                    formData.append(key, profile[key]);
                }
            });

            // 2. Append Location Data (Matching backend structure)
            if (profile.lat) formData.append('lat', profile.lat);
            if (profile.lng) formData.append('lng', profile.lng);

            // 3. Append Document Text Fields
            if (profile.gstNumber) formData.append('gstNumber', profile.gstNumber);
            if (profile.drugLicenseType) formData.append('drugLicenseType', profile.drugLicenseType);
            if (profile.issuingAuthority) formData.append('issuingAuthority', profile.issuingAuthority);
            
            // 4. Append Single Profile Image
            if (files.profileImage instanceof File) {
                formData.append('profileImage', files.profileImage);
            }
            
            // 5. Append Multiple Files
            const multiFileKeys = [
                'pharmacyImages', 'pharmacyCertificates', 'pharmacyLicenses', 
                'gstCertificates', 'drugLicenses', 'otherCertificates'
            ];
            
            multiFileKeys.forEach(key => {
                if (files[key] && files[key].length > 0) {
                    files[key].forEach(file => {
                        if (file instanceof File) {
                            formData.append(key, file);
                        }
                    });
                }
            });

            // Call the API
            const res = await PharmacyVendorAPI.updatePharmacyProfile(formData);

            if (res.success) {
                toast.success("Pharmacy profile updated successfully!");
                // Refresh profile to get the latest data from server
                const refresh = await PharmacyVendorAPI.getPharmacyProfile();
                if (refresh.success) {
                    const data = refresh.data;
                    setPreviews(prev => ({
                        ...prev,
                        profile: data.profileImage,
                        pharmacyImages: data.documents?.pharmacyImages || [],
                        drugLicenses: data.documents?.drugLicenses || [],
                        gstCertificates: data.documents?.gstCertificates || [],
                        pharmacyCertificates: data.documents?.pharmacyCertificates || []
                    }));
                }
            } else {
                toast.error(res.message || "Update failed");
            }
        } catch (err) {
            console.error("Submit Error:", err);
            // If it's still a 500, check if your backend specifically requires 'location[lat]' instead of 'lat'
            toast.error(err.response?.data?.message || "Internal Server Error (500). Please check required fields.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center font-bold text-gray-500">Loading Pharmacy Profile...</div>;

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
                            <p className="text-gray-500 font-medium text-sm">Manage your pharmacy storefront and compliance documents</p>
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
                                        <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
                                        <input name="gstNumber" value={profile.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Issuing Authority</label>
                                        <input name="issuingAuthority" value={profile.issuingAuthority} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" />
                                    </div>
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
                                        <input name="lat" value={profile.lat} onChange={handleInputChange} placeholder="Latitude" className="px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                                        <input name="lng" value={profile.lng} onChange={handleInputChange} placeholder="Longitude" className="px-4 py-3 rounded-xl border border-gray-200 outline-none" />
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
                                    
                                    <div className="pt-2">
                                        <label className="block text-xs font-bold text-gray-400 mb-2">License Type</label>
                                        <select name="drugLicenseType" value={profile.drugLicenseType} onChange={handleInputChange} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 font-bold outline-none">
                                            <option value="Retail">Retail</option>
                                            <option value="Wholesale">Wholesale</option>
                                            <option value="Both">Both</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                                <h3 className="text-lg font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
                                    <FaFileContract className="text-[#08B36A]" /> Documents
                                </h3>
                                
                                <FileUploadBox label="Pharmacy Store Images" previews={previews.pharmacyImages} onChange={(e) => handleFileChange(e, 'pharmacyImages', true)} formatImagePath={formatImagePath} />
                                <FileUploadBox label="Drug Licenses" previews={previews.drugLicenses} onChange={(e) => handleFileChange(e, 'drugLicenses', true)} formatImagePath={formatImagePath} />
                                <FileUploadBox label="GST Certificates" previews={previews.gstCertificates} onChange={(e) => handleFileChange(e, 'gstCertificates', true)} formatImagePath={formatImagePath} />
                                <FileUploadBox label="Pharmacy Certificates" previews={previews.pharmacyCertificates} onChange={(e) => handleFileChange(e, 'pharmacyCertificates', true)} formatImagePath={formatImagePath} />
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
            <select name={name} value={value} onChange={onChange} disabled={disabled} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] bg-white disabled:bg-gray-50">
                <option value="">Select {label}</option>
                {options.map((opt, i) => <option key={opt.id || opt._id || i} value={opt.id || opt._id}>{opt.name}</option>)}
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

function FileUploadBox({ label, onChange, previews = [], formatImagePath }) {
    return (
        <div className="space-y-3">
            <label className="block text-[11px] font-black uppercase text-gray-400 mb-1 tracking-wider">{label}</label>
            <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-100 rounded-xl hover:border-[#08B36A] hover:bg-green-50/50 cursor-pointer transition-all">
                <FaFileUpload className="text-gray-300 mb-1" />
                <span className="text-[11px] text-gray-500 font-bold">Upload Files</span>
                <input type="file" hidden multiple onChange={onChange} />
            </label>

            {previews && previews.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {previews.map((src, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={formatImagePath(src)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}