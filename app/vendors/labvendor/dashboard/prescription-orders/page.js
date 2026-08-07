'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaFilePrescription, FaUser, FaPhoneAlt, FaMapMarkerAlt, FaFileMedical,
    FaSyncAlt, FaEye, FaSearchPlus, FaSearchMinus, FaRedo, FaExpand, FaCompress,
    FaCheck, FaTrash, FaMotorcycle, FaExclamationCircle,
    FaBox, FaClock, FaCheckCircle, FaEnvelope, FaVenusMars, FaClipboardList
} from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { toast, Toaster } from 'react-hot-toast';
import LabVendorAPI from '@/app/services/LabVendorAPI';

export default function ProviderPrescriptionDashboard() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); 
    
    // Details Modal States
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Zoom & Focus States
    const [zoomScale, setZoomScale] = useState(1);
    const [isImageFocused, setIsImageFocused] = useState(false);

    // Bill Generation Workspace States
    const [invoiceTests, setInvoiceTests] = useState([]);
    const [invoicePackages, setInvoicePackages] = useState([]);
    const [homeVisitCharge, setHomeVisitCharge] = useState(100);
    const [searchQuery, setSearchQuery] = useState('');

    // Rejection State
    const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Status Helpers based on the JSON status field
    const currentStatus = selectedInquiry?.status || 'Pending Review';
    const isPendingReview = currentStatus === 'Pending Review';
    const isReviewing = currentStatus === 'Reviewing';
    const isBillGenerated = currentStatus === 'Bill Generated' || currentStatus === 'Pending Payment' || currentStatus === 'Paid';
    const isRejected = currentStatus === 'Rejected';

    useEffect(() => {
        fetchInquiries();
    }, [activeTab]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const apiStatus = activeTab === 'ALL' ? '' : activeTab;
            const res = await LabVendorAPI.getIncomingRequestsList(apiStatus);
            if (res && res.success && res.data) {
                setInquiries(res.data);
            } else {
                setInquiries([]);
            }
        } catch (error) {
            console.error("Failed to load inquiries:", error);
            toast.error("Failed to load lab prescription requests");
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetails = async (id) => {
        try {
            setDetailsLoading(true);
            setIsDetailsModalOpen(true);
            const res = await LabVendorAPI.getProviderRequestDetails(id);
            if (res && res.success && res.data) {
                const data = res.data;
                setSelectedInquiry(data);
                
                // Assign home collection fee
                const parsedHomeVisitCharge = data.verifiedBill?.homeVisitCharge !== undefined 
                    ? data.verifiedBill.homeVisitCharge 
                    : 100;
                setHomeVisitCharge(parsedHomeVisitCharge);

                // --- ONLY LOAD VALID TESTS FROM API ---
                const verifiedTests = (data.verifiedBill?.tests || []).filter(t => t && t.name && t.name.trim() !== '');
                
                if (verifiedTests.length > 0) {
                    setInvoiceTests(verifiedTests);
                } else if (data.requestedTests && data.requestedTests.length > 0) {
                    const validRequestedTests = data.requestedTests.filter(rt => rt && rt.name && rt.name.trim() !== '');
                    const autoMapped = validRequestedTests.map(rt => ({
                        testId: rt.masterId || null,
                        name: rt.name,
                        mrp: rt.price || 0,
                        pricePerUnit: rt.price || 0,
                        precaution: "No special preparation required."
                    }));
                    setInvoiceTests(autoMapped);
                } else {
                    setInvoiceTests([]);
                }

                setInvoicePackages(data.verifiedBill?.packages || []);
                setSearchQuery('');
            } else {
                toast.error("Failed to fetch request detail profile.");
                setIsDetailsModalOpen(false);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            toast.error("An error occurred while loading profile details.");
            setIsDetailsModalOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleStartReview = async () => {
        if (!selectedInquiry) return;
        try {
            setActionLoading(true);
            const res = await LabVendorAPI.startPrescriptionReview(selectedInquiry._id);
            if (res && res.success) {
                toast.success("Review session started successfully");
                setSelectedInquiry(prev => prev ? { ...prev, status: 'Reviewing' } : null);
                fetchInquiries();
            } else {
                toast.error(res?.message || "Failed to lock review session");
            }
        } catch (error) {
            console.error("Error locking review:", error);
            toast.error("An error occurred while locking review session.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddClientRequestedTest = (test) => {
        if (!test || !test.name || !test.name.trim()) return;
        const isDuplicate = invoiceTests.some(item => item.name.toLowerCase() === test.name.toLowerCase());
        if (isDuplicate) {
            toast.error("This test is already in the list");
            return;
        }
        setInvoiceTests(prev => [
            ...prev,
            {
                testId: test.masterId || null,
                name: test.name,
                mrp: test.price || 0,
                pricePerUnit: test.price || 0,
                precaution: "No special preparation required."
            }
        ]);
        toast.success(`Added ${test.name}`);
    };

    const handleImportAllRequestedTests = () => {
        if (!selectedInquiry?.requestedTests) return;
        const newTests = [];
        selectedInquiry.requestedTests.forEach(rt => {
            if (!rt || !rt.name || !rt.name.trim()) return;
            const isDuplicate = invoiceTests.some(item => item.name.toLowerCase() === rt.name.toLowerCase());
            if (!isDuplicate) {
                newTests.push({
                    testId: rt.masterId || null,
                    name: rt.name,
                    mrp: rt.price || 0,
                    pricePerUnit: rt.price || 0,
                    precaution: "No special preparation required."
                });
            }
        });
        if (newTests.length === 0) {
            toast.error("All requested tests are already added");
            return;
        }
        setInvoiceTests(prev => [...prev, ...newTests]);
        toast.success(`Imported ${newTests.length} tests`);
    };

    const handleUpdateBillItem = (index, key, val) => {
        setInvoiceTests(prev => {
            const copy = [...prev];
            copy[index][key] = val;
            return copy;
        });
    };

    const handleRemoveBillItem = (index) => {
        setInvoiceTests(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const validTests = invoiceTests.filter(t => t && t.name && t.name.trim() !== '');
        const singlePatientTestsTotal = validTests.reduce((acc, t) => acc + parseFloat(t.pricePerUnit || 0), 0);
        const singlePatientPackagesTotal = invoicePackages.reduce((acc, p) => acc + parseFloat(p.pricePerUnit || 0), 0);
        const patientCount = selectedInquiry?.patients?.length || 1;
        const itemTotal = (singlePatientTestsTotal + singlePatientPackagesTotal) * patientCount;
        const grandTotal = itemTotal + parseFloat(homeVisitCharge || 0);
        
        return {
            itemTotal,
            grandTotal,
            patientCount
        };
    };

    const handleSubmitBill = async () => {
        const validTests = invoiceTests.filter(t => t && t.name && t.name.trim() !== '');
        if (validTests.length === 0 && invoicePackages.length === 0) {
            return toast.error("Please add at least one test from the API request to generate the invoice");
        }

        try {
            setActionLoading(true);
            const payload = {
                tests: validTests,
                packages: invoicePackages,
                homeVisitCharge: Number(homeVisitCharge)
            };
            const res = await LabVendorAPI.submitReviewAndBill(selectedInquiry._id, payload);
            if (res && res.success) {
                toast.success("Suggested bill generated and sent successfully!");
                setIsDetailsModalOpen(false);
                fetchInquiries();
            } else {
                toast.error(res?.message || "Failed to submit verified bill");
            }
        } catch (error) {
            console.error("Error submitting bill:", error);
            toast.error("An error occurred during invoice submission.");
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
            const res = await LabVendorAPI.rejectPrescriptionRequest(selectedInquiry._id, rejectReason);
            if (res && res.success) {
                toast.success("Request successfully rejected");
                setRejectPopupOpen(false);
                setIsDetailsModalOpen(false);
                setRejectReason('');
                fetchInquiries();
            } else {
                toast.error(res?.message || "Failed to reject prescription request");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("An error occurred during request rejection.");
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

    const getStatusBadgeStyles = (status) => {
        const formatStatus = status ? status.toLowerCase() : 'pending review';
        switch (formatStatus) {
            case 'paid':
                return "bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'bill generated':
                return "bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'pending payment':
                return "bg-purple-50 text-purple-700 border-purple-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'pending review':
                return "bg-amber-50 text-amber-700 border-amber-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'rejected':
                return "bg-rose-50 text-rose-600 border-rose-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            case 'reviewing':
                return "bg-cyan-50 text-cyan-600 border-cyan-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
            default:
                return "bg-slate-50 text-slate-500 border-slate-100 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg border";
        }
    };

    const filteredInquiries = inquiries.filter(item => {
        const matchesTab = activeTab === 'ALL' || (item.status && item.status.toLowerCase() === activeTab.toLowerCase());
        const matchesSearch = 
            (item.requestId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.patients?.[0]?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const calculatedBillSummary = calculateTotals();
    const validInvoiceTests = invoiceTests.filter(item => item && item.name && item.name.trim() !== '');

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <FaFileMedical className="text-emerald-500" /> Rx Prescription Inquiries
                        </h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Audit Incoming Client Inquiries</p>
                    </div>

                    <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex gap-1 overflow-x-auto">
                        {[
                            { label: 'All', value: 'ALL' },
                            { label: 'Pending Review', value: 'Pending Review' },
                            { label: 'Reviewing', value: 'Reviewing' },
                            { label: 'Bill Generated', value: 'Bill Generated' },
                            { label: 'Rejected', value: 'Rejected' },
                            { label: 'Pending Payment', value: 'Pending Payment' },
                            { label: 'Paid', value: 'Paid' }
                        ].map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setActiveTab(t.value)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeTab === t.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Analytics Counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Inbound</span>
                            <h3 className="text-xl font-black mt-1 text-[#0F172A]">{inquiries.length}</h3>
                        </div>
                        <span className="p-3 rounded-xl bg-slate-50 text-slate-400"><FaBox size={16} /></span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Pending Review</span>
                            <h3 className="text-xl font-black mt-1 text-amber-600">
                                {inquiries.filter(i => i.status?.toLowerCase() === 'pending review').length}
                            </h3>
                        </div>
                        <span className="p-3 rounded-xl bg-amber-50 text-amber-500"><FaClock size={16} /></span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Under Review</span>
                            <h3 className="text-xl font-black mt-1 text-blue-600">
                                {inquiries.filter(i => i.status?.toLowerCase() === 'reviewing').length}
                            </h3>
                        </div>
                        <span className="p-3 rounded-xl bg-blue-50 text-blue-500"><FaSyncAlt className="animate-spin" size={16} /></span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Finalized (Paid)</span>
                            <h3 className="text-xl font-black mt-1 text-[#08B36A]">
                                {inquiries.filter(i => i.status?.toLowerCase() === 'paid').length}
                            </h3>
                        </div>
                        <span className="p-3 rounded-xl bg-[#08B36A]/10 text-[#08B36A]"><FaCheckCircle size={16} /></span>
                    </div>
                </div>

                {/* Main Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <FaSyncAlt className="animate-spin text-emerald-500 text-3xl mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing prescriptions...</p>
                    </div>
                ) : filteredInquiries.length === 0 ? (
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
                                        <th className="p-6">Appointment Details</th>
                                        <th className="p-6">Requested Tests</th>
                                        <th className="p-6">Status State</th>
                                        <th className="p-6 text-right pr-8">Audit Portal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredInquiries.map((inquiry) => (
                                        <tr key={inquiry._id} onClick={() => handleOpenDetails(inquiry._id)} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <td className="p-6 pl-8">
                                                <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                                    <FaFileMedical className="text-emerald-500" size={12} /> {inquiry.requestId}
                                                </div>
                                                {inquiry.createdAt && (
                                                    <p className="text-[9px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                                                        Received: {new Date(inquiry.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <p className="font-extrabold text-slate-700 text-sm">{inquiry.patients?.[0]?.name || inquiry.userId?.name || 'Inquiry Contact'}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{inquiry.address?.houseNo ? `${inquiry.address.houseNo}, ${inquiry.address.city}` : 'Walk-in Collection'}</p>
                                            </td>
                                            <td className="p-6">
                                                {inquiry.appointmentDate ? (
                                                    <div className="space-y-0.5 text-xs text-slate-700">
                                                        <p className="font-extrabold">{new Date(inquiry.appointmentDate).toLocaleDateString()}</p>
                                                        {inquiry.appointmentTime && (
                                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{inquiry.appointmentTime}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[10px]">No schedule specified</span>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                {inquiry.requestedTests && inquiry.requestedTests.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {inquiry.requestedTests.map((test, index) => (
                                                            <span key={test._id || index} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold">
                                                                {test.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[10px]">Unspecified / Rx Upload Only</span>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeStyles(inquiry.status)}`}>
                                                    {inquiry.status || 'Pending Review'}
                                                </span>
                                            </td>
                                            <td className="p-6 pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleOpenDetails(inquiry._id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors">
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
            {isDetailsModalOpen && selectedInquiry && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md font-sans">
                    <div className="bg-white rounded-[32px] w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative border border-slate-100 animate-in fade-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-6 bg-slate-50 flex justify-between items-center border-b shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                                    Rx Inquiry Session <span className="text-emerald-600">#{selectedInquiry.requestId}</span>
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Current Audit Stage: {selectedInquiry.status || 'Pending Review'}
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
                                    {selectedInquiry.prescriptionImage && (
                                        <div className={`${isImageFocused ? 'absolute inset-0 z-[90] bg-white' : 'lg:col-span-6'} flex flex-col space-y-4`}>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <FaFileMedical /> Document Inspector
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
                                                    src={getImgUrl(selectedInquiry.prescriptionImage)} 
                                                    style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-out' }} 
                                                    className="max-w-full max-h-full object-contain" 
                                                    alt="Rx Upload" 
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://placehold.co/600x400/1e3a8a/ffffff?text=Doctor+Prescription+Scan";
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* CLINICAL DATA & BILL GENERATOR WORKSPACE */}
                                    {!isImageFocused && (
                                        <div className={`${selectedInquiry.prescriptionImage ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6`}>
                                            
                                            {/* Client Info Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                
                                                {/* Patient & Client Account Profiles */}
                                                <div className="space-y-4">
                                                    {selectedInquiry.userId && (
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                <FaUser /> Registered Client Account
                                                            </p>
                                                            <div className="space-y-1 text-xs">
                                                                <p className="font-extrabold text-slate-700">{selectedInquiry.userId.name || 'Anonymous User'}</p>
                                                                <p className="text-slate-400 flex items-center gap-1.5"><FaEnvelope size={10} /> {selectedInquiry.userId.email}</p>
                                                                <p className="text-emerald-600 font-bold flex items-center gap-1.5"><FaPhoneAlt size={10} /> {selectedInquiry.userId.phone}</p>
                                                                {selectedInquiry.userId.gender && (
                                                                    <p className="text-slate-400 flex items-center gap-1.5 capitalize"><FaVenusMars size={10} /> {selectedInquiry.userId.gender}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedInquiry.patients && selectedInquiry.patients.length > 0 && (
                                                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                <FaUser className="text-emerald-600" /> Patient Profile List
                                                            </p>
                                                            <div className="space-y-2">
                                                                {selectedInquiry.patients.map((pat, idx) => (
                                                                    <div key={pat._id || idx} className="p-3 bg-white rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                                                                        <div>
                                                                            <p className="font-extrabold text-slate-700">{pat.name}</p>
                                                                            <p className="text-[10px] text-slate-400 font-semibold uppercase">Relation: {pat.relation || 'Self'}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="font-extrabold text-slate-600">{pat.age} Years</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{pat.gender}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Logistics, Address & Appointment Details */}
                                                <div className="space-y-4">
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 h-full flex flex-col justify-between">
                                                        <div>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                                <FaMapMarkerAlt /> Address Details
                                                            </p>
                                                            {selectedInquiry.address ? (
                                                                <div className="text-xs text-slate-600 space-y-1">
                                                                    <p className="font-extrabold text-slate-700">{selectedInquiry.address.name || 'Recipient'}</p>
                                                                    <p className="font-medium leading-relaxed">
                                                                        {selectedInquiry.address.houseNo}, {selectedInquiry.address.sector || ''} {selectedInquiry.address.city}
                                                                    </p>
                                                                    {selectedInquiry.address.pincode && (
                                                                        <p className="font-bold text-slate-400">PIN: {selectedInquiry.address.pincode}</p>
                                                                    )}
                                                                    {selectedInquiry.address.addressType && (
                                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200/55 text-slate-600 text-[8px] font-extrabold rounded uppercase tracking-wider">
                                                                            {selectedInquiry.address.addressType}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-400 font-bold italic">No physical coordinates linked.</p>
                                                            )}
                                                        </div>

                                                        {selectedInquiry.appointmentDate && (
                                                            <div className="pt-2 border-t border-slate-200/60 mt-2 space-y-0.5 text-xs">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                                    <FaClock /> Chosen Schedule
                                                                </p>
                                                                <p className="font-extrabold text-slate-700">
                                                                    {new Date(selectedInquiry.appointmentDate).toLocaleDateString()}
                                                                </p>
                                                                {selectedInquiry.appointmentTime && (
                                                                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">
                                                                        {selectedInquiry.appointmentTime}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {selectedInquiry.address?.phone && (
                                                            <div className="pt-2 border-t border-slate-200/60 mt-2">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scheduler Contact Phone</p>
                                                                <p className="text-xs font-bold text-emerald-600 mt-0.5">{selectedInquiry.address.phone}</p>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-2">
                                                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-wider border border-emerald-100">
                                                                {selectedInquiry.collectionType || 'Standard Collection'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Client Requested Tests Quick Bar */}
                                            {selectedInquiry.requestedTests && selectedInquiry.requestedTests.filter(t => t && t.name && t.name.trim() !== '').length > 0 && (
                                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/40 pb-2">
                                                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                                                            <FaFilePrescription /> Client Requested Tests ({selectedInquiry.requestedTests.filter(t => t && t.name && t.name.trim() !== '').length})
                                                        </p>
                                                        {isReviewing && (
                                                            <button 
                                                                type="button" 
                                                                onClick={handleImportAllRequestedTests}
                                                                className="text-[9px] bg-amber-600 text-white font-black uppercase px-3 py-1 rounded-lg hover:bg-amber-700 transition"
                                                            >
                                                                Import All Tests
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedInquiry.requestedTests.filter(t => t && t.name && t.name.trim() !== '').map((test, index) => (
                                                            <button 
                                                                type="button"
                                                                key={test._id || index} 
                                                                disabled={!isReviewing}
                                                                onClick={() => handleAddClientRequestedTest(test)}
                                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm flex items-center gap-2 border text-left transition-all ${
                                                                    isReviewing 
                                                                        ? 'bg-white hover:bg-amber-100 border-amber-200 cursor-pointer hover:scale-[1.02]' 
                                                                        : 'bg-slate-50 border-slate-100'
                                                                }`}
                                                            >
                                                                <span>{test.name}</span>
                                                                <span className="text-[10px] text-emerald-600 font-extrabold">(MRP: ₹{test.price || 0})</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* WORKSPACE LOGIC SECTION */}
                                            {isPendingReview && (
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
                                                    <FaExclamationCircle className="text-amber-500 text-3xl mx-auto" />
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800">Inquiry Lock Required</h4>
                                                        <p className="text-xs text-slate-400 mt-1">Acquire and lock this prescription session before setting price and precautions.</p>
                                                    </div>
                                                    <button onClick={handleStartReview} disabled={actionLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-emerald-50 tracking-widest flex items-center justify-center gap-2 transition-colors">
                                                        {actionLoading ? <FaSyncAlt className="animate-spin" /> : <FaCheck />} Lock & Begin Audit
                                                    </button>
                                                </div>
                                            )}

                                            {isReviewing && (
                                                <div className="space-y-4 border-t pt-4 border-slate-100">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                            <FaClipboardList className="text-emerald-600" /> Bill & Instructions Editor
                                                        </h3>
                                                    </div>

                                                    {/* Streamlined Test Card List - ONLY API TESTS DISPLAYED */}
                                                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                                        {validInvoiceTests.length === 0 ? (
                                                            <div className="p-8 bg-slate-50 border border-dashed border-slate-200 text-center rounded-2xl">
                                                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                                                                    No requested tests found from API for this inquiry.
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            validInvoiceTests.map((item, idx) => (
                                                                <div 
                                                                    key={item.testId || idx} 
                                                                    className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm hover:border-emerald-300 transition-all"
                                                                >
                                                                    {/* Row 1: Test Name & Read-Only System MRP */}
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                                                                            <h4 className="font-extrabold text-slate-800 text-sm truncate" title={item.name}>
                                                                                {item.name}
                                                                            </h4>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 shrink-0">
                                                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                                                MRP: <span className="text-slate-800 font-extrabold">₹{item.mrp || 0}</span>
                                                                            </span>
                                                                            <button 
                                                                                type="button"
                                                                                onClick={() => handleRemoveBillItem(idx)} 
                                                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                                                title="Remove Test"
                                                                            >
                                                                                <FaTrash size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Row 2: Price & Precaution Inputs */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                                                                        {/* 1. Price Input */}
                                                                        <div className="sm:col-span-4 flex flex-col gap-1">
                                                                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                                                Price (₹) <span className="text-emerald-600">*</span>
                                                                            </label>
                                                                            <div className="relative flex items-center">
                                                                                <span className="absolute left-3 text-slate-400 font-bold text-xs">₹</span>
                                                                                <input 
                                                                                    type="number" 
                                                                                    min="0"
                                                                                    placeholder="0"
                                                                                    value={item.pricePerUnit !== undefined ? item.pricePerUnit : ''} 
                                                                                    onChange={(e) => handleUpdateBillItem(idx, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                                                                                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 ring-emerald-500/20 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all"
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* 2. Precaution Input */}
                                                                        <div className="sm:col-span-8 flex flex-col gap-1">
                                                                            <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                                                Precaution / Instructions
                                                                            </label>
                                                                            <input 
                                                                                type="text"
                                                                                placeholder="e.g. Fasting of 8-10 hours is recommended."
                                                                                value={item.precaution || ''}
                                                                                onChange={(e) => handleUpdateBillItem(idx, 'precaution', e.target.value)}
                                                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 ring-emerald-500/20 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none transition-all"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* Home Collection & Grand Total Box */}
                                                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-slate-600 flex items-center gap-1.5">
                                                                <FaMotorcycle className="text-slate-400" /> Home Visit Charge
                                                            </span>
                                                            <div className="flex items-center">
                                                                <span className="text-slate-400 font-bold mr-1">₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={homeVisitCharge} 
                                                                    onChange={(e) => setHomeVisitCharge(parseFloat(e.target.value) || 0)}
                                                                    className="w-20 px-2 py-1 border border-emerald-200 rounded-lg bg-white text-right font-black text-slate-800 text-xs outline-none focus:ring-2 ring-emerald-500/20"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-emerald-100">
                                                            <span>Patient Count:</span>
                                                            <span className="font-bold text-slate-700">{calculatedBillSummary.patientCount} Patient(s)</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Final Total</span>
                                                            <span className="text-lg font-black text-emerald-700">₹{calculatedBillSummary.grandTotal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Read-Only Bill Summary when Bill is Generated / Paid */}
                                            {isBillGenerated && (
                                                <div className="space-y-4">
                                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold text-xs flex items-center gap-2">
                                                        <FaClock />
                                                        <span>
                                                            {currentStatus.toLowerCase() === 'paid' 
                                                                ? 'Payment completed successfully.' 
                                                                : 'Suggested invoice sent. Awaiting patient payment.'}
                                                        </span>
                                                    </div>

                                                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaCheckCircle className="text-emerald-600" />
                                                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Final Verified Invoice</h4>
                                                        </div>
                                                        
                                                        {validInvoiceTests.length > 0 && (
                                                            <div className="space-y-2 border-b border-emerald-100 pb-3">
                                                                <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider mb-2">Tests Breakdown</p>
                                                                {validInvoiceTests.map((t, index) => (
                                                                    <div key={index} className="flex justify-between text-xs text-slate-700">
                                                                        <span className="font-bold">{t.name}</span>
                                                                        <span className="font-extrabold text-slate-800">₹{t.pricePerUnit}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Delivery / Home Collection Charges Display */}
                                                        <div className="space-y-2 border-b border-emerald-100 pb-3 text-xs text-slate-600">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold flex items-center gap-1.5">
                                                                    <FaMotorcycle className="text-emerald-600" /> Delivery / Home Visit Charge
                                                                </span>
                                                                <span className="font-extrabold text-slate-800">₹{homeVisitCharge || 0}</span>
                                                            </div>
                                                            {calculatedBillSummary.patientCount > 1 && (
                                                                <div className="flex justify-between items-center text-[11px] text-slate-500">
                                                                    <span>Patient Multiplier</span>
                                                                    <span className="font-bold">{calculatedBillSummary.patientCount} Patient(s)</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center text-sm font-black text-emerald-800 pt-1">
                                                            <span>Grand Total</span>
                                                            <span>₹{calculatedBillSummary.grandTotal}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isRejected && (
                                                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 space-y-3">
                                                    <div className="flex items-center gap-2"><FaExclamationCircle className="text-rose-500" /><h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">Rejection Record</h4></div>
                                                    <p className="text-xs text-rose-900 font-bold italic bg-white/50 p-3 rounded-xl border border-rose-100">"{selectedInquiry.rejectReason || "Unspecified rejection reason."}"</p>
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
                            {selectedInquiry && isReviewing && (
                                <>
                                    <button onClick={() => setRejectPopupOpen(true)} className="px-6 py-3 bg-rose-100 hover:bg-rose-200 text-rose-600 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all">Reject Request</button>
                                    <button onClick={handleSubmitBill} disabled={actionLoading} className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-50 flex items-center justify-center gap-2 transition-all">
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
                            placeholder="Provide rejection audit details..." 
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