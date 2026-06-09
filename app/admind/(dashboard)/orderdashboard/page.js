'use client'
import React, { useState, useEffect, useCallback } from 'react';
import AdminAPI from '../../../services/AdminAPI';
import {
    Beaker, Pill, UserRound, Building2, Truck,
    Clock, CheckCircle2, XCircle, Activity,
    Search, RefreshCcw, ExternalLink, Calendar,
    Wallet, ChevronLeft, ChevronRight, User,
    Phone, Mail, MapPin, Stethoscope, FileText,
    X, Tag, ShoppingBag, Navigation,
    Image as ImageIcon, Loader2, AlertTriangle, Filter
} from 'lucide-react';

const VENDOR_UI = {
    doctor: { name: 'Doctor', icon: Stethoscope, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    lab: { name: 'Lab', icon: Beaker, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    pharmacy: { name: 'Pharmacy', icon: Pill, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    nurse: { name: 'Nurse', icon: UserRound, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
    hospital: { name: 'Hospital', icon: Building2, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-600' },
    ambulance: { name: 'Ambulance', icon: Truck, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
};

export default function OrderDashboard() {
    // Stats & Table States
    const [stats, setStats] = useState(null);
    const [liveOrders, setLiveOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

    // --- FILTER STATES (Defaulted to 'all' to show everything) ---
    const [timeRange, setTimeRange] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [limit] = useState(25);

    // Modal & Detail States
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // --- API FETCH FUNCTIONS ---

    const fetchStats = async () => {
        try {
            // Only send params if they are not 'all'
            const params = {
                timeRange: timeRange === 'all' ? undefined : timeRange,
                vendor: selectedVendor === 'all' ? undefined : selectedVendor
            };
            const res = await AdminAPI.adminStatDashboard(params);
            if (res.success) setStats(res.data);
        } catch (err) { console.error("Stats Error:", err); }
    };

    const fetchOrders = useCallback(async (page) => {
        try {
            setTableLoading(true);
            
            // Passing Filters as query params. If 'all', we send undefined.
            const res = await AdminAPI.getLiveOrders(
                page, 
                limit, 
                timeRange === 'all' ? undefined : timeRange, 
                selectedVendor === 'all' ? undefined : selectedVendor,
                searchQuery
            );

            if (res.success) {
                setLiveOrders(res.data);
                setTotalPages(res.totalPages);
                setTotalOrders(res.totalOrders);
                setCurrentPage(res.currentPage);
            }
        } catch (err) { console.error("Table Error:", err); } finally {
            setTableLoading(false);
            setLoading(false);
        }
    }, [limit, timeRange, selectedVendor, searchQuery]);

    const handleViewDetails = async (orderId) => {
        try {
            setSelectedOrderId(orderId);
            setDetailsLoading(true);
            const res = await AdminAPI.getOrderDetails(orderId);
            if (res.success) setOrderDetails(res);
        } catch (err) { console.error("Detail Error:", err); } finally {
            setDetailsLoading(false);
        }
    };

    // Refetch when page or filters change
    useEffect(() => {
        fetchStats();
        fetchOrders(currentPage);
    }, [fetchOrders, currentPage, timeRange, selectedVendor]);

    // --- HELPERS ---

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('pending') || s.includes('placed')) return 'bg-amber-50 text-amber-700 border-amber-100';
        if (s.includes('confirmed') || s.includes('progress')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (s.includes('completed')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (s.includes('cancelled')) return 'bg-rose-50 text-rose-700 border-rose-100';
        return 'bg-slate-50 text-slate-700 border-slate-100';
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold tracking-tight uppercase text-xs">Initializing Admin System...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans text-slate-900">
            <main className="max-w-[1600px] mx-auto px-6 pt-8">

                {/* SECTION 1: VENDOR ANALYTICS CARDS */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Provider Analytics</h2>
                            <p className="text-xs text-slate-400 font-bold mt-1">Snapshot of system-wide performance</p>
                        </div>
                        
                        {/* --- DROPDOWN FILTERS --- */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                <Calendar size={14} className="text-slate-400" />
                                <select 
                                    value={timeRange} 
                                    onChange={(e) => { setTimeRange(e.target.value); setCurrentPage(1); }}
                                    className="text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer text-slate-600"
                                >
                                    <option value="all">All Time</option>
                                    <option value="6h">6 Hours</option>
                                    <option value="12h">12 Hours</option>
                                    <option value="24h">24 Hours</option>
                                    <option value="7d">7 Days</option>
                                    <option value="30d">30 Days</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                                <Filter size={14} className="text-slate-400" />
                                <select 
                                    value={selectedVendor} 
                                    onChange={(e) => { setSelectedVendor(e.target.value); setCurrentPage(1); }}
                                    className="text-[10px] font-black uppercase tracking-widest bg-transparent outline-none cursor-pointer text-slate-600"
                                >
                                    <option value="all">All Vendors</option>
                                    {Object.keys(VENDOR_UI).map(key => (
                                        <option key={key} value={key}>{VENDOR_UI[key].name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => { fetchStats(); fetchOrders(1); }}
                                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
                        {Object.keys(VENDOR_UI).map((key) => {
                            const vendor = VENDOR_UI[key];
                            const data = stats ? stats[key] : { pending: 0, completed: 0, cancelled: 0 };
                            const total = (data?.pending || 0) + (data?.completed || 0) + (data?.cancelled || 0);

                            return (
                                <div key={key} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`${vendor.bg} ${vendor.text} p-3 rounded-2xl`}>
                                            <vendor.icon size={24} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                            <p className={`text-xl font-black ${vendor.text}`}>{total}</p>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-4">{vendor.name}</h3>
                                    <div className="space-y-4">
                                        <StatRow label="Pending" value={data?.pending} color="text-amber-500" icon={<Clock size={14} />} />
                                        <StatRow label="Done" value={data?.completed} color="text-emerald-500" icon={<CheckCircle2 size={14} />} />
                                        <StatRow label="Cancel" value={data?.cancelled} color="text-rose-500" icon={<XCircle size={14} />} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 2: LIVE ORDERS TABLE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-10">
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight">Live Request Feed</h2>
                                <div className="bg-emerald-500 w-2 h-2 rounded-full animate-ping" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium tracking-tight">
                                Showing {liveOrders.length} results from {totalOrders} entries
                            </p>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto min-h-[400px]">
                        {tableLoading && (
                            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                            </div>
                        )}
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-8 py-5">Vendor</th>
                                    <th className="px-8 py-5">Service</th>
                                    <th className="px-8 py-5">Net Amount</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">View</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {liveOrders.length > 0 ? liveOrders.map((order) => (
                                    <tr key={order.id || order.orderId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5 font-mono font-bold text-indigo-600 text-sm tracking-tight">#{order.orderId}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${VENDOR_UI[order.vendor?.toLowerCase()]?.bg || 'bg-slate-100'}`}>
                                                    {React.createElement(VENDOR_UI[order.vendor?.toLowerCase()]?.icon || Building2, { size: 14, className: VENDOR_UI[order.vendor?.toLowerCase()]?.text })}
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-slate-500">{order.vendor}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-800">{order.service}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900 tracking-tighter">₹{order.amount?.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                                                {order.status?.replace(/-/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => handleViewDetails(order.orderId)}
                                                className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center opacity-40">
                                                <ShoppingBag size={48} className="mb-4" />
                                                <p className="font-black uppercase tracking-widest text-xs">No orders found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-500 font-medium">
                            Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || tableLoading}
                                className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-600"
                            >
                                <ChevronLeft size={18} /> Prev
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || tableLoading}
                                className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 disabled:opacity-50 transition-all hover:border-indigo-600"
                            >
                                Next <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* SECTION 3: DYNAMIC ORDER DETAILS MODAL */}
            {selectedOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl my-auto flex flex-col relative animate-in zoom-in-95">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${getStatusStyle(orderDetails?.data?.status)}`}>
                                    {orderDetails?.vendor ? React.createElement(VENDOR_UI[orderDetails?.vendor.toLowerCase()]?.icon || Activity, { size: 28 }) : <Activity size={28} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">#{orderDetails?.data?.bookingId || orderDetails?.data?.orderId}</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{orderDetails?.vendor} Service Manifest</p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedOrderId(null); setOrderDetails(null); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                            {detailsLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-indigo-600"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold tracking-widest text-xs uppercase">Decoding Order Data...</p></div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-1 space-y-6">
                                        <DetailCard title="Customer Profile" icon={<User size={18} />}>
                                            <div className="space-y-4">
                                                <InfoItem label="Name" value={orderDetails?.data?.userId?.name} />
                                                <InfoItem label="Email" value={orderDetails?.data?.userId?.email} />
                                                <InfoItem label="Contact" value={orderDetails?.data?.userId?.phone} />
                                            </div>
                                        </DetailCard>

                                        <DetailCard title="Billing Details" icon={<Wallet size={18} />}>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Method</span> <span className="text-slate-800">{orderDetails?.data?.paymentMethod || 'Online'}</span></div>
                                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Status</span> <span className="text-emerald-600">{orderDetails?.data?.paymentStatus}</span></div>
                                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="text-xs font-black text-slate-400 uppercase">Total Amount</span>
                                                    <span className="text-2xl font-black text-slate-900">₹{(orderDetails?.data?.totalAmount || orderDetails?.data?.billSummary?.totalAmount || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </DetailCard>
                                    </div>

                                    <div className="lg:col-span-2 space-y-6">
                                        {(orderDetails?.vendor === 'Hospital' || orderDetails?.vendor === 'Doctor' || orderDetails?.vendor === 'Nurse') && (
                                            <>
                                                <DetailCard title="Service Information" icon={<Building2 size={18} />}>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <InfoItem label="Facility/Provider" value={orderDetails?.data?.hospitalId?.name || orderDetails?.data?.doctorId?.name || orderDetails?.data?.nurseId?.name} />
                                                        <InfoItem label="Category" value={orderDetails?.data?.bedBookingType || orderDetails?.data?.consultationType || 'Home Service'} />
                                                        <InfoItem label="Location" value={`${orderDetails?.data?.hospitalId?.city || ''}, ${orderDetails?.data?.hospitalId?.state || ''}`} />
                                                        <InfoItem label="Booking Type" value={orderDetails?.data?.bookingType} />
                                                    </div>
                                                </DetailCard>
                                                <DetailCard title="Patient Details" icon={<UserRound size={18} />}>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {orderDetails?.data?.patients?.map((p, i) => (
                                                            <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                                                                <div><p className="font-bold text-slate-800">{p.patientName}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{p.gender} • {p.patientAge} Years</p></div>
                                                                <span className="text-[10px] font-black px-3 py-1 bg-white rounded-lg border text-slate-500 uppercase">{p.relation}</span>
                                                            </div>
                                                        ))}
                                                        {!orderDetails?.data?.patients && (
                                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                                <InfoItem label="Patient Name" value={orderDetails?.data?.patientName} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </DetailCard>
                                            </>
                                        )}

                                        {orderDetails?.vendor === 'Ambulance' && (
                                            <>
                                                <DetailCard title="Ambulance Timeline" icon={<Navigation size={18} />}>
                                                    <div className="space-y-4">
                                                        {orderDetails?.data?.trackingTimeline?.map((t, i) => (
                                                            <div key={i} className="flex gap-4 relative">
                                                                <div className={`w-3 h-3 rounded-full mt-1.5 ${i === orderDetails.data.trackingTimeline.length - 1 ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-200'}`} />
                                                                <div className={i !== orderDetails.data.trackingTimeline.length - 1 ? 'border-l-2 border-slate-100 pb-4 ml-1.5 pl-6' : 'ml-6'}>
                                                                    <p className="text-sm font-bold text-slate-800 leading-tight">{t.status}</p>
                                                                    <p className="text-xs text-slate-500 mt-1">{t.note}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(t.timestamp).toLocaleTimeString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DetailCard>
                                                <DetailCard title="Emergency Response" icon={<AlertTriangle size={18} />}>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InfoItem label="Vehicle Type" value={orderDetails?.data?.ambulanceId?.vehicleType} />
                                                        <InfoItem label="Service Requested" value={orderDetails?.data?.serviceType} />
                                                    </div>
                                                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pickup Address</p>
                                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{orderDetails?.data?.pickupLocation?.address}</p>
                                                    </div>
                                                </DetailCard>
                                            </>
                                        )}

                                        {(orderDetails?.vendor === 'Pharmacy' || orderDetails?.vendor === 'Lab') && (
                                            <>
                                                <DetailCard title="Request Items" icon={<ShoppingBag size={18} />}>
                                                    <div className="space-y-1 divide-y divide-slate-50">
                                                        {(orderDetails?.data?.items || orderDetails?.data?.tests)?.map((item, i) => (
                                                            <div key={i} className="py-3 flex justify-between items-center text-sm font-bold">
                                                                <span className="text-slate-700">{item.name || item.testName} <span className="text-slate-300 ml-2 font-normal">x{item.quantity || 1}</span></span>
                                                                <span className="text-slate-900 font-black">₹{item.price || item.testPrice}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DetailCard>
                                                <DetailCard title="Attachments/Rx" icon={<ImageIcon size={18} />}>
                                                    <div className="flex flex-wrap gap-3">
                                                        {(orderDetails?.data?.prescriptionImages || orderDetails?.data?.attachments)?.map((img, i) => (
                                                            <div key={i} className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-white shadow-sm overflow-hidden cursor-zoom-in">
                                                                <img src={img} className="w-full h-full object-cover" alt="rx" />
                                                            </div>
                                                        ))}
                                                        {(!orderDetails?.data?.prescriptionImages && !orderDetails?.data?.attachments) && <p className="text-xs text-slate-400 italic">No attachments found</p>}
                                                    </div>
                                                </DetailCard>
                                                <DetailCard title="Service Location" icon={<MapPin size={18} />}>
                                                    <p className="text-sm font-bold text-slate-800">{orderDetails?.data?.address?.name || orderDetails?.data?.userName}</p>
                                                    <p className="text-xs text-slate-500">{orderDetails?.data?.address?.houseNo || ''} {orderDetails?.data?.address?.addressLine || ''}, {orderDetails?.data?.address?.city} - {orderDetails?.data?.address?.pincode}</p>
                                                </DetailCard>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-[2.5rem]">
                            <button onClick={() => setSelectedOrderId(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// UI SUB-COMPONENTS

function DetailCard({ title, icon, children }) {
    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <div className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg">{icon}</div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            </div>
            {children}
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-slate-800">{value || '---'}</span>
        </div>
    );
}

function StatRow({ label, value, color, icon }) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">{icon} {label}</div>
            <span className={`text-lg font-black ${color}`}>{value || 0}</span>
        </div>
    );
}