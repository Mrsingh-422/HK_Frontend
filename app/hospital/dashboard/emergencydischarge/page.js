'use client'

import React, { useState, useEffect } from 'react'
import {
  FaUserCheck, FaFileAlt, FaSignOutAlt,
  FaNotesMedical, FaDollarSign,
  FaCheckCircle, FaSearch, FaUserMd, FaTint, FaRegCalendarAlt, FaAmbulance, FaProcedures
} from 'react-icons/fa'
import PatientDetailModal from './components/PatientDetailModal';
import CompleteDischargeModal from './components/CompleteDischargeModal';
import HospitalAPI from '@/app/services/HospitalAPI';

export default function EmergencyDischargePage() {
  const [activeTab, setActiveTab] = useState("emergency"); // "emergency" or "admission"
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePatientId, setActivePatientId] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDischargeCandidates(activeTab);
  }, [activeTab]);

  const fetchDischargeCandidates = async (caseType) => {
    setLoading(true);
    try {
      // Calls updated API function with id as null and the current active tab type
      const response = await HospitalAPI.getAdmissionDetails(null, caseType);

      console.log(`Discharge Patients API Response (${caseType}):`, response);

      if (response?.success) {
        setPatients(response.data || []);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error(`Failed to load discharge patients for ${caseType}:`, error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (id) => {
    setActivePatientId(id);
    setIsModalOpen(true);
  };

  const handleOpenDischarge = (patient) => {
    setActivePatient(patient);
    setIsCompleteOpen(true);
  };

  const handleConfirmDischarge = async (data) => {
    try {
      let response;
      if (data.isEmergency) {
        response = await HospitalAPI.finalizeEmergencyDischarge({
          appointmentId: data.appointmentId,
          billingItems: data.billingItems
        });
      } else {
        response = await HospitalAPI.finalizeDischarge({
          appointmentId: data.appointmentId,
          billingItems: data.billingItems
        });
      }

      if (response?.success) {
        alert(`${response.message || "Discharge complete"}. Final Closed Cost: ₹${response.billAmount || response.data?.totalAmount}`);
        fetchDischargeCandidates(activeTab); 
      } else {
        alert(response?.message || "Failed to finalize admission closure.");
      }
    } catch (error) {
      console.error("Error processing discharge closure:", error);
      alert("Failed to finalize discharge procedure.");
    }
  };

  // We rely directly on the backend's API response filters, applying only the local query search
  const filteredPatients = patients.filter(p => {
    const mainUserName = p.userId?.name || "";
    const secondaryPatientName = p.patients?.[0]?.patientName || "";
    const bookingId = p.bookingId || "";
    
    return mainUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           secondaryPatientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bookingId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">

      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="p-3 bg-[#08B36A] rounded-2xl shadow-lg shadow-green-100 text-white flex items-center justify-center">
              <FaSignOutAlt />
            </span>
            Discharge Lounge
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage finalized cases and patient departures</p>
        </div>

        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name or Booking ID..."
            className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-[#08B36A] outline-none transition-all font-semibold text-xs"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="max-w-7xl mx-auto mb-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 duration-200 ${
            activeTab === "emergency"
              ? "border-[#08B36A] text-[#08B36A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FaAmbulance size={14} />
          Emergency Ambulances
        </button>
        <button
          onClick={() => setActiveTab("admission")}
          className={`flex items-center gap-2 pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 duration-200 ${
            activeTab === "admission"
              ? "border-[#08B36A] text-[#08B36A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <FaProcedures size={14} />
          Hospital Admissions
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-150 shadow-sm max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A] mb-4"></div>
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Fetching Pending Discharges...</span>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6">Patient Info</th>
                  <th className="p-4">Clinical Diagnosis</th>
                  <th className="p-4">Allotment (Location)</th>
                  <th className="p-4">Attending Doctor</th>
                  <th className="p-4">Admission Schedule</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((item) => {
                  const patientName = item.patients?.[0]?.patientName || item.userId?.name || "Unknown Patient";
                  const patientAge = item.patients?.[0]?.patientAge ;
                  const patientGender = item.patients?.[0]?.gender || item.userId?.gender;
                  const relation = item.patients?.[0]?.relation;
                  const bloodGroup = item.clinicalSummary?.bloodGroup || "N/A";

                  const chiefComplaint = item.clinicalSummary?.chiefComplaint || item.patients?.[0]?.reasonForVisit ;
                  const diagnosis = item.clinicalSummary?.diagnosis || "Undisclosed Diagnosis";

                  const isDoctorObject = typeof item.doctorId === 'object' && item.doctorId !== null;
                  const docName = isDoctorObject ? item.doctorId.name : "Lead Attending";
                  const docSpec = isDoctorObject ? item.doctorId.speciality : "Duty Physician";

                  const isAmbulanceObj = typeof item.ambulanceId === 'object' && item.ambulanceId !== null;
                  const ambulanceName = isAmbulanceObj ? item.ambulanceId.name : "Emergency Transit Services";

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Patient Info */}
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-wider mb-0.5">
                            {item.bookingId || "CAS-ID"}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 leading-tight">
                            {patientName}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-400">
                            <span>{patientAge} Yrs &bull; {patientGender} ({relation})</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 text-red-500">
                              <FaTint size={9} /> Blood: {bloodGroup}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Clinical Details */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <span className="p-1 bg-slate-100 text-slate-500 rounded text-[9px] uppercase tracking-wider font-extrabold">Complaint</span>
                            <span className="truncate">{chiefComplaint || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <span className="p-1 bg-green-50 text-[#08B36A] rounded text-[9px] uppercase tracking-wider font-extrabold">Diagnosis</span>
                            <span className="truncate">{diagnosis}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location / Allotment */}
                      <td className="p-4">
                        {item.bedId ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              <FaNotesMedical className="text-[#08B36A]" size={11} />
                              <span>
                                {item.bedId.wardId?.name} ({item.bedId.wardId?.type || "ICU"}) &bull; Bed {item.bedId.bedNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-0.5">
                              <FaDollarSign size={8} className="text-slate-300" /> 
                              <span>₹{item.bedId.pricePerDay || 0} / Day Rate</span>
                            </span>
                          </div>
                        ) : item.ambulanceId ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#08B36A]">
                              <FaAmbulance size={11} />
                              <span>Emergency Transit</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold truncate max-w-[180px]">
                              {ambulanceName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">No Bed Allocated</span>
                        )}
                      </td>

                      {/* Doctor Info */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                            <FaUserMd className="text-slate-400" size={12} />
                            <span>{docName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5 pl-4 uppercase tracking-wider">
                            {docSpec}
                          </span>
                        </div>
                      </td>

                      {/* Admission Schedule */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <FaRegCalendarAlt className="text-slate-400" size={11} />
                          <span>{formatDate(item.startDate)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.status === 'Discharge-Pending' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/50' 
                            : 'bg-green-50 text-[#08B36A] border border-[#08B36A]/20'
                        }`}>
                          {item.status || "Ready"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDischarge(item)}
                            className="px-3.5 py-2 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition shadow-sm"
                          >
                            <FaCheckCircle size={10} /> COMPLETE
                          </button>
                          <button
                            onClick={() => handleOpenDetail(item._id)}
                            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-500 hover:border-slate-800 hover:text-slate-800 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition"
                          >
                            <FaFileAlt size={10} /> DETAILS
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 max-w-7xl mx-auto bg-white rounded-3xl border border-slate-150 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FaUserCheck size={30} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No pending discharges found</h3>
          <p className="text-slate-400 text-sm mt-1">All {activeTab} departures have been cleared.</p>
        </div>
      )}

      {/* Clinical Dossier Modal */}
      {isModalOpen && (
        <PatientDetailModal
          appointmentId={activePatientId}
          patientData={patients.find(p => p._id === activePatientId)}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Complete Discharge Billing Modal */}
      {isCompleteOpen && (
        <CompleteDischargeModal
          patient={activePatient}
          initialBillingItems={activePatient?.specialServices || []}
          onClose={() => setIsCompleteOpen(false)}
          onConfirm={handleConfirmDischarge}
        />
      )}
    </div>
  )
}