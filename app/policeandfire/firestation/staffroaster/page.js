'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaSearch, FaSpinner, FaShieldAlt, FaCheckCircle, 
    FaSun, FaMoon, FaUserCheck, FaUserTimes, FaUsers, 
    FaUserTie, FaExclamationTriangle, FaTimesCircle, FaIdBadge, FaClock
} from 'react-icons/fa'

// API Import
import FireStationAPI from '@/app/services/FireStationAPI'

export default function RosterManagementPage() {
    // --- STATES ---
    const [shift, setShift] = useState('Day'); // 'Day' or 'Night'
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stats State matching your exact Postman Response
    const [rosterStats, setRosterStats] = useState({
        totalStaff: 0,
        totalPresent: 0,
        totalOnLeave: 0
    });
    const [rosterList, setRosterList] = useState([]);

    // --- FETCH DATA ---
    const fetchRosterData = async (selectedShift) => {
        setIsLoading(true);
        setError(null);
        try {
            // This will now call /fireStation/ops/roster?shiftType=Day or Night
            const res = await FireStationAPI.GetRoster(selectedShift);
            
            if (res.success) {
                setRosterStats({
                    totalStaff: res.stats?.totalStaff || 0,
                    totalPresent: res.stats?.totalPresent || 0,
                    totalOnLeave: res.stats?.totalOnLeave || 0
                });
                setRosterList(res.data || []);
            } else {
                setError('Failed to fetch roster data.');
            }
        } catch (err) {
            console.error("Error fetching roster:", err);
            setError("Server connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when Tab changes
    useEffect(() => {
        fetchRosterData(shift);
        setSearchQuery(''); 
    }, [shift]);

    // --- FILTER ---
    const filteredRoster = rosterList?.filter(staff => {
        const query = searchQuery.toLowerCase();
        return (
            staff.name?.toLowerCase().includes(query) ||
            staff.rank?.toLowerCase().includes(query) ||
            staff.dutyStatus?.toLowerCase().includes(query) ||
            staff.badge?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shift Roster</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage daily operations, shifts, and staff availability</p>
                </div>
                
                {/* 🌟 SHIFT TOGGLE BUTTONS 🌟 */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setShift('Day')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                            shift === 'Day' ? 'bg-white text-[#08B36A] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <FaSun size={14} /> Day Shift
                    </button>
                    <button 
                        onClick={() => setShift('Night')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                            shift === 'Night' ? 'bg-white text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <FaMoon size={14} /> Night Shift
                    </button>
                </div>
            </div>

            {/* --- STATS SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FaUsers size={20}/>} title="Total Staff" value={rosterStats.totalStaff} colorClass="text-blue-500" bgClass="bg-blue-50" />
                <StatCard icon={<FaUserCheck size={20}/>} title="Total Present" value={rosterStats.totalPresent} colorClass="text-[#08B36A]" bgClass="bg-green-50" />
                <StatCard icon={<FaUserTimes size={20}/>} title="Total On Leave" value={rosterStats.totalOnLeave} colorClass="text-red-500" bgClass="bg-red-50" />
            </div>

            {/* --- DATA TABLE SECTION --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FaShieldAlt className={`transition-colors ${shift === 'Day' ? 'text-[#08B36A]' : 'text-indigo-500'}`}/> 
                        {shift} Shift Personnel
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, badge..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"/>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Loading {shift} Shift...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-red-500">
                            <FaExclamationTriangle className="text-4xl mb-4 opacity-50"/>
                            <p className="text-sm font-bold">{error}</p>
                            <button onClick={() => fetchRosterData(shift)} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors">Try Again</button>
                        </div>
                    ) : (
                        <table className="w-full text-left whitespace-nowrap">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                                    <th className="px-8 py-4">Badge ID</th>
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4">Rank / Role</th>
                                    <th className="px-6 py-4">Check-in Time</th>
                                    <th className="px-6 py-4">Duty Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRoster?.map((staff) => {
                                    // Status colors mapping
                                    const isLeave = staff.dutyStatus === 'LEAVE';
                                    const isOnDuty = staff.dutyStatus === 'ON-DUTY';
                                    
                                    return (
                                        <tr key={staff.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <FaIdBadge className="text-slate-400" />
                                                    <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{staff.badge || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0"><FaUserTie size={16} /></div>
                                                    <span className="text-sm font-bold text-slate-800">{staff.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-[#08B36A]">{staff.rank || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                                                    <FaClock className="text-slate-300"/> {staff.checkInTime || '--:--'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max ${
                                                    isOnDuty ? 'bg-green-50 text-green-600 border border-green-100' : 
                                                    isLeave ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    'bg-slate-50 text-slate-500 border border-slate-200'
                                                }`}>
                                                    {isOnDuty ? <FaCheckCircle size={11} className="text-green-500"/> : 
                                                     isLeave ? <FaUserTimes size={11} className="text-red-500"/> : 
                                                     <FaTimesCircle size={11} className="text-slate-400"/>} 
                                                    {staff.dutyStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                
                                {(!filteredRoster || filteredRoster.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-16 text-slate-500 font-medium">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                    {shift === 'Day' ? <FaSun size={32}/> : <FaMoon size={32}/>}
                                                </div>
                                                <p>No staff found for {shift} Shift.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, title, value, colorClass, bgClass }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
            <div className={`p-4 rounded-2xl flex-shrink-0 ${bgClass} ${colorClass}`}>{icon}</div>
            <div className="truncate">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{title}</p>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            </div>
        </div>
    )
}