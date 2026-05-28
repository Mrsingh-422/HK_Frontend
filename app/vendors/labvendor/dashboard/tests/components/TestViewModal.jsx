'use client'
import React from 'react'
import { FaTimes, FaVial, FaClipboardList, FaExclamationTriangle, FaInfoCircle, FaFlask, FaRupeeSign } from 'react-icons/fa'

export default function TestViewModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b flex justify-between items-start">
            <div>
                <div className="flex gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">{data.mainCategory}</span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">{data.category || 'General'}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">{data.testName}</h2>
            </div>
            <button onClick={onClose} className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-300 hover:text-rose-500 transition-all shadow-sm">
                <FaTimes size={24}/>
            </button>
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
            
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest flex items-center gap-1"><FaVial /> Sample Required</p>
                    <p className="text-sm font-black text-slate-700">{data.sampleType || 'Not Specified'}</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest flex items-center gap-1"><FaRupeeSign /> Global MRP</p>
                    <p className="text-xl font-black text-slate-800">₹{data.standardMRP || data.amount || 0}</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest flex items-center gap-1"><FaFlask /> Test Method</p>
                    <p className="text-sm font-black text-slate-700">Standard Master</p>
                </div>
            </div>

            {/* Parameters Section */}
            {data.parameters && data.parameters.length > 0 && (
                <section>
                    <h3 className="flex items-center gap-3 text-sm font-black uppercase text-slate-800 mb-5 tracking-widest">
                        <FaClipboardList className="text-blue-500" /> Parameters Measured ({data.parameters.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.parameters.map((param, i) => (
                            <span key={i} className="px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                {param}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Preparation Section */}
            <section className="bg-amber-50 p-8 rounded-[32px] border border-amber-100">
                <h3 className="flex items-center gap-3 text-sm font-black uppercase text-amber-700 mb-3 tracking-widest">
                    <FaExclamationTriangle /> Pre-test Preparation
                </h3>
                <p className="text-sm text-amber-900 font-bold leading-relaxed">
                    {data.pretestPreparation || data.precaution || 'No specific preparation required for this test.'}
                </p>
            </section>

            {/* Detailed Clinical Description Section */}
            {data.detailedDescription && data.detailedDescription.length > 0 && (
                <section className="space-y-8 pb-4">
                    <h3 className="flex items-center gap-3 text-sm font-black uppercase text-slate-800 mb-6 tracking-widest">
                        <FaInfoCircle className="text-emerald-500" /> Clinical Info
                    </h3>
                    {data.detailedDescription.map((desc, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                            <h4 className="font-black text-[11px] text-emerald-600 uppercase mb-3 tracking-wider">{desc.sectionTitle}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-bold">{desc.sectionContent}</p>
                        </div>
                    ))}
                </section>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex justify-end">
             <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white text-xs font-black uppercase rounded-2xl tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                Close View
             </button>
        </div>
      </div>
    </div>
  )
}