'use client'
import React from 'react'
import { 
  FaClipboardList, 
  FaUserNurse, 
  FaCheckCircle, 
  FaWallet, 
  FaArrowUp, 
  FaClock,
  FaChartLine 
} from 'react-icons/fa'

// --- CHART IMPORTS ---
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function LabDashboard() {
  
  // Stats Data
  const stats = [
    { id: 1, name: 'Total Orders', value: '128', icon: FaClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, name: 'Active Nurses', value: '12', icon: FaUserNurse, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 3, name: 'Completed', value: '115', icon: FaCheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 4, name: 'Total Earnings', value: '₹45,200', icon: FaWallet, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  // --- GRAPH MOCK DATA ---
  const graphData = [
    { name: 'Mon', total: 2400 },
    { name: 'Tue', total: 1398 },
    { name: 'Wed', total: 9800 },
    { name: 'Thu', total: 3908 },
    { name: 'Fri', total: 4800 },
    { name: 'Sat', total: 3800 },
    { name: 'Sun', total: 4300 },
  ];

  // Recent Orders Data
  const recentOrders = [
    { id: '#HK-901', patient: 'Rahul Sharma', service: 'Blood Test', status: 'Pending', time: '2 mins ago' },
    { id: '#HK-899', patient: 'Sana Khan', service: 'Dressing', status: 'Completed', time: '1 hour ago' },
    { id: '#HK-895', patient: 'Amit Verma', service: 'ECG', status: 'In Progress', time: '3 hours ago' },
  ]

  return (
    <div className="space-y-4">
      
      {/* --- WELCOME SECTION --- */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back, Admin! 👋</h1>
        <p className="text-gray-500 text-sm">Here's what's happening with your lab today.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <FaArrowUp className="mr-1" size={10} /> 12%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- NEW GRAPH SECTION --- */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
            <FaChartLine className="text-[#08B36A]" />
            <h2 className="font-bold text-gray-800">Analytics Overview</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#08B36A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#08B36A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#08B36A" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <button className="text-[#08B36A] text-sm font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700">{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.patient}</td>
                  <td className="px-6 py-4 text-gray-600">{order.service}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 flex items-center gap-1">
                    <FaClock size={12} /> {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}