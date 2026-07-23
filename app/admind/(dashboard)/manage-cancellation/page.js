'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaPlus, FaTimes, FaArrowLeft, FaEdit, FaTrash, 
    FaClipboardList, FaPercentage, FaStethoscope,
    FaExclamationTriangle, FaSearch
} from 'react-icons/fa'
import AdminAPI from '@/app/services/AdminAPI'; // Apne folder path ke hisab se modify karein

export default function ManageCancellation() {
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [cancellations, setCancellations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // Store item to edit/delete
    
    // Tabs matching backend schema vendorTypes [15]
    const tabs = [
        { id: 'LAB', label: 'LAB CANCELLATION' },
        { id: 'MEDICINE', label: 'MEDICINE CANCELLATION' },
        { id: 'HOSPITAL', label: 'HOSPITAL CANCELLATION' },
        { id: 'NURSE', label: 'NURSE CANCELLATION' },
        { id: 'DOCTOR', label: 'DOCTOR APPOINTMENT CANCELLATION' },
        { id: 'AMBULANCE', label: 'AMBULANCE CANCELLATION' }
    ];
    
    const [activeTab, setActiveTab] = useState('LAB');

    // Form State (Only fields that are actually being posted to backend)
    const [formData, setFormData] = useState({
        chargeValue: '',
        chargeType: 'Percentage', // 'Percentage' | 'Rupees'
        isActive: true
    });

    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

    // ==========================================
    // 🌟 MAPPING UTILITIES
    // ==========================================
    const mapTabToVendorType = (tabId) => {
        const map = {
            'LAB': 'Lab',
            'MEDICINE': 'Pharmacy',
            'HOSPITAL': 'Hospital',
            'NURSE': 'Nurse',
            'DOCTOR': 'Doctor',
            'AMBULANCE': 'Ambulance'
        };
        return map[tabId] || tabId;
    };

    const mapVendorTypeToTab = (vendorType) => {
        const map = {
            'Lab': 'LAB',
            'Pharmacy': 'MEDICINE',
            'Hospital': 'HOSPITAL',
            'Nurse': 'NURSE',
            'Doctor': 'DOCTOR',
            'Ambulance': 'AMBULANCE'
        };
        return map[vendorType] || 'LAB';
    };

    // ==========================================
    // 🌟 API CALLS
    // ==========================================

    // Fetch active cancellation policies on mount
    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getActivePolicies();
            if (response.success && response.data) {
                setCancellations(response.data.cancellation || []);
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch cancellation policies.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // Helper to display toast/alert messages
    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 5000);
    };

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    
    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ 
            ...formData, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    // Handle Tab Change
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // Open Add Modal
    const openAddModal = () => {
        setFormData({ chargeValue: '', chargeType: 'Percentage', isActive: true });
        setActiveTab('LAB');
        setIsAddModalOpen(true);
    };

    // Submit ADD / UPSERT
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                vendorType: mapTabToVendorType(activeTab),
                chargeType: formData.chargeType,
                chargeValue: Number(formData.chargeValue),
                isActive: formData.isActive
            };

            const response = await AdminAPI.updateCancellationPolicy(payload);
            if (response.success) {
                showAlert('success', response.message || 'Cancellation policy saved successfully.');
                setIsAddModalOpen(false);
                fetchPolicies(); // Table refresh
            } else {
                showAlert('error', response.message || 'Operation failed.');
            }
        } catch (error) {
            showAlert('error', 'Something went wrong while saving the policy.');
        } finally {
            setActionLoading(false);
        }
    };

    // Open EDIT Modal
    const openEditModal = (item) => {
        setSelectedItem(item);
        setActiveTab(mapVendorTypeToTab(item.vendorType));
        setFormData({
            chargeValue: item.chargeValue,
            chargeType: item.chargeType,
            isActive: item.isActive ?? true
        });
        setIsEditModalOpen(true);
    };

    // Submit EDIT / UPSERT
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const payload = {
                vendorType: mapTabToVendorType(activeTab),
                chargeType: formData.chargeType,
                chargeValue: Number(formData.chargeValue),
                isActive: formData.isActive
            };

            const response = await AdminAPI.updateCancellationPolicy(payload);
            if (response.success) {
                showAlert('success', response.message || 'Cancellation policy updated successfully.');
                setIsEditModalOpen(false);
                setSelectedItem(null);
                fetchPolicies(); // Table refresh
            } else {
                showAlert('error', response.message || 'Operation failed.');
            }
        } catch (error) {
            showAlert('error', 'Something went wrong while updating the policy.');
        } finally {
            setActionLoading(false);
        }
    };

    // Open DELETE Modal (Deactivates policy as per upsert structure)
    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    // Confirm DELETE (Sends payload with isActive: false to disable policy)
    const handleDeleteConfirm = async () => {
        setActionLoading(true);
        try {
            const payload = {
                vendorType: selectedItem.vendorType,
                chargeType: selectedItem.chargeType,
                chargeValue: Number(selectedItem.chargeValue),
                isActive: false // Deactivate
            };

            const response = await AdminAPI.updateCancellationPolicy(payload);
            if (response.success) {
                showAlert('success', 'Cancellation policy successfully deactivated.');
                fetchPolicies();
            } else {
                showAlert('error', response.message || 'Failed to deactivate policy.');
            }
        } catch (error) {
            showAlert('error', 'Error while deactivating policy.');
        } finally {
            setActionLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
        }
    };

    // Filter Table based on Search Query
    const filteredCancellations = cancellations.filter(item => 
        item.vendorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chargeType.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        {title === 'Add' ? <FaPlus size={14} /> : <FaEdit size={14} />} {title} Cancellation Rule
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
                                type="button"
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

                    {/* Form Body */}
                    <div className="p-6 md:p-10 flex justify-center">
                        <form onSubmit={onSubmitHandler} className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-6">
                            
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">{tabs.find(t => t.id === activeTab)?.label}</h3>
                                <p className="text-xs text-gray-400 mt-1">Fill the details to {title.toLowerCase()} cancellation policy</p>
                            </div>

                            {/* Service Category Info (Read-only mapped from Active Tab) */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Service Category</label>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={mapTabToVendorType(activeTab) + " Cancellation"}
                                    className="w-full px-4 py-3 bg-slate-100 rounded-xl border border-gray-200 text-[14px] font-bold text-slate-500 outline-none" 
                                />
                            </div>

                            {/* Charges Input */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Cancellation Charges <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaPercentage className="text-gray-400 text-[13px]" />
                                    </div>
                                    <input 
                                        type="number" 
                                        name="chargeValue" 
                                        value={formData.chargeValue} 
                                        onChange={handleChange} 
                                        required
                                        placeholder="e.g. 15 or 150" 
                                        className="w-full pl-10 pr-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-800" 
                                    />
                                </div>
                            </div>

                            {/* Cancellation Charge Type (Percentage / Rupees) */}
                            <div>
                                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Charge Type <span className="text-red-500">*</span></label>
                                <select 
                                    name="chargeType" 
                                    value={formData.chargeType} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full px-4 py-3 bg-[#fafafa] rounded-xl border border-gray-200 focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] outline-none transition-all text-[14px] font-semibold text-gray-600 cursor-pointer"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Rupees">Rupees (₹)</option>
                                </select>
                            </div>

                            {/* Status Toggle Switch */}
                            <div className="flex items-center justify-between p-1 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
                                <span className="text-[13px] font-bold text-gray-700">Policy Active Status</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="isActive" 
                                        checked={formData.isActive} 
                                        onChange={handleChange} 
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08B36A]"></div>
                                </label>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="w-full py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 uppercase tracking-wide disabled:opacity-50"
                                >
                                    {actionLoading ? 'Saving...' : title === 'Add' ? 'Submit' : 'Update'}
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
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 rounded-xl border border-[#08B36A]/20">
                        <FaClipboardList className="text-[#08B36A] text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Manage Cancellation</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Set rules and charges for various cancellations</p>
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

            {/* Alert Message Toast */}
            {alertMessage.text && (
                <div className={`max-w-7xl mx-auto p-4 mb-6 rounded-xl border-l-4 text-sm font-semibold shadow-sm transition-all duration-300 ${
                    alertMessage.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500' 
                        : 'bg-rose-50 text-rose-800 border-rose-500'
                }`}>
                    {alertMessage.text}
                </div>
            )}

            {/* Table Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                
                {/* Search Bar Row */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="text-[14px] font-bold text-slate-500 uppercase tracking-wide">
                        All Configured Services
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]" />
                        <input 
                            type="text" 
                            placeholder="Search service type..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-8 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-[#08B36A]"></div>
                            <span className="text-xs font-semibold text-slate-400">Loading cancellation policies...</span>
                        </div>
                    ) : filteredCancellations.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-[13px] text-gray-500 uppercase tracking-wider">
                                    <th className="p-5 font-bold">S No.</th>
                                    <th className="p-5 font-bold">Cancellation Name</th>
                                    <th className="p-5 font-bold">Charges</th>
                                    <th className="p-5 font-bold">Charge Type</th>
                                    <th className="p-5 font-bold">Status</th>
                                    <th className="p-5 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] text-gray-700">
                                {filteredCancellations.map((item, index) => (
                                    <tr key={item._id || item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 font-medium">{index + 1}</td>
                                        <td className="p-5 font-bold text-gray-800">
                                            {item.vendorType} Cancellation
                                            <span className="block text-[11px] text-[#08B36A] font-semibold mt-0.5">
                                                {item.vendorType.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-5 font-semibold text-[#f2964b]">
                                            {item.chargeValue} {item.chargeType === 'Percentage' ? '%' : '₹'}
                                        </td>
                                        <td className="p-5">
                                            <span className="bg-slate-100 px-3 py-1 rounded-md text-[12px] font-bold text-slate-600">
                                                {item.chargeType}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                item.isActive !== false 
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                                    : 'bg-rose-50 text-rose-800 border border-rose-100'
                                            }`}>
                                                {item.isActive !== false ? 'Active' : 'Deactivated'}
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
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-20 space-y-2">
                            <div className="text-4xl text-slate-300">📁</div>
                            <p className="text-slate-400 font-medium text-sm">No cancellation configurations found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================= */}
            {/* 🌟 ADD & EDIT MODALS                      */}
            {/* ========================================= */}
            {isAddModalOpen && renderModalForm(handleAddSubmit, 'Add')}
            {isEditModalOpen && renderModalForm(handleEditSubmit, 'Edit')}

            {/* ========================================= */}
            {/* 🌟 DEACTIVATE CONFIRMATION POPUP          */}
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
                            Do you really want to deactivate <span className="text-gray-800 font-bold">"{selectedItem?.vendorType} Cancellation"</span>?
                        </p>
                        
                        <div className="flex items-center justify-center gap-3">
                            <button 
                                disabled={actionLoading}
                                onClick={() => setIsDeleteModalOpen(false)} 
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                disabled={actionLoading}
                                onClick={handleDeleteConfirm} 
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {actionLoading ? 'Processing...' : 'Yes, Deactivate'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}