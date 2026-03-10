'use client'
import { useAuth } from '@/app/context/AuthContext';
import React from 'react'
// Import Font Awesome icons
import {
  FaUserPlus,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList
} from "react-icons/fa";

export default function HospitalDashboard() {
  const { hospital } = useAuth();

  const stats = [
    {
      label: 'Active Doctors',
      value: '18',
      icon: FaUserPlus,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'Appointments Today',
      value: '42',
      icon: FaCalendarAlt,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Verified Status',
      value: hospital?.profileStatus || 'N/A',
      icon: FaCheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hospital Overview</h1>
        <p className="text-gray-500 mt-1">Hello, {hospital?.name || "Member"}. Manage your facility and staff below.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Data Tables */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px] p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
          {/* Updated to FaClipboardList */}
          <FaClipboardList className="text-gray-300 text-5xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">No Recent Appointments</h3>
        <p className="text-gray-400 max-w-xs mx-auto">Your recent patient appointments and logs will appear here once they are scheduled.</p>
      </div>
    </div>
  )
}