'use client'
import React, { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaShieldAlt } from 'react-icons/fa'
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI'

export default function HospitalDoctorChangePasswordPage() {
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
      alert("Please fill in all security fields.")
      return
    }

    try {
      setChangingPassword(true)
      const res = await HospitalDoctorAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      if (res && res.success) {
        alert(res.message || "Password updated successfully.")
        setPasswordData({ oldPassword: '', newPassword: '' })
      } else {
        alert(res?.message || "Failed to update password.")
      }
    } catch (error) {
      console.error("Security update error:", error)
      const responseMessage = error.response?.data?.message || error.message || error.toString()
      
      if (responseMessage.includes("bcrypt is not defined")) {
        alert("Server Error: Missing password hashing libraries (bcrypt) on backend.")
      } else {
        alert(responseMessage)
      }
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      
      {/* Header Info */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-emerald-600 text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
            <FaShieldAlt size={32}/>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase leading-none">Security Center</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-3">Configure and update your active clinical login details</p>
      </div>

      {/* Security Credentials Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col items-stretch text-left">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl"><FaLock/></div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Current Password</label>
            <div className="relative">
              <input 
                type={showOldPassword ? "text" : "password"}
                name="oldPassword" 
                value={passwordData.oldPassword} 
                onChange={handlePasswordTextChange} 
                placeholder="••••••••" 
                className="w-full py-3 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 pr-12"
                required 
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showOldPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">New Secure Password</label>
            <div className="relative">
              <input 
                type={showNewPassword ? "text" : "password"}
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordTextChange} 
                placeholder="••••••••" 
                className="w-full py-3 px-4 bg-slate-50/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all text-slate-700 pr-12"
                required 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={changingPassword}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {changingPassword ? <FaSpinner className="animate-spin" /> : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}