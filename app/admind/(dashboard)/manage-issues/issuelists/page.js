'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    FaTimes, FaExclamationTriangle, FaClipboardList, 
    FaRegEdit, FaCheck, FaUserCheck, FaPlus, FaArrowLeft, FaSearch, FaChevronRight, FaChevronLeft
} from 'react-icons/fa'

export default function ManageIssues() {
    const router = useRouter(); 
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const [currentView, setCurrentView] = useState('list'); 
    const [selectedItem, setSelectedItem] = useState(null); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ issueText: '' });

    const [issues, setIssues] = useState([
        { id: 1, issueText: "Health locker update issue.", isSolved: true, solvedBy: "Admin_John", createdAt: "2023-10-24" },
        { id: 2, issueText: "Health locker pin generate issue.", isSolved: false, solvedBy: null, createdAt: "2023-10-25" },
        { id: 3, issueText: "Profile update problem.", isSolved: false, solvedBy: null, createdAt: "2023-10-25" },
        { id: 4, issueText: "Booking Hospital bed issue.", isSolved: true, solvedBy: "Super_Admin", createdAt: "2023-10-22" },
        { id: 5, issueText: "Service booking problem.", isSolved: false, solvedBy: null, createdAt: "2023-10-26" },
    ]);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================
    
    const openAddView = () => {
        setFormData({ issueText: '' });
        setCurrentView('add');
    };

    const openEditView = (item) => {
        setSelectedItem(item);
        setFormData({ issueText: item.issueText });
        setCurrentView('edit');
    };

    const handleConfirmSolve = () => {
        const currentAdmin = "Super_Admin"; // Mocked admin session
        setIssues(issues.map(item => 
            item.id === selectedItem.id ? { ...item, isSolved: true, solvedBy: currentAdmin } : item
        ));
        setIsSolveModalOpen(false);
        setSelectedItem(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentView === 'add') {
            setIssues([{ id: Date.now(), issueText: formData.issueText, isSolved: false, solvedBy: null, createdAt: new Date().toISOString().split('T')[0] }, ...issues]);
        } else {
            setIssues(issues.map(item => item.id === selectedItem.id ? { ...item, issueText: formData.issueText } : item));
        }
        setCurrentView('list');
    };

    // ==========================================
    // 🌟 UI COMPONENTS
    // ==========================================

    if (currentView === 'add' || currentView === 'edit') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => setCurrentView('list')} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-semibold text-sm mb-6 transition-colors">
                        <FaArrowLeft /> Back to list
                    </button>
                    
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                        <div className="bg-emerald-600 p-8 text-white text-center">
                            <h2 className="text-2xl font-bold">{currentView === 'edit' ? 'Update Issue' : 'Log New Issue'}</h2>
                            <p className="text-emerald-100 text-sm mt-1 opacity-80">Fill in the details below to maintain user satisfaction</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Issue Description</label>
                                <textarea 
                                    rows="4"
                                    value={formData.issueText} 
                                    onChange={(e) => setFormData({ issueText: e.target.value })} 
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-700 font-medium"
                                    placeholder="Describe the problem reported by the user..."
                                />
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                                {currentView === 'edit' ? 'Update Details' : 'Submit Issue'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">
                
                {/* Header Card */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <FaClipboardList size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Issue Management</h1>
                            <p className="text-slate-400 text-sm font-medium">Tracking and resolving platform hurdles</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={openAddView} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 transition-all">
                            <FaPlus size={12} /> ADD ISSUE
                        </button>
                    </div>
                </div>

                {/* Table Logic */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-50 gap-4">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Search across issues..." 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                            <span>Show</span>
                            <select className="bg-slate-50 border-none rounded-xl px-3 py-2 text-slate-700 outline-none">
                                <option>10</option><option>25</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    <th className="px-8 py-5"># ID</th>
                                    <th className="px-8 py-5">Issue Description</th>
                                    <th className="px-8 py-5 text-center">Status</th>
                                    <th className="px-8 py-5 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {issues.map((item, index) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-slate-400 text-sm">#{index + 1}</td>
                                        <td className="px-8 py-6">
                                            <p className="text-slate-700 font-bold text-[15px]">{item.issueText}</p>
                                            <p className="text-[11px] text-slate-400 mt-1 font-medium italic">Logged: {item.createdAt}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {item.isSolved ? (
                                                <div className="inline-flex flex-col items-center group/solved">
                                                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl flex items-center gap-1.5 border border-emerald-100">
                                                        <FaCheck size={10} /> RESOLVED
                                                    </span>
                                                    <div className="flex items-center gap-1 mt-1.5 text-slate-400">
                                                        <FaUserCheck size={10} />
                                                        <span className="text-[10px] font-bold">{item.solvedBy}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl border border-amber-100">
                                                    IN PROGRESS
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2">
                                                {!item.isSolved && (
                                                    <button onClick={() => {setSelectedItem(item); setIsSolveModalOpen(true)}} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Resolve">
                                                        <FaCheck size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => openEditView(item)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Edit">
                                                    <FaRegEdit size={14} />
                                                </button>
                                                <button onClick={() => {setSelectedItem(item); setIsDeleteModalOpen(true)}} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm" title="Delete">
                                                    <FaTimes size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-4 border-t border-slate-50">
                        <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest">Page 1 of 1</p>
                        <div className="flex items-center gap-1">
                            <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors"><FaChevronLeft size={12} /></button>
                            <button className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-100">1</button>
                            <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors"><FaChevronRight size={12} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SOLVE CONFIRMATION MODAL --- */}
            {isSolveModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSolveModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-200 border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <FaCheck className="text-emerald-600 text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Resolve Issue?</h3>
                        <p className="text-slate-400 font-medium mb-8">This will mark the issue as solved under your name.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsSolveModalOpen(false)} className="flex-1 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold transition-all">Cancel</button>
                            <button onClick={handleConfirmSolve} className="flex-[2] px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-200 border border-slate-100">
                        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                            <FaExclamationTriangle className="text-rose-500 text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Delete Permanently?</h3>
                        <p className="text-slate-400 font-medium mb-8">The records for this issue will be destroyed forever.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold transition-all">Keep it</button>
                            <button onClick={() => { setIssues(issues.filter(i => i.id !== selectedItem.id)); setIsDeleteModalOpen(false); }} className="flex-[2] px-4 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-100 transition-all active:scale-95">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}