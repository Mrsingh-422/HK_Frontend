import React from 'react';
import { FaBoxOpen, FaArrowRight, FaFlask, FaClock, FaVial } from 'react-icons/fa';

export default function AllPackages({ packages = [], onViewDetails }) {
  return (
    <div className="w-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-slate-50/50">
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <th className="px-8 py-5">Master Template Name</th>
            <th className="px-8 py-5">Standard MRP</th>
            <th className="px-8 py-5">Category</th>
            <th className="px-8 py-5">Details Summary</th>
            <th className="px-8 py-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {packages.map((pkg) => (
            <tr key={pkg._id} className="hover:bg-slate-50/30 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <FaBoxOpen size={18} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-800 text-sm capitalize">{pkg.packageName}</span>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{pkg.shortDescription}</span>
                    </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-sm">₹{pkg.standardMRP?.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Base Price</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <FaFlask size={10} className="text-emerald-500" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                            {pkg.category}
                        </span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase ml-4">{pkg.mainCategory}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase w-fit">
                        {pkg.tests?.length || 0} Components
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase">
                        <span className="flex items-center gap-1"><FaClock size={10}/> {pkg.reportTime}</span>
                        <span className="flex items-center gap-1"><FaVial size={10}/> {pkg.sampleTypes?.[0] || 'N/A'}</span>
                    </div>
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <button 
                  onClick={() => onViewDetails(pkg)} 
                  className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-600 text-[10px] font-black rounded-xl hover:border-emerald-600 hover:text-emerald-600 transition-all uppercase tracking-widest inline-flex items-center gap-2"
                >
                  View & Configure <FaArrowRight />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}