'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Search, RefreshCw, Eye, 
  CheckCircle2, XCircle, Clock, MapPin, Phone, 
  Mail, FileText, ChevronLeft, ChevronRight, 
  ExternalLink, X, Check, Ban, Loader2, AlertCircle
} from 'lucide-react';
import AdminAPI from '@/app/services/AdminAPI'; // 👈 Pointed to AdminAPI

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

export default function ManageHospitalApproval() {
  // --- States ---
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected' | '' (All)
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Modals
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', hospital: null });
  const [rejectionReason, setRejectionReason] = useState('');

  // Notification Toast
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  // --- Fetch Hospitals Data ---
  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(cityFilter.trim() && { city: cityFilter.trim() }),
        ...(stateFilter.trim() && { state: stateFilter.trim() }),
      };

      const res = await AdminAPI.getHospitalApprovals(params);
      if (res.data?.success || res.success || res.status === 200) {
        const data = res.data?.data || res.data || [];
        setHospitals(data);
        setTotalPages(res.data?.totalPages || res.totalPages || 1);
        setTotalDocs(res.data?.totalDocs || res.totalDocs || data.length || 0);
      }
    } catch (err) {
      console.error('Error fetching hospitals approval list:', err);
      showAlert(err.response?.data?.message || 'Failed to load hospitals list', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, cityFilter, stateFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHospitals();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchHospitals]);

  // --- Action 1: Approve Hospital ---
  const handleApprove = async (hospitalId) => {
    try {
      setActionLoading(true);
      const res = await AdminAPI.approveHospital(hospitalId);
      if (res?.success || res?.status === 200) {
        showAlert(res?.message || 'Hospital profile approved successfully!', 'success');
        setConfirmModal({ show: false, type: '', hospital: null });
        if (selectedHospital?._id === hospitalId) setSelectedHospital(null);
        await fetchHospitals();
      }
    } catch (err) {
      console.error('Approve hospital error:', err);
      showAlert(err.response?.data?.message || 'Failed to approve hospital', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- Action 2: Reject Hospital ---
  const handleReject = async (hospitalId) => {
    try {
      setActionLoading(true);
      const res = await AdminAPI.rejectHospital(hospitalId, { reason: rejectionReason });
      if (res?.success || res?.status === 200) {
        showAlert(res?.message || 'Hospital onboarding request rejected.', 'success');
        setConfirmModal({ show: false, type: '', hospital: null });
        setRejectionReason('');
        if (selectedHospital?._id === hospitalId) setSelectedHospital(null);
        await fetchHospitals();
      }
    } catch (err) {
      console.error('Reject hospital error:', err);
      showAlert(err.response?.data?.message || 'Failed to reject hospital', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-8 space-y-6 font-sans text-slate-800">
      
      {/* Toast Alert Banner */}
      {alertBanner && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all animate-in fade-in duration-200 ${
            alertBanner.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-75"><X size={16} /></button>
        </div>
      )}

      {/* Top Header & Status Filter Pills */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="text-[#08B36A]" size={24} /> Registered Hospital Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review onboarding requests, licenses, and location verification for hospital profiles.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: '', label: 'All' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setStatusFilter(item.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                statusFilter === item.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar: Search & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search hospital name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by city (e.g. Jaipur)..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by state..."
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] outline-none"
          />
          <button
            onClick={fetchHospitals}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Hospital Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">
              <th className="px-5 py-3">Hospital Details</th>
              <th className="px-5 py-3">Category Type</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Verification Status</th>
              <th className="px-5 py-3">Onboarded Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#08B36A]" />
                    <span className="font-bold">Loading hospitals data...</span>
                  </div>
                </td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-slate-400 font-bold">
                  No hospital records found.
                </td>
              </tr>
            ) : (
              hospitals.map((hosp) => (
                <tr key={hosp._id} className="hover:bg-slate-50/80 transition-all">
                  <td className="bg-slate-50/60 py-4 px-5 rounded-l-2xl">
                    <div className="font-bold text-slate-900 text-sm">{hosp.name}</div>
                    <div className="flex flex-col text-[11px] text-slate-500 mt-0.5 space-y-0.5">
                      <span className="flex items-center gap-1"><Mail size={12} /> {hosp.email}</span>
                      {hosp.phone && <span className="flex items-center gap-1 font-mono"><Phone size={12} /> {hosp.phone}</span>}
                    </div>
                  </td>

                  <td className="bg-slate-50/60 py-4 px-5">
                    <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      {hosp.hospitalType || 'General'}
                    </span>
                  </td>

                  <td className="bg-slate-50/60 py-4 px-5 text-slate-600">
                    <div className="font-semibold">{hosp.city ? `${hosp.city}, ${hosp.state || ''}` : 'N/A'}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{hosp.address || 'Address not specified'}</div>
                  </td>

                  <td className="bg-slate-50/60 py-4 px-5">
                    {getStatusBadge(hosp.profileStatus)}
                  </td>

                  <td className="bg-slate-50/60 py-4 px-5 text-slate-500 font-medium">
                    {hosp.createdAt ? new Date(hosp.createdAt).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Actions */}
                  <td className="bg-slate-50/60 py-4 px-5 text-right rounded-r-2xl">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedHospital(hosp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1"
                        title="View Profile Details"
                      >
                        <Eye size={13} /> View
                      </button>

                      {hosp.profileStatus === 'Pending' && (
                        <>
                          <button
                            onClick={() => setConfirmModal({ show: true, type: 'Approve', hospital: hosp })}
                            className="px-3 py-1.5 bg-[#08B36A] hover:bg-[#06965a] text-white rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1"
                            title="Approve Hospital"
                          >
                            <Check size={13} /> Approve
                          </button>
                          <button
                            onClick={() => setConfirmModal({ show: true, type: 'Reject', hospital: hosp })}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition inline-flex items-center gap-1"
                            title="Reject Hospital"
                          >
                            <Ban size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Total Hospitals: {totalDocs} | Page {currentPage} of {totalPages}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold px-3 text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* --- MODAL 1: HOSPITAL DETAIL & DOCUMENTS --- */}
      {selectedHospital && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Building2 className="text-[#08B36A]" size={20} /> {selectedHospital.name}
                </h3>
                <span className="text-xs text-slate-400">ID: {selectedHospital._id}</span>
              </div>
              <button onClick={() => setSelectedHospital(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedHospital.profileStatus)}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Hospital Type:</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                    {selectedHospital.hospitalType || 'Multi-Speciality'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Account Active:</span>
                  <span className={`font-bold mt-1 inline-block ${selectedHospital.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedHospital.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>

              {/* Contact and Location */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Contact & Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Email:</span>
                    <span className="font-bold text-slate-800">{selectedHospital.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Phone:</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedHospital.phone || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 block font-semibold">Address:</span>
                    <span className="font-medium text-slate-800">
                      {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}, {selectedHospital.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Uploaded License & Documents</h4>
                <div className="space-y-2">
                  {selectedHospital.licenseDocument && selectedHospital.licenseDocument.length > 0 ? (
                    selectedHospital.licenseDocument.map((doc, idx) => (
                      <a
                        key={idx}
                        href={getMediaUrl(doc)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-700 hover:bg-indigo-100 transition font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={16} /> Official License Document #{idx + 1}
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    ))
                  ) : (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl">No license documents uploaded.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                {selectedHospital.profileStatus === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmModal({ show: true, type: 'Approve', hospital: selectedHospital })}
                      className="px-5 py-2.5 bg-[#08B36A] hover:bg-[#06965a] text-white rounded-xl font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Check size={14} /> Approve Hospital
                    </button>
                    <button
                      onClick={() => setConfirmModal({ show: true, type: 'Reject', hospital: selectedHospital })}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Ban size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRM APPROVE / REJECT ACTION --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className={`p-2.5 rounded-2xl ${confirmModal.type === 'Approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {confirmModal.type === 'Approve' ? <CheckCircle2 size={24} /> : <Ban size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{confirmModal.type} Hospital Onboarding</h3>
                <p className="text-xs text-slate-500">{confirmModal.hospital?.name}</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to <strong>{confirmModal.type.toLowerCase()}</strong> access for this hospital profile?
              </p>

              {confirmModal.type === 'Reject' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Reason for Rejection (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. License documents are expired or unclear..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal({ show: false, type: '', hospital: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirmModal.type === 'Approve') {
                    handleApprove(confirmModal.hospital._id);
                  } else {
                    handleReject(confirmModal.hospital._id);
                  }
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition inline-flex items-center gap-1.5 disabled:opacity-50 ${
                  confirmModal.type === 'Approve' ? 'bg-[#08B36A] hover:bg-[#06965a]' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm {confirmModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}