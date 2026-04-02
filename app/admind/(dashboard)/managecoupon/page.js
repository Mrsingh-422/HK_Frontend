'use client'

import AdminAPI from '@/app/services/AdminAPI';
import React, { useState, useEffect } from 'react';
import {
    FaPlus, FaTrash, FaEdit, FaTicketAlt,
    FaCalendarAlt, FaShoppingBag, FaTag, FaTimes, FaLayerGroup,
    FaStethoscope, FaUserMd, FaFlask, FaHospital, FaAmbulance, FaCapsules, FaUserNurse, FaPowerOff
} from 'react-icons/fa';
import { MdOutlineLocalOffer, MdOutlineAttachMoney } from 'react-icons/md';

const CouponAdmin = () => {
    // States
    const [coupons, setCoupons] = useState([]);
    const [vendorTypes, setVendorTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        vendorType: '',
        couponName: '',
        discountPercentage: '',
        maxDiscount: '',
        minOrderAmount: '',
        maxUsagePerUser: '1',
        startDate: '',
        expiryDate: ''
    });

    // Helper to format ISO date strings to YYYY-MM-DD for HTML input compatibility
    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        return isoString.split('T')[0];
    };

    // 1. Initial Data Fetch
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [couponRes, typeRes] = await Promise.all([
                    AdminAPI.adminGetCouponsList(),
                    AdminAPI.adminGetVendorTypes()
                ]);

                // Map "data" array from response based on your JSON structure
                setCoupons(couponRes.data || []);

                // Set vendor types and default selection
                const types = typeRes.data || typeRes || [];
                setVendorTypes(types);
                if (types.length > 0) {
                    setFormData(prev => ({ ...prev, vendorType: types[0] }));
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
            setCoupons(res.data || []);
        } catch (error) { console.error(error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'couponName' ? value.toUpperCase() : value });
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            // Edit Mode: Populate form with existing coupon data
            setEditId(coupon._id);
            setFormData({
                vendorType: coupon.vendorType,
                couponName: coupon.couponName,
                discountPercentage: coupon.discountPercentage,
                maxDiscount: coupon.maxDiscount,
                minOrderAmount: coupon.minOrderAmount,
                maxUsagePerUser: coupon.maxUsagePerUser,
                startDate: formatDateForInput(coupon.startDate),
                expiryDate: formatDateForInput(coupon.expiryDate)
            });
        } else {
            // Create Mode: Reset form
            setEditId(null);
            setFormData({
                vendorType: vendorTypes[0] || '',
                couponName: '',
                discountPercentage: '',
                maxDiscount: '',
                minOrderAmount: '',
                maxUsagePerUser: '1',
                startDate: '',
                expiryDate: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                // Call Update API
                await AdminAPI.adminUpdateCoupon(editId, formData);
                alert("Coupon Updated Successfully!");
            } else {
                // Call Add API
                await AdminAPI.adminAddCoupon(formData);
                alert("Coupon Created Successfully!");
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            alert(error.response?.data?.message || "Error saving coupon");
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
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                await AdminAPI.adminDeleteCoupon(id);
                fetchCoupons();
            } catch (error) {
                alert("Failed to delete coupon");
            }
        }
    };

    // Helper to get Category Icon (kept original icons)
    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Doctor': return <FaUserMd />;
            case 'Lab': return <FaFlask />;
            case 'Hospital': return <FaHospital />;
            case 'Pharmacy': return <FaCapsules />;
            case 'Ambulance': return <FaAmbulance />;
            case 'Nurse': return <FaUserNurse />;
            default: return <FaStethoscope />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-10 text-gray-800">
            {/* Header */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-gray-800">
                        <FaTicketAlt className="text-[#08b36a]" /> Coupon Central
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and monitor your promotional codes</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_-10px_#08b36a]"
                >
                    <FaPlus /> Create New Coupon
                </button>
            </div>

            {/* Coupon Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-2 text-center py-20 font-bold text-gray-300">Fetching coupons...</div>
                ) : coupons.map((coupon) => (
                    <div key={coupon._id} className={`flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group transition-all ${!coupon.isActive ? 'opacity-60 grayscale-[0.4]' : ''}`}>

                        {/* Left Section (Visual Discount) */}
                        <div className={`${coupon.isActive ? 'bg-[#08b36a]' : 'bg-gray-400'} w-1/3 p-6 flex flex-col items-center justify-center text-white relative transition-colors`}>
                            <span className="text-sm font-bold opacity-80 uppercase mb-1 tracking-tighter">Value</span>
                            <div className="text-3xl font-black text-center break-all">
                                {coupon.discountPercentage}%
                            </div>
                            <span className="text-[10px] mt-2 opacity-70 uppercase tracking-widest font-bold">OFF</span>

                            <div className="absolute -right-3 -top-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                            <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                        </div>

                        {/* Perforation Line */}
                        <div className="border-l-2 border-dashed border-gray-100 relative"></div>

                        {/* Right Section (Data) */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-[#08b36a]/10 text-[#08b36a] text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                            {getCategoryIcon(coupon.vendorType)} {coupon.vendorType}
                                        </span>
                                        <span className={`text-[9px] font-bold uppercase ${coupon.isActive ? 'text-green-500' : 'text-red-400'}`}>
                                            {coupon.isActive ? '● Active' : '● Inactive'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-mono font-black text-gray-800 tracking-tighter uppercase">
                                        {coupon.couponName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase mt-1">
                                        <FaTag size={8} /> Max Discount: ₹{coupon.maxDiscount}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleToggle(coupon._id)}
                                        className={`p-2 rounded-lg transition-all ${coupon.isActive ? 'text-orange-400 hover:bg-orange-50' : 'text-[#08b36a] hover:bg-green-50'}`}
                                        title="Toggle Status"
                                    >
                                        <FaPowerOff size={14} />
                                    </button>
                                    <button
                                        onClick={() => openModal(coupon)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Edit Coupon"
                                    >
                                        <FaEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1 mt-4">
                                <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                                    <FaShoppingBag size={12} className="text-[#08b36a]" />
                                    <span>Min Order: <b>₹{coupon.minOrderAmount}</b> | Limit: <b>{coupon.maxUsagePerUser} Use</b></span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                                    <FaCalendarAlt size={12} className="text-[#08b36a]" />
                                    <span>Valid: <b>{new Date(coupon.startDate).toLocaleDateString()}</b> to <b>{new Date(coupon.expiryDate).toLocaleDateString()}</b></span>
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
                                <h2 className="text-2xl font-black uppercase">{editId ? 'Update Coupon' : 'Create Coupon'}</h2>
                                <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-1">Global Configuration</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform bg-white/20 p-2 rounded-full">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Coupon Code</label>
                                <div className="relative mt-1">
                                    <FaTicketAlt className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="couponName" value={formData.couponName} onChange={handleChange} required
                                        type="text" placeholder="E.G. NEWYEAR2026"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-mono font-bold text-lg uppercase transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Discount (%)</label>
                                <div className="relative mt-1">
                                    <MdOutlineLocalOffer className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required
                                        type="number" className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Max Discount (₹)</label>
                                <div className="relative mt-1">
                                    <MdOutlineAttachMoney className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="maxDiscount" value={formData.maxDiscount} onChange={handleChange} required
                                        type="number" className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Min Order (₹)</label>
                                <div className="relative mt-1">
                                    <MdOutlineAttachMoney className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} required
                                        type="number" className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">User Limit</label>
                                <div className="relative mt-1">
                                    <FaLayerGroup className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="maxUsagePerUser" value={formData.maxUsagePerUser} onChange={handleChange} required
                                        type="number" className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                                <select
                                    name="vendorType" value={formData.vendorType} onChange={handleChange} required
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold text-gray-700"
                                >
                                    {vendorTypes.map((type, idx) => (
                                        <option key={idx} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Start Date</label>
                                <input
                                    name="startDate" value={formData.startDate} onChange={handleChange} required
                                    type="date"
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">End Date</label>
                                <input
                                    name="expiryDate" value={formData.expiryDate} onChange={handleChange} required
                                    type="date"
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="md:col-span-2 bg-[#08b36a] hover:bg-[#079d5d] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-lg transition-all active:scale-95"
                            >
                                {editId ? 'Update Coupon' : 'Generate Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponAdmin;