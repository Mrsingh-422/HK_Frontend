'use client'
import React, { useState } from 'react'
import { FaTimes, FaIdBadge, FaCheckCircle } from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI';

export default function DeployOfficerModal({ isOpen, onClose, selectedCase, officers, onDispatchSuccess }) {
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);

  if (!isOpen || !selectedCase) return null;

  const toggleStaffSelection = (id) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmDispatch = async () => {
    if (selectedStaffIds.length === 0) {
        alert("Please select at least one officer for dispatch.");
        return;
    }

    try {
        setIsDispatching(true);
        const payload = {
            caseId: selectedCase._id,
            staffIds: selectedStaffIds
        };

        const res = await PoliceAPI.disptchStaffToCase(selectedCase._id, payload);
        
        if (res.success) {
            alert("Officers dispatched successfully. Case status updated.");
            onDispatchSuccess();
            onClose();
        }
    } catch (error) {
        console.error("Dispatch Error:", error);
        alert("Failed to dispatch staff.");
    } finally {
        setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Dispatch Unit</h3>
                <button onClick={onClose} className="text-slate-300 hover:text-red-500"><FaTimes size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Available Units</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {officers.length > 0 ? officers.map(officer => (
                        <div 
                            key={officer._id} 
                            onClick={() => toggleStaffSelection(officer._id)}
                            className={`flex items-center justify-between p-4 bg-slate-50 border ${selectedStaffIds.includes(officer._id) ? 'border-[#08B36A] bg-emerald-50/30' : 'border-slate-100'} rounded-2xl cursor-pointer group transition-all`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${selectedStaffIds.includes(officer._id) ? 'bg-[#08B36A] text-white' : 'bg-white text-slate-400 group-hover:text-[#08B36A]'}`}><FaIdBadge /></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{officer.fullName}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{officer.badgeId} • {officer.rank}</p>
                                </div>
                            </div>
                            {selectedStaffIds.includes(officer._id) ? (
                                <FaCheckCircle className="text-[#08B36A]" />
                            ) : (
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${officer.status === 'On Duty' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>{officer.status}</span>
                            )}
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-400 font-bold text-xs uppercase">No officers registered</div>
                    )}
                </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
                <button onClick={onClose} className="flex-1 bg-white border border-slate-200 py-3 rounded-xl font-black text-[10px] text-slate-500 uppercase tracking-widest">Cancel</button>
                <button 
                    onClick={handleConfirmDispatch} 
                    disabled={isDispatching}
                    className="flex-1 bg-[#08B36A] py-3 rounded-xl font-black text-[10px] text-white shadow-lg shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isDispatching ? "Dispatching..." : <><FaCheckCircle /> Confirm Dispatch</>}
                </button>
            </div>
        </div>
    </div>
  );
}