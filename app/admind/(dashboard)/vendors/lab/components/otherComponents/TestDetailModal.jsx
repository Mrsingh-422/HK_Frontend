'use client';
import React from 'react';
import { FaTimes, FaVials, FaFlask, FaInfoCircle, FaEdit, FaTrashAlt, FaMicroscope, FaCheckCircle, FaFileAlt } from 'react-icons/fa';

const TestDetailModal = ({ test, isOpen, onClose, onEdit, onDelete }) => {
    if (!isOpen || !test) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-hidden">
            <div className="bg-white w-full max-w-5xl max-h-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
                            <FaMicroscope size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight">{test.testName}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px] font-bold uppercase">{test.testCode}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase">{test.sampleType}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"><FaTimes size={24} /></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-50/20 custom-scrollbar">

                    {/* Quick Specs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SpecCard label="Main Category" value={test.mainCategory} icon={<FaFlask />} />
                        <SpecCard label="Sub Category" value={test.category} icon={<FaFileAlt />} />
                        <SpecCard label="Active Status" value={test.isActive ? 'Published' : 'Hidden'} icon={<FaCheckCircle />} color="text-emerald-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Column */}
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Measured Parameters</h3>
                                <div className="flex flex-wrap gap-2">
                                    {test.parameters?.[0]?.split(',').map((p, i) => p.trim() && (
                                        <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">{p}</span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detailed Analysis</h3>
                                <div className="space-y-4">
                                    {test.detailedDescription?.map((desc) => (
                                        <div key={desc._id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <h4 className="text-sm font-black text-slate-800 mb-2">{desc.sectionTitle}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc.sectionContent}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Patient Instructions</h3>
                                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                                    <p className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                                        <FaInfoCircle /> Pre-test Preparation
                                    </p>
                                    <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">{test.pretestPreparation}</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Clinical FAQs</h3>
                                <div className="space-y-4">
                                    {test.faqs?.map((faq) => (
                                        <div key={faq._id} className="space-y-1">
                                            <p className="text-xs font-black text-slate-800">Q: {faq.question}</p>
                                            <p className="text-xs text-slate-500 font-medium">A: {faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex justify-between items-center bg-white">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Price (MRP)</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{test.standardMRP}</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => onDelete(test._id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><FaTrashAlt size={20} /></button>
                        <button onClick={() => onEdit(test)} className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:scale-105 transition-all flex items-center gap-2">
                            <FaEdit /> Edit Test Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SpecCard = ({ label, value, icon, color = "text-slate-400" }) => (
    <div className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center gap-4 shadow-sm">
        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>{icon}</div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-bold text-slate-700">{value}</p>
        </div>
    </div>
);

export default TestDetailModal;