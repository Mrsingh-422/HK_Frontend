'use client'
import React, { useState, useEffect } from 'react';
import { FaSearch, FaBoxOpen, FaFilePrescription, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

// Import Tab Components
import General from './components/General';
import Prescription from './components/Prescription';
import Approved from './components/Approved';
import Rejected from './components/Rejected';

export default function PharmacyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('General');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setFetching(true);
        try {
            const res = await PharmacyVendorAPI.listPharmacyOrders();
            setOrders(res.data || []);
        } catch (err) { console.error(err); }
        finally { setFetching(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-7xl mx-auto px-4 mt-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-[32px] border border-emerald-50 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 uppercase">
                        <FaBoxOpen className="text-emerald-600" /> Order Center
                    </h1>
                </div>
                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                        type="text" placeholder="Search ID, Name..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-emerald-500"
                    />
                </div>
            </div>

            {/* TABS */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-emerald-50 shadow-sm w-fit">
                {[
                    { id: 'General', icon: <FaBoxOpen />, label: 'General' },
                    { id: 'Prescription', icon: <FaFilePrescription />, label: 'Prescription' },
                    { id: 'Approved', icon: <FaCheckCircle />, label: 'Approved' },
                    { id: 'Rejected', icon: <FaTimesCircle />, label: 'Rejected' }
                ].map(tab => (
                    <button 
                        key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm overflow-hidden min-h-[400px]">
                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <FaSpinner className="animate-spin text-emerald-600 mb-4" size={32} />
                    </div>
                ) : (
                    <>
                        {activeTab === 'General' && <General orders={orders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Prescription' && <Prescription orders={orders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Approved' && <Approved orders={orders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Rejected' && <Rejected orders={orders} searchTerm={searchTerm} refresh={fetchOrders} />}
                    </>
                )}
            </div>
        </div>
    );
}