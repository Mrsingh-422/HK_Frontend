'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // <-- Router import kiya
import { 
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash, 
    FaBuilding, FaSearch, FaExclamationTriangle,
    FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaShieldAlt, 
    FaInfoCircle, FaEye, FaUserTie, FaUser, FaPhoneSquare
} from 'react-icons/fa'

export default function ManagePoliceStation() {
    const router = useRouter(); // <-- Router initialize kiya
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const[isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const[isInfoModalOpen, setIsInfoModalOpen] = useState(false); 
    const[zoomedImage, setZoomedImage] = useState(null); 
    const [selectedItem, setSelectedItem] = useState(null); 
    
    // Mock List of Headquarters (For Dropdown in Add/Edit Form)
    const hqList = ['Aryan HQ', 'Karan HQ', 'Delhi Central HQ', 'Mumbai Main HQ'];

    // Form State for Add/Edit
    const [formData, setFormData] = useState({
        stationName: '',
        hqName: '',
        shoName: '',
        username: '',
        email: '',
        phone: '',
        landline: '',
        address: '',
    });

    // Mock Data based on your screenshots
    const [stations, setStations] = useState([
        { 
            id: 1, 
            stationName: "HK Police' Station", 
            hqName: 'Aryan HQ',
            shoName: 'Inspector Mohali',
            username: 'HK P110423',
            email: 'hkpolice@gmail.com', 
            address: 'Tdi City, Sector 117', 
            phone: '1234567890', 
            landline: '0172-12345',
            image: 'https://images.unsplash.com/photo-1555952494-efd681c7e3f9?auto=format&fit=crop&w=800&q=80', 
            caseStatus: '' 
        },
        { 
            id: 2, 
            stationName: 'Naman PS', 
            hqName: 'Karan HQ',
            shoName: 'Inspector Naman',
            username: 'NAMAN_PS_01',
            email: 'naman@gmail.com', 
            address: 'Phase 8, Industrial Area', 
            phone: '9855253670', 
            landline: '0172-98552',
            image: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=800&q=80',
            caseStatus: '' 
        },
        { 
            id: 3, 
            stationName: 'Rajat PS', 
            hqName: 'Karan HQ',
            shoName: 'Inspector Rajat',
            username: 'RAJAT_PS_09',
            email: 'rajat@gmail.com', 
            address: 'Sector 62, Mohali', 
            phone: '9872168323', 
            landline: '0172-98721',
            image: 'https://images.unsplash.com/photo-1541888081622-3860520287ce?auto=format&fit=crop&w=800&q=80',
            caseStatus: '' 
        },
    ]);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    
    const handleChange = (e) => {
        setFormData({ ...formData,[e.target.name]: e.target.value });
    };

    const handleCaseChange = (id, value) => {
        const updatedList = stations.map(item => 
            item.id === id ? { ...item, caseStatus: value } : item
        );
        setStations(updatedList);
    };

    const openAddModal = () => {
        setFormData({ stationName: '', hqName: '', shoName: '', username: '', email: '', phone: '', landline: '', address: '' });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            ...formData,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.stationName}&backgroundColor=08B36A`, 
            caseStatus: ''
        };
        setStations([...stations, newItem]);
        setIsAddModalOpen(false);
    };

    const openEditModal = (e, item) => {
        e.stopPropagation(); 
        setSelectedItem(item);
        setFormData({
            stationName: item.stationName,
            hqName: item.hqName,
            shoName: item.shoName,
            username: item.username,
            email: item.email,
            phone: item.phone,
            landline: item.landline,
            address: item.address,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const updatedList = stations.map(item => {
            if (item.id === selectedItem.id) {
                return { ...item, ...formData };
            }
            return item;
        });
        setStations(updatedList);
        setIsEditModalOpen(false);
        setSelectedItem(null);
    };

    const openDeleteModal = (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const filteredList = stations.filter(item => item.id !== selectedItem.id);
        setStations(filteredList);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    const openInfoModal = (item) => {
        setSelectedItem(item);
        setIsInfoModalOpen(true);
    };

    const handleImageZoom = (e, imageSrc) => {
        e.stopPropagation(); 
        setZoomedImage(imageSrc);
    };

    // ==========================================
    // 🌟 REUSABLE MODAL FORM (ADD/EDIT)
    // ==========================================
    const renderModalForm = (onSubmitHandler, title) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} Police Station
                    </h2>
                    <button 
                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 overflow-y-auto bg-[#fafafa]">
                    <form onSubmit={onSubmitHandler} className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Station Name */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Police Station Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaShieldAlt className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="stationName" value={formData.stationName} onChange={handleChange} required
                                        placeholder="e.g. HK Police Station" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Headquarter Dropdown */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Police Headquarter <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaBuilding className="text-gray-400 text-[13px]" />
                                    </div>
                                    <select 
                                        name="hqName" value={formData.hqName} onChange={handleChange} required
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800 cursor-pointer"
                                    >
                                        <option value="" disabled>Select Headquarter</option>
                                        {hqList.map((hq, idx) => (
                                            <option key={idx} value={hq}>{hq}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* SHO Name */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">SHO Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUserTie className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="shoName" value={formData.shoName} onChange={handleChange} required
                                        placeholder="e.g. Inspector Mohali" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="username" value={formData.username} onChange={handleChange} required
                                        placeholder="e.g. HK_P1104" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} required
                                        placeholder="e.g. ps@gmail.com" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPhoneAlt className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                        placeholder="e.g. 9876543210" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Landline */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">LAN Line Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPhoneSquare className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="landline" value={formData.landline} onChange={handleChange}
                                        placeholder="e.g. 0172-12345" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400 text-[13px]" />
                                    </div>
                                    <textarea 
                                        name="address" value={formData.address} onChange={handleChange} required
                                        placeholder="e.g. Sector 117, Mohali" rows="1"
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800 resize-none min-h-[48px]" 
                                    />
                                </div>
                            </div>

                            {/* Image Upload Mock */}
                            <div className="md:col-span-2 mt-2">
                                <label className="block text-[13px] font-bold text-gray-700 mb-3">Station Image</label>
                                <div className="flex flex-col sm:flex-row items-start gap-5">
                                    <div className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group hover:border-[#08B36A] transition-colors cursor-pointer">
                                        {selectedItem && title === 'Edit' ? (
                                            <img src={selectedItem.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaPlus className="text-gray-300 text-xl mb-1 group-hover:text-[#08B36A]" />
                                                <span className="text-[10px] font-bold px-4 text-center group-hover:text-[#08B36A]">UPLOAD</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <FaEdit className="text-white text-xl" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center h-32">
                                        <button type="button" className="px-5 py-2.5 bg-[#08B36A]/10 text-[#08B36A] font-bold text-[13px] rounded-xl hover:bg-[#08B36A] hover:text-white transition-colors border border-[#08B36A]/20">
                                            Select New Image
                                        </button>
                                        <p className="text-[11px] text-gray-400 mt-2 font-medium">Recommended size: 800x600px.<br/>Max file size: 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                            <button type="submit" className="px-10 py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide">
                                {title === 'Add' ? 'Submit Details' : 'Update Police Station'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* Header Section */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 md:p-4 rounded-xl border border-[#08B36A]/20">
                        <FaShieldAlt className="text-[#08B36A] text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Police Station</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Manage details of all registered police stations</p>
                    </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    {/* 👇 YAHAN GO BACK BUTTON KO FUNCTIONAL BANA DIYA HAI 👇 */}
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#08B36A] text-[#08B36A] hover:bg-[#e6f7eb] text-[13px] font-bold rounded-xl transition-all"
                    >
                        <FaArrowLeft size={12} /> Go Back
                    </button>
                    <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(8,179,106,0.25)] transition-all hover:-translate-y-0.5">
                        <FaPlus size={12} /> Add Police Station
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                
                {/* Search & Entries */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                        Show 
                        <select className="border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-[#08B36A] bg-white cursor-pointer">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select> 
                        entries
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide">
                                <th className="p-5">S No.</th>
                                <th className="p-5">Police Station Name</th>
                                <th className="p-5">Police Headquarter</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5 text-center">Image</th>
                                <th className="p-5 min-w-[140px]">Case</th>
                                <th className="p-5 text-center min-w-[150px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {stations.length > 0 ? (
                                stations.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">
                                        
                                        {/* Clickable TDs (Opens Info Modal) */}
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-500 cursor-pointer">{index + 1}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">{item.stationName}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-semibold text-gray-600 cursor-pointer">
                                            <span className="bg-gray-100 px-3 py-1 rounded-md text-[12px]">{item.hqName}</span>
                                        </td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-600 cursor-pointer">{item.email}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-semibold text-gray-700 cursor-pointer">{item.phone}</td>
                                        
                                        {/* IMAGE TD */}
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.stationName} 
                                                    onClick={(e) => handleImageZoom(e, item.image)}
                                                    className="w-12 h-10 object-cover rounded-md shadow-sm border border-gray-200 hover:scale-110 transition-transform cursor-zoom-in"
                                                    title="Zoom Image"
                                                />
                                            </div>
                                        </td>

                                        {/* Case Status Dropdown */}
                                        <td className="p-5">
                                            <select 
                                                value={item.caseStatus}
                                                onChange={(e) => handleCaseChange(item.id, e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[13px] font-medium text-gray-700 outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] cursor-pointer shadow-sm transition-all"
                                            >
                                                <option value="" disabled>--Case Details--</option>
                                                <option value="Fresh Case">Fresh Case</option>
                                                <option value="Pending Case">Pending Case</option>
                                                <option value="History">History</option>
                                            </select>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center items-center gap-2.5">
                                                {/* Eye / View Button */}
                                                <button onClick={(e) => { e.stopPropagation(); openInfoModal(item); }} className="text-[#08B36A] hover:text-white bg-[#e6f7eb] hover:bg-[#08B36A] p-2 rounded-lg transition-all shadow-sm" title="View Details">
                                                    <FaEye size={14} />
                                                </button>
                                                {/* Edit Button */}
                                                <button onClick={(e) => openEditModal(e, item)} className="text-[#f59e0b] hover:text-white bg-[#fffbeb] hover:bg-[#f59e0b] p-2 rounded-lg transition-all shadow-sm" title="Edit">
                                                    <FaEdit size={14} />
                                                </button>
                                                {/* Delete Button */}
                                                <button onClick={(e) => openDeleteModal(e, item)} className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-lg transition-all shadow-sm" title="Delete">
                                                    <FaTimes size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400 font-medium text-[14px]">
                                        Data Not Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <p className="text-[13px] text-gray-500 font-medium">
                        Showing 1 to {stations.length} of {stations.length} entries
                    </p>
                    <div className="flex items-center gap-1">
                        <button className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 transition-colors">FIRST</button>
                        <button className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 transition-colors">PREVIOUS</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#08B36A] text-white text-[12px] font-bold shadow-md">1</button>
                        <button className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 transition-colors">NEXT</button>
                        <button className="px-3 py-1.5 text-[12px] font-bold text-gray-400 hover:text-gray-700 transition-colors">LAST</button>
                    </div>
                </div>

            </div>

            {/* ========================================= */}
            {/* 🌟 DYNAMIC RENDERING: ADD & EDIT MODALS   */}
            {/* ========================================= */}
            {isAddModalOpen && renderModalForm(handleAddSubmit, 'Add')}
            {isEditModalOpen && renderModalForm(handleEditSubmit, 'Edit')}

            {/* ========================================= */}
            {/* 🌟 IMAGE ZOOM MODAL                       */}
            {/* ========================================= */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setZoomedImage(null)}></div>
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in duration-200">
                        <button 
                            onClick={() => setZoomedImage(null)} 
                            className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors z-20"
                        >
                            <FaTimes size={16} />
                        </button>
                        <img 
                            src={zoomedImage} alt="Zoomed" 
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
                        />
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* 🌟 INFO / VIEW MODAL (2-Column Grid Style)*/}
            {/* ========================================= */}
            {isInfoModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInfoModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaInfoCircle size={16} /> Police Station Details
                            </h2>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => { setIsInfoModalOpen(false); openEditModal(e, selectedItem); }}
                                    className="px-4 py-1.5 bg-[#fffbeb] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white border border-[#f59e0b]/30 text-[12px] font-bold rounded-lg transition-colors"
                                >
                                    Edit Info
                                </button>
                                <button 
                                    onClick={() => setIsInfoModalOpen(false)} 
                                    className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 md:p-10 overflow-y-auto">
                            
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                                <img 
                                    src={selectedItem.image} 
                                    alt={selectedItem.stationName} 
                                    onClick={(e) => handleImageZoom(e, selectedItem.image)} 
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-50 shadow-md cursor-zoom-in hover:opacity-90 transition-opacity"
                                />
                                <div className="text-center sm:text-left mt-2">
                                    <h3 className="text-3xl font-black text-gray-800">{selectedItem.stationName}</h3>
                                    <p className="text-[14px] text-gray-500 font-bold mt-1 flex items-center justify-center sm:justify-start gap-2">
                                        <FaBuilding className="text-[#08B36A]" /> {selectedItem.hqName}
                                    </p>
                                    <div className="mt-3">
                                        <span className={`inline-block px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm ${
                                            selectedItem.caseStatus ? 'bg-[#e6f7eb] text-[#08B36A] border border-[#08B36A]/20' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                        }`}>
                                            Case Status: {selectedItem.caseStatus || 'Not Assigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 2-Column Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                
                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Police Station Name</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaShieldAlt className="text-gray-300"/> {selectedItem.stationName}</p>
                                </div>
                                
                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaEnvelope className="text-gray-300"/> {selectedItem.email}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Police Headquarter Name</p>
                                    <p className="text-[15px] font-bold text-[#08B36A] flex items-center gap-2"><FaBuilding className="text-[#08B36A]/50"/> {selectedItem.hqName}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaMapMarkerAlt className="text-gray-300"/> {selectedItem.address}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">SHO Name</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaUserTie className="text-gray-300"/> {selectedItem.shoName}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Land Line Number</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaPhoneSquare className="text-gray-300"/> {selectedItem.landline}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Username</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaUser className="text-gray-300"/> {selectedItem.username}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaPhoneAlt className="text-gray-300"/> {selectedItem.phone}</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================= */}
            {/* 🌟 DELETE CONFIRMATION POPUP              */}
            {/* ========================================= */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <FaExclamationTriangle className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-[20px] font-bold text-gray-800 mb-2">Are you sure?</h3>
                        <p className="text-[14px] text-gray-500 font-medium mb-8">
                            Do you really want to delete <span className="text-gray-800 font-bold capitalize">"{selectedItem?.stationName}"</span>?
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}