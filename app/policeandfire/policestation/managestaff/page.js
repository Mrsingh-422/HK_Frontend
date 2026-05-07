'use client'
import React, { useState } from 'react'
import { 
  FaUserPlus, 
  FaSearch, 
  FaUserTie, 
  FaUserShield, 
  FaTrash, 
  FaEdit, 
  FaFilter, 
  FaFileExport, 
  FaTimes, 
  FaIdCard, 
  FaPhoneAlt,
  FaCheckCircle,
  FaUsers
} from 'react-icons/fa'

export default function ManageStaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState("");
  
  // Demo Staff Data
  const [staff, setStaff] = useState([
    { id: "STF-9901", name: "Vikram Singh", role: "Chief Inspector", dept: "Investigation", status: "Active", contact: "+91 98765-00101", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" },
    { id: "STF-9905", name: "Ananya Iyer", role: "Forensic Lead", dept: "Lab Division", status: "Active", contact: "+91 98765-00105", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
    { id: "STF-9912", name: "Rajesh Kumar", role: "Sub-Inspector", dept: "Field Patrol", status: "On Leave", contact: "+91 98765-00112", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" },
    { id: "STF-9920", name: "Suman Deep", role: "Constable", dept: "Traffic Control", status: "Active", contact: "+91 98765-00120", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" },
  ]);

  const [currentStaff, setCurrentStaff] = useState({ id: '', name: '', role: '', dept: '', contact: '', status: 'Active' });

  const handleOpenModal = (mode, staffMember = null) => {
    setModalMode(mode);
    if (mode === 'edit' && staffMember) {
      setCurrentStaff(staffMember);
    } else {
      setCurrentStaff({ id: `STF-${Math.floor(1000 + Math.random() * 9000)}`, name: '', role: '', dept: '', contact: '', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to remove this staff member?")) {
        setStaff(staff.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 font-medium mt-1">Control access levels and manage department personnel</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all">
                <FaFileExport /> Export Roster
            </button>
            <button 
                onClick={() => handleOpenModal('add')}
                className="bg-[#08B36A] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all"
            >
                <FaUserPlus /> Add New Staff
            </button>
        </div>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompactStatCard title="Total Force" count={staff.length} label="Registered" color="blue" icon={<FaUsers/>} />
        <CompactStatCard title="Active Duty" count="18" label="On Field" color="emerald" icon={<FaUserShield/>} />
        <CompactStatCard title="Departments" count="06" label="Divisions" color="slate" icon={<FaIdCard/>} />
      </div>

      {/* --- STAFF TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-inner"><FaUserTie /></div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Personnel Registry</h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
              <input 
                type="text" 
                placeholder="Search by name, ID or role..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Officer</th>
                <th className="px-6 py-4">Staff ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <img src={member.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{member.name}</span>
                            <span className="text-[10px] font-bold text-[#08B36A] uppercase">{member.role}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-400 text-xs">{member.id}</td>
                  <td className="px-6 py-5 font-bold text-slate-600 text-xs">{member.dept}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <FaPhoneAlt size={10} className="text-slate-300" /> {member.contact}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        member.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenModal('edit', member)}
                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            <FaEdit size={14} />
                        </button>
                        <button 
                            onClick={() => handleDelete(member.id)}
                            className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#08B36A] text-white rounded-2xl shadow-lg shadow-green-100">
                            <FaUserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {modalMode === 'add' ? 'Register Staff' : 'Update Profile'}
                            </h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mt-1">Personnel Management System</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem label="Full Name" placeholder="e.g. Vikram Singh" value={currentStaff.name} />
                    <InputItem label="Staff ID" placeholder="STF-0000" value={currentStaff.id} disabled />
                    <InputItem label="Role/Designation" placeholder="e.g. Sub-Inspector" value={currentStaff.role} />
                    <InputItem label="Department" placeholder="e.g. Investigation" value={currentStaff.dept} />
                    <InputItem label="Contact Number" placeholder="+91 00000-00000" value={currentStaff.contact} />
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Duty Status</label>
                        <select className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/20">
                            <option>Active</option>
                            <option>On Leave</option>
                            <option>Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Discard</button>
                    <button onClick={() => setIsModalOpen(false)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-slate-200 uppercase tracking-widest flex items-center gap-2">
                        <FaCheckCircle className="text-[#08B36A]" /> {modalMode === 'add' ? 'Confirm Registration' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

// --- HELPER COMPONENTS ---

function CompactStatCard({ title, count, label, color, icon }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        slate: "text-slate-600 bg-slate-50 border-slate-100"
    }
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-5">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${colors[color]} border shadow-inner`}>
                    {React.cloneElement(icon, {size: 18})}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-4xl font-black tracking-tight ${colors[color].split(' ')[0]}`}>{count}</h2>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputItem({ label, placeholder, value, disabled = false }) {
    return (
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">{label}</label>
            <input 
                type="text"
                placeholder={placeholder}
                defaultValue={value}
                disabled={disabled}
                className={`w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    )
}