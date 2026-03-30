'use client';
import React, { useEffect, useState } from 'react';
import AdminAPI from '@/app/services/AdminAPI';
import { FaPlus, FaSearch, FaCheckCircle, FaTimesCircle, FaEye, FaMicroscope, FaDna } from 'react-icons/fa';
import PackageDetailModal from './otherComponents/PackageDetailModal';
import EditPackageModal from './otherComponents/EditPackageModal';
import { toast, Toaster } from 'react-hot-toast';

function LabTestPackageComponent() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const brandColor = "#08B36A";

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getTestsByType('package');
      if (res?.success) {
        setPackages(res.data || []);
      }
    } catch (err) {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      try {
        // await AdminAPI.deletePackage(id);
        setPackages(packages.filter(p => p._id !== id));
        toast.success("Package deleted successfully");
      } catch (err) {
        toast.error("Delete failed");
      }
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

  const filteredPackages = packages.filter(pkg =>
    pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0 min-h-screen font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <FaDna className="text-[#08B36A]" />
            </div>
            Health Packages
          </h1>
          <p className="text-slate-500 mt-1 ml-1 text-sm font-medium">Manage and monitor diagnostic test bundles</p>
        </div>
        <button
          style={{ backgroundColor: brandColor }}
          className="hover:opacity-90 shadow-lg shadow-emerald-200 transition-all text-white px-7 py-3.5 rounded-2xl font-bold flex items-center gap-2"
        >
          <FaPlus /> Create New Package
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#08B36A] transition-colors" />
          <input
            type="text"
            placeholder="Search by name, category, or ID..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#08B36A] outline-none text-sm font-medium transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between px-6 border border-slate-100">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Active</span>
          <span className="text-2xl font-black text-slate-800">{packages.filter(p => p.isActive).length}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
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
              <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-medium">Loading packages...</td></tr>
            ) : filteredPackages.map((pkg) => (
              <tr key={pkg._id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <FaMicroscope size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{pkg.packageName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{pkg.category} • {pkg.tests?.length || 0} Tests</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800">₹{pkg.standardMRP?.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of GST</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {pkg.isActive ?
                    <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                      <FaCheckCircle /> Active
                    </span> :
                    <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase">
                      <FaTimesCircle /> Hidden
                    </span>
                  }
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => handleView(pkg)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#08B36A] hover:text-white transition-all text-xs font-bold"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PackageDetailModal
        isOpen={isDetailOpen}
        pkg={selectedPackage}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditPackageModal
        pkg={selectedPackage}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveUpdate}
      />
    </div>
  );
}

export default LabTestPackageComponent;