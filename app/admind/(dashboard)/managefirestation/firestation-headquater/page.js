'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash, 
    FaSearch, FaExclamationTriangle, FaEnvelope, 
    FaPhoneAlt, FaMapMarkerAlt, FaInfoCircle, FaEye, 
    FaFireExtinguisher, FaLock
} from 'react-icons/fa'

export default function ManageFirestationHeadquarter() {
    const router = useRouter(); 
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const[isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); 
    const[zoomedImage, setZoomedImage] = useState(null); 
    const [selectedItem, setSelectedItem] = useState(null); 
    
    // Form State for Add/Edit (Strictly matching your Screenshot 3)
    const[formData, setFormData] = useState({
        email: '',
        password: '',
        address: '',
        phone: '',
    });

    // Mock Data based on your screenshots 1 & 2
    const[headquarters, setHeadquarters] = useState([
        { 
            id: 1, 
            email: 'aryan.omninos@gmail.com', 
            password: 'hashed_password_123',
            address: 'mohali', 
            phone: '9876543210', 
            image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80', // Fire related image mock
            caseStatus: '' 
        },
        { 
            id: 2, 
            email: 'dikshant.omninos@gmail.com', 
            password: 'hashed_password_456',
            address: 'chandigarh', 
            phone: '7894561230', 
            image: 'https://images.unsplash.com/photo-1599708153386-62bf21c4b7b0?auto=format&fit=crop&w=800&q=80',
            caseStatus: '' 
        },
    ]);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCaseChange = (id, value) => {
        const updatedList = headquarters.map(item => 
            item.id === id ? { ...item, caseStatus: value } : item
        );
        setHeadquarters(updatedList);
    };

    const openAddModal = () => {
        setFormData({ email: '', password: '', address: '', phone: '' });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            ...formData,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.email}&backgroundColor=08B36A`, 
            caseStatus: ''
        };
        setHeadquarters([...headquarters, newItem]);
        setIsAddModalOpen(false);
    };

    const openEditModal = (e, item) => {
        e.stopPropagation(); 
        setSelectedItem(item);
        setFormData({
            email: item.email,
            password: item.password, // Ideally password is not fetched directly, but for UI mockup we do it
            address: item.address,
            phone: item.phone,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const updatedList = headquarters.map(item => {
            if (item.id === selectedItem.id) {
                return { ...item, ...formData };
            }
            return item;
        });
        setHeadquarters(updatedList);
        setIsEditModalOpen(false);
        setSelectedItem(null);
    };

    const openDeleteModal = (e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const filteredList = headquarters.filter(item => item.id !== selectedItem.id);
        setHeadquarters(filteredList);
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
            <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                    <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} Firestation Headquarter
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
                        
                        <div className="grid grid-cols-1 gap-6">
                            
                            {/* Email */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} required
                                        placeholder="e.g. aryan.omninos@gmail.com" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaLock className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="password" value={formData.password} onChange={handleChange} required
                                        placeholder="Enter secure password" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Address *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="address" value={formData.address} onChange={handleChange} required
                                        placeholder="e.g. Mohali" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone *</label>
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

                            {/* Image Upload Mock */}
                            <div className="mt-2">
                                <label className="block text-[13px] font-bold text-gray-700 mb-3">Image</label>
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
                                            Select Image
                                        </button>
                                        <p className="text-[11px] text-gray-400 mt-2 font-medium">Recommended size: 800x600px.<br/>Max file size: 2MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-center">
                            <button type="submit" className="px-10 py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide">
                                Submit Details
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
                        <FaFireExtinguisher className="text-[#08B36A] text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Firestation Headquarter</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Manage and organize firestation headquarters</p>
                    </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#08B36A] text-[#08B36A] hover:bg-[#e6f7eb] text-[13px] font-bold rounded-xl transition-all"
                    >
                        <FaArrowLeft size={12} /> Go Back
                    </button>
                    <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(8,179,106,0.25)] transition-all hover:-translate-y-0.5 uppercase tracking-wider">
                        Add Firestation Headquarter
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
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide">
                                <th className="p-5">S No.</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Address</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5 text-center">Image</th>
                                <th className="p-5 min-w-[140px]">Case</th>
                                <th className="p-5 text-center min-w-[120px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {headquarters.length > 0 ? (
                                headquarters.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">
                                        
                                        {/* Clickable TDs (Opens Info Modal) */}
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-500 cursor-pointer">{index + 1}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">{item.email}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-600 cursor-pointer capitalize">{item.address}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-semibold text-gray-700 cursor-pointer">{item.phone}</td>
                                        
                                        {/* IMAGE TD */}
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center">
                                                <img 
                                                    src={item.image} 
                                                    alt="HQ" 
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
                                    <td colSpan="7" className="p-8 text-center text-gray-400 font-medium text-[14px]">
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
                        Showing 1 to {headquarters.length} of {headquarters.length} entries
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
            {/* 🌟 INFO / VIEW MODAL                      */}
            {/* ========================================= */}
            {isInfoModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInfoModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaInfoCircle size={16} /> Headquarter Details
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
                        <div className="p-6 md:p-8 overflow-y-auto">
                            
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                                <img 
                                    src={selectedItem.image} 
                                    alt="HQ Profile" 
                                    onClick={(e) => handleImageZoom(e, selectedItem.image)} 
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-50 shadow-md cursor-zoom-in hover:opacity-90 transition-opacity"
                                />
                                <div className="text-center sm:text-left mt-2">
                                    <h3 className="text-2xl font-black text-gray-800 break-all">{selectedItem.email}</h3>
                                    <div className="mt-4">
                                        <span className={`inline-block px-4 py-1.5 rounded-full text-[12px] font-bold shadow-sm ${
                                            selectedItem.caseStatus ? 'bg-[#e6f7eb] text-[#08B36A] border border-[#08B36A]/20' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                        }`}>
                                            Case Status: {selectedItem.caseStatus || 'Not Assigned'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                
                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2"><FaEnvelope className="text-gray-300"/> {selectedItem.email}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Address</p>
                                    <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2 capitalize"><FaMapMarkerAlt className="text-gray-300"/> {selectedItem.address}</p>
                                </div>

                                <div className="flex flex-col border-b border-gray-50 pb-3">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone Number</p>
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
                            Do you really want to delete this headquarter record?
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