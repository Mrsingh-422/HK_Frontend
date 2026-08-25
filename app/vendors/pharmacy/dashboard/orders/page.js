'use client'
import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaBoxOpen, FaFilePrescription, FaCheckCircle, 
  FaTimesCircle, FaSpinner, FaTruck, FaTag 
} from 'react-icons/fa';
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';

// Import Tab Components
import General from './components/General';
import Prescription from './components/Prescription';
import Approved from './components/Approved';
import Rejected from './components/Rejected';
import OrderTable from './components/OrderTable';

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
        } catch (err) { 
            console.error(err); 
        } finally { 
            setFetching(false); 
        }
    };

    // ==========================================
    // PARENT-LEVEL ORDER FILTERS
    // ==========================================
    
    // 1. General: New orders waiting to be Accepted / Packed
    const generalOrders = orders.filter(o => ['Placed', 'Under Review'].includes(o.status));

    // 2. Placed / Dispatch Queue: Orders waiting for driver assignment
    const placedOrders = orders.filter(o => {
        const hasNoDriver = !o.driverId || o.driverId === "" || (typeof o.driverId === 'object' && !o.driverId._id);
        if (!hasNoDriver) return false;

        if (['Placed', 'Packed', 'Accepted'].includes(o.status)) return true;
        if (o.orderType === 'Prescription' && ['Placed', 'Packed'].includes(o.status)) return true;

        return false;
    });

    // 3. Approved / Dispatched: Orders with drivers assigned or in transit
    const approvedOrders = orders.filter(o => 
        (o.driverId && o.driverId._id) || ['Shipped', 'Delivered', 'Completed'].includes(o.status)
    );

    // 4. Rejected: Denied orders
    const rejectedOrders = orders.filter(o => o.status === 'Rejected');

    // 5. Prescription: Orders containing custom prescription attachments
    const prescriptionOrders = orders.filter(o => o.prescriptionImages?.length > 0);

    const getFilteredPlacedOrders = () => {
        return placedOrders.filter(o => {
            const id = o.orderId ? String(o.orderId).toLowerCase() : '';
            const name = o.userId?.name ? String(o.userId.name).toLowerCase() : '';
            const query = searchTerm ? searchTerm.toLowerCase() : '';
            return id.includes(query) || name.includes(query);
        });
    };

    const getComboCountForTab = (tabId) => {
        let subset = [];
        if (tabId === 'General') subset = generalOrders;
        else if (tabId === 'Prescription') subset = prescriptionOrders;
        else if (tabId === 'Placed') subset = placedOrders;
        else if (tabId === 'Approved') subset = approvedOrders;
        else if (tabId === 'Rejected') subset = rejectedOrders;
        
        return subset.filter(o => o.hasComboApplied).length;
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
                    { id: 'Placed', icon: <FaTruck />, label: 'Ready For Dispatch' }, 
                    { id: 'Approved', icon: <FaCheckCircle />, label: 'Shipped / Completed' },
                    { id: 'Rejected', icon: <FaTimesCircle />, label: 'Rejected' }
                ].map(tab => {
                    const comboCount = getComboCountForTab(tab.id);
                    return (
                        <button 
                            key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all relative ${
                                activeTab === tab.id 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            {tab.icon} 
                            <span>{tab.label}</span>
                            {comboCount > 0 && (
                                <span className="flex items-center gap-0.5 ml-1 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-extrabold uppercase animate-pulse">
                                    <FaTag size={6} /> {comboCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* CONTENT CONTAINER */}
            <div className="bg-white rounded-[32px] border border-emerald-50 shadow-sm overflow-hidden min-h-[400px]">
                {fetching ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <FaSpinner className="animate-spin text-emerald-600 mb-4" size={32} />
                    </div>
                ) : (
                    <>
                        {activeTab === 'General' && <General orders={generalOrders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Prescription' && <Prescription orders={prescriptionOrders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Placed' && (
                            <OrderTable 
                                orders={getFilteredPlacedOrders()} 
                                refresh={fetchOrders} 
                                isPrescription={true} 
                            />
                        )}
                        {activeTab === 'Approved' && <Approved orders={approvedOrders} searchTerm={searchTerm} refresh={fetchOrders} />}
                        {activeTab === 'Rejected' && <Rejected orders={rejectedOrders} searchTerm={searchTerm} refresh={fetchOrders} />}
                    </>
                )}
            </div>
        </div>
    );
}