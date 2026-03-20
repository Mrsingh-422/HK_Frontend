'use client'
import React, { useState } from 'react';
import { 
    FaSearch, FaFilePrescription, FaBoxOpen, 
    FaCheckCircle, FaTimesCircle, FaEye, FaCheck, FaTimes, 
    FaPhoneAlt, FaMapMarkerAlt, FaImage, FaRupeeSign,
    FaExclamationTriangle
} from 'react-icons/fa';

// ==========================================
// 🌟 DUMMY DATA FOR ORDERS 🌟
// ==========================================
const ordersData =[
    {
        orderId: '383220250518210638',
        customerName: 'Aarush',
        address: '55, Jaipur Division, Jaipur, Rajasthan, India 302012',
        phone: '+91 7597272101',
        medicineName: 'Paracetamol 500mg, Vicks Action 500',
        quantity: 2,
        price: '150.00',
        type: 'General',
        status: 'Pending',
        image: null,
        date: '17 Mar 2026, 10:30 AM'
    },
    {
        orderId: '526620250518210638',
        customerName: 'Yash User',
        address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Punjab',
        phone: '+91 9999999999',
        medicineName: 'Diabetes Care Kit, Insulin Syringes',
        quantity: 1,
        price: '850.00',
        type: 'General',
        status: 'Pending',
        image: null,
        date: '17 Mar 2026, 11:15 AM'
    },
    {
        orderId: '942920250518210639',
        customerName: 'Aarush',
        address: '55, Jaipur Division, Jaipur, Rajasthan, India 302012',
        phone: '+91 7597272101',
        medicineName: 'Pending Doctor Verification',
        quantity: 0,
        price: '0.00',
        type: 'Prescription',
        status: 'Pending',
        image: 'https://via.placeholder.com/150/87CEFA/FFFFFF?text=Prescription+1',
        date: '17 Mar 2026, 01:20 PM'
    },
    {
        orderId: '336820241107104000',
        customerName: 'Yash User',
        address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Ropar Division, Punjab',
        phone: '+91 9999999999',
        medicineName: 'Whey Protein 1kg, Multivitamins',
        quantity: 2,
        price: '3400.00',
        type: 'General',
        status: 'Approved',
        image: null,
        date: '16 Mar 2026, 09:00 AM'
    },
    {
        orderId: '736420250518210640',
        customerName: 'Aarush',
        address: '55, Jaipur Division, Jaipur, Rajasthan',
        phone: '+91 7597272101',
        medicineName: 'Invalid Prescription Upload',
        quantity: 0,
        price: '0.00',
        type: 'Prescription',
        status: 'Rejected',
        image: 'https://via.placeholder.com/150/FFB6C1/FFFFFF?text=Blurry+Image',
        date: '15 Mar 2026, 04:10 PM'
    }
];

