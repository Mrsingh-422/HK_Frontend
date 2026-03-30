'use client';
import React, { useState } from 'react';
import { FaTimes, FaVenusMars, FaUserClock, FaClock, FaVial, FaFileInvoiceDollar, FaNotesMedical, FaFlask, FaInfoCircle, FaEdit, FaTrashAlt, FaMicroscope, FaCopy, FaCheck } from 'react-icons/fa';

const PackageDetailModal = ({ pkg, isOpen, onClose, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !pkg) return null;

  const brandColor = "#08B36A";

  const copyId = () => {
    navigator.clipboard.writeText(pkg._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      <div className="bg-white w-full max-w-6xl max-h-full rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">

        {/* --- Header --- */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-emerald-200" style={{ backgroundColor: brandColor }}>
              <FaMicroscope size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{pkg.packageName}</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pkg.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {pkg.isActive ? 'Live' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded-md">ID: {pkg._id}</span>
                <button onClick={copyId} className="hover:text-emerald-500 transition-colors">
                  {copied ? <FaCheck size={12} className="text-emerald-500" /> : <FaCopy size={12} />}
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
            <FaTimes size={24} />
          </button>
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col lg:flex-row min-h-full">

            {/* LEFT: Core Analysis */}
            <div className="flex-[0.65] p-10 space-y-12 border-r border-slate-50">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailChip icon={<FaVenusMars />} label="Gender" value={pkg.gender} />
                <DetailChip icon={<FaUserClock />} label="Age" value={pkg.ageGroup} />
                <DetailChip icon={<FaClock />} label="TAT" value={pkg.reportTime} />
                <DetailChip icon={<FaVial />} label="Fasting" value={pkg.isFastingRequired ? pkg.fastingDuration : 'None'} />
              </div>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Included Parameters ({pkg.tests?.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pkg.tests?.map((test) => (
                    <div key={test._id} className="p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-500 shadow-sm transition-colors">
                          <FaFlask size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{test.testName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{test.sampleType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <FaInfoCircle size={14} className="text-emerald-500" /> Package Deep-Dive
                </h3>
                <div className="space-y-4">
                  {pkg.detailedDescription?.map((desc) => (
                    <div key={desc._id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <h4 className="text-sm font-black text-slate-800 mb-3">{desc.sectionTitle}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc.sectionContent}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT: Logistics */}
            <div className="flex-[0.35] p-10 bg-slate-50/30 space-y-10">
               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preparation Info</h4>
                  <ul className="space-y-3">
                    {pkg.preparations?.map((prep, i) => (
                      <li key={i} className="flex gap-3 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <FaNotesMedical className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium leading-normal">{prep}</span>
                      </li>
                    ))}
                  </ul>
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient FAQ</h4>
                  <div className="space-y-4">
                    {pkg.faqs?.map((faq) => (
                      <div key={faq._id} className="space-y-2">
                        <p className="text-xs font-bold text-slate-800">Q: {faq.question}</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-10 py-8 border-t border-slate-100 bg-white flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Global Standard MRP</p>
            <span className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{pkg.standardMRP?.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onDelete(pkg._id)}
              className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
            <button
              onClick={() => onEdit(pkg)}
              style={{ backgroundColor: brandColor }}
              className="px-10 py-4 rounded-2xl text-white font-black text-sm shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
              <FaEdit /> Edit Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailChip = ({ icon, label, value }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm transition-all hover:shadow-md">
    <span className="text-emerald-500 mb-2">{icon}</span>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-bold text-slate-800">{value || '---'}</p>
  </div>
);

export default PackageDetailModal;