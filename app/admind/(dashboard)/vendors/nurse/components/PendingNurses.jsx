'use client'

import React, { useState } from 'react'
import { FaEye, FaCheckCircle, FaUserCheck, FaCalendarAlt, FaStethoscope } from "react-icons/fa"
import NurseDetailsModal from './othercomponents/NurseDetailsModal';

function PendingNurses() {
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [pendingNurses, setPendingNurses] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@hospital.com',
      category: 'Senior ICU Specialist',
      appliedDate: 'Oct 24, 2023',
      experience: '5 Years',
      image: 'https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'm.chen@medical.org',
      category: 'Pediatric Care Unit',
      appliedDate: 'Oct 25, 2023',
      experience: '3 Years',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      email: 'elena.rod@clinic.com',
      category: 'Hematology Technician',
      appliedDate: 'Oct 26, 2023',
      experience: '8 Years',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150',
    },
  ]);

  const handleViewDetails = (nurse) => {
    setSelectedNurse(nurse);
    setIsViewModalOpen(true);
  };

  const handleApprove = (id, name) => {
    if (window.confirm(`Approve ${name}?`)) {
      setPendingNurses(pendingNurses.filter(nurse => nurse.id !== id));
      setIsViewModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900">

      {/* DETAIL MODAL */}
      <NurseDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        nurse={selectedNurse}
      />

      <div className="max-w-6xl mx-auto">
        {/* TABLE */}
        <div className="rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Nurse Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Specialization</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingNurses.map((nurse) => (
                  <tr key={nurse.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                          <img src={nurse.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-700 block tracking-tight group-hover:text-[#08B36A]">{nurse.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{nurse.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-tighter">
                        <FaStethoscope className="text-[#08B36A]" size={12} />
                        {nurse.category}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleViewDetails(nurse)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                        >
                          <FaEye size={14} /> View
                        </button>
                        <button
                          onClick={() => handleApprove(nurse.id, nurse.name)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#08B36A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#079d5c] shadow-lg shadow-green-100 transition-all active:scale-95"
                        >
                          <FaCheckCircle size={14} /> Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingNurses