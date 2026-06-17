'use client'

import HospitalAPI from '@/app/services/HospitalAPI';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaTimes, FaSpinner, FaRegCalendarAlt, FaUserMd, 
  FaNotesMedical, FaDollarSign, FaProcedures, FaPrint, FaTint, FaHistory,
  FaAmbulance, FaUser, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

export default function HospitalHistory() {
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'admission'
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination Configuration (Synchronized Server-Side)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Modal Detail State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch History List using the dynamic tab-specific caseType queries
  const fetchHistory = useCallback(async (tab, page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        caseType: tab, // 'emergency' or 'admission'
        page: page,
        limit: itemsPerPage
      };
      
      const res = await HospitalAPI.getHospitalHistory(params);
      console.log("History API response loaded:", res);
      
      if (res && res.success) {
        setHistoryList(res.data || []);
        setTotalRecords(res.totalRecords || 0);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || 1);
      } else {
        setError(res?.message || 'Failed to load historical admission logs.');
      }
    } catch (err) {
      console.error("Error inside fetchHistory:", err);
      setError('An error occurred while fetching history logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when the tab or page indexes are selected
  useEffect(() => {
    fetchHistory(activeTab, currentPage);
  }, [activeTab, currentPage, fetchHistory]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset page constraints on tab shifts
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen text-slate-800 font-sans antialiased selection:bg-[#08B36A]/20">
      
      {/* Header Panel */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="p-3 bg-[#08B36A]/10 rounded-2xl text-[#08B36A] flex items-center justify-center">
              <FaHistory size={24} />
            </span>
            Hospital History & Logs
          </h1>
          <p className="text-slate-400 font-semibold text-xs mt-1 uppercase tracking-wider">Review admissions, bed bookings, diagnostic clinical history, and billing records.</p>
        </div>
        <div className="bg-[#08B36A]/10 text-[#08B36A] px-5 py-2.5 rounded-xl border border-[#08B36A]/20 font-black text-sm flex items-center gap-1.5 shadow-sm">
          Active Registry Count: {totalRecords}
        </div>
      </div>

      {/* Dynamic Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-150 shadow-sm mb-6 max-w-lg">
        <button
          onClick={() => handleTabChange('emergency')}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'emergency' 
              ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/15 scale-102' 
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          🚑 Emergency Cases
        </button>
        <button
          onClick={() => handleTabChange('admission')}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'admission' 
              ? 'bg-[#08B36A] text-white shadow-md shadow-[#08B36A]/15 scale-102' 
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          🏨 Direct Admissions
        </button>
      </div>

      {/* Main Table Interface */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-150 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A] mb-4"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading historical data...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center">
          <p className="text-rose-700 font-semibold">{error}</p>
          <button
            onClick={() => fetchHistory(activeTab, currentPage)}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Retry Request
          </button>
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-150 shadow-sm">
          <p className="text-slate-400 font-semibold text-sm">No historical log entries registered in this classification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Booking Details</th>
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Attending Doctor</th>
                  <th className="p-4">Allotment Placement</th>
                  <th className="p-4">Duration Timeline</th>
                  <th className="p-4 text-right">Invoice Sum</th>
                  <th className="p-4 text-center">Outcome</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {historyList.map((item) => {
                  const mainPatient = item.patients?.[0] || {};
                  const doctor = item.doctorId && typeof item.doctorId === 'object' ? item.doctorId : null;
                  const bed = item.bedId && typeof item.bedId === 'object' ? item.bedId : null;
                  
                  // Check if item is linked to an emergency ambulance drop-off
                  const isAmbulanceDropOff = !!item.ambulanceId;

                  return (
                    <tr key={item._id} className="hover:bg-[#08B36A]/5 transition-colors duration-150">
                      
                      {/* Booking ID & Type */}
                      <td className="p-4 pl-6">
                        <span className="font-extrabold text-slate-900 block text-xs">#{item.bookingId || 'N/A'}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">{item.bookingType || 'Consultation'}</span>
                        <span className={`inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          isAmbulanceDropOff 
                            ? 'bg-rose-50 text-rose-600 border-rose-150' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-150'
                        }`}>
                          {isAmbulanceDropOff ? 'Ambulance Entry' : 'General Walk-In'}
                        </span>
                      </td>

                      {/* Patient details */}
                      <td className="p-4">
                        <p className="font-extrabold text-slate-800 text-sm">{mainPatient.patientName || item.userId?.name || 'N/A'}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {mainPatient.patientAge ? `${mainPatient.patientAge} Yrs` : ''} {mainPatient.gender ? `• ${mainPatient.gender}` : ''}
                        </p>
                      </td>

                      {/* Doctor details */}
                      <td className="p-4">
                        {doctor ? (
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm">{doctor.name || 'N/A'}</p>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                              {doctor.speciality || 'General'} {doctor.qualification ? `• ${doctor.qualification}` : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Ward & Bed details */}
                      <td className="p-4">
                        {bed ? (
                          <div className="flex flex-col gap-0.5">
                            <p className="font-bold text-slate-800 text-xs">{bed.wardId?.name || item.wardName || 'N/A'}</p>
                            <p className="text-[10px] text-[#08B36A] font-bold uppercase">Bed: {item.bedNumber || bed.bedNumber || 'N/A'}</p>
                          </div>
                        ) : item.wardName || item.bedNumber ? (
                          <div className="flex flex-col gap-0.5">
                            <p className="font-bold text-slate-800 text-xs">{item.wardName || 'N/A'}</p>
                            <p className="text-[10px] text-[#08B36A] font-bold uppercase">Bed: {item.bedNumber || 'N/A'}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-medium">Emergency Triage</span>
                        )}
                      </td>

                      {/* Admission Dates */}
                      <td className="p-4">
                        <p className="text-xs text-slate-500 font-medium">
                          <strong className="text-slate-400 font-bold uppercase text-[9px]">Admitted:</strong> {formatDate(item.appointmentDate || item.startDate)}
                        </p>
                        {item.endDate && (
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            <strong className="text-slate-400 font-bold uppercase text-[9px]">Discharged:</strong> {formatDate(item.endDate)}
                          </p>
                        )}
                      </td>

                      {/* Amount Details */}
                      <td className="p-4 text-right font-black text-slate-900 text-sm">
                        ₹{item.totalAmount?.toLocaleString('en-IN') || '0'}
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {item.paymentStatus || 'Pending'}
                        </div>
                      </td>

                      {/* Treatment Status */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#08B36A]/10 text-[#08B36A] border border-[#08B36A]/15">
                          {item.status || 'Completed'}
                        </span>
                      </td>

                      {/* Action trigger */}
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => openDetailsModal(item)}
                          className="px-3.5 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white font-bold rounded-xl text-[10px] uppercase transition shadow-sm hover:shadow-lg hover:shadow-[#08B36A]/15"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Step A.3 Server Synchronized) */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">
              Page {currentPage} of {totalPages} (Total {totalRecords} Records)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition"
              >
                <FaChevronLeft size={9} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-50 text-xs font-bold rounded-xl transition"
              >
                <FaChevronRight size={9} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Clinical Summary Modal */}
      {isModalOpen && selectedRecord && (() => {
        const modalUser = selectedRecord.userId && typeof selectedRecord.userId === 'object' ? selectedRecord.userId : {};
        const modalDoctor = selectedRecord.doctorId && typeof selectedRecord.doctorId === 'object' ? selectedRecord.doctorId : null;
        
        return (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200/50 flex flex-col my-8 max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Case Dossier</h2>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {selectedRecord.bookingType || 'Consultation'}
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-xs mt-0.5">Booking ID: {selectedRecord.bookingId || 'N/A'}</p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow min-h-0 bg-white">
                
                {/* Patient and Doctor Quick Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Section */}
                  <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <h3 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider mb-3">Primary Patient Details</h3>
                    <p className="font-extrabold text-slate-900 text-base">
                      {selectedRecord.patients?.[0]?.patientName || selectedRecord.userId?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Age: {selectedRecord.patients?.[0]?.patientAge || 'N/A'} | Gender: {selectedRecord.patients?.[0]?.gender || 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-3 border-t border-slate-100/50 pt-2.5">
                      Booked by: {modalUser.name || 'N/A'} ({modalUser.phone || 'N/A'})
                    </p>
                  </div>

                  {/* Assigned Professional */}
                  <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    <h3 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider mb-3">Attending Physician</h3>
                    {modalDoctor ? (
                      <div>
                        <p className="font-extrabold text-slate-900 text-base">{modalDoctor.name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">{modalDoctor.speciality || 'General Medicine'}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-3 border-t border-slate-100/50 pt-2.5">
                          Credentials: {modalDoctor.qualification || 'N/A'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs italic font-medium">No clinical doctor assigned to this history record.</p>
                    )}
                  </div>
                </div>

                {/* Stay & Bed Assignment */}
                <div className="p-5 bg-[#08B36A]/5 border border-[#08B36A]/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider">Ward & Bed Info</h4>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">
                      {selectedRecord.wardName || 'N/A'} - {selectedRecord.bedNumber || 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Type: {selectedRecord.bedBookingType || 'Standard'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider">Stay Timeline</h4>
                    <p className="text-sm text-slate-900 mt-1 font-extrabold">
                      {formatDate(selectedRecord.appointmentDate || selectedRecord.startDate)} to {formatDate(selectedRecord.endDate)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider">Duration of Stay</h4>
                    <p className="text-sm text-slate-900 mt-1 font-extrabold">
                      {selectedRecord.stayDuration || 0} Days
                    </p>
                  </div>
                </div>

                {/* Clinical Summary & Notes */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50/50 px-5 py-3 text-[10px] font-bold text-[#08B36A] border-b border-slate-100 uppercase tracking-wider">
                    Clinical Summary & Patient Diagnostics
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="space-y-4">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Chief Complaint</span>
                        <p className="text-slate-800 font-semibold mt-1">{selectedRecord.clinicalSummary?.chiefComplaint || 'No complaints registered.'}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Diagnosis</span>
                        <p className="text-slate-950 font-extrabold mt-1">{selectedRecord.clinicalSummary?.diagnosis || 'Pending clinical diagnosis.'}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Investigation Notes</span>
                        <p className="text-slate-800 font-semibold mt-1">{selectedRecord.clinicalSummary?.investigation || 'No specific diagnostic investigation found.'}</p>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 md:pt-0 md:pl-5">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Treatment Result</span>
                        <p className="text-slate-800 font-semibold mt-1">{selectedRecord.clinicalSummary?.treatmentResult || 'No registered summary.'}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Admission Note</span>
                        <p className="text-slate-800 font-semibold mt-1">{selectedRecord.clinicalSummary?.admissionNote || 'No special admission details provided.'}</p>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Discharge Note</span>
                        <p className="text-slate-800 font-semibold mt-1">{selectedRecord.clinicalSummary?.dischargeNote || 'No discharge notes provided.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown & Special Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Special Services */}
                  <div className="border border-slate-200/80 rounded-2xl p-5">
                    <h4 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider mb-3.5 border-b border-slate-100 pb-2.5">
                      Special Services Used
                    </h4>
                    {selectedRecord.specialServices && selectedRecord.specialServices.length > 0 ? (
                      <div className="space-y-2.5 text-xs">
                        {selectedRecord.specialServices.map((service) => (
                          <div key={service._id} className="flex justify-between items-center">
                            <span className="text-slate-600 font-semibold">{service.serviceName}</span>
                            <span className="font-extrabold text-slate-900">₹{service.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No extra or special health services registered for this patient.</p>
                    )}
                  </div>

                  {/* Pricing Ledger */}
                  <div className="bg-[#08B36A]/5 border border-[#08B36A]/10 rounded-2xl p-5">
                    <h4 className="text-[10px] font-bold text-[#08B36A] uppercase tracking-wider mb-3.5 border-b border-[#08B36A]/10 pb-2.5">
                      Billing Details (INR)
                    </h4>
                    {selectedRecord.pricingBreakdown ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Base Bed Fee:</span>
                          <span>₹{selectedRecord.pricingBreakdown.baseFee}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Doctor Visit Charges:</span>
                          <span>₹{selectedRecord.pricingBreakdown.visitCharges}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Extra Charges:</span>
                          <span>₹{selectedRecord.pricingBreakdown.extraCharges}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-semibold">
                          <span>Discount Applied:</span>
                          <span className="text-red-500 font-bold">-₹{selectedRecord.pricingBreakdown.discountAmount}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 border-t border-[#08B36A]/10 pt-2.5 text-sm">
                          <span>Total Due:</span>
                          <span className="text-[#08B36A]">₹{selectedRecord.totalAmount}</span>
                        </div>
                        <div className="mt-3 text-right">
                          <span className="inline-block bg-[#08B36A] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            Payment: {selectedRecord.paymentStatus || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between font-extrabold text-slate-900 pt-2 text-sm">
                        <span>Total Invoice:</span>
                        <span>₹{selectedRecord.totalAmount || 0}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <FaPrint /> Print Case File
                </button>
                <button
                  onClick={closeDetailsModal}
                  className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-xs hover:border-slate-400 hover:text-slate-800 transition-all"
                >
                  Close Dossier
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}