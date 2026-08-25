"use client";

import React from 'react';
import { FaProcedures, FaTimes, FaCheckCircle, FaFileMedical } from 'react-icons/fa';
import { SpinnerIcon } from './InfoSection';

const BedAllocationModal = ({ 
  isOpen, 
  onClose, 
  onConfirmTransfer, 
  wards, 
  selectedWard, 
  beds, 
  loadingBeds, 
  onSelectWard, 
  onSelectBed, 
  selectedBed,
  isProcessing
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-6 md:p-8 border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-slate-50 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#08B36A]/10 text-[#08B36A] rounded-xl">
              <FaProcedures size={14} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Bed Slot Selection</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Transfer: Shift Patient Bed</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Wards Horizontal List */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 border-b border-slate-100 shrink-0 scrollbar-none">
          {wards.map(ward => {
            const isTabActive = selectedWard?._id === ward._id;
            return (
              <button
                key={ward._id}
                type="button"
                onClick={() => onSelectWard(ward)}
                className={`px-4 py-2.5 text-[9px] font-black uppercase rounded-xl border transition-all duration-150 whitespace-nowrap shrink-0 shadow-sm ${
                  isTabActive 
                    ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-md shadow-[#08B36A]/15 scale-102' 
                    : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {ward.name}
              </button>
            );
          })}
        </div>

        {/* Bed Grid Display Area */}
        <div className="flex-grow overflow-y-auto min-h-0 py-1 pr-1">
          {loadingBeds ? (
            <div className="h-full flex flex-col justify-center items-center py-12 text-slate-400">
              <SpinnerIcon className="w-8 h-8 text-[#08B36A] animate-spin mb-3" />
              <span className="font-extrabold text-[10px] uppercase tracking-widest">Consulting live occupancy indexes...</span>
            </div>
          ) : selectedWard ? (
            <div className="grid grid-cols-3 gap-3.5">
              {beds.map(bed => {
                const isAvailable = bed.status === 'Available';
                const isChosen = selectedBed?._id === bed._id;

                return (
                  <div 
                    key={bed._id}
                    onClick={() => isAvailable && onSelectBed(bed)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[100px] relative group ${
                      isChosen 
                        ? 'bg-[#08B36A] border-[#08B36A] text-white shadow-lg shadow-[#08B36A]/15 scale-102 z-10' 
                        : isAvailable 
                          ? 'bg-white border-slate-200 hover:border-[#08B36A] hover:shadow-md hover:scale-102 cursor-pointer' 
                          : 'bg-rose-50/40 border-rose-100/50 text-rose-700 cursor-not-allowed opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-xs font-black uppercase ${isChosen ? 'text-white' : 'text-slate-900'}`}>
                          {bed.bedNumber}
                        </span>
                        
                        {bed.isVentilatorAvailable && (
                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                            isChosen ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Vent
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1.5">
                        {isChosen ? (
                          <span className="text-[8px] font-black uppercase tracking-wider flex items-center gap-1 text-white/90">
                            <FaCheckCircle size={8} /> Selected
                          </span>
                        ) : isAvailable ? (
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-600">
                            Available
                          </span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-wider text-rose-500">
                              Occupied
                            </span>
                            <span className="text-[9px] font-bold text-rose-700 truncate max-w-[120px] mt-0.5">
                              {bed.currentOccupant || "In Treatment"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`mt-4 pt-2 border-t text-[9px] font-bold flex justify-between items-center ${
                      isChosen ? 'border-white/10 text-white/80' : 'border-slate-100 text-slate-400'
                    }`}>
                      <span>Rate:</span>
                      <span className={`font-black ${isChosen ? 'text-white' : isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ₹{bed.pricePerDay || 0}/Day
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
              <FaFileMedical size={20} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider">Please select a Ward category above</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3.5 mt-6 border-t border-slate-100 pt-5 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3.5 border border-slate-200 text-slate-500 hover:text-slate-800 font-extrabold text-[10px] tracking-widest uppercase rounded-xl hover:bg-slate-50 transition-all active:scale-98"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onConfirmTransfer} 
            disabled={isProcessing || !selectedBed}
            className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#079d5c] disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-md shadow-[#08B36A]/10 active:scale-98 flex justify-center items-center gap-2"
          >
            {isProcessing ? <SpinnerIcon className="w-4 h-4 text-white animate-spin" /> : 'Confirm Bed Transfer \u2192'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BedAllocationModal;