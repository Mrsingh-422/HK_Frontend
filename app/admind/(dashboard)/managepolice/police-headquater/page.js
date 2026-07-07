'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash,
    FaSearch, FaExclamationTriangle, FaEnvelope,
    FaPhoneAlt, FaMapMarkerAlt, FaInfoCircle,
    FaShieldAlt, FaLock, FaUser, FaBuilding,
    FaGlobe
} from 'react-icons/fa'

// 🚨 API path check karein
import DiamondAPI from '@/app/services/DiamondAPI'; 
import { useUserContext } from "@/app/context/UserContext";

const toast = {
    success: (msg) => alert("Success: " + msg),
    error: (msg) => alert("Error: " + msg),
};

export default function ManagePoliceHeadquarter() {
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();

    // STATES
    const [headquarters, setHeadquarters] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Modal State
    
    const [zoomedImage, setZoomedImage] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Location Data States
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Form matching your backend schema
    const [formData, setFormData] = useState({
        hqName: '', commissionerName: '', email: '', password: '', 
        phone: '', address: '', country: '', city: '', state: '', lat: 0, lng: 0
    });

    // FETCH LOCATION DATA
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await getAllCountries();
                setCountries(data || []);
            } catch { console.error("Failed to load countries"); }
        };
        fetchCountries();
    }, [getAllCountries]);

    const fetchStates = async (countryId) => {
        try {
            const data = await getStatesByCountry(countryId);
            setStates(data || []);
            setCities([]);
            return data;
        } catch { console.error("Failed to load states"); }
    };

    const fetchCities = async (stateId) => {
        try {
            const data = await getCitiesByState(stateId);
            setCities(data || []);
            return data;
        } catch { console.error("Failed to load cities"); }
    };

    // FETCH POLICE HQ DATA
    const fetchHQs = async () => {
        try {
            setLoading(true);
            const response = await DiamondAPI.getPoliceHQs();
            if (response.success) {
                setHeadquarters(response.data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load police headquarters");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHQs();
    }, []);

    // HANDLERS
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

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
            hqName: '', commissionerName: '', email: '', password: '', phone: '', 
            address: '', country: '', city: '', state: '', lat: 0, lng: 0
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
            const selectedCountry = countries.find((c) => c.id == formData.country);
            const selectedState = states.find((s) => s.id == formData.state);
            const selectedCity = cities.find((c) => c.id == formData.city);

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'country') data.append(key, selectedCountry?.name || "");
                else if (key === 'state') data.append(key, selectedState?.name || "");
                else if (key === 'city') data.append(key, selectedCity?.name || "");
                else data.append(key, formData[key]);
            });

            if (imageFile) data.append('profileImage', imageFile);

            const res = await DiamondAPI.createPoliceHQ(data);
            if (res.success) {
                toast.success("Police Headquarter Created!");
                setIsAddModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error(error.message || "Error creating HQ");
        }
    };

    const openEditModal = async (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setLoading(true); 

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
            hqName: item.hqName || '',
            commissionerName: item.commissionerName || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            country: countryId,
            state: stateId,
            city: cityId,
            lat: item.location?.lat || 0,
            lng: item.location?.lng || 0,
            password: '', 
        });

        setImagePreview(getImgUrl(item.profileImage));
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
                if (key === 'password' && !formData[key]) return; 

                if (key === 'country') data.append(key, selectedCountry?.name || formData[key]);
                else if (key === 'state') data.append(key, selectedState?.name || formData[key]);
                else if (key === 'city') data.append(key, selectedCity?.name || formData[key]);
                else data.append(key, formData[key]);
            });

            if (imageFile) data.append('profileImage', imageFile);

            const res = await DiamondAPI.updatePoliceHQ(selectedItem._id, data);
            if (res.success) {
                toast.success("Police Headquarter Updated!");
                setIsEditModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error(error.message || "Update failed");
        }
    };

    const openDeleteModal = (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const res = await DiamondAPI.togglePoliceHQStatus(selectedItem._id);
            if (res.success) {
                toast.success(res.message);
                setIsDeleteModalOpen(false);
                fetchHQs();
            }
        } catch (error) {
            toast.error("Status toggle failed");
        }
    };

    // Filter data for search
    const filteredHQs = headquarters.filter(hq => 
        hq.hqName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hq.commissionerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Image URL Helper
    const getImgUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150?text=No+Image";
        if (path.startsWith('http')) return path;
        let cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '').replace(/^\//, '');
        const baseUrl = BACKEND_URL.replace(/\/$/, '');
        return `${baseUrl}/${cleanPath}`; 
    };

    // Modal Form (Add/Edit)
    const renderModalForm = (onSubmitHandler, title) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <h2 className="text-[18px] font-bold text-blue-600 flex items-center gap-2">
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} Police Headquarter
                    </h2>
                    <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all">
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto bg-[#fafafa]">
                    <form onSubmit={onSubmitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-gray-100">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Headquarter Name *</label>
                            <div className="relative">
                                <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="hqName" value={formData.hqName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="e.g. State Police HQ" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Commissioner Name *</label>
                            <div className="relative">
                                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="commissionerName" value={formData.commissionerName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="e.g. IPS Rakesh Singh" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email *</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="hq@police.gov.in" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone *</label>
                            <div className="relative">
                                <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="9110022334" />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Address</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="Street name, landmark..." />
                            </div>
                        </div>

                        {/* Location Selectors */}
                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Country *</label>
                            <div className="relative">
                                <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select name="country" value={formData.country} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600 appearance-none">
                                    <option value="">Select Country</option>
                                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">State *</label>
                            <select name="state" value={formData.state} onChange={handleChange} disabled={!formData.country} required className="w-full px-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600 disabled:opacity-50">
                                <option value="">Select State</option>
                                {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">City *</label>
                            <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state} required className="w-full px-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600 disabled:opacity-50">
                                <option value="">Select City</option>
                                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password {title === 'Edit' && '(Optional)'}</label>
                            <div className="relative">
                                <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required={title === 'Add'} className="w-full pl-10 pr-4 py-2.5 bg-[#f4f7fb] rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="••••••••" />
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
                            <button type="submit" className="px-12 py-3.5 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                                {title === 'Add' ? 'Register HQ' : 'Update Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8">
            {/* Page Header */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <FaShieldAlt className="text-blue-600 text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Police Headquarters</h1>
                        <p className="text-[13px] text-gray-500 font-medium">System Administration & Global Control</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-[13px] font-bold rounded-xl transition-all">
                        <FaArrowLeft size={12} /> Back
                    </button>
                    <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl shadow-md shadow-blue-200 transition-all uppercase">
                        <FaPlus size={12} /> Add New HQ
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-700">Registered Police HQs ({filteredHQs.length})</h3>
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            placeholder="Search HQs..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-600 text-sm w-full sm:w-64" 
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-[12px] uppercase text-gray-400 font-bold">
                            <tr>
                                <th className="p-5">HQ Details</th>
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
                            ) : filteredHQs.length > 0 ? (
                                filteredHQs.map((item) => (
                                    <tr 
                                        key={item._id} 
                                        onClick={() => { setSelectedItem(item); setIsInfoModalOpen(true); }} // 🚨 ROW IS NOW CLICKABLE 🚨
                                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-5">
                                            <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.hqName}</p>
                                            <p className="text-[12px] text-gray-500 flex items-center gap-1 mt-1"><FaUser size={10} className="text-blue-400"/> Comm. {item.commissionerName}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-gray-700 font-medium">{item.email}</p>
                                            <p className="text-gray-400 text-xs mt-0.5">{item.phone}</p>
                                        </td>
                                        <td className="p-5 capitalize">
                                            <p className="text-gray-600 line-clamp-1">{item.address || 'N/A'}</p>
                                            <p className="text-[11px] font-bold text-gray-400 mt-0.5">{item.city}, {item.state}, {item.country}</p>
                                        </td>
                                        <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}> 
                                            {/* Stop Propagation to prevent row click when zooming image */}
                                            <img 
                                                src={getImgUrl(item.profileImage)} 
                                                onClick={() => setZoomedImage(getImgUrl(item.profileImage))} 
                                                className="w-10 h-10 rounded-lg object-cover mx-auto border shadow-sm cursor-zoom-in hover:scale-110 transition-transform" 
                                                alt="HQ" 
                                                onError={(e) => e.target.src="https://via.placeholder.com/150?text=No+Image"}
                                            />
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${item.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-5" onClick={(e) => e.stopPropagation()}>
                                            {/* 🚨 FIX: Pass 'e' inside onClick for Edit and Delete */}
                                            <div className="flex justify-center gap-2">
                                                <button onClick={(e) => openEditModal(e, item)} className="p-2 text-amber-500 bg-amber-50 rounded-lg hover:bg-amber-500 hover:text-white transition-all"><FaEdit size={14} /></button>
                                                <button onClick={(e) => openDeleteModal(e, item)} className={`p-2 rounded-lg transition-all ${item.isActive ? 'text-red-500 bg-red-50 hover:bg-red-500' : 'text-green-500 bg-green-50 hover:bg-green-500'} hover:text-white`}>
                                                    {item.isActive ? <FaTrash size={14} title="Deactivate" /> : <FaPlus size={14} title="Reactivate" />}
                                                </button>
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
                    <img src={zoomedImage} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
                </div>
            )}

            {/* 🌟 PREMIUM INFO MODAL 🌟 */}
            {isInfoModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsInfoModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[95vh]">
                        
                        {/* Gradient Header overlapping with Profile Image */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 p-8 text-white relative">
                            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-6 right-8 text-white/70 hover:text-white hover:rotate-90 transition-all">
                                <FaTimes size={24} />
                            </button>
                            
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mt-2">
                                <img 
                                    src={getImgUrl(selectedItem.profileImage)} 
                                    className="w-28 h-28 rounded-2xl border-4 border-white/20 object-cover shadow-2xl bg-white" 
                                    onError={(e) => e.target.src="https://via.placeholder.com/150?text=HQ"}
                                    alt="Profile"
                                />
                                <div className="text-center md:text-left flex-1 mt-2">
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <h2 className="text-3xl font-black tracking-tight">{selectedItem.hqName}</h2>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${selectedItem.isActive ? 'bg-white/20 border-white/40' : 'bg-red-500/20 border-red-500/40'}`}>
                                            {selectedItem.isActive ? 'Active HQ' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="opacity-90 flex items-center gap-2 mt-2 text-base font-medium justify-center md:justify-start">
                                        <FaUser className="text-white/60" /> Commissioner: {selectedItem.commissionerName}
                                    </p>
                                    <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                                        <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl text-xs font-medium"><FaEnvelope className="text-white/60" /> {selectedItem.email}</span>
                                        <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl text-xs font-medium"><FaPhoneAlt className="text-white/60" /> {selectedItem.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Body */}
                        <div className="p-8 overflow-y-auto bg-gray-50/50 custom-scrollbar">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-blue-600 font-bold flex items-center gap-2 mb-6 uppercase text-xs tracking-widest border-b border-slate-50 pb-3">
                                    <FaMapMarkerAlt /> Geographic Location & Operations
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Full Registered Address</p>
                                        <p className="font-bold text-gray-800 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {selectedItem.address || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-50 pt-4 mt-2">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">City</p><p className="font-bold text-gray-800">{selectedItem.city}</p></div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">State</p><p className="font-bold text-gray-800">{selectedItem.state}</p></div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-1 col-span-2"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">Country</p><p className="font-bold text-gray-800">{selectedItem.country}</p></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 mt-2">
                                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100"><p className="text-[10px] text-blue-400 font-black uppercase mb-1">Latitude</p><p className="font-mono text-xs font-bold text-blue-700">{selectedItem.location?.lat || '0.00'}</p></div>
                                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100"><p className="text-[10px] text-blue-400 font-black uppercase mb-1">Longitude</p><p className="font-mono text-xs font-bold text-blue-700">{selectedItem.location?.lng || '0.00'}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-4">
                            <button onClick={() => setIsInfoModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all text-xs uppercase tracking-widest">Close</button>
                            <button onClick={(e) => { setIsInfoModalOpen(false); openEditModal(e, selectedItem); }} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-200 flex items-center gap-2 text-xs uppercase tracking-widest">
                                <FaEdit size={14}/> Edit HQ Data
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-in zoom-in duration-200">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${selectedItem.isActive ? 'bg-red-50 border-red-100 text-red-500' : 'bg-green-50 border-green-100 text-green-500'}`}><FaExclamationTriangle size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedItem.isActive ? 'Deactivate' : 'Reactivate'} HQ?</h3>
                        <p className="text-sm text-slate-500">Are you sure you want to change the status of <b>{selectedItem.hqName}</b>?</p>
                        <div className="flex gap-3 pt-6">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDeleteConfirm} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md hover:-translate-y-0.5 transition-all ${selectedItem.isActive ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}`}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}