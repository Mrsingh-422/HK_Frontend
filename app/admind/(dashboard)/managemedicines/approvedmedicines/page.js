'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import { 
  FaCheck, FaTimes, FaArrowLeft, FaSearch, 
  FaExclamationTriangle, FaInfoCircle, FaCapsules, 
  FaBuilding, FaDollarSign, FaUser, FaHistory, FaClock,
  FaFileMedical, FaPrescriptionBottleAlt
} from 'react-icons/fa';

export default function MedicineApprovalPage() {
  const themeColor = "#08B36A";

  // ==========================================
  // 🌟 LOADING & NOTIFICATION STATES
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ==========================================
  // 🌟 DATA STATES
  // ==========================================
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ==========================================
  // 🌟 MODAL CONTROL STATES
  // ==========================================
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState("");

  // Fetch pending medicine requests on mount
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getPendingMedicineRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to load pending requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- APPROVAL ACTIONS (API 2) ---
  const openApproveModal = (e, request) => {
    e.stopPropagation(); // Prevent triggering details modal on row click
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest?._id) return;
    setActionLoading(true);
    try {
      const response = await AdminAPI.approveMedicineRequest(selectedRequest._id);
      if (response.success) {
        showNotification(response.message || "Medicine approved and pushed to Master List.", "success");
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
        fetchPendingRequests(); // Reload list
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Approval failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // --- REJECTION ACTIONS (API 3) ---
  const openRejectModal = (e, request) => {
    e.stopPropagation(); // Prevent triggering details modal on row click
    setSelectedRequest(request);
    setAdminComment("");
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!selectedRequest?._id || !adminComment.trim()) {
      showNotification("Please provide a rejection comment.", "error");
      return;
    }
    setActionLoading(true);
    try {
      const response = await AdminAPI.rejectMedicineRequest(selectedRequest._id, {
        adminComment: adminComment.trim()
      });
      if (response.success) {
        showNotification(response.message || "Medicine request rejected successfully.", "success");
        setIsRejectModalOpen(false);
        setSelectedRequest(null);
        fetchPendingRequests(); // Reload list
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Rejection action failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  // Filter local records based on search input
  const filteredRequests = requests.filter(req => {
    const medName = req.data?.name?.toLowerCase() || '';
    const vendorName = req.vendorId?.name?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return medName.includes(query) || vendorName.includes(query);
  });

  return (
    <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans text-slate-900">
      
      {/* Status Notification Alert Toast */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[150] flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${
          notification.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="mr-3 font-semibold text-xs uppercase">
            {notification.type === 'error' ? 'Error' : 'Success'}
          </div>
          <div className="text-sm font-medium">{notification.message}</div>
        </div>
      )}

      {/* Top Metrics Panel */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Awaiting Verification</p>
          <p className="mt-1 text-3xl font-black text-gray-800">{requests.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Status</p>
          <div className="mt-2 text-sm font-semibold flex items-center">
            {loading ? (
              <span className="text-blue-600 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Syncing database...
              </span>
            ) : (
              <span className="text-[#08B36A] flex items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[#08B36A] mr-2 animate-pulse"></span>
                Action Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section Card */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        
        {/* Search & Header Layout */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
            Show 
            <select className="border border-gray-200 rounded-md px-2 py-1.5 outline-none focus:border-[#08B36A] bg-white cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select> 
            entries
          </div>
          <div className="relative w-full sm:w-auto">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records by pharmacy or drug name..." 
              className="w-full sm:w-80 pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide">
                <th className="p-5">S No.</th>
                <th className="p-5 text-center">Preview</th>
                <th className="p-5">Medicine Details</th>
                <th className="p-5">Manufacturer</th>
                <th className="p-5">Vendor Partner</th>
                <th className="p-5 text-center">mrp / best price</th>
                <th className="p-5 text-center">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="text-[14px] text-gray-700">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => (
                  <tr key={req._id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">
                    
                    {/* Clickable Columns (Triggers details inspect modal) */}
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-medium text-gray-500 cursor-pointer w-16">
                      {index + 1}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 text-center cursor-pointer w-20">
                      <div className="flex justify-center">
                        {req.data?.image_url?.[0] ? (
                          <img 
                            src={req.data.image_url[0]} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#e6f7eb] text-[#08B36A] flex items-center justify-center border border-gray-200">
                            <FaCapsules size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">
                      <div>
                        <p className="leading-tight text-slate-800">{req.data?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">Composition: {req.data?.salt_composition || "N/A"}</p>
                      </div>
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-semibold text-gray-600 cursor-pointer">
                      {req.data?.manufacturers || "N/A"}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-medium text-gray-600 cursor-pointer">
                      {req.vendorId?.name || "Unknown Pharmacy"}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 text-center cursor-pointer">
                      <p className="font-bold text-slate-400 text-xs line-through">₹{req.data?.mrp || 0}</p>
                      <p className="font-black text-[#08B36A] text-sm">₹{req.data?.best_price || 0}</p>
                    </td>

                    {/* Non-Clickable Action Columns */}
                    <td className="p-5 text-center w-52" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={(e) => openApproveModal(e, req)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#08B36A] hover:bg-[#069356] text-white text-[12px] font-bold rounded-xl shadow-[0_2px_8px_rgba(8,179,106,0.15)] transition-all"
                        >
                          <FaCheck size={9} /> Approve
                        </button>
                        <button 
                          onClick={(e) => openRejectModal(e, req)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[12px] font-bold rounded-xl transition-all"
                        >
                          <FaTimes size={9} /> Reject
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400 font-medium text-[14px]">
                    No pending medicine requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing {filteredRequests.length} pending medicine review entries
          </p>
        </div>

      </div>

      {/* ========================================= */}
      {/* 🌟 DETAIL VIEW INSPECT MODAL             */}
      {/* ========================================= */}
      {isDetailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                <FaInfoCircle size={16} /> Request Properties
              </h2>
              <button 
                onClick={() => setIsDetailsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto bg-white space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-5">
                {selectedRequest.data?.image_url?.[0] ? (
                  <img 
                    src={selectedRequest.data.image_url[0]} 
                    alt="Medicine" 
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#e6f7eb] border border-[#08B36A]/20 flex items-center justify-center shadow-sm shrink-0">
                    <FaCapsules className="text-[#08B36A] text-2xl" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-gray-800 leading-tight">{selectedRequest.data?.name}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Pending catalog request</p>
                </div>
              </div>

              {/* Attributes Details Section */}
              <div className="space-y-4 bg-[#fafafa] p-5 rounded-2xl border border-gray-100">
                
                {/* Vendor Partner */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaUser className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Submitted By Pharmacy</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      {selectedRequest.vendorId?.name || "Unknown Vendor"} 
                      {selectedRequest.vendorId?.phone && ` (${selectedRequest.vendorId.phone})`}
                    </p>
                  </div>
                </div>

                {/* Manufacturers */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaBuilding className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Manufacturers / Brand</p>
                    <p className="text-[13px] font-bold text-gray-800">{selectedRequest.data?.manufacturers || "N/A"}</p>
                  </div>
                </div>

                {/* Packaging details */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaFileMedical className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Packaging unit</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      {selectedRequest.data?.packaging || "e.g. Strip of 10 Tablets"}
                    </p>
                  </div>
                </div>

                {/* Base Cost / Price */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaDollarSign className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Pricing Details</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      MRP: <span className="line-through text-slate-400">₹{selectedRequest.data?.mrp || 0}</span> | Best Price: <span className="text-[#08B36A]">₹{selectedRequest.data?.best_price || 0}</span>
                    </p>
                  </div>
                </div>

                {/* Prescription required */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaPrescriptionBottleAlt className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Prescription Mandatory?</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      {selectedRequest.data?.prescription_required || "No"}
                    </p>
                  </div>
                </div>

              </div>

              {/* Salt Composition */}
              {selectedRequest.data?.salt_composition && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Chemical Salt Composition</h4>
                  <p className="text-xs font-semibold text-slate-600 bg-[#fafafa] border border-gray-100 rounded-2xl p-4 leading-relaxed">
                    {selectedRequest.data.salt_composition}
                  </p>
                </div>
              )}

              {/* Clinical Description */}
              {selectedRequest.data?.description && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Clinical Description / Usage</h4>
                  <p className="text-xs text-slate-500 bg-[#fafafa] border border-gray-100 rounded-2xl p-4 leading-relaxed italic">
                    "{selectedRequest.data.description}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-[11px] text-gray-400 font-bold">
                <div>ID: {selectedRequest._id}</div>
                <div className="text-right">REQUEST DATE: {new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🌟 APPROVAL CONFIRMATION MODAL            */}
      {/* ========================================= */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsApproveModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-200">
            
            <div className="w-16 h-16 bg-[#e6f7eb] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#08B36A]/20">
              <FaCheck className="text-[#08B36A] text-2xl" />
            </div>

            <h3 className="text-[20px] font-bold text-gray-800 mb-2">Approve Request?</h3>
            <p className="text-[14px] text-gray-500 font-medium mb-8 leading-relaxed">
              Confirming this will move <span className="text-gray-800 font-bold">"{selectedRequest.data?.name}"</span> into the master medicine inventory database.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => { setIsApproveModalOpen(false); setSelectedRequest(null); }} 
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleApproveConfirm} 
                className="flex-1 px-4 py-3 bg-[#08B36A] hover:bg-[#069356] disabled:opacity-45 text-white rounded-xl text-[14px] font-bold shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
              >
                {actionLoading ? "Processing..." : "Yes, Approve"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🌟 REJECTION MODAL WITH COMMENT          */}
      {/* ========================================= */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsRejectModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-[18px] font-bold text-red-500 flex items-center gap-2">
                <FaExclamationTriangle size={16} /> Reject Medicine Request
              </h2>
              <button 
                onClick={() => setIsRejectModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="p-6 md:p-8 space-y-5">
              <p className="text-sm text-gray-500 font-medium">
                Please enter a constructive reason below for rejecting <span className="text-gray-800 font-bold capitalize">"{selectedRequest.data?.name}"</span>. The pharmacy vendor will see this comment.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Rejection Comment / Remarks *</label>
                <textarea 
                  required
                  rows="3"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. Rejected because manufacturer details are wrong and incomplete." 
                  className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm font-semibold text-slate-800 resize-none" 
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-3 border-t">
                <button 
                  type="button"
                  onClick={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }} 
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-45 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all"
                >
                  {actionLoading ? "Processing..." : "Confirm Reject"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}