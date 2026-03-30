'use client';
import React, { useEffect, useState, useCallback } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import {
  FaPlus, FaSearch, FaCheckCircle, FaTimesCircle,
  FaEye, FaMicroscope, FaDna, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import PackageDetailModal from './otherComponents/PackageDetailModal';
import EditPackageModal from './otherComponents/EditPackageModal';
import { toast, Toaster } from 'react-hot-toast';

function LabTestPackageComponent() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const brandColor = "#08B36A";

  const fetchPackages = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      // Calling updated AdminAPI with search and pagination
      const res = await AdminAPI.getTestsByType('package', page, ITEMS_PER_PAGE, search);

      if (res?.success) {
        setPackages(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      toast.error("Failed to load packages from server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when page changes
  useEffect(() => {
    fetchPackages(currentPage, searchTerm);
  }, [currentPage, fetchPackages]);

  // Search logic
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    fetchPackages(1, value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleView = (pkg) => {
    setSelectedPackage(pkg);
    setIsDetailOpen(true);
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleSaveUpdate = async (updatedData) => {
    try {
      // await AdminAPI.updatePackage(updatedData._id, updatedData);
      setPackages(prev => prev.map(p => p._id === updatedData._id ? updatedData : p));
      setIsEditOpen(false);
      toast.success("Package updated successfully!");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      setPackages(prev => prev.filter(p => p._id !== id));
      toast.success("Package removed locally");
    }
  };

  return (
    <div className="p-0 min-h-screen font-sans text-slate-900 bg-gray-50/30">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 px-6 pt-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-2xl"><FaDna className="text-[#08B36A]" /></div>
            Health Packages
          </h1>
          <p className="text-slate-500 mt-1 ml-1 text-sm font-medium">Managing {totalItems} total bundles</p>
        </div>
        <button style={{ backgroundColor: brandColor }} className="hover:opacity-90 shadow-lg shadow-emerald-200 transition-all text-white px-7 py-3.5 rounded-2xl font-bold flex items-center gap-2">
          <FaPlus /> Create New
        </button>
      </div>

      {/* Search & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 px-6">
        <div className="lg:col-span-3 relative group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by package name or category..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#08B36A] outline-none text-sm font-medium transition-all bg-white"
            onChange={handleSearch}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between px-6 border border-slate-100">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Page</span>
          <span className="text-2xl font-black text-slate-800">{currentPage}<span className="text-slate-300 text-sm font-medium">/{totalPages}</span></span>
        </div>
      </div>

      {/* Table Section */}
      <div className="mx-6 bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Package Details</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
              <th className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-32 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest">Loading Data...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan="4" className="py-32 text-center text-slate-400 font-bold">No packages matching "{searchTerm}"</td></tr>
            ) : packages.map((pkg) => (
              <tr key={pkg._id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors"><FaMicroscope size={18} /></div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{pkg.packageName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{pkg.category} • {pkg.tests?.length || 0} Tests</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-black text-slate-800">₹{pkg.standardMRP?.toLocaleString()}</td>
                <td className="px-8 py-6">
                  {pkg.isActive ?
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase"><FaCheckCircle /> Active</span> :
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase"><FaTimesCircle /> Hidden</span>
                  }
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleView(pkg)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#08B36A] hover:text-white transition-all text-xs font-bold">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {packages.length} of {totalItems} Packages</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border bg-white disabled:opacity-30 hover:border-emerald-500"
              ><FaChevronLeft size={14} /></button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-[#08B36A] text-white shadow-lg' : 'bg-white border text-slate-400'}`}
                  >{i + 1}</button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border bg-white disabled:opacity-30 hover:border-emerald-500"
              ><FaChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <PackageDetailModal isOpen={isDetailOpen} pkg={selectedPackage} onClose={() => setIsDetailOpen(false)} onEdit={handleEdit} onDelete={handleDelete} />
      <EditPackageModal pkg={selectedPackage} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSave={handleSaveUpdate} />
    </div>
  );
}

export default LabTestPackageComponent;