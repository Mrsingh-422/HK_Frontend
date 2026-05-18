'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash,
    FaSearch, FaExclamationTriangle, FaEnvelope,
    FaPhoneAlt, FaMapMarkerAlt, FaInfoCircle,
    FaFireExtinguisher, FaLock, FaUser, FaBuilding,
    FaGlobe, FaChartLine, FaUsers, FaLayerGroup, FaShieldAlt, FaHistory, FaSync
} from 'react-icons/fa'

import AdminAPI2 from '@/app/services/AdminAPI2';
// Import the context as per your reference
import { useUserContext } from "@/app/context/UserContext";

// Simple mock for toast since react-toastify is not installed
const toast = {
    success: (msg) => alert("Success: " + msg),
    error: (msg) => alert("Error: " + msg),
};

export default function ManageFirestationHeadquarter() {
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    // Reference from your provided code
    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [headquarters, setHeadquarters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Location Data States (From Reference)
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [formData, setFormData] = useState({
        stationName: '',
        captainName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        country: '', // Store ID for selection
        city: '',    // Store ID for selection
        state: '',   // Store ID for selection
    });

    // ==========================================
    // 🌟 LOCATION LOGIC (From Reference)
    // ==========================================
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
        try {
            const data = await getStatesByCountry(countryId);
            setStates(data || []);
            setCities([]);
            return data;
        } catch {
            console.error("Failed to load states");
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const data = await getCitiesByState(stateId);
            setCities(data || []);
            return data;
        } catch {
            console.error("Failed to load cities");
        }
    };

    // ==========================================
    // 🌟 API FETCHING
    // ==========================================
    const fetchHQs = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI2.listFireHQ();
            if (response.data.success) {
                setHeadquarters(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load headquarters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHQs();
    }, []);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Location Logic from reference
        if (name === "country") {
            fetchStates(value);
            setFormData((prev) => ({ ...prev, state: "", city: "" }));
        }
        if (name === "state") {
            fetchCities(value);
            setFormData((prev) => ({ ...prev, city: "" }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openAddModal = () => {
        setFormData({
            stationName: '', captainName: '', email: '',
            password: '', phone: '', address: '',
            country: '', city: '', state: ''
        });
        setImagePreview(null);
        setImageFile(null);
        setStates([]);
        setCities([]);
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            // Find names from IDs for API (Logic from reference)
            const selectedCountry = countries.find((c) => c.id == formData.country);
            const selectedState = states.find((s) => s.id == formData.state);
            const selectedCity = cities.find((c) => c.id == formData.city);

            const data = new FormData();
            // Append all data, overriding ID values with Name strings for backend
            Object.keys(formData).forEach(key => {
                if (key === 'country') data.append(key, selectedCountry?.name || "");
                else if (key === 'state') data.append(key, selectedState?.name || "");
                else if (key === 'city') data.append(key, selectedCity?.name || "");
                else data.append(key, formData[key]);
            });

            if (imageFile) data.append('profileImage', imageFile);

            const res = await AdminAPI2.createFireHQ(data);
            if (res.data.success) {
                toast.success("Headquarter Created!");
                setIsAddModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating HQ");
        }
    };

    const openEditModal = async (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setLoading(true); // Temporary loading for fetching location IDs

        // 1. Find Country ID from Name
        const countryObj = countries.find(c => c.name === item.country);
        let countryId = countryObj ? countryObj.id : '';
        let stateId = '';
        let cityId = '';

        if (countryId) {
            const fetchedStates = await fetchStates(countryId);
            const stateObj = fetchedStates?.find(s => s.name === item.state);
            if (stateObj) {
                stateId = stateObj.id;
                const fetchedCities = await fetchCities(stateId);
                const cityObj = fetchedCities?.find(c => c.name === item.city);
                if (cityObj) cityId = cityObj.id;
            }
        }

        setFormData({
            stationName: item.stationName || '',
            captainName: item.captainName || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            country: countryId,
            state: stateId,
            city: cityId,
            password: '',
        });

        setImagePreview(item.profileImage ? `${BACKEND_URL}/${item.profileImage.replace('public/', '')}` : null);
        setLoading(false);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedCountry = countries.find((c) => c.id == formData.country);
            const selectedState = states.find((s) => s.id == formData.state);
            const selectedCity = cities.find((c) => c.id == formData.city);

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                // If the key is a location, send the name, otherwise send the value
                if (key === 'country') data.append(key, selectedCountry?.name || formData[key]);
                else if (key === 'state') data.append(key, selectedState?.name || formData[key]);
                else if (key === 'city') data.append(key, selectedCity?.name || formData[key]);
                else if (formData[key]) data.append(key, formData[key]);
            });

            if (imageFile) data.append('profileImage', imageFile);

            const res = await AdminAPI2.updateFireHQ(selectedItem._id, data);
            if (res.data.success) {
                toast.success("Headquarter Updated!");
                setIsEditModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const openDeleteModal = (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await AdminAPI2.toggleFireHQStatus(selectedItem._id);
            if (res.data.success) {
                toast.success("Status toggled successfully");
                setIsDeleteModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error("Toggle failed");
        }
    };
    const openInfoModal = (item) => {
        setSelectedItem(item);
        setIsInfoModalOpen(true);
    };

    // ==========================================
    // 🌟 UI HELPERS
    // ==========================================
    const getImgUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150?text=No+Image";
        const cleanPath = path.replace('public/', '');
        return path.startsWith('http') ? path : `${BACKEND_URL}/${cleanPath}`;
    };

    const renderModalForm = (onSubmitHandler, title) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">

                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} Firestation Headquarter
                    </h2>
                    <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-[#fafafa]">
                    <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100">

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Station Name *</label>
                            <div className="relative">
                                <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="stationName" value={formData.stationName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="e.g. Jaipur Main HQ" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Captain Name *</label>
                            <div className="relative">
                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="captainName" value={formData.captainName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="e.g. Rajesh Kumar" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email *</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="hq@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone *</label>
                            <div className="relative">
                                <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="9110022334" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Address</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="Street name, landmark..." />
                            </div>
                        </div>

                        {/* Location Selectors */}
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Country *</label>
                            <div className="relative">
                                <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select name="country" value={formData.country} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] appearance-none">
                                    <option value="">Select Country</option>
                                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">State *</label>
                            <select name="state" value={formData.state} onChange={handleChange} disabled={!formData.country} required className="w-full px-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] disabled:opacity-50">
                                <option value="">Select State</option>
                                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">City *</label>
                            <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state} required className="w-full px-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A] disabled:opacity-50">
                                <option value="">Select City</option>
                                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password {title === 'Edit' && '(Optional)'}</label>
                            <div className="relative">
                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required={title === 'Add'} className="w-full pl-10 pr-4 py-2.5 bg-[#f8fcf9] rounded-xl border border-gray-200 outline-none focus:border-[#08B36A]" placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-gray-700 mb-3">Profile Image</label>
                            <div className="flex items-center gap-5">
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <FaPlus className="text-gray-300" />
                                    )}
                                </div>
                                <input type="file" onChange={handleImageChange} accept="image/*" className="text-xs" />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-center pt-4">
                            <button type="submit" className="px-12 py-3.5 bg-[#08B36A] text-white rounded-xl font-bold uppercase tracking-wider shadow-lg hover:bg-[#069356] transition-all">
                                {title === 'Add' ? 'Register Headquarter' : 'Update Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-4 rounded-xl">
                        <FaFireExtinguisher className="text-[#08B36A] text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Firestation Headquarters</h1>
                        <p className="text-[13px] text-gray-500 font-medium">System Administration & Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-bold rounded-xl transition-all">
                        <FaArrowLeft size={12} /> Back
                    </button>
                    <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-md transition-all uppercase">
                        <FaPlus size={12} /> Add New HQ
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-700">Registered HQs ({headquarters.length})</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Search stations..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#08B36A] text-sm w-full sm:w-64" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-[12px] uppercase text-gray-400 font-bold">
                            <tr>
                                <th className="p-5">Details</th>
                                <th className="p-5">Contact</th>
                                <th className="p-5">Location</th>
                                <th className="p-5 text-center">Image</th>
                                <th className="p-5">Status</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px]">
                            {loading && !isEditModalOpen ? (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-400">Loading Data...</td></tr>
                            ) : headquarters.length > 0 ? (
                                headquarters.map((item) => (
                                    <tr key={item._id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors">
                                        <td className="p-5 cursor-pointer" onClick={() => openInfoModal(item)}>
                                            <p className="font-bold text-gray-800">{item.stationName}</p>
                                            <p className="text-[12px] text-gray-500 flex items-center gap-1"><FaUser size={10} /> {item.captainName}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-gray-700 font-medium">{item.email}</p>
                                            <p className="text-gray-400 text-xs">{item.phone}</p>
                                        </td>
                                        <td className="p-5 capitalize">
                                            <p className="text-gray-600 line-clamp-1">{item.address || 'N/A'}</p>
                                            <p className="text-[11px] font-bold text-gray-400">{item.city}, {item.state}, {item.country}</p>
                                        </td>
                                        <td className="p-5 text-center">
                                            <img src={getImgUrl(item.profileImage)} onClick={(e) => { e.stopPropagation(); setZoomedImage(getImgUrl(item.profileImage)) }} className="w-10 h-10 rounded-lg object-cover mx-auto border shadow-sm cursor-zoom-in" alt="HQ" />
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${item.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={(e) => openEditModal(e, item)} className="p-2 text-amber-500 bg-amber-50 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><FaEdit size={14} /></button>
                                                <button onClick={(e) => openDeleteModal(e, item)} className={`p-2 rounded-lg transition-all ${item.isActive ? 'text-red-500 bg-red-50 hover:bg-red-500' : 'text-green-500 bg-green-50 hover:bg-green-500'} hover:text-white`}>{item.isActive ? <FaTrash size={14} title="Deactivate" /> : <FaPlus size={14} title="Reactivate" />}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-400">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {isAddModalOpen && renderModalForm(handleAddSubmit, 'Add')}
            {isEditModalOpen && renderModalForm(handleEditSubmit, 'Edit')}

            {zoomedImage && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} className="max-w-full max-h-[90vh] object-contain rounded-xl" />
                </div>
            )}

            {isInfoModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsInfoModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
                        <div className="bg-gradient-to-r from-[#08B36A] to-[#047a47] p-8 text-white relative">
                            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-6 right-8 text-white/70 hover:text-white hover:rotate-90 transition-all"><FaTimes size={24} /></button>
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <img src={getImgUrl(selectedItem.profileImage)} className="w-32 h-32 rounded-[2rem] border-4 border-white/20 object-cover shadow-2xl" />
                                <div className="text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <h2 className="text-3xl font-black tracking-tight">{selectedItem.stationName}</h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${selectedItem.isActive ? 'bg-white/20 border-white/40' : 'bg-red-500/20 border-red-500/40'}`}>{selectedItem.isActive ? 'Active HQ' : 'Inactive'}</span>
                                    </div>
                                    <p className="opacity-90 flex items-center gap-2 mt-2 text-lg font-medium justify-center md:justify-start"><FaUser className="text-white/60" /> Captain: {selectedItem.captainName}</p>
                                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                                        <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl text-sm"><FaEnvelope className="text-white/60" /> {selectedItem.email}</span>
                                        <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl text-sm"><FaPhoneAlt className="text-white/60" /> {selectedItem.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                    <h3 className="text-[#08B36A] font-bold flex items-center gap-2 mb-6 uppercase text-xs tracking-widest"><FaMapMarkerAlt /> Geographic Location</h3>
                                    <div className="space-y-4">
                                        <div><p className="text-[10px] text-gray-400 font-black uppercase mb-1">Full Address</p><p className="font-bold text-gray-800 text-sm leading-relaxed">{selectedItem.address || 'N/A'}</p></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><p className="text-[10px] text-gray-400 font-black uppercase mb-1">City</p><p className="font-bold text-gray-800">{selectedItem.city}</p></div>
                                            <div><p className="text-[10px] text-gray-400 font-black uppercase mb-1">State</p><p className="font-bold text-gray-800">{selectedItem.state}</p></div>
                                            <div className="col-span-2"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">Country</p><p className="font-bold text-gray-800">{selectedItem.country}</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                    <h3 className="text-[#08B36A] font-bold flex items-center gap-2 mb-6 uppercase text-xs tracking-widest"><FaChartLine /> Jurisdiction Stats</h3>
                                    <div className="grid grid-cols-2 gap-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#08B36A]"><FaLayerGroup /></div>
                                            <div><p className="text-[10px] text-gray-400 font-black uppercase">Area</p><p className="font-bold text-sm text-gray-800">{selectedItem.jurisdictionStats?.totalArea || 'N/A'}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><FaUsers /></div>
                                            <div><p className="text-[10px] text-gray-400 font-black uppercase">Population</p><p className="font-bold text-sm text-gray-800">{selectedItem.jurisdictionStats?.population || 'N/A'}</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 flex justify-center gap-4">
                            <button onClick={(e) => { setIsInfoModalOpen(false); openEditModal(e, selectedItem); }} className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200">Edit Details</button>
                            <button onClick={() => setIsInfoModalOpen(false)} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${selectedItem.isActive ? 'bg-red-50 border-red-100 text-red-500' : 'bg-green-50 border-green-100 text-green-500'}`}><FaExclamationTriangle size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedItem.isActive ? 'Deactivate' : 'Reactivate'} Station?</h3>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-600">Cancel</button>
                            <button onClick={handleDeleteConfirm} className={`flex-1 py-3 text-white rounded-xl font-bold ${selectedItem.isActive ? 'bg-red-500' : 'bg-green-500'}`}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
