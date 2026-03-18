'use client'
import { useAuth } from '@/app/context/AuthContext';
import React from 'react'
import {
  FaVials,
  FaCalendarCheck,
  FaFileMedicalAlt
} from "react-icons/fa";

export default function LabVendorDashboard() {
  const { labVendor } = useAuth(); // Apne auth context ke hisab se variable ka naam check kar lena

  const stats =[
    {
      label: 'Available Tests',
      value: '124',
      icon: FaVials,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      label: 'New Bookings Today',
      value: '15',
      icon: FaCalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      label: 'Pending Reports',
      value: '8',
      icon: FaFileMedicalAlt,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Overview</h1>
        <p className="text-gray-500 mt-1">Hello, {labVendor?.labName || "Lab Partner"}. Manage your tests and patient reports below.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
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

      <hr className="my-8 border-gray-200" />
      
    </div>
  )
}