'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import { 
    FaCheck, FaTimes, FaArrowLeft, FaSearch, 
    FaExclamationTriangle, FaInfoCircle, FaFlask, 
    FaListAlt, FaBuilding, FaDollarSign, FaFileMedical,
    FaUser
} from 'react-icons/fa';

export default function Page() {
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

  // Fetch pending requests on mount
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
      const response = await AdminAPI.getPendingLabTestRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to load pending requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (e, request) => {
    e.stopPropagation(); // Prevent row click details modal
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest?._id) return;
    setActionLoading(true);
    try {
      const response = await AdminAPI.approveLabTestRequest(selectedRequest._id);
      if (response.success) {
        showNotification(response.message || "Request approved and moved to Master list.", "success");
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
        fetchPendingRequests(); // Reload data
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Approval action failed.", "error");
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
    const testName = req.data?.testName?.toLowerCase() || '';
    const vendorName = req.vendorId?.name?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return testName.includes(query) || vendorName.includes(query);
  });

  return (
    <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
      
      {/* Notification Banner */}
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pending Requests</p>
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
                Awaiting Decisions
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section Card */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        
        {/* Search & Header layout */}
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
              placeholder="Search records by vendor or test name..." 
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
                <th className="p-5">Submitted Test Title</th>
                <th className="p-5">Lab Vendor Partner</th>
                <th className="p-5 text-center">Sample Type</th>
                <th className="p-5 text-center">Standard MRP</th>
                <th className="p-5 text-center">Verification Action</th>
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
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">
                      {req.data?.testName || "N/A"}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 font-medium text-gray-600 cursor-pointer">
                      {req.vendorId?.name || "Unknown Vendor"}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 text-center cursor-pointer font-medium text-slate-500">
                      {req.data?.sampleType || "Blood"}
                    </td>
                    <td onClick={() => handleOpenDetails(req)} className="p-5 text-center cursor-pointer font-bold text-slate-800">
                      ₹{req.data?.standardMRP || 0}
                    </td>

                    {/* Non-Clickable Action columns */}
                    <td className="p-5 text-center w-40">
                      <button 
                        onClick={(e) => openApproveModal(e, req)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#08B36A] hover:bg-[#069356] text-white text-[12px] font-bold rounded-xl shadow-[0_2px_8px_rgba(8,179,106,0.15)] transition-all"
                      >
                        <FaCheck size={10} /> Approve Entry
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400 font-medium text-[14px]">
                    No pending verification requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing {filteredRequests.length} pending review items
          </p>
        </div>

      </div>

      {/* ========================================= */}
      {/* 🌟 DETAIL VIEW INSPECT MODAL (API 2 style) */}
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
                <div className="w-16 h-16 rounded-2xl bg-[#e6f7eb] border border-[#08B36A]/20 flex items-center justify-center shadow-sm shrink-0">
                  <FaFlask className="text-[#08B36A] text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800">{selectedRequest.data?.testName}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">Pending approval setup</p>
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
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Submitted By</p>
                    <p className="text-[13px] font-bold text-gray-800">{selectedRequest.vendorId?.name || "Unknown Vendor"}</p>
                  </div>
                </div>

                {/* Base Category */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaListAlt className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Classification Domain</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      {selectedRequest.data?.mainCategory || "Pathology"} ({selectedRequest.data?.category || "General"})
                    </p>
                  </div>
                </div>

                {/* Base Cost / Price */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaDollarSign className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Base Market Price (MRP)</p>
                    <p className="text-[13px] font-bold text-[#08B36A]">₹{selectedRequest.data?.standardMRP || 0}</p>
                  </div>
                </div>

                {/* Pretest Preparation requirements */}
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shrink-0">
                    <FaFileMedical className="text-[#08B36A] text-[13px]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Pre-test Requirements</p>
                    <p className="text-[13px] font-bold text-gray-800">
                      {selectedRequest.data?.pretestPreparation || "No special instructions required"}
                    </p>
                  </div>
                </div>

              </div>

              {/* Sub parameters array details */}
              {selectedRequest.data?.parameters && selectedRequest.data.parameters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Associated Variables ({selectedRequest.data.parameters.length})</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedRequest.data.parameters.map((param, i) => (
                      <div key={i} className="p-3 bg-[#fafafa] rounded-xl border border-gray-150 text-xs flex justify-between">
                        <span className="font-bold text-slate-800">{param.name}</span>
                        <span className="text-[11px] font-bold text-[#08B36A]">{param.unit || 'No Unit'}</span>
                      </div>
                    ))}
                  </div>
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
              Confirming this will move <span className="text-gray-800 font-bold">"{selectedRequest.data?.testName}"</span> into the master diagnostics database list.
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
                className="flex-1 px-4 py-3 bg-[#08B36A] hover:bg-[#069356] disabled:opacity-40 text-white rounded-xl text-[14px] font-bold shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
              >
                {actionLoading ? "Processing..." : "Yes, Approve"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}