'use client'
import PoliceAPI from '@/app/services/PoliceAPI';
import React, { useState, useEffect } from 'react'
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
  FaUsers,
  FaEnvelope,
  FaLock
} from 'react-icons/fa'


export default function ManageStaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Staff Data State
  const [staff, setStaff] = useState([]);

  // Form State aligned with Mongoose Model
  const [formData, setFormData] = useState({
    fullName: '',
    badgeId: '',
    rank: '',
    officialEmail: '',
    mobileNumber: '',
    password: '',
    status: 'On Duty'
  });

  // --- API ACTIONS ---

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await PoliceAPI.getAllStaff();
      if (res.success) {
        setStaff(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch staff", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenModal = (mode, staffMember = null) => {
    setModalMode(mode);
    if (mode === 'edit' && staffMember) {
      setFormData({
        _id: staffMember._id,
        fullName: staffMember.fullName,
        badgeId: staffMember.badgeId,
        rank: staffMember.rank,
        officialEmail: staffMember.officialEmail,
        mobileNumber: staffMember.mobileNumber,
        status: staffMember.status,
        password: '' 
      });
    } else {
      setFormData({
        fullName: '',
        badgeId: `B-${Math.floor(10000 + Math.random() * 90000)}`,
        rank: '',
        officialEmail: '',
        mobileNumber: '',
        password: '',
        status: 'On Duty'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (modalMode === 'add') {
        const res = await PoliceAPI.createStaff(formData);
        if (res.success) {
            setIsModalOpen(false);
            fetchStaff();
        }
      } else {
        const { password, ...updateData } = formData;
        const res = await PoliceAPI.updateStaff(formData._id, updateData);
        if (res.success) {
            setIsModalOpen(false);
            fetchStaff();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this staff member?")) {
        try {
            const res = await PoliceAPI.deleteStaff(id);
            if(res.success) fetchStaff();
        } catch (error) {
            alert("Delete failed");
        }
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
        <CompactStatCard title="Active Duty" count={staff.filter(s => s.status === 'On Duty').length} label="On Field" color="emerald" icon={<FaUserShield/>} />
        <CompactStatCard title="Specialists" count={new Set(staff.map(s => s.rank)).size} label="Ranks" color="slate" icon={<FaIdCard/>} />
      </div>

      {/* --- STAFF TABLE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        
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
                placeholder="Search by name or Badge ID..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                <th className="px-8 py-4">Officer</th>
                <th className="px-6 py-4">Badge ID</th>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
                <tr key={member._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-100 uppercase">
                            {member.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{member.fullName}</span>
                            <span className="text-[10px] font-bold text-[#08B36A] uppercase">{member.officialEmail}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-black text-slate-400 text-xs">{member.badgeId}</td>
                  <td className="px-6 py-5 font-bold text-slate-600 text-xs">{member.rank}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <FaPhoneAlt size={10} className="text-slate-300" /> {member.mobileNumber}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        member.status === 'On Duty' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
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
                            onClick={() => handleDelete(member._id)}
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
          {staff.length === 0 && !loading && (
             <div className="p-20 text-center flex flex-col items-center">
                <FaUsers className="text-slate-200 text-5xl mb-4" />
                <p className="text-slate-400 font-bold">No registered staff members found.</p>
             </div>
          )}
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-[#08B36A] text-white rounded-2xl shadow-lg shadow-green-100">
                            <FaUserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {modalMode === 'add' ? 'Register Staff' : 'Update Profile'}
                            </h3>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em] mt-1">Official Personnel Registry</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem 
                        label="Full Name" 
                        placeholder="Officer Full Name" 
                        icon={<FaUserTie/>}
                        value={formData.fullName} 
                        onChange={(val) => setFormData({...formData, fullName: val})} 
                    />
                    <InputItem 
                        label="Badge ID" 
                        placeholder="Unique Badge Number" 
                        icon={<FaIdCard/>}
                        value={formData.badgeId} 
                        onChange={(val) => setFormData({...formData, badgeId: val})} 
                    />
                    <InputItem 
                        label="Rank" 
                        placeholder="e.g. Inspector, SI" 
                        icon={<FaUserShield/>}
                        value={formData.rank} 
                        onChange={(val) => setFormData({...formData, rank: val})} 
                    />
                    <InputItem 
                        label="Mobile Number" 
                        placeholder="Official Mobile" 
                        icon={<FaPhoneAlt/>}
                        value={formData.mobileNumber} 
                        onChange={(val) => setFormData({...formData, mobileNumber: val})} 
                    />
                    <InputItem 
                        label="Official Email" 
                        placeholder="officer@email.com" 
                        icon={<FaEnvelope/>}
                        value={formData.officialEmail} 
                        onChange={(val) => setFormData({...formData, officialEmail: val})} 
                    />
                    {modalMode === 'add' ? (
                        <InputItem 
                            label="Password" 
                            type="password"
                            placeholder="System Password" 
                            icon={<FaLock/>}
                            value={formData.password} 
                            onChange={(val) => setFormData({...formData, password: val})} 
                        />
                    ) : (
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Duty Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                            >
                                <option value="On Duty">On Duty</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">Discard</button>
                    <button 
                        disabled={loading}
                        onClick={handleSubmit} 
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black shadow-xl shadow-slate-200 uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <FaCheckCircle className="text-[#08B36A]" /> 
                                {modalMode === 'add' ? 'Confirm Registration' : 'Save Changes'}
                            </>
                        )}
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

function InputItem({ label, placeholder, value, onChange, icon, disabled = false, type = "text" }) {
    return (
        <div>
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08B36A]">
                    {icon}
                </div>
                <input 
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>
        </div>
    )
}