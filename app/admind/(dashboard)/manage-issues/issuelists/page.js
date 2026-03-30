'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    FaTimes, FaExclamationTriangle, FaClipboardList, 
    FaRegEdit, FaSort 
} from 'react-icons/fa'

export default function ManageIssues() {
    const router = useRouter(); 
    
    // ==========================================
    // 🌟 STATES
    // ==========================================
    const[currentView, setCurrentView] = useState('list'); 
    const [selectedItem, setSelectedItem] = useState(null); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ issueText: '' });

    // Mock Data exactly based on your screenshot
    const [issues, setIssues] = useState([
        { id: 1, issueText: "Health locker update issue." },
        { id: 2, issueText: "Health locker pin generate issue." },
        { id: 3, issueText: "Profile update problem." },
        { id: 4, issueText: "Booking Hospital bed issue." },
        { id: 5, issueText: "Service booking problem." },
        { id: 6, issueText: "medicine buying issue." },
        { id: 7, issueText: "AppointmentBooking Problem." },
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentView === 'add') {
            const newItem = { id: Date.now(), issueText: formData.issueText };
            setIssues([...issues, newItem]);
        } else if (currentView === 'edit') {
            const updatedList = issues.map(item => 
                item.id === selectedItem.id ? { ...item, issueText: formData.issueText } : item
            );
            setIssues(updatedList);
        }
        setCurrentView('list');
        setSelectedItem(null);
    };

    const openDeleteModal = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        const filteredList = issues.filter(item => item.id !== selectedItem.id);
        setIssues(filteredList);
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    // ==========================================
    // 🌟 UI COMPONENTS
    // ==========================================

    // 1️⃣ ADD / EDIT FORM VIEW 
    if (currentView === 'add' || currentView === 'edit') {
        return (
            <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
                <div className="max-w-[1400px] mx-auto">
                    {/* Top Buttons */}
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => setCurrentView('list')} 
                            className="px-6 py-2.5 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded shadow-sm transition-colors"
                        >
                            GO BACK
                        </button>
                    </div>

                    {/* Main Form Container */}
                    <div className="relative bg-white rounded-md shadow-sm border border-gray-100 pt-16 pb-14 px-8 md:px-12">
                        
                        {/* Green Tab Header */}
                        <div className="absolute top-0 left-0 bg-[#2EBE7E] text-white px-6 py-3 rounded-br-lg rounded-tl-md text-[15px] font-bold tracking-wide shadow-sm">
                            {currentView === 'edit' ? 'Edit Issue' : 'Add Issue'}
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="w-full mt-6">
                            <div className="mb-12">
                                <label className="block text-[12px] text-gray-400 mb-2 font-medium">Issue <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="issueText" 
                                    value={formData.issueText} 
                                    onChange={(e) => setFormData({ issueText: e.target.value })} 
                                    required
                                    placeholder="Enter issue details..." 
                                    className="w-full outline-none text-[14px] text-gray-700 bg-transparent py-1.5 border-b border-gray-300 focus:border-[#2EBE7E] transition-colors" 
                                />
                            </div>

                            {/* Submit Button Centered */}
                            <div className="flex justify-center">
                                <button type="submit" className="px-8 py-2.5 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded shadow-sm transition-all hover:-translate-y-0.5">
                                    SUBMIT DETAILS
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // 2️⃣ MAIN LIST VIEW 
    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* Header Section */}
            <div className="max-w-[1400px] mx-auto bg-transparent mb-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-200/60 p-3 rounded-lg">
                        <FaClipboardList className="text-[#374151] text-xl" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#1f2937]">Manage Issues</h1>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <button onClick={openAddView} className="flex-1 md:flex-none px-6 py-2.5 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded shadow-sm transition-colors">
                        ADD ISSUE
                    </button>
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 md:flex-none px-6 py-2.5 bg-[#2EBE7E] hover:bg-[#259c67] text-white text-[13px] font-bold rounded shadow-sm transition-colors"
                    >
                        GO BACK
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Search & Entries (FIXED UI: Only Bottom Borders) */}
                <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                        Show 
                        <input 
                            type="number" 
                            defaultValue="10" 
                            className="w-12 border-b border-gray-300 px-1 py-0.5 text-center outline-none focus:border-[#2EBE7E] bg-transparent text-gray-700" 
                        />
                        entries
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search records" 
                            className="w-full sm:w-64 px-1 py-1 text-[13px] border-b border-gray-300 outline-none focus:border-[#2EBE7E] transition-colors bg-transparent text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-y border-gray-200 text-[13px] text-[#1f2937] font-bold">
                                <th className="p-4 pl-6 w-24 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2">S No. <FaSort className="text-gray-300 text-[10px]" /></div>
                                </th>
                                <th className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2">Issue <FaSort className="text-gray-300 text-[10px]" /></div>
                                </th>
                                <th className="p-4 w-32 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-center gap-2">Action <FaSort className="text-gray-300 text-[10px]" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-600">
                            {issues.length > 0 ? (
                                issues.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-[#fcfdfc] transition-colors">
                                        <td className="p-4 pl-6 font-medium text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-700">{item.issueText}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                {/* Edit Icon */}
                                                <button onClick={() => openEditView(item)} className="text-[#f59e0b] hover:text-[#d97706] transition-colors" title="Edit">
                                                    <FaRegEdit size={16} />
                                                </button>
                                                {/* Delete Icon */}
                                                <button onClick={() => openDeleteModal(item)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                                                    <FaTimes size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-gray-400 font-medium text-[14px]">
                                        Data Not Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (FIXED UI: Exact Screenshot Match) */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white border-t border-gray-50">
                    <p className="text-[13px] text-gray-500 font-medium">
                        Showing 1 to {issues.length} of {issues.length} entries
                    </p>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                        <button className="px-3 py-2 text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200">FIRST</button>
                        <button className="px-3 py-2 text-[11px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200">PREVIOUS</button>
                        
                        {/* Active Page Number */}
                        <div className="px-2 py-1 bg-white border-r border-gray-200 flex items-center justify-center">
                            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#2EBE7E] text-white text-[12px] font-bold shadow-sm">1</button>
                        </div>
                        
                        <button className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-r border-gray-200">NEXT</button>
                        <button className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">LAST</button>
                    </div>
                </div>

            </div>

            {/* ========================================= */}
            {/* 🌟 DELETE CONFIRMATION MODAL              */}
            {/* ========================================= */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 md:p-8 text-center animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <FaExclamationTriangle className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-[20px] font-bold text-gray-800 mb-2">Are you sure?</h3>
                        <p className="text-[14px] text-gray-500 font-medium mb-8">
                            Do you really want to delete this issue?
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] font-bold transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}