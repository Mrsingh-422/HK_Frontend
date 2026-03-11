'use client'
import React from 'react'
import { 
  FaTimes, FaUserMd, FaProcedures, FaClock, 
  FaHeartbeat, FaThermometerHalf, FaTint, 
  FaFilePrescription, FaHistory, FaPrint 
} from 'react-icons/fa'

const PatientDetailModal = ({ patient, onClose }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Case File</h2>
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {patient.id}
                </span>
            </div>
            <p className="text-slate-400 font-bold text-xs mt-1">Registry Record • Internal Emergency Dept.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
          
          {/* Patient Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-10 bg-slate-50/50 p-6 rounded-[2.5rem]">
            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-4xl font-black text-[#08B36A] border-4 border-white">
              {patient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black text-slate-800 mb-1">{patient.name}</h3>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-2"><FaUserMd className="text-slate-300"/> {patient.age} Years</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span className="flex items-center gap-2 text-red-500"><FaTint /> Blood: {patient.bloodGroup || 'O+'}</span>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Location</p>
              <div className="flex items-center gap-2 text-slate-800 font-black bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <FaProcedures className="text-[#08B36A]" /> {patient.room || 'ER-Bay 1'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Vitals & Condition */}
            <div className="space-y-8">
              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Live Vitals</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                        <FaHeartbeat className="text-red-500 text-xl" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</p>
                            <p className="text-lg font-black text-slate-800">78 <small className="text-[10px] text-slate-400">BPM</small></p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                        <FaThermometerHalf className="text-orange-500 text-xl" />
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Temp</p>
                            <p className="text-lg font-black text-slate-800">98.6 <small className="text-[10px] text-slate-400">°F</small></p>
                        </div>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Condition Summary</h4>
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
                  <p className="text-slate-700 font-bold mb-2">Primary Diagnosis:</p>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {patient.summary || "Patient admitted with acute respiratory distress. Responded well to nebulization and oxygen therapy. Vitals remained stable throughout the observation period."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline & Staff */}
            <div className="space-y-8">
               <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Medical Personnel</h4>
                <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
                        <FaUserMd />
                    </div>
                    <div>
                        <p className="font-black text-slate-800">{patient.doctor || 'Dr. Unassigned'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Lead Attending Physician</p>
                    </div>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Care Timeline</h4>
                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="flex items-center gap-4 relative">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-xs z-10 border-4 border-white"><FaClock /></div>
                        <div>
                            <p className="text-xs font-black text-slate-800">Admission</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">10:30 AM • Intake Team</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs z-10 border-4 border-white"><FaFilePrescription /></div>
                        <div>
                            <p className="text-xs font-black text-slate-800">Final Assessment</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">02:15 PM • {patient.doctor}</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 flex flex-col md:flex-row gap-4">
            <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all">
                <FaPrint /> PRINT DISCHARGE FORM
            </button>
            <button 
                onClick={onClose}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-500 py-4 rounded-2xl font-black text-sm hover:border-slate-400 hover:text-slate-800 transition-all"
            >
                CLOSE DOSSIER
            </button>
        </div>
      </div>
    </div>
  )
}

export default PatientDetailModal;