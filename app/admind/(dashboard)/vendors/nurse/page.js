"use client";

import React, { useState, useMemo } from "react";
import {
  Search, Plus, Eye, Star, FileText,
  ChevronLeft, CheckCircle, Clock, XCircle,
  Stethoscope, Filter, Trash2, X
} from "lucide-react";

const INITIAL_VENDORS = [
  { id: 1, name: "Lucifer2", email: "global@vendor.com", phone: "9876543210", live: true, verification: "pending", date: "2023-10-25 12:16:15", image: "https://i.pravatar.cc/150?u=1", featured: false },
  { id: 2, name: "Sarah Medical", email: "global@vendor.com", phone: "9000012345", live: true, verification: "approved", date: "2023-09-12 10:05:00", image: "https://i.pravatar.cc/150?u=2", featured: true },
  { id: 3, name: "John Care", email: "global@vendor.com", phone: "9888877766", live: false, verification: "rejected", date: "2023-10-01 14:20:10", image: "https://i.pravatar.cc/150?u=3", featured: false },
];

export default function NurseVendorManager() {
  const [view, setView] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [vendors, setVendors] = useState(INITIAL_VENDORS);

  // Modal States
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form State for Adding
  const [formData, setFormData] = useState({
    name: "",
    email: "global@vendor.com",
    phone: "",
    verification: "pending",
    image: "https://i.pravatar.cc/150?u=" + Math.random()
  });

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || vendor.phone.includes(searchTerm);
      const matchesFilter = filterStatus === "all" || vendor.verification === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, vendors]);

  const toggleLiveStatus = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, live: !v.live } : v));
  };

  const toggleFeatured = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, featured: !v.featured } : v));
  };

  const deleteVendor = (id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    const newVendor = {
      ...formData,
      id: Date.now(),
      live: true,
      date: new Date().toISOString().replace('T', ' ').split('.')[0],
      featured: false
    };
    setVendors([newVendor, ...vendors]);
    setView("list");
    setFormData({ name: "", email: "global@vendor.com", phone: "", verification: "pending", image: "https://i.pravatar.cc/150?u=" + Math.random() });
  };

  const openDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* View Details Modal */}
      {isViewModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800">Vendor Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-8 text-center">
              <img src={selectedVendor.image} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">{selectedVendor.name}</h2>
              <p className="text-slate-500 mb-6">{selectedVendor.email}</p>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Phone</p>
                  <p className="font-semibold text-slate-700">{selectedVendor.phone}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                  <p className="font-semibold capitalize text-slate-700">{selectedVendor.verification}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Stethoscope size={24} />
            </div>
            Nurse Vendor Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage, verify, and add nurse vendors</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === "list" ? "add" : "list")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${view === "list"
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-gray-50"
              }`}
          >
            {view === "list" ? <><Plus size={18} /> Add New Vendor</> : <><ChevronLeft size={18} /> Back to List</>}
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
              <Filter size={16} className="text-slate-400 mr-2 hidden lg:block" />
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === status
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      : "text-slate-500 hover:bg-slate-50 border border-transparent"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="px-6 py-4">S No.</th>
                    <th className="px-6 py-4">Vendor Identity</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4 text-center">Live Status</th>
                    <th className="px-6 py-4">Admin Verification</th>
                    <th className="px-6 py-4">Reg. Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVendors.map((vendor, idx) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 text-slate-400 font-medium">#{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img src={vendor.image} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                          <div>
                            <div className="font-bold text-slate-800 leading-tight">{vendor.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{vendor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 text-sm font-semibold">{vendor.phone}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleLiveStatus(vendor.id)}
                            className={`w-12 h-6 rounded-full transition-all relative ${vendor.live ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${vendor.live ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {vendor.verification === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase border border-amber-100">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {vendor.verification === "approved" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase border border-emerald-100">
                            <CheckCircle size={12} /> Approved
                          </span>
                        )}
                        {vendor.verification === "rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase border border-rose-100">
                            <XCircle size={12} /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-slate-400 text-xs font-medium italic">
                        {vendor.date}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openDetails(vendor)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="View"><Eye size={16} /></button>
                          <button onClick={() => toggleFeatured(vendor.id)} className={`p-2 rounded-lg transition-colors ${vendor.featured ? 'bg-yellow-400 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`} title="Feature"><Star size={16} /></button>
                          <button onClick={() => deleteVendor(vendor.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ADD NEW VENDOR FORM - Properly matched with table fields */
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleAddVendor} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vendor Name</label>
                  <input required type="text" placeholder="Full Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                  <input required type="text" placeholder="Contact number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input required type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verification Status</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none"
                  value={formData.verification} onChange={(e) => setFormData({ ...formData, verification: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="bg-indigo-500 text-white p-1 rounded-full h-fit mt-0.5"><CheckCircle size={14} /></div>
                <p className="text-sm text-indigo-800 leading-relaxed">Ensure all contact information is accurate for admin verification purposes.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex items-center justify-end gap-3">
              <button type="button" onClick={() => setView("list")} className="px-8 py-3 font-bold text-slate-500">Discard</button>
              <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all">Create Vendor</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
