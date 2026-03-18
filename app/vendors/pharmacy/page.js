'use client'
import React from 'react';
import Link from 'next/link';
import { 
    FaRupeeSign, FaBoxOpen, FaMotorcycle, FaClipboardCheck, 
    FaArrowRight, FaExclamationTriangle, FaCheckCircle, 
    FaClock, FaMapMarkerAlt, FaPlusCircle, FaBullhorn, FaCircle
} from 'react-icons/fa';
import { MdOutlineDeliveryDining } from 'react-icons/md';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';

// ==========================================
// 🌟 DUMMY DATA FOR DASHBOARD 🌟
// ==========================================

// Chart Data 1: Weekly Revenue
const revenueData =[
    { day: 'Mon', revenue: 4500 },
    { day: 'Tue', revenue: 6200 },
    { day: 'Wed', revenue: 5800 },
    { day: 'Thu', revenue: 8900 },
    { day: 'Fri', revenue: 7400 },
    { day: 'Sat', revenue: 11200 },
    { day: 'Sun', revenue: 12450 },
];

// Chart Data 2: Order Status
const orderStats =[
    { name: 'Delivered', value: 82, color: '#08B36A' }, // Green
    { name: 'Pending', value: 45, color: '#F59E0B' },   // Amber
    { name: 'On The Way', value: 18, color: '#3B82F6' }, // Blue
];

const recentOrders =[
    { id: 'ORD-8091', customer: 'Rahul Verma', items: 'Paracetamol, Cough Syrup +2', amount: '₹450', time: '10 mins ago', status: 'Pending' },
    { id: 'ORD-8090', customer: 'Sneha Patil', items: 'Diabetes Care Kit (Monthly)', amount: '₹1,250', time: '45 mins ago', status: 'Out for Delivery' },
    { id: 'ORD-8089', customer: 'Amit Sharma', items: 'Whey Protein 1kg', amount: '₹3,200', time: '2 hours ago', status: 'Delivered' },
    { id: 'ORD-8088', customer: 'Priya Desai', items: 'Baby Care Products +3', amount: '₹890', time: '3 hours ago', status: 'Delivered' },
];

const lowStockItems =[
    { name: 'Dolo 650mg Tablet', stock: 12, category: 'Fever/Pain' },
    { name: 'Vicks VapoRub 50ml', stock: 5, category: 'Cold/Cough' },
    { name: 'Accu-Chek Test Strips', stock: 2, category: 'Diabetes Care' },
];

export default function PharmacyDashboard() {
    
    // Status Badge Logic
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Out for Delivery': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    // Custom Tooltip for Area Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg">
                    <p className="font-semibold">{label}</p>
                    <p className="text-[#08B36A] font-bold">₹{payload[0].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, Apollo Pharmacy! 👋</h1>
                    <p className="text-sm text-gray-500 mt-1">Here is what's happening with your store today, 17 March 2026.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2">
                        View Store
                    </button>
                    <button className="bg-[#08B36A] hover:bg-[#079b5c] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-green-200 flex items-center gap-2">
                        <FaPlusCircle /> Add Medicine
                    </button>
                </div>
            </div>

            {/* --- TOP STATISTICS CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Card (Special Gradient) */}
                <div className="bg-gradient-to-br from-[#08B36A] to-teal-600 p-5 rounded-2xl shadow-md text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Today's Revenue</p>
                            <h3 className="text-3xl font-extrabold mt-1">₹12,450</h3>
                            <p className="text-xs text-white/90 bg-white/20 w-fit px-2 py-0.5 rounded-full mt-2">↑ 15% from yesterday</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-sm">
                            <FaRupeeSign />
                        </div>
                    </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">145</h3>
                            <p className="text-xs font-medium text-emerald-500 mt-2">82 Delivered successfully</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaBoxOpen />
                        </div>
                    </div>
                </div>

                {/* Active Delivery Boys */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Delivery Boys</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">08 <span className="text-lg text-gray-400 font-medium">/ 12</span></h3>
                            <p className="text-xs font-medium text-amber-500 mt-2">4 Currently on break</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaMotorcycle />
                        </div>
                    </div>
                </div>

                {/* Pending Prescriptions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Prescriptions</p>
                            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">24</h3>
                            <p className="text-xs font-medium text-red-500 mt-2">Needs manual verification</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl">
                            <FaClipboardCheck />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 NEW SECTION: GRAPHS & CHARTS 🌟         */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 📉 Revenue Area Chart (Takes 2 Columns) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Revenue Overview</h2>
                            <p className="text-xs text-gray-400 font-medium">Sales performance over the last 7 days</p>
                        </div>
                        <select className="bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#08B36A]">
                            <option>Last 7 Days</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#08B36A" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#08B36A" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 🍩 Orders Donut Chart (Takes 1 Column) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <h2 className="text-base font-bold text-gray-800 mb-1">Orders Distribution</h2>
                    <p className="text-xs text-gray-400 font-medium mb-4">Current status of today's orders</p>
                    
                    <div className="h-[200px] w-full relative flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={orderStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {orderStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text inside Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-extrabold text-gray-800">145</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</span>
                        </div>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        {orderStats.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <FaCircle className="text-[8px]" style={{ color: stat.color }} />
                                <span className="text-xs font-semibold text-gray-600">{stat.name}</span>
                                <span className="text-xs font-bold text-gray-800 ml-1">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- BOTTOM GRID LAYOUT (Table & Actions) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 🌟 LEFT COLUMN: RECENT ORDERS TABLE 🌟 */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/40">
                        <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
                        <Link href="/vendors/pharmacy/orders" className="text-sm font-semibold text-[#08B36A] hover:text-[#068e54] flex items-center gap-1">
                            View All <FaArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                                    <th className="p-4 pl-6">Order ID & Time</th>
                                    <th className="p-4">Customer Details</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.map((order, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                        <td className="p-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm group-hover:text-[#08B36A] transition-colors">{order.id}</span>
                                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
                                                    <FaClock size={10} className="text-gray-400"/> {order.time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">{order.customer}</span>
                                                <span className="text-xs text-gray-500 truncate max-w-[180px] mt-0.5" title={order.items}>
                                                    {order.items}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-800 text-sm">{order.amount}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 🌟 RIGHT COLUMN: QUICK ACTIONS & LOW STOCK 🌟 */}
                <div className="space-y-6">
                    
                    {/* Quick Actions Panel */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/vendors/pharmacy/assign-delivery-boy" className="flex flex-col items-center justify-center p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <MdOutlineDeliveryDining size={20} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center">Assign Rider</span>
                            </Link>
                            
                            <Link href="/vendors/pharmacy/track-delivery-boy" className="flex flex-col items-center justify-center p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <FaMapMarkerAlt size={16} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center">Track Riders</span>
                            </Link>

                            <Link href="/vendors/pharmacy/promotion" className="flex flex-col items-center justify-center p-3 bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <FaBullhorn size={16} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center">Promotions</span>
                            </Link>
                            
                            <Link href="/vendors/pharmacy/services" className="flex flex-col items-center justify-center p-3 bg-[#08B36A]/5 hover:bg-[#08B36A]/10 border border-[#08B36A]/20 rounded-xl transition-colors group">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#08B36A] shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                    <FaCheckCircle size={16} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 text-center">Services</span>
                            </Link>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-500" /> Low Stock Alerts
                            </h2>
                        </div>
                        
                        <div className="space-y-3">
                            {lowStockItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-red-50/40 border border-red-100 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{item.category}</p>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-lg font-extrabold text-red-600 leading-none">{item.stock}</span>
                                        <span className="text-[9px] font-bold text-red-400">LEFT</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}