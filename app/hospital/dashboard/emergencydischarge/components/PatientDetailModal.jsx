'use client'

import React, { useEffect, useState } from 'react'
import { 
  FaTimes, FaUserMd, FaProcedures, FaClock, 
  FaHeartbeat, FaFilePrescription, FaPrint, FaTint, FaUserCheck
} from 'react-icons/fa'
import HospitalAPI from '@/app/services/HospitalAPI';

const PatientDetailModal = ({ appointmentId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      loadClinicalCaseFile();
    }
  }, [appointmentId]);

  const loadClinicalCaseFile = async () => {
    setLoading(true);
    try {
      const response = await HospitalAPI.getAdmissionDetails(appointmentId);
      if (response?.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Clinical fetching error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentId) return null;

  // Compute profile fallback variables
  const patient = data?.patient || {};
  const patientName = patient.patients?.[0]?.patientName || patient.userId?.name || "Unknown Patient";
  const patientAge = patient.patients?.[0]?.patientAge ;
  const patientGender = patient.patients?.[0]?.gender || patient.userId?.gender ;
  const relation = patient.patients?.[0]?.relation ;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Clinical Case File</h2>
              {patient.bookingId && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  {patient.bookingId}
                </span>
              )}
            </div>
            <p className="text-slate-400 font-bold text-xs mt-0.5">Registry Record • Internal Emergency Dept.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow min-h-0 bg-white">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#08B36A]"></div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl font-black text-[#08B36A] border-2 border-white">
                  {patientName.charAt(0)}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{patientName}</h3>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-400 mt-1">
                    <span>{patientAge} Years &bull; {patientGender} ({relation})</span>
                    <span>&bull;</span>
                    <span className="text-rose-500 flex items-center gap-1">
                      <FaTint size={10} /> Blood: {patient.clinicalSummary?.bloodGroup }
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ward Placement</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-black bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 text-xs">
                    <FaProcedures className="text-[#08B36A]" /> {patient.bedId?.wardId?.name || "Neuro ICU"} ({patient.bedId?.bedNumber || "NI-11"})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column: Diagnostics */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Case Details</h4>
                    <div className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Chief Complaint:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{patient.clinicalSummary?.chiefComplaint || "No complaint specified"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Admission Reason:</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{patient.clinicalSummary?.admissionNote || "N/A"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Final Diagnosis:</p>
                        <p className="font-semibold text-[#08B36A] mt-0.5">{patient.clinicalSummary?.diagnosis || "Diagnosis pending clinical review"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bedside Care team shifts */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Bedside Care Team</h4>
                    <div className="space-y-2">
                      {patient.bedsideCareTeam && patient.bedsideCareTeam.length > 0 ? (
                        patient.bedsideCareTeam.map((doc, idx) => {
                          const docObj = typeof doc.doctorId === 'object' ? doc.doctorId : { name: "Specialist Consultant", speciality: "Attending" };
                          return (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-150 rounded-xl text-xs">
                              <div className="flex items-center space-x-2.5">
                                <FaUserMd className="text-slate-400" />
                                <div>
                                  <p className="font-bold text-slate-800">{docObj.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{docObj.speciality || "Specialist"}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-[#08B36A]/10 text-[#08B36A] px-2.5 py-1 rounded-md">
                                {doc.status || "Completed"}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pl-1">No bedside specialist transfers initiated.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Personnel & Prescriptions */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Lead Physician</h4>
                    <div className="flex items-center gap-3 p-3 bg-white border border-slate-150 rounded-2xl text-xs">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base">
                        <FaUserMd />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{patient.doctorId?.name || "Dr. Attending"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{patient.doctorId?.speciality || "General"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Treatment Outcome</h4>
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs space-y-2 text-slate-700">
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Investigation:</p>
                        <p className="font-medium mt-0.5">{patient.clinicalSummary?.investigation || "Standard followups"}</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-400 uppercase text-[9px]">Result Summary:</p>
                        <p className="font-medium mt-0.5">{patient.clinicalSummary?.treatmentResult || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Clinical Reports</h4>
                    <div className="space-y-2 text-xs">
                      {patient.clinicalSummary?.uploadedReports && patient.clinicalSummary.uploadedReports.length > 0 ? (
                        patient.clinicalSummary.uploadedReports.map((report, idx) => (
                          <a 
                            key={idx}
                            href={getFullUrl(report)} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center space-x-2 p-2 border border-[#08B36A]/20 hover:bg-[#08B36A]/5 rounded-xl text-[#08B36A] font-bold transition"
                          >
                            <FaFilePrescription size={12} />
                            <span>View Lab Report File #{idx + 1}</span>
                          </a>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pl-1">No lab files attached to case.</p>
                      )}
                      {data.prescription?.dietPlanPdf && (
                        <a 
                          href={getFullUrl(data.prescription.dietPlanPdf)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-2 p-2 border border-blue-200 hover:bg-blue-50 rounded-xl text-blue-600 font-bold transition"
                        >
                          <FaFilePrescription size={12} />
                          <span>View Diet Plan PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">Failed to load dossier file details.</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 flex gap-3">
          <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all">
            <FaPrint /> PRINT DISCHARGE FORM
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-slate-200 text-slate-500 py-3 rounded-xl font-bold text-xs hover:border-slate-400 hover:text-slate-800 transition-all animate-none"
          >
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientDetailModal;