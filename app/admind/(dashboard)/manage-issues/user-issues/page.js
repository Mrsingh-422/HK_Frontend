'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaClipboardList, FaSort, FaSearch, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa'

export default function ManageUserIssues() {
    const router = useRouter(); 

    // ==========================================
    // 🌟 MOCK DATA (Extended slightly to show pagination)
    // ==========================================
    const [userIssues] = useState([
        { id: 1, username: "-", issue: "Booking Hospital bed issue.", details: "Enter issue", email: "foqakiku.q.ab.47.0@gmail.com", phone: "-" },
        { id: 2, username: "-", issue: "Booking Hospital bed issue.", details: "Enter issue", email: "foqakiku.q.ab.47.0@gmail.com", phone: "-" },
        { id: 3, username: "-", issue: "Booking Hospital bed issue.", details: "Enter issue", email: "foqakiku.q.ab.47.0@gmail.com", phone: "-" },
        { id: 4, username: "-", issue: "Booking Hospital bed issue.", details: "Enter issue", email: "a.jam.in.ivi5.52@gmail.com", phone: "-" },
        { id: 5, username: "Khanday", issue: "-", details: "Enter issue", email: "-", phone: "-" },
        { id: 6, username: "-", issue: "Health locker update issue.", details: "Enter issue", email: "xaco.wa.xu8.60@gmail.com", phone: "-" },
        { id: 7, username: "-", issue: "Health locker update issue.", details: "Enter issue", email: "aroyu.l.ifih.i.j.6.3@gmail.com", phone: "-" },
        { id: 8, username: "-", issue: "Service booking problem.", details: "Enter issue", email: "u.q.ec.ol.a.gore1.9@gmail.com", phone: "-" },
        { id: 9, username: "-", issue: "medicine buying issue.", details: "Enter issue", email: "hof.e.yog.onaki16@gmail.com", phone: "-" },
        { id: 10, username: "-", issue: "medicine buying issue.", details: "Enter issue", email: "sic.u.r.ohi.q.oq43@gmail.com", phone: "-" },
        { id: 11, username: "Rahul", issue: "Payment Failed", details: "Money deducted but appointment not confirmed", email: "rahul@example.com", phone: "9876543210" },
        { id: 12, username: "Amit", issue: "App crashing", details: "App crashes on login screen", email: "amit.kumar@gmail.com", phone: "7894561230" },
    ]);

    // ==========================================
    // 🌟 FUNCTIONAL STATES (Search & Pagination)
    // ==========================================
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Handling Search Logic
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 on new search
    };

    // Filter Data based on Search Term
    const filteredIssues = userIssues.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.username && item.username.toLowerCase().includes(searchLower)) ||
            (item.issue && item.issue.toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toLowerCase().includes(searchLower)) ||
            (item.details && item.details.toLowerCase().includes(searchLower))
        );
    });

    // 2. Handling Pagination Logic
    const totalEntries = filteredIssues.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    
    // Get current items for the current page
    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentItems = filteredIssues.slice(indexOfFirstItem, indexOfLastItem);

    // Handlers for Page Changes
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);

    // Handle Entries Per Page Change
    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to page 1 when changing entries limit
    };

    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans">
            
            {/* ========================================== */}
            {/* 🌟 PREMIUM HEADER SECTION                  */}
            {/* ========================================== */}
            <div className="max-w-[1500px] mx-auto bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#eefcf5] p-3 md:p-4 rounded-xl border border-[#2EBE7E]/20">
                        <FaExclamationCircle className="text-[#2EBE7E] text-xl md:text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">Manage User Issues</h1>
                        <p className="text-[13px] text-gray-500 font-medium mt-0.5">Track and resolve problems reported by users</p>
                    </div>
                </div>
                
                <div className="flex w-full md:w-auto items-center gap-3">
                    <button 
                        onClick={() => router.back()} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-[#2EBE7E] text-[#2EBE7E] hover:bg-[#eefcf5] text-[13px] font-bold rounded-xl transition-all shadow-sm"
                    >
                        <FaArrowLeft size={12} /> Go Back
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 TABLE SECTION                           */}
            {/* ========================================== */}
            <div className="max-w-[1500px] mx-auto bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                
                {/* Search & Entries Controls */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                        Show 
                        <select 
                            value={entriesPerPage} 
                            onChange={handleEntriesChange}
                            className="border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-[#2EBE7E] bg-white cursor-pointer shadow-sm"
                        >
                            <option value={5}>5</option>
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
                            placeholder="Search by email, issue or username..." 
                            className="w-full sm:w-72 pl-9 pr-4 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-[#2EBE7E] focus:ring-1 focus:ring-[#2EBE7E] transition-all bg-white shadow-sm"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-[13px] text-gray-500 font-bold tracking-wide uppercase">
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">S No. <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">Username <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">Issue <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">Issue Details <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">Email <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                                <th className="p-5 cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-2">Phone <FaSort className="text-gray-300 group-hover:text-[#2EBE7E] transition-colors" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-gray-700">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-[#f8fdfa] transition-colors">
                                        <td className="p-5 font-medium text-gray-500">
                                            {/* S.No dynamically calculated across pages */}
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="p-5 font-bold text-gray-800">
                                            {item.username || '-'}
                                        </td>
                                        <td className="p-5 font-medium text-gray-700 max-w-[250px] truncate" title={item.issue}>
                                            {item.issue || '-'}
                                        </td>
                                        <td className="p-5 text-gray-500 max-w-[200px] truncate" title={item.details}>
                                            {item.details}
                                        </td>
                                        <td className="p-5 font-medium text-[#2EBE7E]">
                                            {item.email || '-'}
                                        </td>
                                        <td className="p-5 font-semibold text-gray-600">
                                            {item.phone || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FaSearch className="text-4xl mb-3 text-gray-200" />
                                            <p className="text-[15px] font-medium text-gray-500">No issues found matching "{searchTerm}"</p>
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
                    
                    {/* Hide pagination buttons if there is no data or only 1 page */}
                    {totalPages > 1 && (
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            
                            <button 
                                onClick={goToFirstPage} disabled={currentPage === 1}
                                className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                FIRST
                            </button>
                            
                            <button 
                                onClick={goToPrevPage} disabled={currentPage === 1}
                                className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-r border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                PREVIOUS
                            </button>
                            
                            {/* Dynamic Page Numbers */}
                            <div className="flex items-center px-1">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => paginate(index + 1)}
                                        className={`w-8 h-8 flex items-center justify-center text-[12px] font-bold mx-0.5 rounded-full transition-all ${
                                            currentPage === index + 1 
                                            ? 'bg-[#2EBE7E] text-white shadow-md' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={goToNextPage} disabled={currentPage === totalPages}
                                className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                NEXT
                            </button>
                            
                            <button 
                                onClick={goToLastPage} disabled={currentPage === totalPages}
                                className="px-3 py-2 text-[11px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-l border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                LAST
                            </button>

                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}