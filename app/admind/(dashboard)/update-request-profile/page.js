"use client";
import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI'; 

export default function ProfileUpdatesPage() {
    // List states
    const [requests, setRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Pending'); // Default Pending
    const [vendorFilter, setVendorFilter] = useState(''); // Default empty string means 'All'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // Detail/Modal states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Action states
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });

    // Category options for Tabs (PoliceHQ and FireHQ dynamically included) [15]
    const categories = [
        { id: '', name: 'All Categories' },
        { id: 'Doctor', name: 'Doctor' },
        { id: 'Hospital', name: 'Hospital' },
        { id: 'Nurse', name: 'Nurse' },
        { id: 'Pharmacy', name: 'Pharmacy' },
        { id: 'Lab', name: 'Lab' },
        { id: 'Ambulance', name: 'Ambulance' },
        { id: 'Driver', name: 'Driver' },
        { id: 'PoliceHQ', name: 'Police HQ' },
        { id: 'FireHQ', name: 'Fire HQ' },
    ];

    // Status options for Pills
    const statusOptions = [
        { id: 'Pending', name: 'Pending' },
        { id: 'Approved', name: 'Approved' },
        { id: 'Rejected', name: 'Rejected' }
    ];

    // Fetch Requests List
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.listProfileUpdateRequests(
                statusFilter || undefined, 
                vendorFilter || undefined, 
                page, 
                10
            );
            if (response.success) {
                setRequests(response.data || []);
                setTotalPages(response.totalPages || 1);
            }
        } catch (error) {
            showAlert('error', 'Failed to fetch profile updates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, vendorFilter, page]);

    // Fetch Comparison Details
    const handleViewDetails = async (requestId) => {
        setDetailsLoading(true);
        setShowModal(true);
        setShowRejectInput(false);
        setRejectionReason('');
        try {
            const response = await AdminAPI.getProfileUpdateRequestDetails(requestId);
            if (response.success) {
                setSelectedRequest(response.data);
            } else {
                showAlert('error', 'Failed to fetch details.');
                setShowModal(false);
            }
        } catch (error) {
            showAlert('error', 'Error while loading details.');
            setShowModal(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Action Handler (Approve / Reject)
    const handleAction = async (actionType) => {
        if (actionType === 'Reject' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (actionType === 'Reject' && !rejectionReason.trim()) {
            showAlert('error', 'Please provide a rejection reason.');
            return;
        }

        setActionLoading(true);
        try {
            const response = await AdminAPI.actionProfileUpdateRequest(
                selectedRequest.request._id,
                actionType,
                actionType === 'Reject' ? rejectionReason : ''
            );

            if (response.success) {
                showAlert('success', `Profile update successfully ${actionType}d!`);
                setShowModal(false);
                fetchRequests(); // Refresh table list
            } else {
                showAlert('error', response.message || 'Operation failed.');
            }
        } catch (error) {
            showAlert('error', 'Something went wrong while processing the request.');
        } finally {
            setActionLoading(false);
        }
    };

    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 5000);
    };

    // ==========================================
    // IMAGE UTILITIES & CORRECTIONS
    // ==========================================

    // 1. Checks if the field value or key suggests an image
    const isImageField = (key, value) => {
        const lowerKey = key.toLowerCase();
        const isImgKey = lowerKey.includes('image') || lowerKey.includes('avatar') || lowerKey.includes('logo') || lowerKey.includes('pic') || lowerKey.includes('document') || lowerKey.includes('licence');
        
        if (typeof value === 'string') {
            const isImgUrl = value.startsWith('http') || value.startsWith('data:image/') || value.match(/\.(jpeg|jpg|gif|png|webp)/i);
            return isImgKey || isImgUrl;
        }
        return isImgKey;
    };

    // 2. Checks if a string represents a valid image source
    const isValidImageUrl = (url) => {
        if (!url) return false;
        const normalized = String(url).trim().toLowerCase();
        return normalized !== '' && normalized !== 'null' && normalized !== 'undefined' && normalized !== 'none';
    };

    // 3. Formats relative server paths to absolute URLs (strips 'public/' prefix)
    const formatImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
            return url;
        }

        let cleanUrl = url.trim();

        if (cleanUrl.startsWith('public/')) {
            cleanUrl = cleanUrl.replace('public/', '');
        } else if (cleanUrl.startsWith('/public/')) {
            cleanUrl = cleanUrl.replace('/public/', '/');
        }

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.7:5002'; // Fallback to live local backend
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const finalUrl = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
        
        return `${cleanBase}${finalUrl}`;
    };

    // ==========================================
    // ADVANCED CLUTTER-FILTER COMPARISON LOGIC
    // ==========================================
    const getChangedFields = () => {
        if (!selectedRequest || !selectedRequest.request || !selectedRequest.request.updatedFields) {
            return [];
        }
        
        const updatedFields = selectedRequest.request.updatedFields;
        const profile = selectedRequest.currentProfile || {};

        // Helper to normalize server paths for strict comparison (removes leading slashes and 'public/') [1]
        const cleanPathForComparison = (path) => {
            if (typeof path !== 'string') return path;
            let clean = path.trim().replace(/^\//, ''); 
            if (clean.startsWith('public/')) {
                clean = clean.replace('public/', '');
            }
            return clean;
        };

        return Object.keys(updatedFields).filter(key => {
            const newVal = updatedFields[key];
            const oldVal = profile[key];

            // Helper to determine if value is equivalent to empty/default state
            const isEmptyOrDefault = (val) => {
                if (val === undefined || val === null) return true;
                const str = String(val).trim().toLowerCase();
                return (
                    str === '' || 
                    str === '[]' || 
                    str === '{}' || 
                    str === 'false' || 
                    str === 'null' || 
                    str === 'undefined'
                );
            };

            // 1. Agar old aur new dono hi essentially default/empty hain, toh isko ignore karein
            if (isEmptyOrDefault(oldVal) && isEmptyOrDefault(newVal)) {
                return false;
            }

            // 2. Path normalization for images comparison (prevents false matches due to 'public/') [1]
            const cleanNew = cleanPathForComparison(newVal ?? '');
            const cleanOld = cleanPathForComparison(oldVal ?? '');

            return cleanNew !== cleanOld;
        });
    };

    const changedKeys = getChangedFields();

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Upper Breadcrumb & Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            <span>Admin Portal</span>
                            <span>/</span>
                            <span className="text-indigo-600">Verification</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profile Update Requests</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Seamlessly review and control profile updates requested by business vendors.</p>
                    </div>
                </div>

                {/* Status Pills Selection */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-200/60 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto overflow-x-auto">
                        {statusOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { setStatusFilter(opt.id); setPage(1); }}
                                className={`flex-1 md:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                                    statusFilter === opt.id
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                                }`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Tab Row */}
                <div className="border-b border-slate-200 bg-white p-2 rounded-xl shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setVendorFilter(cat.id); setPage(1); }}
                            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                                vendorFilter === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${vendorFilter === cat.id ? 'bg-white' : 'bg-slate-300'}`}></span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Alert Toast */}
                {alertMessage.text && (
                    <div className={`p-4 rounded-xl text-sm border-l-4 shadow-sm transition-all duration-300 ${
                        alertMessage.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500' 
                            : 'bg-rose-50 text-rose-800 border-rose-500'
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{alertMessage.type === 'success' ? 'Success:' : 'Alert:'}</span>
                            <span>{alertMessage.text}</span>
                        </div>
                    </div>
                )}

                {/* Table Data Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-24 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-indigo-600"></div>
                            <span className="text-xs font-semibold text-slate-400">Loading requests...</span>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-24 space-y-3">
                            <div className="text-4xl text-slate-300">📁</div>
                            <p className="text-slate-400 font-medium text-sm">No profile update requests found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-4.5 px-6">Vendor Category</th>
                                        <th className="py-4.5 px-6">Updated Fields</th>
                                        <th className="py-4.5 px-6">Status</th>
                                        <th className="py-4.5 px-6">Submitted At</th>
                                        <th className="py-4.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-slate-50/50 transition duration-150">
                                            <td className="py-4.5 px-6 font-semibold text-slate-700">
                                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-3 py-1.5 rounded-xl text-xs font-bold">
                                                    {req.vendorModel}
                                                </span>
                                            </td>
                                            <td className="py-4.5 px-6 max-w-xs truncate text-slate-600 font-medium">
                                                {Object.keys(req.updatedFields || {}).join(', ')}
                                            </td>
                                            <td className="py-4.5 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    req.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                                                    req.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                                    'bg-rose-50 text-rose-800 border border-rose-100'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        req.status === 'Pending' ? 'bg-amber-500' :
                                                        req.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`}></span>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="py-4.5 px-6 text-slate-500 font-medium">
                                                {new Date(req.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-4.5 px-6 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(req._id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition duration-150 hover:-translate-y-0.5 transform"
                                                >
                                                    Compare & Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center p-5 border-t border-slate-100 bg-slate-50/50">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-white shadow-sm transition"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-semibold text-slate-500">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-white shadow-sm transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

                {/* MODAL: Dynamic Side-by-Side Differences only comparison */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                            
                            {/* Modal Header */}
                            <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50/80">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-extrabold text-slate-800">Verify Profile Updates</span>
                                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                            {selectedRequest?.request?.vendorModel}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">Showing only fields that are different from original active profile.</p>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 w-8 h-8 flex items-center justify-center rounded-full transition"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                                {detailsLoading ? (
                                    <div className="flex flex-col justify-center items-center py-24 gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-indigo-600"></div>
                                        <span className="text-xs text-slate-400 font-semibold">Comparing fields...</span>
                                    </div>
                                ) : selectedRequest ? (
                                    <div className="space-y-6">
                                        
                                        {changedKeys.length === 0 ? (
                                            <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-5 text-center animate-in fade-in duration-200">
                                                <p className="text-sm font-semibold">No field differences found between Old & New details.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Labels Header Grid */}
                                                <div className="hidden md:grid grid-cols-2 gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                                                    <div>Current Value (Old)</div>
                                                    <div>Proposed Change (New)</div>
                                                </div>

                                                {/* Comparison Rows */}
                                                {changedKeys.map((key) => {
                                                    const oldValue = selectedRequest.currentProfile?.[key];
                                                    const newValue = selectedRequest.request.updatedFields[key];
                                                    const isImg = isImageField(key, newValue || oldValue);

                                                    return (
                                                        <div key={key} className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm hover:border-slate-300 transition duration-150">
                                                            <div className="text-xs font-bold text-indigo-600 uppercase mb-3 border-b border-indigo-50/50 pb-2 flex items-center gap-2">
                                                                <span>📝</span>
                                                                <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                
                                                                {/* Left Side: Current Old Profile Value */}
                                                                <div className="space-y-1">
                                                                    <span className="md:hidden text-[10px] font-bold text-slate-400 block uppercase">Current Value</span>
                                                                    {isImg ? (
                                                                        isValidImageUrl(oldValue) ? (
                                                                            <div className="relative group border border-slate-200 rounded-xl p-1 max-w-[150px] bg-slate-50">
                                                                                <img 
                                                                                    src={formatImageUrl(oldValue)} 
                                                                                    alt="Current" 
                                                                                    className="w-full h-24 object-cover rounded-lg transition transform group-hover:scale-105 duration-200"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = "https://images.placeholders.dev/?width=150&height=150&text=No+Image&bgColor=%23f1f5f9";
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs text-slate-400 italic font-semibold inline-block p-2 bg-slate-100 rounded-lg">No Current Image</span>
                                                                        )
                                                                    ) : (
                                                                        <p className="text-sm text-slate-600 font-semibold break-words bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                                            {oldValue !== undefined && oldValue !== null ? String(oldValue) : <em className="text-slate-400">Not Set</em>}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Right Side: New Proposed Value */}
                                                                <div className="space-y-1">
                                                                    <span className="md:hidden text-[10px] font-bold text-slate-400 block uppercase">New Proposed Change</span>
                                                                    {isImg ? (
                                                                        isValidImageUrl(newValue) ? (
                                                                            <div className="relative group border border-indigo-200 rounded-xl p-1 max-w-[150px] bg-indigo-50/30">
                                                                                <img 
                                                                                    src={formatImageUrl(newValue)} 
                                                                                    alt="Proposed" 
                                                                                    className="w-full h-24 object-cover rounded-lg transition transform group-hover:scale-105 duration-200"
                                                                                    onError={(e) => {
                                                                                        e.target.onerror = null;
                                                                                        e.target.src = "https://images.placeholders.dev/?width=150&height=150&text=No+Image&bgColor=%23e0e7ff";
                                                                                    }}
                                                                                />
                                                                                <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase">New</span>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs text-rose-500 italic font-semibold inline-block p-2 bg-rose-50 rounded-lg">Removed / Empty</span>
                                                                        )
                                                                    ) : (
                                                                        <div className="relative">
                                                                            <p className="text-sm text-indigo-950 font-bold break-words bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg">
                                                                                {newValue !== undefined && newValue !== null ? String(newValue) : '—'}
                                                                            </p>
                                                                            <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">New</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Status Meta Section */}
                                        {selectedRequest.request.status !== 'Pending' && (
                                            <div className="p-4 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 space-y-1">
                                                <div><strong>Request Status:</strong> {selectedRequest.request.status}</div>
                                                {selectedRequest.request.status === 'Rejected' && selectedRequest.request.rejectionReason && (
                                                    <div className="text-rose-600 mt-1"><strong>Rejection Reason:</strong> {selectedRequest.request.rejectionReason}</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Rejection input box with standard validations */}
                                        {showRejectInput && selectedRequest.request.status === 'Pending' && (
                                            <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                                                <label className="block text-xs font-extrabold text-rose-800 tracking-wider uppercase">
                                                    REJECTION REASON <span className="text-rose-500">*</span>
                                                </label>
                                                <textarea
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    rows="3"
                                                    placeholder="Reason for rejecting this request..."
                                                    className="w-full text-sm p-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 font-medium">Failed to load comparison data.</p>
                                )}
                            </div>

                            {/* Modal Footer Actions */}
                            {selectedRequest && selectedRequest.request.status === 'Pending' && (
                                <div className="border-t border-slate-100 p-5 flex flex-col sm:flex-row justify-end gap-3 bg-slate-50">
                                    <button
                                        disabled={actionLoading}
                                        onClick={() => setShowModal(false)}
                                        className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl border border-slate-200 bg-white transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleAction('Reject')}
                                        className="px-5 py-2.5 text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-xl border border-rose-200 transition"
                                    >
                                        {actionLoading ? 'Saving...' : 'Reject Request'}
                                    </button>

                                    <button
                                        disabled={actionLoading}
                                        onClick={() => handleAction('Approve')}
                                        className="px-5 py-2.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition duration-150 hover:-translate-y-0.5"
                                    >
                                        {actionLoading ? 'Saving...' : 'Approve Request'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}