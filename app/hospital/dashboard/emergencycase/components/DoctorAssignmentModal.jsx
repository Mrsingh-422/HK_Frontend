"use client";

import React from 'react';
import { FaTimes, FaUserMd, FaClock, FaCheckCircle, FaStethoscope } from 'react-icons/fa';

const DoctorAssignmentModal = ({ 
  isOpen, 
  onClose, 
  onBack, 
  onFinalize, 
  doctors, 
  selectedDoctorId, 
  onSelectDoctor, 
  isProcessing 
}) => {
  if (!isOpen) return null;

  // Formatter helper: Extracts initials for physician profile avatars
  const getDoctorInitials = (name) => {
    if (!name) return "Dr";
    const parts = name.replace(/^(Dr\.|dr\.)\s*/i, "").split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 md:p-8 border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-50 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#08B36A]/10 text-[#08B36A] rounded-xl">
              <FaStethoscope size={14} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Lead Physician</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Step 3: Assign Attending Doctor</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Doctor List Directory */}
        <div className="flex-grow overflow-y-auto min-h-0 py-1 pr-1 space-y-3">
          {doctors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase italic flex flex-col items-center gap-2">
              <FaUserMd size={20} className="text-slate-300" />
              <span>No Active Doctors On Duty</span>
            </div>
          ) : (
            doctors.map(doc => {
              const isChosen = selectedDoctorId === doc._id;
              return (
                <div 
                  key={doc._id}
                  onClick={() => onSelectDoctor(doc._id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                    isChosen 
                      ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-lg shadow-[#08B36A]/15 scale-102 z-10' 
                      : 'bg-white border-slate-200 hover:border-[#08B36A] hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Doctor Initials Avatar Badge */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs transition-colors shrink-0 ${
                      isChosen 
                        ? 'bg-white/10 text-white border border-white/20' 
                        : 'bg-[#08B36A]/15 text-[#08B36A]'
                    }`}>
                      {getDoctorInitials(doc.name)}
                    </div>
                    
                    <div className="truncate">
                      <h4 className={`font-extrabold text-xs uppercase leading-tight ${isChosen ? 'text-white' : 'text-slate-900'}`}>
                        Dr. {doc.name}
                      </h4>
                      <p className={`text-[8px] font-black uppercase tracking-wider mt-1 ${
                        isChosen ? 'text-white/80' : 'text-slate-400'
                      }`}>
                        {doc.speciality || 'General Medicine'}
                      </p>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isChosen ? 'bg-white border-white scale-110' : 'border-slate-300 group-hover:border-[#08B36A]'
                  }`}>
                    {isChosen && <div className="w-1.5 h-1.5 bg-[#08B36A] rounded-full animate-scaleIn"></div>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3.5 mt-6 border-t border-slate-100 pt-5 shrink-0">
          <button 
            type="button"
            onClick={onBack} 
            className="flex-1 py-3.5 border border-slate-200 text-slate-500 hover:text-slate-800 font-extrabold text-[10px] tracking-widest uppercase rounded-xl hover:bg-slate-50 transition-all active:scale-98"
          >
            &larr; Prev: Bed Map
          </button>
          
          <button 
            type="button"
            onClick={onFinalize} 
            disabled={!selectedDoctorId || isProcessing}
            className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#079d5c] disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-md shadow-[#08B36A]/10 active:scale-98"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <FaClock className="animate-spin text-sm" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <FaCheckCircle size={10} />
                <span>Finalize & Admit</span>
              </div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorAssignmentModal;