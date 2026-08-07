'use client'
import React, { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaShieldAlt } from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import PharmacyAPI from '@/app/services/PharmacyVendorAPI'

export default function PharmacyChangePasswordPage() {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handlePasswordTextChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Please fill in all security fields.")
      return
    }

    try {
      setChangingPassword(true)
      const res = await PharmacyAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      if (res && res.success) {
        toast.success(res.message || "Password updated successfully.")
        setPasswordData({ oldPassword: '', newPassword: '' })
      } else {
        toast.error(res?.message || "Failed to update password.")
      }
    } catch (error) {
      console.error("Security update error:", error)
      const responseMessage = error.response?.data?.message || error.message || error.toString()
      
      if (responseMessage.includes("bcrypt is not defined")) {
        toast.error("Server Error: Missing password hashing configuration on backend.")
      } else {
        toast.error(responseMessage)
      }
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <Toaster position="top-right" />
      
      {/* Header Info */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
            <FaShieldAlt size={32}/>
        </div>
        <h1 className="text-4xl font-extrabold text-[#1e3a8a] tracking-tight uppercase leading-none">Pharmacy Security Center</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">Configure and secure your pharmaceutical service credentials</p>
      </div>

      {/* Security Credentials Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl"><FaLock/></div>
          <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
            <div className="relative">
              <input 
                type={showOldPassword ? "text" : "password"}
                name="oldPassword" 
                value={passwordData.oldPassword} 
                onChange={handlePasswordTextChange} 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
                required 
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showOldPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Secure Password</label>
            <div className="relative">
              <input 
                type={showNewPassword ? "text" : "password"}
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordTextChange} 
                placeholder="••••••••" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
                required 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={changingPassword}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-green-600/20"
            >
              {changingPassword ? <FaSpinner className="animate-spin" /> : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}