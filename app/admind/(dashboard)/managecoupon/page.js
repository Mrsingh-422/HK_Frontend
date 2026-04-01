'use client'

import React, { useState } from 'react';
import {
    FaPlus, FaTrash, FaEdit, FaTicketAlt,
    FaCalendarAlt, FaShoppingBag, FaTag, FaTimes, FaCut, FaLayerGroup,
    FaStethoscope, FaUserMd, FaFlask, FaHospital
} from 'react-icons/fa';
import { MdOutlineLocalOffer, MdOutlineAttachMoney } from 'react-icons/md';

const CouponAdmin = () => {
    // Initial State
    const [coupons, setCoupons] = useState([
        {
            id: 1,
            code: 'FLAT500',
            discount: '500',
            minOrder: '2000',
            type: 'Fixed Amount',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            category: 'Nurse'
        },
        {
            id: 2,
            code: 'SAVE20',
            discount: '20',
            minOrder: '1000',
            type: 'Percentage',
            startDate: '2024-05-10',
            endDate: '2024-11-15',
            category: 'Doctor'
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount: '',
        minOrder: '',
        type: 'Percentage',
        startDate: '',
        endDate: '',
        category: 'Nurse'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'code' ? value.toUpperCase() : value });
    };

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditId(coupon.id);
            setFormData({ ...coupon });
        } else {
            setEditId(null);
            setFormData({ code: '', discount: '', minOrder: '', type: 'Percentage', startDate: '', endDate: '', category: 'Nurse' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            setCoupons(coupons.map(c => (c.id === editId ? { ...formData, id: editId } : c)));
        } else {
            setCoupons([...coupons, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    };

    // Helper to get Category Icon
    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Doctor': return <FaUserMd />;
            case 'Lab': return <FaFlask />;
            case 'Hospital': return <FaHospital />;
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
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">

                        {/* Left Section (Visual Discount) */}
                        <div className="bg-[#08b36a] w-1/3 p-6 flex flex-col items-center justify-center text-white relative">
                            <span className="text-sm font-bold opacity-80 uppercase mb-1 tracking-tighter">Value</span>
                            <div className="text-3xl font-black text-center break-all">
                                {coupon.type === 'Percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
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
                                            {getCategoryIcon(coupon.category)} {coupon.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-mono font-black text-gray-800 tracking-tighter uppercase">
                                        {coupon.code}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase mt-1">
                                        <FaTag size={8} /> {coupon.type}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(coupon)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><FaEdit size={16} /></button>
                                    <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><FaTrash size={16} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1 mt-4">
                                <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                                    <FaShoppingBag size={12} className="text-[#08b36a]" />
                                    <span>Min Order: <b>₹{coupon.minOrder}</b></span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                                    <FaCalendarAlt size={12} className="text-[#08b36a]" />
                                    <span>Duration: <b>{coupon.startDate}</b> to <b>{coupon.endDate}</b></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#08b36a] p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black">{editId ? 'Update Coupon' : 'Create Coupon'}</h2>
                                <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-1">Voucher Configuration</p>
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
                                        name="code" value={formData.code} onChange={handleChange} required
                                        type="text" placeholder="E.g. SUMMER50"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-mono font-bold text-lg uppercase transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Discount Value</label>
                                <div className="relative mt-1">
                                    <MdOutlineLocalOffer className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="discount" value={formData.discount} onChange={handleChange} required
                                        type="text" placeholder="e.g. 500 or 20"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Min Order Amount (₹)</label>
                                <div className="relative mt-1">
                                    <MdOutlineAttachMoney className="absolute left-3 top-3 text-[#08b36a]" />
                                    <input
                                        name="minOrder" value={formData.minOrder} onChange={handleChange} required
                                        type="number" placeholder="e.g. 1000"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                                <select
                                    name="category" value={formData.category} onChange={handleChange} required
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold text-gray-700"
                                >
                                    <option value="Nurse">Nurse</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Hospital">Hospital</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Coupon Type</label>
                                <select
                                    name="type" value={formData.type} onChange={handleChange}
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold text-gray-700"
                                >
                                    <option value="Percentage">Percentage (%)</option>
                                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Start Date</label>
                                <input
                                    name="startDate" value={formData.startDate} onChange={handleChange} required
                                    type="date"
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">End Date</label>
                                <input
                                    name="endDate" value={formData.endDate} onChange={handleChange} required
                                    type="date"
                                    className="w-full mt-1 p-2.5 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] rounded-xl outline-none font-semibold"
                                />
                            </div>

                            <button
                                type="submit"
                                className="md:col-span-2 bg-[#08b36a] hover:bg-[#079d5d] text-white py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-lg transition-all active:scale-95"
                            >
                                {editId ? 'Save Changes' : 'Generate Coupon'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponAdmin;