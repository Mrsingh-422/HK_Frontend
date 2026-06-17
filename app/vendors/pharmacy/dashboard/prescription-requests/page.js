'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaFilePrescription, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFileMedical,
    FaSyncAlt, FaEye, FaSearchPlus, FaSearchMinus, FaRedo, FaExpand, FaCompress,
    FaCheck, FaTimes, FaSearch, FaTrash, FaShoppingCart, FaMotorcycle, FaExclamationCircle
} from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import { toast, Toaster } from 'react-hot-toast';

export default function PrescriptionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState(''); // Empty string shows all
    
    // Details Modal States
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Zoom & Focus States
    const [zoomScale, setZoomScale] = useState(1);
    const [isImageFocused, setIsImageFocused] = useState(false);

    // Bill Generation Workspace States
    const [verifiedItems, setVerifiedItems] = useState([]);
    const [deliveryCharge, setDeliveryCharge] = useState(40);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Rejection State
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await PharmacyVendorAPI.listPrescriptionRequests(statusFilter);
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            toast.error("Failed to load prescription requests");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = async (requestId) => {
        try {
            setDetailsLoading(true);
            setIsDetailsModalOpen(true);
            const res = await PharmacyVendorAPI.getPrescriptionRequestDetails(requestId);
            if (res.success) {
                setSelectedRequest(res.data);
                // Clear billing workspace state so the pharmacist maps items cleanly from database search
                setVerifiedItems([]);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (error) {
            toast.error("Failed to fetch request detail profiles");
            setIsDetailsModalOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStartReview = async () => {
        if (!selectedRequest) return;
        try {
            setActionLoading(true);
            const res = await PharmacyVendorAPI.startPrescriptionReview(selectedRequest.requestId);
            if (res.success) {
                toast.success("Review session started successfully");
                setSelectedRequest(prev => ({ ...prev, status: 'Reviewing' }));
                fetchRequests();
            }
        } catch (error) {
            toast.error("Failed to lock review session");
        } finally {
            setActionLoading(false);
        }
    };

    // Live Database Master Search
    const handleMedicineSearch = async (val) => {
        setSearchQuery(val);
        if (!val.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            setSearchLoading(true);
            const res = await PharmacyVendorAPI.searchMasterMedicines(val);
            if (res.success) {
                setSearchResults(res.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddSearchItem = (med) => {
        const isDuplicate = verifiedItems.some(item => item.medicineId === med._id);
        if (isDuplicate) {
            toast.error("Medicine already added to bill mapping");
            return;
        }
        setVerifiedItems(prev => [
            ...prev,
            {
                medicineId: med._id,
                name: med.name,
                pricePerUnit: med.price || 10, 
                quantity: 1
            }
        ]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleUpdateBillItem = (index, key, val) => {
        setVerifiedItems(prev => {
            const copy = [...prev];
            copy[index][key] = val;
            return copy;
        });
    };

    const handleRemoveBillItem = (index) => {
        setVerifiedItems(prev => prev.filter((_, i) => i !== index));
    };

    const getBillTotal = () => {
        const itemsSum = verifiedItems.reduce((acc, curr) => acc + (curr.pricePerUnit * curr.quantity), 0);
        return itemsSum + Number(deliveryCharge);
    };

    const handleSubmitBill = async () => {
        if (verifiedItems.length === 0) {
            return toast.error("Please add at least one verified item from database search to generate the invoice");
        }
        const hasMissingIds = verifiedItems.some(item => !item.medicineId);
        if (hasMissingIds) {
            return toast.error("Please ensure all items are linked to a database product ID");
        }

        try {
            setActionLoading(true);
            const payload = {
                items: verifiedItems,
                deliveryCharge: Number(deliveryCharge)
            };
            const res = await PharmacyVendorAPI.submitPrescriptionReview(selectedRequest.requestId, payload);
            if (res.success) {
                toast.success("Bill generated and transmitted to the customer");
                setIsDetailsModalOpen(false);
                fetchRequests();
            }
        } catch (error) {
            toast.error("Failed to generate and submit verified bill");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!rejectReason.trim()) {
            return toast.error("Please enter a valid rejection reason");
        }
        try {
            setActionLoading(true);
            const res = await PharmacyVendorAPI.rejectPrescriptionRequest(selectedRequest.requestId, rejectReason);
            if (res.success) {
                toast.success("Request successfully rejected");
                setRejectPopupOpen(false);
                setIsDetailsModalOpen(false);
                setRejectReason('');
                fetchRequests();
            }
        } catch (error) {
            toast.error("Failed to reject prescription request");
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

    // Zoom and Pan Handlers
    const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 5));
    const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.5, 0.5));
    const handleResetZoom = () => setZoomScale(1);

    const handleWheel = (e) => {
        if (e.deltaY < 0) handleZoomIn();
        else handleZoomOut();
    };

    const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <FaFilePrescription className="text-emerald-500" /> Rx Prescription Inquiries
                        </h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Audit Incoming Client Inquiries</p>
                    </div>

                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex gap-1 overflow-x-auto">
                        {[
                            { label: 'All', value: '' },
                            { label: 'Pending Review', value: 'Pending Review' },
                            { label: 'Reviewing', value: 'Reviewing' },
                            { label: 'Bill Generated', value: 'Bill Generated' },
                            { label: 'Rejected', value: 'Rejected' }
                        ].map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setStatusFilter(t.value)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    statusFilter === t.value ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <FaSyncAlt className="animate-spin text-emerald-500 text-3xl mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing prescriptions...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-slate-300 font-bold uppercase tracking-widest text-xs">
                        No prescription request profiles found
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="p-6 pl-8">Inquiry ID</th>
                                        <th className="p-6">Client Recipient</th>
                                        <th className="p-6">Status State</th>
                                        <th className="p-6 text-right pr-8">Audit Portal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((req) => (
                                        <tr key={req.requestId} onClick={() => handleOpenDetails(req.requestId)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="p-6 pl-8">
                                                <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                                    <FaFilePrescription className="text-emerald-500" size={12} /> {req.requestId}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="font-extrabold text-slate-700 text-sm">{req.address?.name || 'Inquiry Contact'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{req.address?.houseNo || 'No address line configured'}</p>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                                    req.status === 'Pending Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    req.status === 'Reviewing' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                                    req.status === 'Bill Generated' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-6 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleOpenDetails(req.requestId)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors">
                                                    <FaEye size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- DETAILED INTERACTION WORKSPACE MODAL --- */}
            {isDetailsModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative border border-slate-100 animate-in fade-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-6 bg-slate-50 flex justify-between items-center border-b shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    Rx Inquiry Session <span className="text-emerald-600">#{selectedRequest.requestId}</span>
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Current Audit Stage: {selectedRequest.status}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsImageFocused(!isImageFocused)} className="p-2 bg-white rounded-full text-slate-400 border hover:bg-slate-50 transition-all">
                                    {isImageFocused ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                </button>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-300 hover:text-rose-500 border transition-all">
                                    <IoCloseOutline size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Workspace Body */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative">
                            {detailsLoading ? (
                                <div className="py-24 text-center flex flex-col items-center gap-3">
                                    <FaSyncAlt className="animate-spin text-emerald-500 text-3xl" />
                                    <p className="text-[10px] font-black text-slate-400 tracking-wider">Acquiring profiles...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                                    
                                    {/* PRESCRIPTION ENHANCED INSPECTOR */}
                                    {selectedRequest.prescriptionImage && (
                                        <div className={`${isImageFocused ? 'absolute inset-0 z-[90] bg-white' : 'lg:col-span-6'} flex flex-col space-y-4`}>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FaFilePrescription /> Document Inspector
                                                </p>
                                                <div className="flex gap-1.5">
                                                    <button onClick={handleZoomOut} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-100"><FaSearchMinus size={10} /></button>
                                                    <button onClick={handleResetZoom} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-100"><FaRedo size={10} /></button>
                                                    <button onClick={handleZoomIn} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-100"><FaSearchPlus size={10} /></button>
                                                    {isImageFocused && (
                                                        <button onClick={() => setIsImageFocused(false)} className="px-3.5 py-1.5 bg-rose-500 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1.5 tracking-wider">
                                                            <FaCompress /> Exit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div 
                                                className="relative w-full aspect-[4/5] bg-slate-100 rounded-2xl border-2 border-slate-100 overflow-hidden flex items-center justify-center cursor-move"
                                                onWheel={handleWheel}
                                            >
                                                <img 
                                                    src={getImgUrl(selectedRequest.prescriptionImage)} 
                                                    style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-out' }} 
                                                    className="max-w-full max-h-full object-contain" 
                                                    alt="Rx Upload" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* CLINICAL DATA & BILL GENERATOR WORKSPACE */}
                                    {!isImageFocused && (
                                        <div className={`${selectedRequest.prescriptionImage ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6`}>
                                            
                                            {/* Client Info Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2"><FaUser /> Customer Profile</p>
                                                    <p className="text-sm font-extrabold text-slate-700">{selectedRequest.address?.name}</p>
                                                    <p className="text-xs font-bold text-emerald-600 mt-0.5">{selectedRequest.address?.phone}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2"><FaMapMarkerAlt /> Shipping Coordinates</p>
                                                    <p className="text-xs text-slate-600 font-bold leading-relaxed">{selectedRequest.address?.houseNo}</p>
                                                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200/50 text-slate-500 text-[8px] font-black rounded uppercase tracking-wider">{selectedRequest.durationType || 'Standard Duration'}</span>
                                                </div>
                                            </div>

                                            {/* Requested Medications List */}
                                            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                                                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                                                    <FaFileMedical /> Transcribed Medications
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedRequest.requestedMedicines?.map((med, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-blue-100/40">
                                                            <div className="flex-1 min-w-0 mr-3">
                                                                <p className="text-xs font-extrabold text-slate-800">{med.name}</p>
                                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Estimated Duration: {med.durationDays} days</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {selectedRequest.status === 'Reviewing' && (
                                                                    <button 
                                                                        onClick={() => handleMedicineSearch(med.name)}
                                                                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                                                                    >
                                                                        <FaSearch size={10} /> Search DB
                                                                    </button>
                                                                )}
                                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${med.isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                    {med.isSelected ? 'Approved' : 'De-Selected'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* WORKSPACE LOGIC SECTION */}
                                            {selectedRequest.status === 'Pending Review' && (
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
                                                    <FaExclamationCircle className="text-amber-500 text-3xl mx-auto" />
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800">Inquiry Lock Required</h4>
                                                        <p className="text-xs text-slate-400 mt-1">Acquire and lock this prescription inquiry session before editing or building the verified invoice.</p>
                                                    </div>
                                                    <button onClick={handleStartReview} disabled={actionLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-emerald-50 tracking-widest flex items-center justify-center gap-2">
                                                        {actionLoading ? <FaSyncAlt className="animate-spin" /> : <FaCheck />} Lock & Begin Audit
                                                    </button>
                                                </div>
                                            )}

                                            {selectedRequest.status === 'Reviewing' && (
                                                <div className="space-y-4 border-t pt-4 border-slate-100">
                                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pharmacist Verified Bill Editor</h3>
                                                    
                                                    {/* Local Search and Map from Master */}
                                                    <div className="relative">
                                                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                                                            <FaSearch className="text-slate-400 mr-2" size={12} />
                                                            <input 
                                                                type="text" 
                                                                placeholder="Search products in database to link..." 
                                                                value={searchQuery}
                                                                onChange={(e) => handleMedicineSearch(e.target.value)}
                                                                className="bg-transparent outline-none text-xs text-slate-700 w-full placeholder-slate-400"
                                                            />
                                                            {searchLoading && <FaSyncAlt className="animate-spin text-slate-400 ml-2" size={12} />}
                                                        </div>
                                                        {searchResults.length > 0 && (
                                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-[20] divide-y divide-slate-50">
                                                                {searchResults.map((med) => (
                                                                    <div key={med._id} onClick={() => handleAddSearchItem(med)} className="p-3 hover:bg-emerald-50/50 cursor-pointer text-xs font-bold text-slate-700 transition-colors flex justify-between items-center">
                                                                        <span>{med.name}</span>
                                                                        <span className="text-[10px] text-emerald-600 font-extrabold">₹{med.price}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Verified Bill Invoice List */}
                                                    <div className="space-y-3">
                                                        <div className="max-h-52 overflow-y-auto space-y-2">
                                                            {verifiedItems.length === 0 ? (
                                                                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 text-center rounded-2xl text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                                    Please use the search utility above to link inventory products
                                                                </div>
                                                            ) : (
                                                                verifiedItems.map((item, idx) => (
                                                                    <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs shadow-sm">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-extrabold text-slate-800 truncate">{item.name}</p>
                                                                            <span className="text-[8px] text-slate-400 uppercase">Linked ID: {item.medicineId}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Price Input */}
                                                                            <div className="flex items-center border rounded px-1.5 py-1 bg-slate-50">
                                                                                <span className="text-slate-400 mr-1 text-[10px]">₹</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    value={item.pricePerUnit} 
                                                                                    onChange={(e) => handleUpdateBillItem(idx, 'pricePerUnit', Number(e.target.value))}
                                                                                    className="w-12 bg-transparent outline-none font-bold text-right text-slate-700 text-[10px]"
                                                                                />
                                                                            </div>
                                                                            {/* Qty Input */}
                                                                            <div className="flex items-center border rounded px-1.5 py-1 bg-slate-50">
                                                                                <span className="text-slate-400 mr-1 text-[10px]">Qty</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    value={item.quantity} 
                                                                                    onChange={(e) => handleUpdateBillItem(idx, 'quantity', Number(e.target.value))}
                                                                                    className="w-10 bg-transparent outline-none font-bold text-right text-slate-700 text-[10px]"
                                                                                />
                                                                            </div>
                                                                            <button onClick={() => handleRemoveBillItem(idx)} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"><FaTrash size={10} /></button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delivery Fees & Grand Total Details */}
                                                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-600 flex items-center gap-1.5"><FaMotorcycle className="text-slate-400" /> Delivery Surcharges</span>
                                                            <input 
                                                                type="number" 
                                                                value={deliveryCharge} 
                                                                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                                                                className="w-16 px-2 py-1 border rounded bg-white text-right font-extrabold text-slate-700 text-xs"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Estimated Invoice Total</span>
                                                            <span className="text-lg font-black text-emerald-700">₹{getBillTotal()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Finished Status Invoice Summary (Read-Only) */}
                                            {selectedRequest.status === 'Bill Generated' && (
                                                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4">
                                                    <div className="flex items-center gap-2"><FaShoppingCart className="text-emerald-600" /><h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Final Verified Invoice Summary</h4></div>
                                                    <div className="space-y-1.5 border-b border-emerald-100/50 pb-3 text-xs text-slate-600">
                                                        <div className="flex justify-between"><span>Verified Medicine Items Total</span><span className="font-bold text-slate-800">₹{selectedRequest.verifiedBill?.itemTotal || 0}</span></div>
                                                        <div className="flex justify-between"><span>Delivery/Surcharge Fees</span><span className="font-bold text-slate-800">₹{selectedRequest.verifiedBill?.deliveryCharge || 0}</span></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm font-black text-emerald-700"><span>Grand Total</span><span>₹{selectedRequest.verifiedBill?.totalAmount || 0}</span></div>
                                                </div>
                                            )}

                                            {selectedRequest.status === 'Rejected' && (
                                                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100/50 space-y-3">
                                                    <div className="flex items-center gap-2"><FaExclamationCircle className="text-rose-500" /><h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Rejection Record</h4></div>
                                                    <p className="text-xs text-rose-900 font-bold italic bg-white/50 p-3 rounded-xl border border-rose-100/50">"{selectedRequest.rejectReason || "Unspecified rejection reason."}"</p>
                                                </div>
                                            )}

                                        </div>
                                    )}

                                </div>
                            )}
                        </div>

                        {/* Modal Action Controls Footer */}
                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-3 bg-white hover:bg-slate-100 border text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all">Close</button>
                            {selectedRequest && selectedRequest.status === 'Reviewing' && (
                                <>
                                    <button onClick={() => setRejectPopupOpen(true)} className="px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-600 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all">Reject Request</button>
                                    <button onClick={handleSubmitBill} disabled={actionLoading} className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-50 tracking-widest flex items-center justify-center gap-2">
                                        {actionLoading ? <FaSyncAlt className="animate-spin" /> : <FaCheck />} Send Verified Bill
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* --- REJECT REASON SUBMISSION POPUP --- */}
            {rejectPopupOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 space-y-6 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><FaExclamationCircle size={20} /></div>
                            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Prescription Rejection Details</h2>
                        </div>
                        <textarea 
                            rows="3" 
                            placeholder="Provide rejection audit details (e.g., blur prescription image, expired date)..." 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold focus:ring-2 ring-rose-500 outline-none resize-none transition-all placeholder-slate-400 text-slate-700"
                        ></textarea>
                        <div className="flex gap-3">
                            <button onClick={() => setRejectPopupOpen(false)} className="flex-1 py-3 bg-white border text-slate-400 font-black rounded-xl text-[10px] uppercase transition-all">Cancel</button>
                            <button onClick={handleRejectRequest} disabled={actionLoading} className="flex-[2] bg-rose-500 text-white py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg shadow-rose-100 hover:bg-rose-600">
                                {actionLoading ? <FaSyncAlt className="animate-spin mx-auto"/> : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}