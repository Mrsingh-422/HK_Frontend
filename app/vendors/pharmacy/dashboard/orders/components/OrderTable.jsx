'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaPhoneAlt, FaMapMarkerAlt, FaEye, FaCheck, FaTimes, 
    FaUser, FaClipboardList, FaImage, FaSpinner, FaExclamationTriangle, 
    FaCheckCircle, FaCreditCard, FaCalendarAlt, FaClock, FaTruck, FaTag,
    FaIdCard, FaMotorcycle, FaGlobe, FaFilePrescription,
    FaSearchPlus, FaSearchMinus, FaRedo, FaExpand, FaCompress, FaExchangeAlt,
    FaUserInjured, FaMoneyBillWave, FaShippingFast, FaStethoscope
} from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import { toast } from 'react-hot-toast';

export default function OrderTable({ orders = [], refresh, hideActions = false, isPrescription = false }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Magnifier States
    const [zoomScale, setZoomScale] = useState(1);
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [isImageFocused, setIsImageFocused] = useState(false); 
    
    // Approval & Driver Assignment States
    const [approvePopupOpen, setApprovePopupOpen] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [driversLoading, setDriversLoading] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    
    // Reject States
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

    const handleConfirmDriver = async () => {
        if (!selectedDriverId) return toast.error("Please select a driver");
        setActionLoading(true);
        try {
            if (['Accepted', 'Shipped'].includes(selectedOrder.status)) {
                const res = await PharmacyVendorAPI.reassignDriver(selectedOrder._id, selectedDriverId);
                if (res.success) {
                    toast.success("Order reassigned to new driver successfully");
                } else {
                    throw new Error(res.message || "Failed to reassign driver");
                }
            } 
            else {
                const statusRes = await PharmacyVendorAPI.updatePharmacyOrderStatus(selectedOrder._id, 'Accepted');
                if (statusRes.success) {
                    const assignRes = await PharmacyVendorAPI.assignManualDriver(selectedOrder._id, selectedDriverId);
                    if (assignRes.success) {
                        toast.success("Order Approved & Driver Assigned");
                    } else {
                        throw new Error(assignRes.message);
                    }
                } else {
                    throw new Error(statusRes.message);
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
            const res = await PharmacyVendorAPI.updatePharmacyOrderStatus(selectedOrder._id, 'Rejected', rejectReason);
            if (res.success) {
                toast.success("Order Rejected");
                setRejectPopupOpen(false);
                setIsModalOpen(false);
                refresh();
            }
        } catch (err) { toast.error("Error rejecting order"); }
        finally { setActionLoading(false); }
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

    if (!orders || orders.length === 0) return <div className="p-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">No orders found</div>;

    return (
        <div className="w-full overflow-hidden rounded-[32px] border border-emerald-50">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b text-[10px] uppercase tracking-widest text-slate-400 font-black">
                            <th className="p-5 pl-8">Order ID</th>
                            <th className="p-5">Customer</th>
                            {isPrescription && <th className="p-5">Rx</th>}
                            <th className="p-5">Bill</th>
                            <th className="p-5">Location</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right pr-8">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-emerald-50/30 transition-all cursor-pointer group" onClick={() => { 
                                setSelectedOrder(order); 
                                setZoomScale(1); 
                                setActiveImgIndex(0); 
                                setIsImageFocused(false);
                                setIsModalOpen(true); 
                            }}>
                                <td className="p-5 pl-8">
                                    <span className="font-black text-slate-700 text-sm">{order.orderId}</span>
                                    <div className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-[10px]">{getInitials(order.userId?.name)}</div>
                                        <div className="font-black text-slate-700 text-xs truncate max-w-[120px]">{order.userId?.name}</div>
                                    </div>
                                </td>
                                {isPrescription && (
                                    <td className="p-5">
                                        {order.prescriptionImages?.length > 0 ? (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                                <img src={getImgUrl(order.prescriptionImages[0])} className="w-full h-full object-cover" alt="Rx" />
                                            </div>
                                        ) : (
                                            <FaFilePrescription className="text-slate-200" size={18} />
                                        )}
                                    </td>
                                )}
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
                                    <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors"><FaEye size={12}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar relative">
                            
                            {isImageFocused && selectedOrder.prescriptionImages?.length > 0 && (
                                <div className="absolute inset-0 z-[50] bg-white flex flex-col p-6 animate-in fade-in zoom-in duration-300">
                                    {/* ... focus mode header ... */}
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Inspection Mode</p>
                                        <div className="flex gap-2">
                                            <button onClick={handleZoomOut} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaSearchMinus /></button>
                                            <button onClick={handleResetZoom} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaRedo /></button>
                                            <button onClick={handleZoomIn} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 shadow-sm"><FaSearchPlus /></button>
                                            <button onClick={() => setIsImageFocused(false)} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg ml-4 font-bold text-xs flex items-center gap-2 uppercase tracking-widest"><FaCompress /> Exit</button>
                                        </div>
                                    </div>
                                    <div className="flex-grow bg-slate-50 rounded-[32px] overflow-hidden flex items-center justify-center border-4 border-slate-100 cursor-all-scroll" onWheel={handleWheel}>
                                        <img src={getImgUrl(selectedOrder.prescriptionImages[activeImgIndex])} style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-out' }} className="max-w-full max-h-full object-contain" alt="Focus Rx" />
                                    </div>
                                </div>
                            )}

                            <div className={`grid grid-cols-1 ${selectedOrder.prescriptionImages?.length > 0 ? 'lg:grid-cols-12' : 'lg:grid-cols-2'} gap-10`}>
                                
                                {/* Left Column: Prescription (If exists) */}
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
                                        <div className="relative w-full aspect-[4/5] bg-slate-100 rounded-[32px] border-4 border-white shadow-inner overflow-hidden flex items-center justify-center cursor-zoom-in group" onClick={() => setIsImageFocused(true)} onWheel={handleWheel}>
                                            <div className="w-full h-full transition-transform duration-200 ease-out flex items-center justify-center" style={{ transform: `scale(${zoomScale})` }}>
                                                <img src={getImgUrl(selectedOrder.prescriptionImages[activeImgIndex])} className="max-w-full max-h-full object-contain" alt="Prescription" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"><FaExpand /> Focus Mode</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto py-2">
                                            {selectedOrder.prescriptionImages.map((img, idx) => (
                                                <button key={idx} onClick={() => { setActiveImgIndex(idx); setZoomScale(1); }} className={`w-20 h-20 rounded-2xl overflow-hidden border-4 shrink-0 transition-all ${activeImgIndex === idx ? 'border-emerald-500 scale-105' : 'border-white opacity-60'}`}><img src={getImgUrl(img)} className="w-full h-full object-cover" /></button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Info Column */}
                                <div className={`${selectedOrder.prescriptionImages?.length > 0 ? 'lg:col-span-5' : 'lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8'} space-y-8`}>
                                    
                                    {/* 1. Patient Details */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-4 flex items-center gap-2"><FaUserInjured /> Patient Information</p>
                                            {selectedOrder.patients?.map((patient, pIdx) => (
                                                <div key={pIdx} className="space-y-2">
                                                    <p className="font-black text-slate-800 text-sm">{patient.name}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100 uppercase">{patient.gender}</span>
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100 uppercase">{patient.age} Years</span>
                                                        <span className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-blue-600 border border-blue-100 uppercase">{patient.relation}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 2. Customer & Shipping Contact */}
                                        <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><FaUser /> Shipping Address</p>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">{selectedOrder.address?.name || selectedOrder.userId?.name}</p>
                                                    <p className="text-xs font-bold text-emerald-600">{selectedOrder.address?.phone || selectedOrder.userId?.phone}</p>
                                                </div>
                                                <div className="pt-3 border-t border-slate-200">
                                                    <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase">
                                                        <FaMapMarkerAlt className="inline mr-1 text-emerald-400" />
                                                        {selectedOrder.address?.houseNo}, {selectedOrder.address?.sector ? `Sector ${selectedOrder.address?.sector},` : ''} {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                                                    </p>
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black rounded uppercase tracking-widest">{selectedOrder.address?.addressType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Logistics & Payment */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FaMoneyBillWave /> Payment</p>
                                                <p className="text-xs font-black text-slate-700">{selectedOrder.paymentMethod}</p>
                                                <p className={`text-[9px] font-bold uppercase ${selectedOrder.paymentStatus === 'Pending' ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedOrder.paymentStatus}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><FaShippingFast /> Delivery</p>
                                                <p className="text-xs font-black text-slate-700 truncate">{selectedOrder.deliveryStatus}</p>
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase">{selectedOrder.collectionType}</p>
                                            </div>
                                        </div>

                                        {/* 4. Slot Timing */}
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

                                    <div className="space-y-4">
                                        {/* 5. Items */}
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><FaClipboardList /> Order Items ({selectedOrder.items?.length || 0})</p>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800">{item.name}</p>
                                                            <div className="flex gap-2 items-center">
                                                                <p className="text-[10px] font-bold text-slate-400">Qty: {item.quantity}</p>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                <p className="text-[10px] font-bold text-emerald-500 uppercase">{item.duration}</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-black text-slate-700 text-xs">₹{item.price * item.quantity}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 6. Bill Summary */}
                                        <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                                            <p className="text-[10px] font-black uppercase mb-4 flex items-center gap-2 opacity-80"><FaCreditCard /> Bill Summary</p>
                                            <div className="space-y-2 text-xs font-bold">
                                                <div className="flex justify-between opacity-90"><span>Item Total</span><span>₹{selectedOrder.billSummary?.itemTotal || 0}</span></div>
                                                <div className="flex justify-between opacity-90"><span>Delivery Charges</span><span>₹{selectedOrder.billSummary?.deliveryCharge || 0}</span></div>
                                                {selectedOrder.billSummary?.rapidDeliveryCharge > 0 && <div className="flex justify-between opacity-90"><span>Rapid Charge</span><span>₹{selectedOrder.billSummary?.rapidDeliveryCharge}</span></div>}
                                                <div className="pt-4 border-t border-emerald-500 mt-2 flex justify-between items-center">
                                                    <span className="text-[10px] uppercase font-black tracking-widest">Grand Total</span>
                                                    <span className="text-3xl font-black">₹{selectedOrder.billSummary?.totalAmount || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 7. Assigned Driver Display */}
                                        {selectedOrder.driverId && (
                                            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-6">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                        <FaTruck /> Assigned Driver
                                                    </p>
                                                    {['Accepted', 'Shipped'].includes(selectedOrder.status) && (
                                                        <button onClick={() => setApprovePopupOpen(true)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                                                            <FaExchangeAlt size={10} /> Reassign
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm font-black text-xl">
                                                        {getInitials(selectedOrder.driverId.name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-blue-800">{selectedOrder.driverId.name}</p>
                                                        <p className="text-[11px] font-bold text-blue-400">{selectedOrder.driverId.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- ACTION FOOTER --- */}
                        {!hideActions && (['Placed', 'Under Review'].includes(selectedOrder.status)) && (
                            <div className="p-8 bg-slate-50 border-t flex gap-4 z-[10]">
                                <button onClick={() => setRejectPopupOpen(true)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-rose-500 font-black rounded-2xl text-[10px] uppercase hover:bg-rose-50 transition-all">Reject Order</button>
                                <button onClick={() => setApprovePopupOpen(true)} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl text-[10px] uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                                    Assign Driver & Accept
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL: APPROVE & ASSIGN/REASSIGN DRIVER --- */}
            {approvePopupOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
                        <div className={`p-6 border-b flex justify-between items-center ${['Accepted', 'Shipped'].includes(selectedOrder.status) ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                            <div>
                                <h2 className={`text-xl font-black uppercase flex items-center gap-2 ${['Accepted', 'Shipped'].includes(selectedOrder.status) ? 'text-blue-800' : 'text-emerald-800'}`}>
                                    {['Accepted', 'Shipped'].includes(selectedOrder.status) ? <><FaExchangeAlt /> Reassign New Driver</> : <><FaTruck /> Assign Driver</>}
                                </h2>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${['Accepted', 'Shipped'].includes(selectedOrder.status) ? 'text-blue-600' : 'text-emerald-600'}`}>Order #{selectedOrder?.orderId}</p>
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
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0"><img src={getImgUrl(driver.profilePic)} alt={driver.name} className="w-full h-full object-cover" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} /></div>
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
                            <button onClick={handleConfirmDriver} disabled={!selectedDriverId || actionLoading} className={`flex-[2] py-4 text-white font-black rounded-2xl text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!selectedDriverId || actionLoading ? 'bg-slate-300' : ['Accepted', 'Shipped'].includes(selectedOrder.status) ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'}`}>
                                {actionLoading ? <FaSpinner className="animate-spin" /> : ['Accepted', 'Shipped'].includes(selectedOrder.status) ? 'Confirm Reassignment' : 'Confirm Assignment'}
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
                            <button onClick={() => setRejectPopupOpen(false)} className="flex-1 py-4 bg-white border-2 border-slate-200 text-rose-500 font-black rounded-2xl text-[10px] uppercase transition-all hover:bg-rose-50">Back</button>
                            <button onClick={handleReject} disabled={actionLoading} className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg shadow-rose-100 hover:bg-rose-600">{actionLoading ? <FaSpinner className="animate-spin mx-auto"/> : 'Submit Rejection'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}