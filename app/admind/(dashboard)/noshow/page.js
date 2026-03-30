'use client'
import React, { useState } from 'react'
import { 
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash, 
    FaUserSlash, FaPercentage, FaClock, FaStethoscope,
    FaExclamationTriangle, FaSearch
} from 'react-icons/fa'

export default function ManageNoShow() {
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const[isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); 
    
    // Tabs 
    const tabs =[
        { id: 'LAB', label: 'LAB NO SHOW' },
        { id: 'MEDICINE', label: 'MEDICINE NO SHOW' },
        { id: 'HOSPITAL', label: 'HOSPITAL NO SHOW' },
        { id: 'NURSE', label: 'NURSE NO SHOW' },
        { id: 'DOCTOR', label: 'DOCTOR APPT. NO SHOW' }
    ];
    
    const [activeTab, setActiveTab] = useState('LAB');

    // Form State
    const[formData, setFormData] = useState({
        noShowName: '',
        noShowCharge: '',
        timePeriod: '', 
        noShowType: ''
    });

    // Mock Data
    const[noShows, setNoShows] = useState([
        { id: 1, name: 'lab', charge: '20', timePeriod: '50 Minutes ago', timeType: 'Null', category: 'LAB' },
        { id: 2, name: 'med', charge: '20', timePeriod: 'Null', timeType: 'Driver_Assigned', category: 'MEDICINE' },
        { id: 3, name: 'hos', charge: '20', timePeriod: 'Null', timeType: 'Null', category: 'HOSPITAL' },
        { id: 4, name: 'nurse', charge: '67', timePeriod: 'Null', timeType: 'Appointment_Approved', category: 'NURSE' },
    ]);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    
    const handleChange = (e) => {
        setFormData({ ...formData,[e.target.name]: e.target.value });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setFormData({ noShowName: '', noShowCharge: '', timePeriod: '', noShowType: '' });
    };

    const openAddModal = () => {
        setFormData({ noShowName: '', noShowCharge: '', timePeriod: '', noShowType: '' });
        setActiveTab('LAB');
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            name: formData.noShowName,
            charge: formData.noShowCharge,
            timePeriod: formData.timePeriod || 'Null',
            timeType: formData.noShowType || 'Null',
            category: activeTab
        };
        setNoShows([...noShows, newItem]);
        setIsAddModalOpen(false);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setActiveTab(item.category);
        setFormData({
            noShowName: item.name,
            noShowCharge: item.charge,
            timePeriod: item.timePeriod !== 'Null' ? item.timePeriod : '',
            noShowType: item.timeType !== 'Null' ? item.timeType : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const updatedList = noShows.map(item => {
            if (item.id === selectedItem.id) {
                return {
                    ...item,
                    name: formData.noShowName,
                    charge: formData.noShowCharge,
                    timePeriod: formData.timePeriod || 'Null',
                    timeType: formData.noShowType || 'Null',
                    category: activeTab
                };
            }
            return item;
        });
        setNoShows(updatedList);
        setIsEditModalOpen(false);
        setSelectedItem(null);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const filteredList = noShows.filter(item => item.id !== selectedItem.id);
        setNoShows(filteredList);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    // ==========================================
    // 🌟 REUSABLE MODAL FORM COMPONENT
    // ==========================================
    const renderModalForm = (onSubmitHandler, title) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} No Show Rule
                    </h2>
                    <button 
                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} 
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <div className="overflow-y-auto bg-[#fafafa]">
                    {/* Tabs */}
                    <div className="bg-white px-4 py-4 md:px-8 flex flex-wrap gap-2 md:gap-4 justify-center items-center border-b border-gray-100 sticky top-0 z-10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`px-4 py-2 text-[11px] md:text-[12px] font-bold rounded-full transition-all ${
                                    activeTab === tab.id
                                    ? 'bg-[#08B36A] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Body - Reduced side padding, increased max-w to 2xl */}
                    <div className="p-4 md:p-6 flex justify-center">
                        {/* CHANGED: max-w-md to max-w-2xl for wider form card */}
                        <form onSubmit={onSubmitHandler} className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
                            
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">{tabs.find(t => t.id === activeTab).label}</h3>
                                <p className="text-xs text-gray-400 mt-1">Fill the details to {title.toLowerCase()} no show policy</p>
                            </div>

                            {/* Inputs */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">No Show Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaStethoscope className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="text" name="noShowName" value={formData.noShowName} onChange={handleChange} required
                                        placeholder="e.g. lab, med, hos" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Charges in Percentage/Rupee <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPercentage className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="number" name="noShowCharge" value={formData.noShowCharge} onChange={handleChange} required
                                        placeholder="e.g. 20 or 67" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Only For LAB Tab */}
                            {activeTab === 'LAB' && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Time Period <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FaClock className="text-gray-400 text-[13px]" />
                                        </div>
                                        <input 
                                            type="text" name="timePeriod" value={formData.timePeriod} onChange={handleChange} required
                                            placeholder="e.g. 50 Minutes ago" 
                                            className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Time Type <span className="text-red-500">*</span></label>
                                <select 
                                    name="noShowType" value={formData.noShowType} onChange={handleChange} required
                                    className="w-full px-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-600 cursor-pointer"
                                >
                                    <option value="" disabled>--Select--</option>
                                    <option value="Null">Null</option>
                                    <option value="Driver_Assigned">Driver Assigned</option>
                                    <option value="Appointment_Approved">Appointment Approved</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide">
                                    {title === 'Add' ? 'Submit' : 'Update'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 rounded-xl border border-[#08B36A]/20">
                        <FaUserSlash className="text-[#08B36A] text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Manage No Show</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Configure rules and charges for no-show appointments</p>
                    </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-[#08B36A] text-[#08B36A] hover:bg-[#e6f7eb] text-[13px] font-bold rounded-xl transition-all">
                        <FaArrowLeft size={12} /> Go Back
                    </button>
                    <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(8,179,106,0.25)] transition-all hover:-translate-y-0.5">
                        <FaPlus size={12} /> Add New
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                
                {/* Search & Entries Controls */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                        Show 
                        <select className="border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-[#08B36A]">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select> 
                        entries
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            className="w-full sm:w-64 pl-8 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-[13px] text-gray-500 uppercase tracking-wider">
                                <th className="p-5 font-bold">S No.</th>
                                <th className="p-5 font-bold">No Show Name</th>
                                <th className="p-5 font-bold">Charges (in % or ₹)</th>
                                <th className="p-5 font-bold">Time Period</th>
                                <th className="p-5 font-bold">Time Type</th>
                                <th className="p-5 font-bold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {noShows.length > 0 ? (
                                noShows.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 font-medium">{index + 1}</td>
                                        <td className="p-5 font-bold text-gray-800 capitalize">
                                            {item.name}
                                            <span className="block text-[11px] text-[#08B36A] font-semibold mt-0.5">{item.category}</span>
                                        </td>
                                        <td className="p-5 font-semibold text-[#f2964b]">{item.charge}</td>
                                        <td className="p-5 font-medium text-gray-600">{item.timePeriod}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-md text-[12px] font-bold ${
                                                item.timeType === 'Null' ? 'bg-gray-100 text-gray-500' : 'bg-[#e6f7eb] text-[#08B36A]'
                                            }`}>
                                                {item.timeType}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <button onClick={() => openEditModal(item)} className="text-[#08B36A] hover:text-[#069356] bg-[#e6f7eb] p-2 rounded-lg transition-colors">
                                                    <FaEdit size={14} />
                                                </button>
                                                <button onClick={() => openDeleteModal(item)} className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-lg transition-all">
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium text-[14px]">
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
                        Showing 1 to {noShows.length} of {noShows.length} entries
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
            {/* 🌟 ADD & EDIT MODALS                      */}
            {/* ========================================= */}
            {isAddModalOpen && renderModalForm(handleAddSubmit, 'Add')}
            {isEditModalOpen && renderModalForm(handleEditSubmit, 'Edit')}

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
                            Do you really want to delete <span className="text-gray-800 font-bold capitalize">"{selectedItem?.name}"</span> no show rule?
                        </p>
                        
                        <div className="flex items-center justify-center gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteConfirm} 
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5"
                            >
                                Yes, Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}