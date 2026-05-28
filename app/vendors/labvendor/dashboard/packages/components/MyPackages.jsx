'use client'
import React from 'react';
import { FaEye, FaTrash, FaEdit, FaCircle, FaVial } from 'react-icons/fa';

export default function MyPackages({ packages = [], onViewDetails, onEdit, onDelete }) {
  
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      onDelete(id);
    }
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest bg-white rounded-3xl border-2 border-dashed border-slate-100">
        No packages found in your inventory.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar bg-white rounded-3xl border border-slate-100 shadow-sm">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/50">
            <th className="py-5 px-6">Package Name</th>
            <th className="py-5 px-6">Pricing</th>
            <th className="py-5 px-6">Patient Criteria</th>
            <th className="py-5 px-6">Collection</th>
            <th className="py-5 px-6">Status</th>
            <th className="py-5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {packages.map((pkg) => (
            <tr key={pkg._id} className="bg-white transition-colors hover:bg-slate-50/30 group">
              <td className="py-5 px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-sm">
                    {pkg.tests?.length || 0}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm capitalize">{pkg.packageName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TAT: {pkg.reportTime}</p>
                  </div>
                </div>
              </td>
              <td className="py-5 px-6">
                <div className="flex flex-col">
                  <span className="text-base font-black text-emerald-600 leading-none">₹{pkg.offerPrice?.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-300 font-bold mt-1 uppercase line-through">MRP ₹{(pkg.mrp || pkg.standardMRP)?.toLocaleString('en-IN')}</span>
                </div>
              </td>
              <td className="py-5 px-6">
                <div className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                    <p className="text-slate-800">{pkg.ageGroup || 'All Ages'}</p>
                    <p>{pkg.gender}</p>
                </div>
              </td>
              <td className="py-5 px-6">
                 <div className="flex items-center gap-1.5 text-slate-400">
                    <FaVial size={12} className="text-rose-400" />
                    <span className="text-[10px] font-black uppercase">
                        {Array.isArray(pkg.sampleType) ? pkg.sampleType.join(', ') : (pkg.sampleType || 'Blood')}
                    </span>
                 </div>
              </td>
              <td className="py-5 px-6">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${pkg.isActive ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                    <FaCircle size={6} className={pkg.isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    <span className={`text-[9px] font-black uppercase ${pkg.isActive ? 'text-emerald-700' : 'text-slate-50'}`}>
                        {pkg.isActive ? 'Live' : 'Hidden'}
                    </span>
                </div>
              </td>
              <td className="py-5 px-6 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onViewDetails(pkg)} title="View Details" className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><FaEye size={16}/></button>
                  <button onClick={() => onEdit(pkg)} title="Edit Package" className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FaEdit size={16}/></button>
                  <button onClick={() => handleDeleteClick(pkg._id)} title="Delete" className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><FaTrash size={16}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}