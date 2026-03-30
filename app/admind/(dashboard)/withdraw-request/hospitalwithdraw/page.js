'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    FaArrowLeft, FaSearch, FaSort, FaTimes, 
    FaInfoCircle, FaEye, FaCheckCircle, FaTimesCircle,
    FaMoneyCheckAlt, FaBuilding, FaUserAlt, FaUniversity, FaHashtag,
    FaExclamationTriangle, FaEnvelope
} from 'react-icons/fa'

export default function HospitalWithdrawRequest() {
    const router = useRouter(); 

    // ==========================================
    // 🌟 MOCK DATA (Based precisely on your screenshot)
    // ==========================================
    const [withdrawRequests, setWithdrawRequests] = useState([
        { id: 1, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "Aryan Jaswal", accNumber: "562314899800", ifscCode: "kot0123", amount: 10, status: "Paid" },
        { id: 2, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "SDFSDF", accNumber: "213213", ifscCode: "SWSD21", amount: 25, status: "Paid" },
        { id: 3, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "Aryan Jaswal", accNumber: "562314899800", ifscCode: "kot0123", amount: 32, status: "Rejected" },
        { id: 4, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "SDFSDF", accNumber: "213213", ifscCode: "SWSD21", amount: 11, status: "Rejected" },
        { id: 5, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "Aryan Jaswal", accNumber: "562314899800", ifscCode: "kot0123", amount: 55, status: "Pending" },
        { id: 6, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "Aryan Jaswal", accNumber: "562314899800", ifscCode: "kot0123", amount: 22, status: "Pending" },
        { id: 7, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "YASH", accNumber: "2223444566", ifscCode: "BBCH3233", amount: 323, status: "Pending" },
        { id: 8, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "YASH", accNumber: "2223444566", ifscCode: "BBCH3233", amount: 55, status: "Pending" },
        { id: 9, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "Aryan Jaswal", accNumber: "562314899800", ifscCode: "kot0123", amount: 10, status: "Pending" },
        { id: 10, hospitalName: "Radius Hospital", email: "radius@gmail.com", accHolderName: "YASH", accNumber: "2223444566", ifscCode: "BBCH3233", amount: 200, status: "Pending" },
    ]);

    // ==========================================
    // 🌟 FUNCTIONAL STATES 
    // ==========================================
    const [searchTerm, setSearchTerm] = useState("");
    const[entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal States
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // ==========================================
    // 🌟 HANDLERS
    // ==========================================

    // Handle Search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Filter Data
    const filteredRequests = withdrawRequests.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.hospitalName.toLowerCase().includes(searchLower) ||
            item.email.toLowerCase().includes(searchLower) ||
            item.accHolderName.toLowerCase().includes(searchLower) ||
            item.accNumber.includes(searchLower) ||
            item.status.toLowerCase().includes(searchLower)
        );
    });

    // Pagination Logic
    const totalEntries = filteredRequests.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);

    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Open Info Modal
    const openInfoModal = (item) => {
        setSelectedItem(item);
        setIsInfoModalOpen(true);
    };

    // Change Status Handler (Paid / Reject)
    const updateStatus = (e, id, newStatus) => {
        e.stopPropagation(); // Preven click from opening Info Modal
        const updatedList = withdrawRequests.map(req => 
            req.id === id ? { ...req, status: newStatus } : req
        );
        setWithdrawRequests(updatedList);
        
        // Live update in Modal if open
        if(selectedItem && selectedItem.id === id) {
            setSelectedItem({ ...selectedItem, status: newStatus });
        }
    };

    // Status Color Helper
    const getStatusColor = (status) => {
        switch(status) {
            case 'Pending': return 'text-red-500 bg-red-50'; 
            case 'Paid': return 'text-[#08B36A] bg-[#e6f7eb]'; // Screenshot uses "Paid" in green
            case 'Rejected': return 'text-gray-500 bg-gray-100';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* ========================================== */}
            {/* 🌟 PREMIUM HEADER SECTION                  */}
            {/* ========================================== */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#e6f7eb] p-3 md:p-4 rounded-xl border border-[#08B36A]/20">
                        <FaBuilding className="text-[#08B36A] text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Hospital Withdraw Request</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Manage and disburse hospital payments</p>
                    </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_12px_rgba(8,179,106,0.25)] transition-all hover:-translate-y-0.5 uppercase tracking-wider"
                    >
                        <FaArrowLeft size={12} /> Go Back
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 TABLE SECTION                           */}
            {/* ========================================== */}
            <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                
                {/* Search & Entries Controls */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                        Show 
                        <select 
                            value={entriesPerPage} 
                            onChange={handleEntriesChange}
                            className="border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-[#08B36A] bg-white cursor-pointer shadow-sm"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select> 
                        entries
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search records..." 
                            className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide">
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">No. <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Hospital Name <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Hospital Email <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Acc. Holder Name <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Account Number <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">IFSC Code <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Amount <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#08B36A]">Status <FaSort className="text-gray-300" /></div>
                                </th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f8fcf9] transition-colors group">
                                        
                                        {/* Clickable TDs for Info Modal */}
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-500 cursor-pointer">{indexOfFirstItem + index + 1}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-bold text-gray-800 cursor-pointer group-hover:text-[#08B36A] transition-colors">{item.hospitalName}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-600 cursor-pointer">{item.email}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-semibold text-gray-700 cursor-pointer">{item.accHolderName}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-600 cursor-pointer tracking-wider">{item.accNumber}</td>
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-medium text-gray-600 cursor-pointer uppercase">{item.ifscCode}</td>
                                        
                                        <td onClick={() => openInfoModal(item)} className="p-5 font-black text-gray-800 cursor-pointer">
                                            {item.amount}
                                        </td>
                                        
                                        <td onClick={() => openInfoModal(item)} className="p-5 cursor-pointer">
                                            <span className={`px-3 py-1 rounded-md text-[12px] font-bold ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        {/* 🌟 ACTION BUTTONS (Kept Outside properly) */}
                                        <td className="p-5 text-center">
                                            <div className="flex justify-center items-center gap-2.5">
                                                
                                                {/* View Button (Always visible) */}
                                                <button onClick={(e) => { e.stopPropagation(); openInfoModal(item); }} className="text-gray-500 hover:text-white bg-gray-100 hover:bg-gray-600 p-2 rounded-lg transition-all shadow-sm" title="View Details">
                                                    <FaEye size={14} />
                                                </button>

                                                {/* Approve / Reject (Only if Pending) */}
                                                {item.status === 'Pending' && (
                                                    <>
                                                        <button 
                                                            onClick={(e) => updateStatus(e, item.id, 'Paid')} 
                                                            className="text-[#08B36A] hover:text-white bg-[#e6f7eb] hover:bg-[#08B36A] p-2 rounded-lg transition-all shadow-sm" 
                                                            title="Mark as Paid"
                                                        >
                                                            <FaCheckCircle size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => updateStatus(e, item.id, 'Rejected')} 
                                                            className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-lg transition-all shadow-sm" 
                                                            title="Reject Request"
                                                        >
                                                            <FaTimesCircle size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FaSearch className="text-4xl mb-3 text-gray-200" />
                                            <p className="text-[15px] font-medium text-gray-500">No records found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ========================================== */}
                {/* 🌟 FUNCTIONAL PAGINATION CONTROLS          */}
                {/* ========================================== */}
                <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <p className="text-[13px] text-gray-500 font-medium">
                        Showing {totalEntries === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
                    </p>
                    
                    {totalPages > 1 && (
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button onClick={goToFirstPage} disabled={currentPage === 1} className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">FIRST</button>
                            <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">PREVIOUS</button>
                            
                            <div className="flex items-center px-1">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index} onClick={() => paginate(index + 1)}
                                        className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold mx-0.5 rounded-full transition-all ${
                                            currentPage === index + 1 ? 'bg-[#08B36A] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            
                            <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">NEXT</button>
                            <button onClick={goToLastPage} disabled={currentPage === totalPages} className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">LAST</button>
                        </div>
                    )}
                </div>

            </div>

            {/* ========================================= */}
            {/* 🌟 INFO / VIEW MODAL (Bank Receipt Style) */}
            {/* ========================================= */}
            {isInfoModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInfoModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200 max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-[18px] font-bold text-[#08B36A] flex items-center gap-2">
                                <FaInfoCircle size={16} /> Withdraw Request Details
                            </h2>
                            <button 
                                onClick={() => setIsInfoModalOpen(false)} 
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-md transition-all"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 md:p-8 overflow-y-auto">
                            
                            {/* Top Highlight (Amount & Status) */}
                            <div className="bg-gradient-to-br from-[#08B36A] to-[#04824b] rounded-2xl p-6 md:p-8 text-white flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden mb-8">
                                <div className="absolute -right-10 -top-10 w-40 h-40 border-[12px] border-white/10 rounded-full opacity-50"></div>
                                <div className="absolute -left-5 -bottom-5 w-24 h-24 border-[8px] border-white/10 rounded-full opacity-50"></div>
                                
                                <p className="text-white/80 text-[13px] font-bold tracking-widest uppercase mb-2 relative z-10">Requested Amount</p>
                                <h3 className="text-4xl md:text-5xl font-black tracking-tight relative z-10">
                                    ₹ {selectedItem.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </h3>
                                
                                <div className="mt-4 relative z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm ${
                                        selectedItem.status === 'Pending' ? 'bg-yellow-400 text-yellow-900' : 
                                        selectedItem.status === 'Paid' ? 'bg-white text-[#08B36A]' : 
                                        'bg-red-500 text-white'
                                    }`}>
                                        {selectedItem.status === 'Pending' && <FaExclamationTriangle size={12} />}
                                        {selectedItem.status === 'Paid' && <FaCheckCircle size={12} />}
                                        {selectedItem.status === 'Rejected' && <FaTimesCircle size={12} />}
                                        Status: {selectedItem.status}
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fafafa] p-6 rounded-2xl border border-gray-100">
                                
                                {/* Hospital Info Section */}
                                <div className="space-y-6 md:pr-6 md:border-r border-gray-200">
                                    <h4 className="text-[15px] font-black text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                                        <FaBuilding className="text-[#08B36A]" /> Hospital Details
                                    </h4>
                                    
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Hospital Name</p>
                                        <p className="text-[15px] font-bold text-gray-800">{selectedItem.hospitalName}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Hospital Email</p>
                                        <p className="text-[14px] font-bold text-gray-600 flex items-center gap-2">
                                            <FaEnvelope className="text-gray-300" /> {selectedItem.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Bank Info Section */}
                                <div className="space-y-6">
                                    <h4 className="text-[15px] font-black text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                                        <FaUniversity className="text-[#08B36A]" /> Bank Information
                                    </h4>
                                    
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Account Holder Name</p>
                                        <p className="text-[15px] font-bold text-gray-800 flex items-center gap-2">
                                            <FaUserAlt className="text-gray-300" /> {selectedItem.accHolderName}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">Account Number</p>
                                        <p className="text-[15px] font-bold text-gray-800 tracking-widest flex items-center gap-2">
                                            <FaHashtag className="text-gray-300" /> {selectedItem.accNumber}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">IFSC Code</p>
                                        <p className="text-[15px] font-bold text-gray-800 uppercase bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200">
                                            {selectedItem.ifscCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons Inside Modal (If Pending) */}
                            {selectedItem.status === 'Pending' && (
                                <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
                                    <button 
                                        onClick={(e) => updateStatus(e, selectedItem.id, 'Rejected')}
                                        className="flex-1 py-3.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 hover:border-red-500 text-[14px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <FaTimesCircle /> Reject Request
                                    </button>
                                    <button 
                                        onClick={(e) => updateStatus(e, selectedItem.id, 'Paid')}
                                        className="flex-1 py-3.5 bg-[#08B36A] hover:bg-[#069356] text-white text-[14px] font-bold rounded-xl shadow-[0_4px_15px_rgba(8,179,106,0.3)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle /> Mark as Paid
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}