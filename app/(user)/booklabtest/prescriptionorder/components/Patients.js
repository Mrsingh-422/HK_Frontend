'use client';
import React from 'react';
import { FaCheckCircle, FaUserCircle } from 'react-icons/fa';

export default function Patients({ familyMembers, selectedPatientIds, onToggle, onNext, onBack }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h3 className="text-base font-bold text-slate-800">3. Select Target Patients</h3>
        <p className="text-xs text-slate-500">Pick the family members whose names are stated on this prescription.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Default Self Option */}
        <div 
          onClick={() => onToggle("Self")}
          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative ${
            selectedPatientIds.includes("Self") 
              ? 'border-[#08B36A] bg-green-50/15' 
              : 'border-slate-100 hover:border-slate-200'
          }`}
        >
          {selectedPatientIds.includes("Self") && (
            <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
              <FaCheckCircle size={14} />
            </span>
          )}
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border">
            <FaUserCircle className="text-lg" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Myself</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Self Account Profile</p>
          </div>
        </div>

        {/* Family Members */}
        {familyMembers.map((member) => (
          <div 
            key={member._id}
            onClick={() => onToggle(member._id)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative ${
              selectedPatientIds.includes(member._id) 
                ? 'border-[#08B36A] bg-green-50/15' 
                : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {selectedPatientIds.includes(member._id) && (
              <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                <FaCheckCircle size={14} />
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border">
               <FaUserCircle className="text-lg" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">{member.memberName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{member.relation} • {member.gender}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-50">
        <button onClick={onBack} className="px-6 py-2.5 border rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50">
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={selectedPatientIds.length === 0}
          className="px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
        >
          Continue to Slots
        </button>
      </div>
    </div>
  );
}