export default function PharmacyOrdersPage() {
    const [activeTab, setActiveTab] = useState('General');
    const [searchTerm, setSearchTerm] = useState('');
    
    // 🌟 1. Main Info Modal State 🌟
    const[selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🌟 2. Approve Confirmation State 🌟
    const[approvePopupOpen, setApprovePopupOpen] = useState(false);
    const [orderToApprove, setOrderToApprove] = useState(null);

    // 🌟 3. Reject Reason State 🌟
    const[rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [orderToReject, setOrderToReject] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // --- Tab & Search Filter ---
    const filteredOrders = ordersData.filter(order => {
        let tabMatch = false;
        if (activeTab === 'General') tabMatch = order.type === 'General' && order.status === 'Pending';
        else if (activeTab === 'Prescription') tabMatch = order.type === 'Prescription' && order.status === 'Pending';
        else if (activeTab === 'Approved') tabMatch = order.status === 'Approved';
        else if (activeTab === 'Rejected') tabMatch = order.status === 'Rejected';

        const searchMatch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.orderId.includes(searchTerm) ||
                            order.phone.includes(searchTerm);

        return tabMatch && searchMatch;
    });

    // --- Modal Handlers ---
    const openInfoModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeInfoModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedOrder(null), 200);
    };

    // --- Action Initiators (Opens Popups) ---
    const initiateApprove = (e, order) => {
        e.stopPropagation(); // Prevents row click
        setOrderToApprove(order);
        setApprovePopupOpen(true);
    };

    const initiateReject = (e, order) => {
        e.stopPropagation(); // Prevents row click
        setOrderToReject(order);
        setRejectReason('');
        setRejectPopupOpen(true);
    };

    // --- Action Confirmers (Final Action) ---
    const confirmApprove = () => {
        // Here you will call your API to update status
        alert(`Order ID: ${orderToApprove.orderId}\nSuccessfully Approved! ✅`);
        setApprovePopupOpen(false);
        setOrderToApprove(null);
        setIsModalOpen(false); // Close info modal if open
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Please enter a valid reason for rejection.');
            return;
        }
        // Here you will call your API to update status with reason
        alert(`Order ID: ${orderToReject.orderId}\nRejected! ❌\nReason: ${rejectReason}`);
        setRejectPopupOpen(false);
        setOrderToReject(null);
        setRejectReason('');
        setIsModalOpen(false); // Close info modal if open
    };

    const getInitials = (name) => name.substring(0, 2).toUpperCase();

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBoxOpen className="text-[#08B36A]" /> Manage Orders
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Accept, reject and review general & prescription orders.</p>
                </div>
                
                <div className="relative w-full sm:w-72">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Name or Phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* --- 4 TABS NAVIGATION --- */}
            <div className="flex flex-wrap gap-2 sm:gap-4 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                <button 
                    onClick={() => setActiveTab('General')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'General' ? 'bg-[#08B36A] text-white shadow-md shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FaBoxOpen size={16} /> General Orders
                </button>
                <button 
                    onClick={() => setActiveTab('Prescription')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'Prescription' ? 'bg-[#08B36A] text-white shadow-md shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FaFilePrescription size={16} /> Prescription Orders
                </button>
                <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block self-center"></div>
                <button 
                    onClick={() => setActiveTab('Approved')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'Approved' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-emerald-600 hover:bg-emerald-50'}`}
                >
                    <FaCheckCircle size={16} /> Approved
                </button>
                <button 
                    onClick={() => setActiveTab('Rejected')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'Rejected' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'text-red-600 hover:bg-red-50'}`}
                >
                    <FaTimesCircle size={16} /> Rejected
                </button>
            </div>

            {/* --- MAIN DATA TABLE --- */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1050px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="p-4 pl-6">Order Details</th>
                                <th className="p-4">Customer Info</th>
                                <th className="p-4">Medicine & Price</th>
                                <th className="p-4">Delivery Address</th>
                                <th className="p-4 text-center pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order, index) => (
                                    <tr 
                                        key={index} 
                                        onClick={() => openInfoModal(order)} 
                                        className="hover:bg-[#08B36A]/5 transition-all duration-200 group cursor-pointer"
                                    >
                                        <td className="p-4 pl-6">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="font-bold text-gray-800 text-sm">{order.orderId}</span>
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${order.type === 'Prescription' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {order.type}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-semibold">{order.date}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-100 to-[#08B36A]/20 flex items-center justify-center text-[#08B36A] font-bold text-xs shadow-sm">
                                                    {getInitials(order.customerName)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm group-hover:text-[#08B36A] transition-colors">{order.customerName}</span>
                                                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                                                        <FaPhoneAlt size={9}/> {order.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-start gap-3">
                                                {order.image && (
                                                    <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                        <img src={order.image} alt="Prescription" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col max-w-[200px]">
                                                    <span className="text-sm font-semibold text-gray-800 truncate" title={order.medicineName}>
                                                        {order.medicineName}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded">Qty: {order.quantity}</span>
                                                        <span className="text-xs font-bold text-gray-800">₹{order.price}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span className="text-xs text-gray-600 font-medium flex items-start gap-1.5 max-w-[250px] line-clamp-2">
                                                <FaMapMarkerAlt className="text-gray-400 mt-0.5 shrink-0" size={12} /> 
                                                {order.address}
                                            </span>
                                        </td>

                                        {/* Updated Action Buttons */}
                                        <td className="p-4 pr-6" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); openInfoModal(order); }}
                                                    title="View Full Details"
                                                    className="p-2 flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-[#08B36A] rounded-lg transition-all border border-gray-200"
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                                
                                                {order.status === 'Pending' && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => initiateApprove(e, order)}
                                                            className="px-3 py-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-200 text-xs font-bold shadow-sm"
                                                        >
                                                            <FaCheck size={10} /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={(e) => initiateReject(e, order)}
                                                            className="px-3 py-1.5 flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-200 text-xs font-bold shadow-sm"
                                                        >
                                                            <FaTimes size={10} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">
                                        No orders found for this category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 1. ORDER INFORMATION MODAL 🌟           */}
            {/* ========================================== */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedOrder.type === 'Prescription' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-[#08B36A]'}`}>
                                    {selectedOrder.type === 'Prescription' ? <FaFilePrescription size={20} /> : <FaBoxOpen size={20} />}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800 tracking-tight leading-none">Order Details</h2>
                                    <p className="text-xs text-gray-500 font-semibold mt-1">ID: {selectedOrder.orderId}</p>
                                </div>
                            </div>
                            <button onClick={closeInfoModal} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Customer Name</p>
                                        <p className="font-bold text-gray-800 text-sm">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Contact Details</p>
                                        <p className="font-semibold text-blue-600 text-sm flex items-center gap-1.5"><FaPhoneAlt size={12}/> {selectedOrder.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Delivery Address</p>
                                        <p className="font-medium text-gray-700 text-sm leading-relaxed flex items-start gap-1.5">
                                            <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" size={12}/> {selectedOrder.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Items / Medicines</p>
                                        <p className="font-bold text-gray-800 text-sm">{selectedOrder.medicineName}</p>
                                        <div className="flex gap-4 mt-2">
                                            <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md">Qty: {selectedOrder.quantity}</span>
                                            <span className="text-xs font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded-md flex items-center"><FaRupeeSign size={10}/> {selectedOrder.price}</span>
                                        </div>
                                    </div>
                                    {selectedOrder.type === 'Prescription' && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Uploaded Prescription</p>
                                            {selectedOrder.image ? (
                                                <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative group cursor-pointer">
                                                    <img src={selectedOrder.image} alt="Prescription" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300 text-gray-400">
                                                    <FaImage size={24} className="mb-1" />
                                                    <span className="text-xs font-medium">No image provided</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer (Buttons) */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Status: <span className={`ml-1 ${selectedOrder.status === 'Approved' ? 'text-emerald-600' : selectedOrder.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}`}>{selectedOrder.status}</span>
                            </span>
                            
                            <div className="flex gap-2">
                                {selectedOrder.status === 'Pending' ? (
                                    <>
                                        <button 
                                            onClick={(e) => initiateReject(e, selectedOrder)}
                                            className="px-5 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-xs hover:bg-red-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={(e) => initiateApprove(e, selectedOrder)}
                                            className="px-5 py-2.5 bg-[#08B36A] text-white rounded-xl font-bold text-xs hover:bg-[#079b5c] transition-all shadow-md shadow-green-200 flex items-center gap-2"
                                        >
                                            <FaCheck size={12} /> Approve
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={closeInfoModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors">
                                        Close Window
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🌟 2. APPROVE CONFIRMATION POPUP 🌟        */}
            {/* ========================================== */}
            {approvePopupOpen && orderToApprove && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 border border-emerald-100">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <FaCheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Approve Order?</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Are you sure you want to approve Order <br/><span className="font-bold text-gray-700">#{orderToApprove.orderId}</span>?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setApprovePopupOpen(false); setOrderToApprove(null); }}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmApprove}
                                className="flex-1 px-4 py-2.5 bg-[#08B36A] text-white rounded-xl font-bold text-sm hover:bg-[#079b5c] transition-all shadow-md shadow-green-200"
                            >
                                Yes, Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* 🌟 3. REJECT REASON POPUP 🌟               */}
            {/* ========================================== */}
            {rejectPopupOpen && orderToReject && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 border border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center shadow-inner shrink-0">
                                <FaExclamationTriangle size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Reject Order</h2>
                                <p className="text-xs text-gray-500 font-medium">Order #{orderToReject.orderId}</p>
                            </div>
                        </div>
                        
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
                            <textarea 
                                rows="3"
                                placeholder="E.g. Prescription is not clear, Item out of stock..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setRejectPopupOpen(false); setOrderToReject(null); setRejectReason(''); }}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmReject}
                                className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-md shadow-red-200"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}