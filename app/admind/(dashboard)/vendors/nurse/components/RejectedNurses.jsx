'use client'

import React, { useState } from 'react'
import { FaUserTimes, FaEye, FaSearch, FaStethoscope, FaInfoCircle, FaTrashAlt } from "react-icons/fa"
import ViewNurseProfile from './othercomponents/ViewNurseProfile';

function RejectedNurses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Sample Data for Rejected Nurses
  const [rejectedNurses, setRejectedNurses] = useState([
    {
      id: 501,
      name: 'Robert Wilson',
      email: 'r.wilson@webmail.com',
      category: 'Senior ICU Specialist',
      rejectedDate: 'Oct 15, 2023',
      reason: 'Insufficient Experience',
      experience: '1 Year',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 502,
      name: 'Janet Amina',
      email: 'janet.a@provider.net',
      category: 'Clinical Pathologist',
      rejectedDate: 'Oct 12, 2023',
      reason: 'Invalid Certification',
      experience: '4 Years',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 503,
      name: 'Liam O’Connor',
      email: 'liam.oc@hospital.org',
      category: 'Hematology Technician',
      rejectedDate: 'Oct 10, 2023',
      reason: 'Background Check',
      experience: '6 Years',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
    },
  ]);

  // Filter Logic
  const filteredNurses = rejectedNurses.filter(nurse =>
    nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (nurse) => {
    setSelectedNurse(nurse);
    setIsViewModalOpen(true);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("Permanently delete this rejection record?")) {
      setRejectedNurses(rejectedNurses.filter(n => n.id !== id));
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-900">

      {/* DETAIL MODAL */}
      <ViewNurseProfile
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        nurse={selectedNurse}
      />

      <div className="max-w-6xl mx-auto">
        {/* --- TABLE CONTAINER --- */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Declined Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Rejection Reason</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredNurses.map((nurse) => (
                  <tr key={nurse.id} className="hover:bg-rose-50/20 transition-colors group">

                    {/* PROFILE CELL */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                          <img
                            src={nurse.image}
                            alt=""
                            className="w-full h-full object-cover filter grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-700 block tracking-tight group-hover:text-rose-500 transition-colors">
                            {nurse.name}
                          </span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">{nurse.category}</span>
                        </div>
                      </div>
                    </td>

                    {/* REASON CELL */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl w-fit">
                        <FaInfoCircle size={12} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{nurse.reason}</span>
                      </div>
                    </td>

                    {/* DATE CELL */}
                    <td className="px-8 py-5 text-slate-400 font-bold text-xs uppercase">
                      {nurse.rejectedDate}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(nurse)}
                          className="p-3 text-black hover:text-slate-900 hover:bg-white rounded-xl transition-all"
                          title="View Full File"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(nurse.id)}
                          className="p-3 text-black hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Record"
                        >
                          <FaTrashAlt size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}
          {filteredNurses.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-slate-300 font-black text-xs tracking-[0.2em] uppercase">No rejection records found</p>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 flex justify-center">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">
            Confidential Administrative Log • Declined Entries
          </p>
        </div>
      </div>
    </div>
  )
}

export default RejectedNurses