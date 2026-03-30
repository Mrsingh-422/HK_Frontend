'use client'

import React, { useState } from 'react'
import { FaEye, FaStar, FaBook, FaSearch, FaFilter, FaChevronDown, FaEllipsisV, FaCircle } from "react-icons/fa"

function NurseVendor() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample Data
  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: 'Lucifer2',
      phone: '9876543210',
      image: 'https://images.unsplash.com/photo-1559839734-2b71f1e3c7e5?auto=format&fit=crop&q=80&w=100',
      status: true,
      verification: 'Pending',
      joinStatus: '2023-10-25 12:16:15'
    },
    {
      id: 2,
      name: 'Sarah Medical',
      phone: '9000012345',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100',
      status: true,
      verification: 'Approved',
      joinStatus: '2023-09-12 10:05:00'
    },
    {
      id: 3,
      name: 'John Care',
      phone: '9888877766',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100',
      status: false,
      verification: 'Rejected',
      joinStatus: '2023-10-01 14:20:10'
    }
  ]);

  const handleToggleStatus = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: !v.status } : v));
  };

  return (
    <div className="min-h-screen font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto">
        {/* --- TABLE CARD --- */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100/50 bg-slate-50/30">
                  <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">S No.</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Vendor Identity</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Contact Info</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Live Status</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Admin Verification</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Registration Date</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vendors.map((vendor, index) => (
                  <tr key={vendor.id} className="hover:bg-white transition-all group">

                    {/* S NO */}
                    <td className="pl-10 pr-6 py-6">
                      <span className="text-xs font-black text-slate-300">#0{index + 1}</span>
                    </td>

                    {/* VENDOR IDENTITY */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                            <img src={vendor.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${vendor.status ? 'bg-[#08B36A]' : 'bg-rose-400'}`}></div>
                        </div>
                        <div>
                          <span className="text-sm font-black text-slate-800 block mb-0.5 tracking-tight group-hover:text-[#08B36A] transition-colors">{vendor.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Vendor</span>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-6">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {vendor.phone}
                      </span>
                    </td>

                    {/* TOGGLE STATUS */}
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleStatus(vendor.id)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${vendor.status ? 'bg-[#08B36A]' : 'bg-slate-200'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${vendor.status ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </td>

                    {/* VERIFICATION */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-start cursor-pointer">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${vendor.verification === 'Pending' ? 'bg-amber-50 text-amber-500 border-amber-100 animate-pulse' :
                          vendor.verification === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                          }`}>
                          <FaCircle size={6} />
                          {vendor.verification}
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity underline decoration-dotted">Verify Account</span>
                      </div>
                    </td>

                    {/* JOIN STATUS */}
                    <td className="px-6 py-6">
                      <span className="text-[11px] font-bold text-slate-400 font-mono italic">
                        {vendor.joinStatus}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button title="View Details" className="p-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                          <FaEye size={14} />
                        </button>
                        <button title="Ratings" className="p-3 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                          <FaStar size={14} />
                        </button>
                        <button title="Logs & History" className="p-3 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm">
                          <FaBook size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER INFO */}
          <div className="px-10 py-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100/50 gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {vendors.length} active medical vendors
            </span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <button key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${i === 1 ? 'bg-[#08B36A] text-white' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
            Cloud-Health Vendor Infrastructure © 2023
          </p>
        </div>
      </div>
    </div>
  )
}

export default NurseVendor