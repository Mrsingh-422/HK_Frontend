'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaPhoneAlt, FaMapMarkerAlt, FaEye, FaCheck, FaTimes, 
    FaUser, FaClipboardList, FaImage, FaSpinner, FaExclamationTriangle, 
    FaCheckCircle, FaCreditCard, FaCalendarAlt, FaClock, FaTruck, FaTag,
    FaIdCard, FaMotorcycle, FaGlobe, FaFilePrescription,
    FaSearchPlus, FaSearchMinus, FaRedo, FaExpand, FaCompress, FaExchangeAlt,
    FaUserInjured, FaMoneyBillWave, FaShippingFast, FaStethoscope,
    FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import { toast } from 'react-hot-toast';

export default function OrderTable({ orders = [], refresh, hideActions = false, isPrescription = false }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subTab, setSubTab] = useState('General'); 

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [zoomScale, setZoomScale] = useState(1);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [isImageFocused, setIsImageFocused] = useState(false); 
    
    const [approvePopupOpen, setApprovePopupOpen] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [driversLoading, setDriversLoading] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    useEffect(() => {
        if (approvePopupOpen) {
            fetchAvailableDrivers();
        }
    }, [approvePopupOpen]);

    const fetchAvailableDrivers = async () => {
        setDriversLoading(true);
        try {
            const res = await PharmacyVendorAPI.listAvailableDrivers();
            if (res.success) {
                setDrivers(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching drivers", err);
        } finally {
            setDriversLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [orders, subTab]);

    useEffect(() => {
        setSubTab('General');
    }, [orders]);

    const handleAcceptOnly = async () => {
        setActionLoading(true);
        try {
            const res = await PharmacyVendorAPI.updatePharmacyOrderStatus(selectedOrder._id, 'Placed');
            if (res.success) {
                toast.success("Order accepted successfully!");
                setIsModalOpen(false);
                refresh();
            } else {
                throw new Error(res.message || "Failed to accept order");
            }
        } catch (err) {
            console.error("Accept Error:", err);
            toast.error(err.message || "Error accepting order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDriver = async () => {
        if (!selectedDriverId) return toast.error("Please select a driver");
        setActionLoading(true);
        try {
            if (selectedOrder.driverId) {
                const res = await PharmacyVendorAPI.reassignDriver(selectedOrder._id, selectedDriverId);
                if (res.success) {
                    toast.success("Order reassigned successfully");
                }
            } else {
                const assignRes = await PharmacyVendorAPI.assignManualDriver(selectedOrder._id, selectedDriverId);
                if (assignRes.success) {
                    toast.success("Driver assigned successfully!");
                }
            }
            setApprovePopupOpen(false);
            setIsModalOpen(false);
            setSelectedDriverId(null);
            refresh();
        } catch (err) { 
            console.error("Assignment Error:", err);
            toast.error(err.message || "Error in driver assignment process"); 
        } finally { 
            setActionLoading(false); 
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error("Reason required");
        setActionLoading(true);
        try {
            const res = await PharmacyVendorAPI.updatePharmacyOrderStatus(selectedOrder._id, 'Rejected');
            if (res.success) {
                toast.success("Order Rejected");
                setRejectPopupOpen(false);
                setIsModalOpen(false);
                refresh();
            }
        } catch (err) { 
            toast.error("Error rejecting order"); 
        } finally { 
            setActionLoading(false); 
        }
    };

    const getImgUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (path.startsWith('http')) return path;
        const cleanPath = path.replace(/^public\//, '');
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

    const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.5, 0.5));
    const handleResetZoom = () => setZoomScale(1);

    const handleWheel = (e) => {
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="p-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                No orders found
            </div>
        );
    }

    const hasApprovedOrAccepted = orders.some(o => ['Accepted', 'Approved', 'Shipped', 'Delivered'].includes(o.status));
    const isOnlyPlacedContext = orders.every(o => o.status === 'Placed');

    const isPriorityOrder = (order) => {
        return (order.billSummary?.rapidDeliveryCharge > 0) || (order.isPriority === true) || (order.isRapid === true);
    };

    const generalPlacedCount = orders.filter(o => o.status === 'Placed' && !isPriorityOrder(o)).length;
    const priorityPlacedCount = orders.filter(o => o.status === 'Placed' && isPriorityOrder(o)).length;

    const generalApprovedCount = orders.filter(o => o.status !== 'Placed' && !isPriorityOrder(o)).length;
    const priorityApprovedCount = orders.filter(o => o.status !== 'Placed' && isPriorityOrder(o)).length;

    const displayedOrders = orders.filter((order) => {
        const isPriority = isPriorityOrder(order);
        if (isOnlyPlacedContext) {
            return subTab === 'Priority' ? isPriority : !isPriority;
        }
        if (hasApprovedOrAccepted) {
            if (order.status === 'Placed') return false; 
            return subTab === 'Priority' ? isPriority : !isPriority;
        }
        return true; 
    });

    const totalItems = displayedOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = displayedOrders.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="w-full overflow-hidden rounded-[32px] border border-emerald-50 bg-white">
            
            {/* Placed Tab Context Sub-Tabs Filter */}
            {isOnlyPlacedContext && (
                <div className="flex gap-4 p-5 bg-slate-50/50 border-b border-slate-100 justify-start">
                    <button 
                        onClick={() => setSubTab('General')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            subTab === 'General'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'
                        }`}
                    >
                        <span>General Placed</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            subTab === 'General' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {generalPlacedCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setSubTab('Priority')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            subTab === 'Priority'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                        <span>Priority Placed</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            subTab === 'Priority' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {priorityPlacedCount}
                        </span>
                    </button>
                </div>
            )}

            {/* Approved Context Sub-Tabs Filter */}
            {hasApprovedOrAccepted && !isOnlyPlacedContext && (
                <div className="flex gap-4 p-5 bg-slate-50/50 border-b border-slate-100 justify-start">
                    <button 
                        onClick={() => setSubTab('General')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            subTab === 'General'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'
                        }`}
                    >
                        <span>General Approved</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            subTab === 'General' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {generalApprovedCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setSubTab('Priority')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            subTab === 'Priority'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                        <span>Priority Approved</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            subTab === 'Priority' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                            {priorityApprovedCount}
                        </span>
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b text-[10px] uppercase tracking-widest text-slate-400 font-black">
                            <th className="p-5 pl-8">Order ID</th>
                            <th className="p-5">Customer</th>
                            {isPrescription ? <th className="p-5">Rx</th> : null}
                            <th className="p-5">Driver</th>
                            <th className="p-5">Bill</th>
                            <th className="p-5">Location</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right pr-8">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={isPrescription ? 8 : 7} className="p-10 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                                    No {subTab.toLowerCase()} orders found
                                </td>
                            </tr>
                        ) : (
                            paginatedOrders.map((order) => {
                                const isDriverAssignable = order.status === 'Placed'; 
                                
                                const comboItem = order.items?.find(item => item.isComboApplied && item.comboOfferId);
                                const comboRuleText = comboItem 
                                    ? `Buy ${comboItem.comboOfferId.buyQty} Get ${comboItem.comboOfferId.getFreeQty} Free`
                                    : null;

                                return (
                                    <tr key={order._id} className="hover:bg-emerald-50/30 transition-all cursor-pointer group" onClick={() => { 
                                        setSelectedOrder(order); 
                                        setZoomScale(1); 
                                        setActiveImgIndex(0); 
                                        setIsImageFocused(false);
                                        setIsModalOpen(true); 
                                        if (isDriverAssignable && !order.driverId) {
                                            setApprovePopupOpen(true);
                                        }
                                    }}>
                                        <td className="p-5 pl-8">
                                            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                <span className="font-black text-slate-700 text-sm">{order.orderId}</span>
                                                {order.hasComboApplied && (
                                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-500 text-white uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
                                                        <FaTag size={8} /> BOGO APPLIED
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                {comboRuleText && (
                                                    <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                        <span>★ {comboRuleText}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-[10px]">{getInitials(order.userId?.name)}</div>
                                                <div className="font-black text-slate-700 text-xs truncate max-w-[120px]">{order.userId?.name}</div>
                                            </div>
                                        </td>
                                        {isPrescription ? (
                                            <td className="p-5">
                                                {order.prescriptionImages?.length > 0 ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                                        <img src={getImgUrl(order.prescriptionImages[0])} className="w-full h-full object-cover" alt="Rx" />
                                                    </div>
                                                ) : (
                                                    <FaFilePrescription className="text-slate-200" size={18} />
                                                )}
                                            </td>
                                        ) : null}
                                        <td className="p-5">
                                            {order.driverId?.name ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                        <FaMotorcycle size={11} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-700 text-xs truncate max-w-[110px]">
                                                            {order.driverId.name}
                                                        </span>
                                                        {order.driverId.phone && (
                                                            <span className="text-[9px] text-slate-400 font-bold">
                                                                {order.driverId.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold italic uppercase tracking-wider">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5">
                                            <div className="text-sm font-black text-slate-800 whitespace-nowrap">₹{order.billSummary?.totalAmount}</div>
                                        </td>
                                        <td className="p-5">
                                            <div className="text-[10px] text-slate-500 font-bold truncate max-w-[100px] uppercase tracking-tighter">
                                                {order.address?.city || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                order.status === 'Delivered' ? 'bg-blue-50 text-blue-600' :
                                                order.status === 'Rejected' ? 'bg-rose-50 text-rose-500' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-5 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => { 
                                                setSelectedOrder(order); 
                                                setIsModalOpen(true); 
                                                if (isDriverAssignable && !order.driverId) {
                                                    setApprovePopupOpen(true);
                                                }
                                            }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors"><FaEye size={12}/></button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION SYSTEM --- */}
            {totalItems > itemsPerPage && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-700">{Math.min(startIndex + 1, totalItems)}</span> to{' '}
                        <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
                        <span className="font-bold text-slate-700">{totalItems}</span> entries
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 transition-all active:scale-95"
                        >
                            <FaChevronLeft size={10} />
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === pageNumber
                                            ? 'bg-[#08B36A] text-white shadow-sm shadow-green-100'
                                            : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 disabled:opacity-40 transition-all active:scale-95"
                        >
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODAL: ORDER DETAILS --- */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
                    <div className={`bg-white rounded-[40px] w-full ${selectedOrder.prescriptionImages?.length > 0 ? 'max-w-6xl' : 'max-w-4xl'} overflow-hidden flex flex-col max-h-[95vh] shadow-2xl relative`}>
                        
                        {/* Header */}
                        <div className="p-6 bg-slate-50 flex justify-between items-center border-b z-[10]">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                        Order Detail <span className="text-emerald-600">#{selectedOrder.orderId}</span>
                                        {selectedOrder.isRapid && <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-600 text-[10px] rounded-full animate-pulse">RAPID</span>}
                                        {selectedOrder.hasComboApplied && (
                                            <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] rounded-full font-black tracking-wide flex items-center gap-1 animate-pulse">
                                                <FaTag size={8} /> BOGO APPLIED
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {selectedOrder.orderType} | {selectedOrder.status} | {selectedOrder.collectionType}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {selectedOrder.prescriptionImages?.length > 0 && (
                                    <button onClick={() => setIsImageFocused(!isImageFocused)} className={`p-3 rounded-full transition-all border ${isImageFocused ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                                        {isImageFocused ? <FaCompress size={18} /> : <FaExpand size={18} />}
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-300 hover:text-rose-500 border transition-all"><FaTimes size={20} /></button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar relative" onWheel={handleWheel}>
                            
                            {isImageFocused && selectedOrder.prescriptionImages?.length > 0 && (
                                <div className="absolute inset-0 z-[50] bg-white flex flex-col p-6 animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Inspection Mode</p>
                                        <div className="flex gap-2">
                                            <button onClick={handleZoomOut} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaSearchMinus /></button>
                                            <button onClick={handleResetZoom} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaRedo /></button>
                                            <button onClick={handleZoomIn} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaSearchPlus /></button>
                                            <button onClick={() => setIsImageFocused(false)} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg ml-4 font-bold text-xs flex items-center gap-2 uppercase tracking-widest"><FaCompress /> Exit</button>
                                        </div>
                                    </div>
                                    <div className="flex-grow bg-slate-50 rounded-[32px] overflow-auto flex items-center justify-center border-4 border-slate-100 cursor-all-scroll">
                                        <img src={getImgUrl(selectedOrder.prescriptionImages?.[activeImgIndex])} style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-out' }} className="max-w-full max-h-full object-contain" alt="Focus Rx" />
                                    </div>
                                </div>
                            )}

                            <div className={`grid grid-cols-1 ${selectedOrder.prescriptionImages?.length > 0 ? 'lg:grid-cols-12' : 'lg:grid-cols-2'} gap-10`}>
                                
                                {/* Left Column: Prescription */}
                                {selectedOrder.prescriptionImages?.length > 0 && (
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><FaImage /> Prescription Magnifier</p>
                                            <div className="flex gap-2">
                                                <button onClick={handleZoomOut} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 shadow-sm"><FaSearchMinus /></button>
                                                <button onClick={handleResetZoom} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 shadow-sm"><FaRedo /></button>
                                                <button onClick={handleZoomIn} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 shadow-sm"><FaSearchPlus /></button>
                                            </div>
                                        </div>
                                        <div className="relative w-full aspect-[4/5] bg-slate-100 rounded-[32px] border-4 border-white shadow-inner overflow-auto flex items-center justify-center cursor-zoom-in group" onClick={() => setIsImageFocused(true)}>
                                            <div className="w-full h-full transition-transform duration-200 ease-out flex items-center justify-center" style={{ transform: `scale(${zoomScale})` }}>
                                                <img src={getImgUrl(selectedOrder.prescriptionImages?.[activeImgIndex])} className="max-w-full max-h-full object-contain" alt="Prescription" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"><FaExpand /> Focus Mode</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto py-2">
                                            {selectedOrder.prescriptionImages?.map((img, idx) => (
                                                <button key={idx} onClick={() => { setActiveImgIndex(idx); setZoomScale(1); }} className={`w-20 h-20 rounded-2xl overflow-hidden border-4 shrink-0 transition-all ${activeImgIndex === idx ? 'border-emerald-500 scale-105' : 'border-white opacity-60'}`}><img src={getImgUrl(img)} className="w-full h-full object-cover" /></button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Info Column */}
                                <div className={`${selectedOrder.prescriptionImages?.length > 0 ? 'lg:col-span-5' : 'lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8'} space-y-8`}>
                                    
                                    {/* Patient Details */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-4 flex items-center gap-2"><FaUserInjured /> Patient Information</p>
                                            {selectedOrder.patients?.map((patient, pIdx) => (
                                                <div key={pIdx} className="space-y-2 border-b border-blue-100/50 pb-2 last:border-b-0 last:pb-0">
                                                    <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100 uppercase">{patient.gender}</span>
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100 uppercase">{patient.age} Years</span>
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-blue-600 border border-blue-100 uppercase">{patient.relation}</span>
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 font-bold tracking-tight">
                                                        Patient ID: {patient.patientId || 'N/A'} | System ID: {patient._id || 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Customer Account */}
                                        {selectedOrder.userId && (
                                            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><FaUser /> Customer Account Detail</p>
                                                <div className="text-xs text-slate-700 font-semibold space-y-1">
                                                    <div>Account Holder: <span className="text-slate-900 font-black">{selectedOrder.userId.name}</span></div>
                                                    <div>Account Mobile: <span className="text-slate-900 font-black">{selectedOrder.userId.phone}</span></div>
                                                    <div className="text-[9px] text-slate-400 uppercase mt-2">Account ID: {selectedOrder.userId._id}</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivery Contact */}
                                        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><FaTruck /> Delivery Contact & Address</p>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">Recipient: {selectedOrder.address?.name || 'N/A'}</p>
                                                    <p className="text-xs font-bold text-emerald-600">Phone: {selectedOrder.address?.phone || 'N/A'}</p>
                                                </div>
                                                <div className="pt-3 border-t border-slate-200">
                                                    <div className="text-xs font-bold text-slate-600 leading-relaxed uppercase space-y-1">
                                                        <p><FaMapMarkerAlt className="inline mr-1 text-emerald-400" />
                                                            {selectedOrder.address?.houseNo}, {selectedOrder.address?.sector ? `Sector ${selectedOrder.address?.sector},` : ''} 
                                                        </p>
                                                        {selectedOrder.address?.landmark && <p className="text-slate-500 font-semibold italic text-[11px]">Landmark: {selectedOrder.address.landmark}</p>}
                                                        <p>{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</p>
                                                        <p className="flex items-center gap-1"><FaGlobe className="text-slate-300" size={10} /> {selectedOrder.address?.country || 'India'}</p>
                                                    </div>
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black rounded uppercase tracking-widest">{selectedOrder.address?.addressType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logistics & Payment */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FaMoneyBillWave /> Payment</p>
                                                <p className="text-xs font-black text-slate-700">{selectedOrder.paymentMethod}</p>
                                                <p className={`text-[9px] font-bold uppercase ${selectedOrder.paymentStatus === 'Pending' ? 'text-emerald-500' : 'text-emerald-500'}`}>{selectedOrder.paymentStatus}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FaShippingFast /> Delivery</p>
                                                <p className="text-xs font-black text-slate-700 truncate">{selectedOrder.deliveryStatus}</p>
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase">{selectedOrder.collectionType}</p>
                                            </div>
                                        </div>

                                        {/* Slot Timing */}
                                        <div className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100"><FaCalendarAlt /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-emerald-600 uppercase">Scheduled Slot</p>
                                                    <p className="text-xs font-black text-slate-800">{new Date(selectedOrder.appointmentDate).toLocaleDateString()} at {selectedOrder.appointmentTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items & Packing Instructions */}
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                                                <FaClipboardList /> Order Items ({selectedOrder.items?.length || 0})
                                            </p>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                                                {selectedOrder.items?.map((item, idx) => {
                                                    const paidQty = item.isComboApplied ? item.quantity - (item.freeQuantity || 0) : item.quantity;
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`flex flex-col p-4 rounded-2xl border transition-all ${
                                                                item.isComboApplied 
                                                                    ? "bg-emerald-50/20 border-emerald-100 shadow-[0_4px_16px_rgba(8,179,106,0.03)]" 
                                                                    : "bg-white border-slate-100"
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-xs font-black text-slate-800">{item.name}</p>
                                                                        {item.isComboApplied && (
                                                                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase rounded tracking-wider flex items-center gap-1">
                                                                                <FaTag size={6} /> COMBO
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex gap-2 items-center mt-1">
                                                                        <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                        <p className="text-[10px] text-slate-400 font-bold">MRP: ₹{item.mrp || item.price}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm font-black text-slate-800 whitespace-nowrap ml-2">
                                                                    ₹{item.price * paidQty}
                                                                </div>
                                                            </div>

                                                            {/* COMBO CAMPAIGN AND PACKING SPECIFICS */}
                                                            {item.isComboApplied && (
                                                                <div className="mt-2.5 p-3 bg-white rounded-xl border border-emerald-100/50 space-y-1 text-[10px]">
                                                                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 uppercase tracking-wide">
                                                                        <span>Campaign: {item.comboOfferId?.campaignDisplayName || "BOGO Offer"}</span>
                                                                    </div>
                                                                    <p className="text-slate-500 font-semibold">
                                                                        Rule Details: Buy {item.comboOfferId?.buyQty || 2} Get {item.comboOfferId?.getFreeQty || 1} Free
                                                                    </p>
                                                                    <div className="text-[9px] font-bold text-emerald-800 bg-emerald-50/50 p-2 rounded border border-emerald-100/30 mt-1">
                                                                        📦 Pack Instructions: Pack {item.quantity} units total ({paidQty} Paid + {item.freeQuantity || 0} Free)
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bill Summary Block */}
                                        <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                                            <p className="text-[10px] font-black uppercase mb-4 flex items-center gap-2 opacity-80"><FaCreditCard /> Bill Summary</p>
                                            <div className="space-y-2 text-xs font-bold">
                                                {selectedOrder.billSummary?.originalItemTotal !== undefined ? (
                                                    <>
                                                        <div className="flex justify-between opacity-75 text-[11px]">
                                                            <span>Original Items Total</span>
                                                            <span className="line-through">₹{selectedOrder.billSummary.originalItemTotal}</span>
                                                        </div>
                                                        {selectedOrder.billSummary.comboSavings > 0 && (
                                                            <div className="flex justify-between text-emerald-200 text-[11px] font-bold">
                                                                <span>Combo Promotion Savings</span>
                                                                <span>- ₹{selectedOrder.billSummary.comboSavings}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between opacity-90 border-b border-emerald-500/30 pb-2">
                                                            <span>Net Items Total</span>
                                                            <span>₹{selectedOrder.billSummary.itemTotal || 0}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex justify-between opacity-90 border-b border-emerald-500/30 pb-2">
                                                        <span>Item Total</span>
                                                        <span>₹{selectedOrder.billSummary?.itemTotal || 0}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between opacity-90 pt-1"><span>Delivery Charges</span><span>₹{selectedOrder.billSummary?.deliveryCharge || 0}</span></div>
                                                {selectedOrder.billSummary?.rapidDeliveryCharge > 0 && <div className="flex justify-between opacity-90"><span>Rapid Charge</span><span>₹{selectedOrder.billSummary?.rapidDeliveryCharge}</span></div>}
                                                <div className="flex justify-between opacity-90"><span>Slot Surcharge</span><span>₹{selectedOrder.billSummary?.slotCharge || 0}</span></div>
                                                {selectedOrder.billSummary?.couponDiscount > 0 && (
                                                    <div className="flex flex-col gap-0.5 pt-1">
                                                        <div className="flex justify-between text-emerald-200">
                                                            <span>Coupon Discount</span>
                                                            <span>- ₹{selectedOrder.billSummary?.couponDiscount}</span>
                                                        </div>
                                                        {selectedOrder.billSummary?.couponId && (
                                                            <div className="text-[8px] text-emerald-100 font-normal tracking-tight">Coupon ID: {selectedOrder.billSummary.couponId}</div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="pt-4 border-t border-emerald-500 mt-2 flex justify-between items-center">
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Grand Total</span>
                                                    <span className="text-3xl font-black">₹{selectedOrder.billSummary?.totalAmount || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assigned Driver Display */}
                                        {selectedOrder.driverId ? (
                                            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 shadow-sm animate-in fade-in">
                                                <div className="flex justify-between items-center mb-6">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                        <FaTruck /> Assigned Driver
                                                    </p>
                                                    {['Accepted', 'Shipped', 'Placed'].includes(selectedOrder.status) && (
                                                        <button onClick={() => setApprovePopupOpen(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                                                            <FaExchangeAlt size={10} /> Reassign
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {selectedOrder.driverId.profilePic ? (
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                                                            <img src={getImgUrl(selectedOrder.driverId.profilePic)} alt="Driver Profile" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm font-black text-xl shrink-0">
                                                            {getInitials(selectedOrder.driverId.name)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-black text-blue-800 truncate">{selectedOrder.driverId.name}</p>
                                                        <p className="text-[11px] font-bold text-blue-400">{selectedOrder.driverId.phone}</p>
                                                        <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-gray-500 uppercase">
                                                            <FaIdCard size={10} className="text-blue-300" /> {selectedOrder.driverId.vehicleNumber}
                                                        </div>
                                                        <div className="text-[8px] text-gray-400 mt-1 font-semibold italic">Driver ID: {selectedOrder.driverId._id}</div>
                                                    </div>
                                                </div>
                                                {selectedOrder.assignedAt && (
                                                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-3 pt-2 border-t border-blue-100 flex items-center gap-1">
                                                        <FaClock size={12} /> Assign Time: {new Date(selectedOrder.assignedAt).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            (selectedOrder.status === 'Accepted' || (selectedOrder.orderType === 'Prescription' && selectedOrder.status === 'Placed')) && (
                                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in">
                                                    <FaTruck className="text-slate-300" size={32} />
                                                    <div>
                                                        <p className="text-xs font-black text-slate-700 uppercase">No Driver Assigned</p>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1">This order is accepted. Please assign a delivery driver to proceed.</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setApprovePopupOpen(true)} 
                                                        className="px-6 py-2.5 bg-[#08B36A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-md active:scale-95"
                                                    >
                                                        Assign Driver
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        {/* Rejections Log */}
                                        {selectedOrder.rejectedBy && (
                                            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FaExclamationTriangle className="text-slate-300" /> Rejection History</p>
                                                {selectedOrder.rejectedBy.length > 0 ? (
                                                    <div className="space-y-1 max-h-24 overflow-y-auto">
                                                        {selectedOrder.rejectedBy.map((item, key) => (
                                                            <div key={key} className="text-xs text-rose-500 font-bold">• {item.reason || "Rejected Log Detail"}</div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 font-bold italic">No rejection events logged for this order.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Metadata */}
                                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-2 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                            <p className="text-slate-500 border-b pb-1">System Metadata Logs</p>
                                            <div>Placed At: <span className="text-slate-700">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                                            <div>Last Updated: <span className="text-slate-700">{new Date(selectedOrder.updatedAt).toLocaleString()}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        {!hideActions && (['Placed', 'Under Review'].includes(selectedOrder.status)) && selectedOrder.status !== 'Placed' && (
                            <div className="p-8 bg-slate-50 border-t flex gap-4 z-[10]">
                                <button onClick={() => setRejectPopupOpen(true)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-rose-500 font-black rounded-2xl text-[10px] uppercase hover:bg-rose-50 transition-all">Reject Order</button>
                                <button onClick={handleAcceptOnly} disabled={actionLoading} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                                    {actionLoading ? <FaSpinner className="animate-spin" /> : "Accept Order"}
                                </button>
                            </div>
                        )}

                        {!hideActions && selectedOrder.status === 'Placed' && !selectedOrder.driverId && (
                            <div className="p-8 bg-slate-50 border-t flex gap-4 z-[10] animate-in fade-in">
                                <button 
                                    onClick={() => setApprovePopupOpen(true)} 
                                    className="w-full py-4 bg-[#08B36A] hover:bg-green-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all"
                                >
                                    <FaTruck /> Assign Driver
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL: APPROVE & ASSIGN DRIVER --- */}
            {approvePopupOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
                        <div className={`p-6 border-b flex justify-between items-center ${selectedOrder.driverId ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                            <div>
                                <h2 className={`text-xl font-black uppercase flex items-center gap-2 ${selectedOrder.driverId ? 'text-blue-800' : 'text-emerald-800'}`}>
                                    {selectedOrder.driverId ? <><FaExchangeAlt /> Reassign New Driver</> : <><FaTruck /> Assign Driver</>}
                                </h2>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedOrder.driverId ? 'text-blue-600' : 'text-emerald-600'}`}>Order #{selectedOrder?.orderId}</p>
                            </div>
                            <button onClick={() => { setApprovePopupOpen(false); setSelectedDriverId(null); }} className="p-2 text-slate-300 hover:text-slate-600 bg-white rounded-full transition-all"><FaTimes size={18}/></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
                            {driversLoading ? (
                                <div className="py-20 text-center flex flex-col items-center gap-3"><FaSpinner className="animate-spin text-emerald-600" size={32}/><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching available drivers...</p></div>
                            ) : drivers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {drivers.map((driver) => (
                                        <div key={driver._id} onClick={() => setSelectedDriverId(driver._id)} className={`p-4 rounded-[28px] border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedDriverId === driver._id ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-[1.02]' : 'border-slate-100 bg-white hover:border-emerald-200'}`}>
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                                                <img 
                                                    src={getImgUrl(driver.profilePic)} 
                                                    alt={driver.name} 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; }} 
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-black text-slate-800 text-sm tracking-tight">{driver.name}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mb-2"><FaPhoneAlt size={8}/> {driver.phone}</p>
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase flex items-center gap-1 w-fit"><FaIdCard size={8}/> {driver.vehicleNumber}</span>
                                            </div>
                                            {selectedDriverId === driver._id && <FaCheckCircle className="text-emerald-500 shrink-0 animate-in zoom-in" size={24}/>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center gap-3"><FaExclamationTriangle className="text-slate-200" size={40} /><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No available drivers found</p></div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 border-t flex gap-3">
                            <button onClick={() => { setApprovePopupOpen(false); setSelectedDriverId(null); }} className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black rounded-2xl text-[10px] uppercase">Cancel</button>
                            <button onClick={handleConfirmDriver} disabled={!selectedDriverId || actionLoading} className={`flex-[2] py-4 text-white font-black rounded-2xl text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!selectedDriverId || actionLoading ? 'bg-slate-300' : selectedOrder.driverId ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                                {actionLoading ? <FaSpinner className="animate-spin" /> : selectedOrder.driverId ? 'Confirm Reassignment' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REJECT POPUP --- */}
            {rejectPopupOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-md p-10 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-4"><div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center"><FaExclamationTriangle size={24} /></div><h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Reject Order</h2></div>
                        <textarea rows="3" placeholder="Reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-2 ring-rose-500 outline-none resize-none transition-all"></textarea>
                        <div className="flex gap-3">
                            <button onClick={() => setRejectPopupOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-rose-500 font-black rounded-2xl text-[10px] uppercase tracking-wide transition-all hover:bg-rose-50">Back</button>
                            <button onClick={handleReject} disabled={actionLoading} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg shadow-rose-100 hover:bg-rose-600">{actionLoading ? <FaSpinner className="animate-spin mx-auto"/> : 'Submit Rejection'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}