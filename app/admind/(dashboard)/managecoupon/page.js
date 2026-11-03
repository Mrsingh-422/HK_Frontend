'use client'

import AdminAPI from '@/app/services/AdminAPI';
import React, { useState, useEffect, useMemo } from 'react';
import {
    FaPlus, FaTrash, FaEdit, FaTicketAlt,
    FaCalendarAlt, FaShoppingBag, FaTag, FaTimes, FaLayerGroup,
    FaStethoscope, FaUserMd, FaFlask, FaHospital, FaAmbulance, FaCapsules, FaUserNurse, FaPowerOff,
    FaFilter
} from 'react-icons/fa';
import { MdOutlineLocalOffer, MdOutlineAttachMoney } from 'react-icons/md';

// Documented Allowed Vendor Types
const DEFAULT_VENDOR_TYPES = ['Doctor', 'Hospital', 'Ambulance', 'Pharmacy', 'Lab', 'Nurse', 'All'];

const CouponAdmin = () => {
    // States
    const [coupons, setCoupons] = useState([]);
    const [vendorTypes, setVendorTypes] = useState(DEFAULT_VENDOR_TYPES);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedTab, setSelectedTab] = useState('All');

    const [formData, setFormData] = useState({
        vendorType: 'Doctor',
        couponName: '',
        discountPercentage: '',
        maxDiscount: '',
        minOrderAmount: '',
        maxUsagePerUser: '1',
        startDate: '',
        expiryDate: ''
    });

    // Helper to format ISO date strings to YYYY-MM-DD
    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        return isoString.split('T')[0];
    };

    // 1. Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [couponRes, typeRes] = await Promise.allSettled([
                    AdminAPI.adminGetCouponsList(),
                    AdminAPI.adminGetVendorTypes()
                ]);

                if (couponRes.status === 'fulfilled') {
                    setCoupons(couponRes.value?.data || couponRes.value || []);
                }

                if (typeRes.status === 'fulfilled') {
                    const typesFromApi = typeRes.value?.data || typeRes.value || [];
                    if (Array.isArray(typesFromApi) && typesFromApi.length > 0) {
                        const mergedTypes = [...new Set([...typesFromApi, ...DEFAULT_VENDOR_TYPES])];
                        setVendorTypes(mergedTypes);
                    }
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await AdminAPI.adminGetCouponsList();
            setCoupons(res?.data || res || []);
        } catch (error) { 
            console.error("Fetch Coupons Error:", error); 
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'couponName' ? value.toUpperCase().trim() : value 
        }));
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            // Edit Mode
            setEditId(coupon._id || coupon.id);
            setFormData({
                vendorType: coupon.vendorType || 'Doctor',
                couponName: coupon.couponName || '',
                discountPercentage: coupon.discountPercentage || '',
                maxDiscount: coupon.maxDiscount || '',
                minOrderAmount: coupon.minOrderAmount || '',
                maxUsagePerUser: coupon.maxUsagePerUser || '1',
                startDate: formatDateForInput(coupon.startDate),
                expiryDate: formatDateForInput(coupon.expiryDate)
            });
        } else {
            // Create Mode
            setEditId(null);
            setFormData({
                vendorType: 'Doctor',
                couponName: '',
                discountPercentage: '',
                maxDiscount: '',
                minOrderAmount: '',
                maxUsagePerUser: '1',
                startDate: new Date().toISOString().split('T')[0],
                expiryDate: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Exact schema payload per documentation
        const payload = {
            vendorType: formData.vendorType,
            couponName: formData.couponName.trim().toUpperCase(),
            discountPercentage: Number(formData.discountPercentage),
            maxDiscount: Number(formData.maxDiscount),
            minOrderAmount: Number(formData.minOrderAmount),
            maxUsagePerUser: Number(formData.maxUsagePerUser) || 1,
            expiryDate: formData.expiryDate
        };

        if (formData.startDate) {
            payload.startDate = formData.startDate;
        }

        try {
            if (editId) {
                await AdminAPI.adminUpdateCoupon(editId, payload);
                alert("Coupon Updated Successfully!");
            } else {
                await AdminAPI.adminAddCoupon(payload);
                alert("Coupon Created Successfully!");
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            alert(error.response?.data?.message || error.message || "Error saving coupon");
        }
    };

    const handleToggle = async (id) => {
        try {
            await AdminAPI.adminToggleCouponStatus(id);
            fetchCoupons();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await AdminAPI.adminDeleteCoupon(id);
            fetchCoupons();
        } catch (error) {
            alert("Failed to delete coupon");
        }
    };

    // Helper to get Category Icon
    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Doctor': return <FaUserMd />;
            case 'Hospital': return <FaHospital />;
            case 'Ambulance': return <FaAmbulance />;
            case 'Pharmacy': return <FaCapsules />;
            case 'Lab': return <FaFlask />;
            case 'Nurse': return <FaUserNurse />;
            case 'All': return <FaLayerGroup />;
            default: return <FaStethoscope />;
        }
    };

    // Filtered coupons list
    const filteredCoupons = useMemo(() => {
        if (selectedTab === 'All') return coupons;
        return coupons.filter(c => c.vendorType === selectedTab || c.vendorType === 'All');
    }, [coupons, selectedTab]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-gray-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-gray-800 tracking-tight">
                        <FaTicketAlt className="text-[#08b36a]" /> Promotional Coupon Central
                    </h1>
                    <p className="text-gray-500 font-medium text-xs mt-1">Configure discount vouchers across Doctor, Hospital, Ambulance &amp; Services</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_-10px_#08b36a] cursor-pointer"
                >
                    <FaPlus /> Create New Coupon
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="max-w-6xl mx-auto mb-8 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                    <FaFilter size={10} /> Filter:
                </span>
                {['All', 'Doctor', 'Hospital', 'Ambulance', 'Pharmacy', 'Lab', 'Nurse'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedTab(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                            selectedTab === cat
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Coupon Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 text-center py-20 font-bold text-gray-300">Fetching coupons database...</div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <FaTicketAlt className="text-slate-300 text-4xl mx-auto mb-3" />
                        <p className="text-gray-500 font-bold">No coupons found under {selectedTab} category.</p>
                    </div>
                ) : filteredCoupons.map((coupon) => (
                    <div key={coupon._id || coupon.id} className={`flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group transition-all ${!coupon.isActive ? 'opacity-60 grayscale-[0.4]' : ''}`}>

                        {/* Left Section (Visual Discount) */}
                        <div className={`${coupon.isActive !== false ? 'bg-[#08b36a]' : 'bg-gray-400'} w-1/3 p-6 flex flex-col items-center justify-center text-white relative transition-colors`}>
                            <span className="text-[10px] font-black opacity-80 uppercase mb-1 tracking-widest">Discount</span>
                            <div className="text-3xl font-black text-center break-all">
                                {coupon.discountPercentage}%
                            </div>
                            <span className="text-[9px] mt-1.5 opacity-80 uppercase tracking-widest font-black">OFF</span>

                            <div className="absolute -right-3 -top-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                            <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                        </div>

                        {/* Perforation Line */}
                        <div className="border-l-2 border-dashed border-gray-100 relative"></div>

                        {/* Right Section (Data) */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="bg-[#08b36a]/10 text-[#08B36A] text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase flex items-center gap-1.5 border border-[#08B36A]/20">
                                            {getCategoryIcon(coupon.vendorType)} {coupon.vendorType}
                                        </span>
                                        <span className={`text-[9px] font-bold uppercase ${coupon.isActive !== false ? 'text-green-600' : 'text-red-400'}`}>
                                            {coupon.isActive !== false ? '● Active' : '● Inactive'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-mono font-black text-gray-800 tracking-tighter uppercase">
                                        {coupon.couponName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase mt-1">
                                        <FaTag size={8} /> Max Cap: ₹{coupon.maxDiscount}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleToggle(coupon._id || coupon.id)}
                                        className={`p-2 rounded-lg transition-all cursor-pointer ${coupon.isActive !== false ? 'text-amber-500 hover:bg-amber-50' : 'text-[#08b36a] hover:bg-green-50'}`}
                                        title="Toggle Status"
                                    >
                                        <FaPowerOff size={14} />
                                    </button>
                                    <button
                                        onClick={() => openModal(coupon)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                        title="Edit Coupon"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id || coupon.id)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        title="Delete"
                                    >
                                        <FaTrash size={15} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 mt-4 pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <FaShoppingBag size={11} className="text-[#08b36a]" />
                                    <span>Min Spend: <b>₹{coupon.minOrderAmount}</b> &bull; Limit: <b>{coupon.maxUsagePerUser || 1} Use</b></span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <FaCalendarAlt size={11} className="text-[#08b36a]" />
                                    <span>Expires: <b>{new Date(coupon.expiryDate).toLocaleDateString()}</b></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">{editId ? 'Update Coupon' : 'Create New Coupon'}</h2>
                                <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-0.5">Admin Central Configuration</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform bg-white/20 p-2 rounded-full cursor-pointer">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Coupon Code *</label>
                                <div className="relative">
                                    <FaTicketAlt className="absolute left-3.5 top-3.5 text-[#08b36a]" />
                                    <input
                                        name="couponName" 
                                        value={formData.couponName} 
                                        onChange={handleChange} 
                                        required
                                        type="text" 
                                        placeholder="e.g. DOCFIRST50, HOSP20"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-mono font-black text-base uppercase transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Discount (% Rate) *</label>
                                <div className="relative">
                                    <MdOutlineLocalOffer className="absolute left-3.5 top-3.5 text-[#08b36a]" />
                                    <input
                                        name="discountPercentage" 
                                        value={formData.discountPercentage} 
                                        onChange={handleChange} 
                                        required
                                        min="1"
                                        max="100"
                                        type="number" 
                                        placeholder="50"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Max Discount (₹ Cap) *</label>
                                <div className="relative">
                                    <MdOutlineAttachMoney className="absolute left-3.5 top-3.5 text-[#08b36a]" />
                                    <input
                                        name="maxDiscount" 
                                        value={formData.maxDiscount} 
                                        onChange={handleChange} 
                                        required
                                        min="1"
                                        type="number" 
                                        placeholder="200"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Min Order Amount (₹) *</label>
                                <div className="relative">
                                    <MdOutlineAttachMoney className="absolute left-3.5 top-3.5 text-[#08b36a]" />
                                    <input
                                        name="minOrderAmount" 
                                        value={formData.minOrderAmount} 
                                        onChange={handleChange} 
                                        required
                                        min="0"
                                        type="number" 
                                        placeholder="500"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">User Usage Limit</label>
                                <div className="relative">
                                    <FaLayerGroup className="absolute left-3.5 top-3.5 text-[#08b36a]" />
                                    <input
                                        name="maxUsagePerUser" 
                                        value={formData.maxUsagePerUser} 
                                        onChange={handleChange} 
                                        required
                                        min="1"
                                        type="number" 
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-sm"
                                    />
                                </div>
                            </div>

                            {/* Vendor Type Selection with full documentation enum */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">
                                    Applicable Vertical (vendorType) *
                                </label>
                                <select
                                    name="vendorType" 
                                    value={formData.vendorType} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-gray-800 text-sm cursor-pointer"
                                >
                                    {vendorTypes.map((type, idx) => (
                                        <option key={idx} value={type}>
                                            {type === 'All' ? '🌟 All Verticals (Global)' : `${type} Service`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Start Date</label>
                                <input
                                    name="startDate" 
                                    value={formData.startDate} 
                                    onChange={handleChange}
                                    type="date"
                                    className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-xs cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Expiry Date *</label>
                                <input
                                    name="expiryDate" 
                                    value={formData.expiryDate} 
                                    onChange={handleChange} 
                                    required
                                    type="date"
                                    className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold text-xs cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                className="md:col-span-2 bg-[#08b36a] hover:bg-[#079d5d] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-2 shadow-lg transition-all active:scale-95 cursor-pointer text-xs"
                            >
                                {editId ? 'Update Coupon' : 'Publish Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponAdmin;