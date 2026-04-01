"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Eye, Stethoscope, Loader2, CheckCircle, Clock
} from "lucide-react";
import AdminAPI from "@/app/services/AdminAPI";
import NurseDetailsModal from "./components/NurseDetailsModal";

export default function NurseVendorManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const fetchNurses = async () => {
    setIsLoading(true);
    try {
      const res = await AdminAPI.getAllNursesInAdmin();
      setVendors(res.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone?.includes(searchTerm);
      const matchesFilter = filterStatus === "all" || vendor.profileStatus?.toLowerCase() === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, vendors]);

  const handleApprove = async (id) => {
    try {
      const res = await AdminAPI.approveNurseByAdmin(id);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, profileStatus: 'Approved' } : v));
        setIsViewModalOpen(false);
        alert("Nurse approved successfully");
      }
    } catch (error) {
      alert("Approval failed");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await AdminAPI.rejectNurseByAdmin(id, reason);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ?
          { ...v, profileStatus: 'Rejected', rejectionReason: reason } : v));
        setIsViewModalOpen(false);
      }
    } catch (error) {
      alert("Rejection failed");
    }
  };

  const openDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  const getImgUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
    return `${baseUrl}/${cleanPath}`;
  };

  if (isLoading) return (
    <div className="h-64 w-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100">
      <Loader2 className="animate-spin text-[#08B36A] w-10 h-10" />
      <p className="mt-4 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Loading Nurse Profiles...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-4">

      {/* Dynamic Modal Component */}
      <NurseDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        vendor={selectedVendor}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Main Header Logic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Nurse Approvals <span className="bg-[#08B36A]/10 text-[#08B36A] text-xs px-2 py-0.5 rounded-lg">{vendors.length}</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Verify professional nursing applications</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Filters Bar - THEME GREEN */}
        <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm shadow-slate-200/50">
          <div className="relative w-full lg:w-96 ml-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-2xl mr-1">
            {["all", "pending", "approved", "rejected", "incomplete"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                  ? "bg-white text-[#08B36A] shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table View - THEME GREEN */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nurse Identity</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Live Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredVendors.map((vendor, idx) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 text-slate-400 font-bold text-xs">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                          <img src={vendor.profileImage ? getImgUrl(vendor.profileImage) : `https://ui-avatars.com/api/?name=${vendor.name}&background=08B36A&color=fff`} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm tracking-tight">{vendor.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{vendor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-600">{vendor.city || 'N/A'}</p>
                      <p className="text-[10px] text-[#08B36A] font-bold uppercase tracking-tighter">{vendor.state}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`w-10 h-5 mx-auto rounded-full relative transition-all duration-300 ${vendor.isActive ? 'bg-[#08B36A]' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 bg-white w-3 h-3 rounded-full transition-all duration-300 ${vendor.isActive ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${vendor.profileStatus === 'Approved' ? 'bg-[#08B36A]/10 text-[#08B36A]' :
                          vendor.profileStatus === 'Rejected' ? 'bg-rose-50 text-rose-500' :
                            'bg-amber-50 text-amber-600'
                        }`}>
                        {vendor.profileStatus === 'Approved' && <CheckCircle size={10} />}
                        {vendor.profileStatus === 'Pending' && <Clock size={10} />}
                        {vendor.profileStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => openDetails(vendor)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 hover:text-[#08B36A] hover:border-[#08B36A]/30 transition-all shadow-sm"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVendors.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No records found matching filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}