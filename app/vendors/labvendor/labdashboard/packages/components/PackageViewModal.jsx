'use client'
import React from 'react'
import { 
  FaTimes, FaVial, FaClock, FaCheckCircle, FaInfoCircle, FaQuestionCircle, FaFlask, FaRupeeSign
} from 'react-icons/fa'

export default function PackageViewModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const displayPrice = data.standardMRP || data.mrp || data.offerPrice || 0;
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        <div className="p-8 bg-slate-50 border-b flex justify-between items-start">
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">
                        {data.mainCategory}
                    </span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">
                        {data.category}
                    </span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{data.packageName}</h2>
                <p className="text-slate-500 font-medium text-lg italic">{data.shortDescription || data.description}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-300 hover:text-rose-500 transition-all"><FaTimes size={24}/></button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest flex items-center gap-1"><FaRupeeSign /> Price</p>
                    <p className="text-2xl font-black text-slate-800">₹{displayPrice}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Fasting</p>
                    <p className="text-sm font-black text-slate-700">{data.isFastingRequired ? `Yes (${data.fastingDuration})` : 'Not Required'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Report Time</p>
                    <p className="text-sm font-black text-slate-700">{data.reportTime}</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">Age / Gender</p>
                    <p className="text-sm font-black text-slate-700">{data.ageGroup} / {data.gender}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-10">
                    <section>
                        <h3 className="flex items-center gap-3 text-sm font-black uppercase text-slate-800 mb-6 tracking-widest"><FaFlask className="text-blue-500" /> Components ({data.tests?.length || 0})</h3>
                        <div className="grid gap-3">
                            {data.tests?.map((test, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl shadow-sm">
                                    <span className="text-sm font-bold text-slate-700 uppercase">{typeof test === 'object' ? test.testName : `ID: ${test}`}</span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase">Included</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
                <div className="lg:col-span-5 space-y-10">
                    <section className="bg-slate-900 rounded-[32px] p-8 text-white">
                        <h3 className="flex items-center gap-3 text-xs font-black uppercase text-emerald-400 mb-6 tracking-widest"><FaVial /> Samples</h3>
                        <div className="flex flex-wrap gap-2">
                            {(Array.isArray(data.sampleTypes) ? data.sampleTypes : [data.sampleType]).map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">{s}</span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
        <div className="p-6 bg-slate-50 border-t flex justify-end">
             <button onClick={onClose} className="px-12 py-4 bg-slate-900 text-white text-xs font-black uppercase rounded-2xl tracking-[0.2em] hover:bg-emerald-600 transition-all">Close View</button>
        </div>
      </div>
    </div>
  )
}