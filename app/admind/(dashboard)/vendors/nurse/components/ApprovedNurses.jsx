'use client'

import React, { useState } from 'react'
import { FaSearch, FaEye, FaCheckCircle, FaStethoscope, FaFilter, FaUserShield } from "react-icons/fa"
import ViewNurseProfile from './othercomponents/ViewNurseProfile';

function ApprovedNurses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Sample Data for Approved Nurses
  const [approvedNurses] = useState([
    {
      id: 101,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.j@hospital.com',
      category: 'Senior ICU Specialist',
      joinedDate: 'Jan 12, 2023',
      experience: '5 Years',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 102,
      name: 'Michael Chen',
      email: 'm.chen@medical.org',
      category: 'Pediatric Care Unit',
      joinedDate: 'Mar 05, 2023',
      experience: '3 Years',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
    },
    {
      id: 103,
      name: 'Elena Rodriguez',
      email: 'elena.rod@clinic.com',
      category: 'Hematology Technician',
      joinedDate: 'Jun 20, 2022',
      experience: '8 Years',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150',
    },
  ]);

  // Filter Logic
  const filteredNurses = approvedNurses.filter(nurse =>
    nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (nurse) => {
    setSelectedNurse(nurse);
    setIsViewModalOpen(true);
  };

  return (
    <div className="min-h-screen  p-4 md:p-10 font-sans text-slate-900">

      {/* Reuse the Detail Modal */}
      <ViewNurseProfile
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        nurse={selectedNurse}
      />

      <div className="max-w-6xl mx-auto">
        {/* --- TABLE CONTAINER --- */}
        <div className=" rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Verified Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredNurses.map((nurse) => (
                  <tr key={nurse.id} className="hover:bg-slate-50/50 transition-colors group">

                    {/* PROFILE CELL */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-[#08B36A]/30 transition-all">
                          <img
                            src={nurse.image}
                            alt=""
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-700 block tracking-tight group-hover:text-[#08B36A] transition-colors">
                            {nurse.name}
                          </span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">ID: RN-{nurse.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT CELL */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <FaStethoscope className="text-[#08B36A]" size={12} />
                        {nurse.category}
                      </div>
                    </td>

                    {/* STATUS CELL */}
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#08B36A] rounded-full">
                        <FaCheckCircle size={10} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
                      </div>
                    </td>

                    {/* ACTION CELL */}
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleViewDetails(nurse)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#08B36A] transition-all active:scale-95 shadow-lg shadow-slate-200"
                      >
                        <FaEye size={14} /> View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY SEARCH STATE */}
          {filteredNurses.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-300 font-bold text-sm tracking-widest uppercase">No verified nurses match your search</p>
            </div>
          )}
        </div>

        {/* FOOTER INFO */}
        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">
            Hospital Personnel Registry v2.0
          </p>
          <div className="flex gap-4">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#08B36A] transition-colors">Export CSV</button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#08B36A] transition-colors">Print Registry</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApprovedNurses