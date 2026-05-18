'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaSearch, FaBuilding, FaUserTie, FaMapMarkerAlt, 
    FaPhoneAlt, FaPlus, FaEdit, FaTrash, FaTimes, 
    FaEye, FaEyeSlash, FaShieldAlt, FaSpinner
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function ManageFireStationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false); 
    const [isFetching, setIsFetching] = useState(true); 
    const [stations, setStations] = useState([]); 

    // Image Zoom State
    const [zoomedImage, setZoomedImage] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        _id: '',
        stationName: '', 
        stationCode: '', 
        captainName: '', 
        operatingZone: '', 
        email: '', 
        phone: '', 
        landline: '', 
        emergencyLines: '', 
        officeDesk: '', 
        password: '', 
        address: '',
        profileImage: null 
    });

    // ==========================================
    // 🌟 GET FULL IMAGE URL 🌟
    // ==========================================
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
        const cleanPath = imagePath.replace(/^public\//, '');
        if (cleanPath.startsWith('http')) return cleanPath;
        return `${backendUrl}/${cleanPath}`;
    };

    // ==========================================
    // 🌟 FETCH REAL DATA 🌟
    // ==========================================
    const fetchStations = async () => {
        setIsFetching(true);
        try {
            const res = await FireHeadAPI.getAllFireStations();
            if (res.success) setStations(res.data);
        } catch (error) {
            console.error("Error fetching fire stations:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => { fetchStations(); },[]);

    // Search Filter
    const filteredStations = stations.filter(station => 
        (station.stationName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (station.captainName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (station.stationCode?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ==========================================
    // 🌟 MODAL HANDLERS 🌟
    // ==========================================
    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ 
            _id: '', stationName: '', stationCode: '', captainName: '', operatingZone: '', 
            email: '', phone: '', landline: '', emergencyLines: '', 
            officeDesk: '', password: '', address: '', profileImage: null
        });
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const openEditModal = (station) => {
        setIsEditMode(true);
        setFormData({ ...station, password: '', profileImage: null }); 
        setShowPassword(false);
        setIsModalOpen(true);
    };

    // ==========================================
    // 🌟 DELETE STATION 🌟
    // ==========================================
    const handleDelete = async (id, name, e) => {
        if(e) e.stopPropagation(); 
        if(window.confirm(`⚠️ Are you sure you want to PERMANENTLY delete ${name}?`)) {
            try {
                const res = await FireHeadAPI.deleteFireStation(id);
                if(res.success) {
                    setStations(stations.filter(s => s._id !== id));
                    alert(res.message || `${name} deleted successfully!`);
                }
            } catch (error) {
                alert("Failed to delete the station. Please check logs.");
            }
        }
    };

    // ==========================================
    // 🌟 CREATE & UPDATE STATION 🌟
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // ✅ Ab dono POST (Add) aur PUT (Edit) me form-data jayega taaki image upload ho sake
            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === '_id') return; // Don't append _id in body
                
                if (key === 'profileImage' && formData[key]) {
                    submitData.append('profileImage', formData[key]); 
                } else if (key === 'password' && !formData[key]) {
                    return; // Ignore empty password
                } else if (formData[key] !== null && formData[key] !== undefined && key !== 'profileImage') {
                    submitData.append(key, formData[key]); 
                }
            });

            if(isEditMode) {
                const res = await FireHeadAPI.updateFireStation(formData._id, submitData);
                alert(res.message || 'Fire Station updated successfully!');
            } else {
                const res = await FireHeadAPI.registerFireStation(submitData);
                alert(res.message || 'New Fire Station added successfully!');
            }
            
            setIsModalOpen(false);
            fetchStations(); 
            
        } catch (error) {
            console.error("API Error Details:", error.response || error);
            let errorMsg = "Server Error (500). Please check your backend terminal logs.";
            if (error.response?.data) {
                errorMsg = error.response.data.message || error.response.data.error || errorMsg;
            }
            alert(`Failed to save: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFormData({ ...formData, profileImage: e.target.files[0] });

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-10">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">Manage Fire Station</h1>
                    <p className="text-sm text-gray-500 mt-1">Add, update or remove fire stations and their captains.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-200 transition-all text-sm shrink-0">
                    <FaPlus /> Add New Station
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by Station Name, Code or Captain Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none shadow-sm transition-all" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Fire Station</th>
                                <th className="px-6 py-4 font-semibold">Captain Info</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold">Zone / Location</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isFetching && (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-gray-500">
                                        <FaSpinner className="animate-spin text-3xl text-[#08B36A] mx-auto mb-3" />
                                        <p className="font-medium">Fetching Fire Stations...</p>
                                    </td>
                                </tr>
                            )}
                            {!isFetching && filteredStations.map((station) => (
                                <tr key={station._id} onClick={() => openEditModal(station)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {station.profileImage ? (
                                                <img src={getImageUrl(station.profileImage)} alt={station.stationName} className="w-10 h-10 rounded-lg object-cover border border-gray-200 cursor-zoom-in hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); setZoomedImage(getImageUrl(station.profileImage)); }} />
                                            ) : (
                                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-lg border border-red-100 shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors"><FaBuilding /></div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm leading-tight">{station.stationName}</h3>
                                                <p className="text-[11px] text-gray-500 font-bold mt-0.5">Code: {station.stationCode}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FaUserTie className="text-gray-400 mt-0.5" />
                                            <div>
                                                <span className="font-bold text-gray-700 text-sm block">Capt. {station.captainName}</span>
                                                <span className="text-xs text-gray-500">{station.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2"><FaPhoneAlt className="text-green-500 text-xs shrink-0" /><span className="text-sm font-medium text-gray-600">{station.phone}</span></div>
                                            {station.landline && <div className="flex items-center gap-2"><FaPhoneAlt className="text-gray-400 text-xs shrink-0" /><span className="text-[11px] text-gray-500">{station.landline} (LL)</span></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2"><FaShieldAlt className="text-blue-400 shrink-0 text-xs" /><span className="text-sm font-medium text-gray-600 block truncate max-w-[150px]">{station.operatingZone}</span></div>
                                            <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400 shrink-0 text-xs" /><span className="text-[11px] text-gray-500 truncate max-w-[150px] block">{station.address}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(station); }} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100" title="Edit Details"><FaEdit size={16} /></button>
                                            <button onClick={(e) => handleDelete(station._id, station.stationName, e)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100" title="Delete Station"><FaTrash size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isFetching && filteredStations.length === 0 && (
                        <div className="py-16 text-center flex flex-col items-center justify-center text-gray-500 bg-white">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3"><FaBuilding className="text-3xl text-gray-300" /></div>
                            <p className="font-bold text-lg text-gray-800">No Fire Stations Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300" onClick={() => setZoomedImage(null)}>
                    <div className="relative max-w-4xl w-full flex justify-center items-center">
                        <button className="absolute -top-12 right-0 md:-right-10 text-white/70 hover:text-white p-2 transition-colors" onClick={() => setZoomedImage(null)}><FaTimes size={28} /></button>
                        <img src={zoomedImage} alt="Zoomed Profile" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                {isEditMode ? <><FaEdit className="text-blue-500"/> Edit Station Details</> : <><FaPlus className="text-[#08B36A]"/> Add New Station</>}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"><FaTimes size={18} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Fire Station Name</label>
                                        <input type="text" name="stationName" required placeholder="E.g. Jhotwara Fire Station" value={formData.stationName} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Station Code</label>
                                        <input type="text" name="stationCode" required disabled={isEditMode} placeholder="E.g. FS-101" value={formData.stationCode} onChange={handleChange} className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all ${isEditMode ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Captain Name</label>
                                        <input type="text" name="captainName" required placeholder="Enter captain name" value={formData.captainName} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Station Login Email</label>
                                        <input type="email" name="email" required placeholder="Enter email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">{isEditMode ? "New Password (Leave blank to keep old)" : "Login Password"}</label>
                                        <div className="relative">
                                            <input type={showPassword ? "text" : "password"} name="password" required={!isEditMode} placeholder="Set password" value={formData.password} onChange={handleChange} className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Primary Phone</label>
                                        <input type="text" name="phone" required placeholder="Primary Phone number" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Office Landline</label>
                                        <input type="text" name="landline" placeholder="Office landline" value={formData.landline} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Lines</label>
                                        <input type="text" name="emergencyLines" required placeholder="E.g. 101, 112" value={formData.emergencyLines} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Operating Zone</label>
                                        <input type="text" name="operatingZone" required placeholder="Area coverage" value={formData.operatingZone} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Office Desk Number</label>
                                        <input type="text" name="officeDesk" placeholder="E.g. Desk-A1" value={formData.officeDesk} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all" />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Address</label>
                                        <textarea name="address" required rows="2" placeholder="Enter full address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all resize-none"></textarea>
                                    </div>

                                    {/* 🌟 FIXED: IMAGE UPLOAD AB DONO ME DIKHEGA 🌟 */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">
                                            {isEditMode ? "Update Station Image" : "Upload Station Image"}
                                        </label>
                                        <div className="relative">
                                            <input type="file" name="profileImage" onChange={handleFileChange} accept="image/*"
                                                className="w-full px-4 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1">Optional: Upload a profile image.</p>
                                    </div>

                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-[#08B36A] text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md shadow-green-200 disabled:bg-gray-400 flex items-center justify-center min-w-[120px]">
                                    {isLoading ? <FaSpinner className="animate-spin text-lg" /> : (isEditMode ? 'Update Station' : 'Add Station')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}