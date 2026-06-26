"use client";
 
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaUserShield, FaCheck, FaTimes, FaPlus } from "react-icons/fa";
import AddNewSubadmin from "./components/AddNewSubadmin";
import EditSubadmin from "./components/EditSubadmin";
import DiamondAPI from "@/app/services/DiamondAPI";
import { toast, Toaster } from "react-hot-toast";
 
export default function Page() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subadmins, setSubadmins] = useState([]);
  const [roles, setRoles] = useState([]); // Available Role Templates
  const [loading, setLoading] = useState(true);
 
  // Modals State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
 
  // ✅ 1. FETCH SUB-ADMINS & ROLES
  const fetchData = async () => {
    try {
      setLoading(true);
      const [subadminRes, rolesRes] = await Promise.all([
        DiamondAPI.getSubAdminList(), // GET /admin/roles/sub-admins
        DiamondAPI.getRolesList()      // GET /admin/roles/list
      ]);
      if (subadminRes.success) setSubadmins(subadminRes.data);
      if (rolesRes.success) setRoles(rolesRes.data);
    } catch (err) {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => { fetchData(); }, []);
 
  // ✅ 2. ASSIGN ROLE SUBMIT
  const handleAssignSubmit = async () => {
    if (!selectedRoleId) return toast.error("Select a role first");
    try {
      const res = await DiamondAPI.assignRoleToAdmin({
        adminId: selectedUser._id,
        // Dhyan dein: Agar backend array expect kar raha hai, toh isko array bana kar bhejein [selectedRoleId]
        roleId: selectedRoleId
      });
      if (res.success) {
        toast.success("Role Assigned Successfully!");
        setAssignModalOpen(false);
        fetchData(); // Refresh table to show new role name
      }
    } catch (err) {
      toast.error("Assignment failed");
    }
  };
 
  const filteredSubadmins = subadmins.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="bg-gray-100 min-h-screen relative p-4 md:p-8">
      <Toaster position="top-right" />
 
      <div className="pt-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Subadmin Management</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute top-3.5 left-4 text-gray-400" />
              <input
                type="text" placeholder="Search subadmin..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#08B36A] bg-white text-sm"
              />
            </div>
            <button
              className="bg-[#08B36A] hover:bg-[#069356] text-white px-8 py-3 rounded-2xl shadow-lg transition-all font-bold text-xs uppercase"
              onClick={() => { setOpenNew(!openNew); setOpenEdit(false); }}
            >
              {openNew ? "Back" : "+ Add New"}
            </button>
          </div>
        </div>
 
        {openNew ? (
          <AddNewSubadmin onSuccess={() => { setOpenNew(false); fetchData(); }} />
        ) : openEdit ? (
          <EditSubadmin user={selectedUser} onClose={() => setOpenEdit(false)} onSuccess={fetchData} />
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6">Email Address</th>
                    <th className="px-8 py-6">Permission Role</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                  </tr>
                </thead>
 
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-20 font-bold text-gray-300 animate-pulse">Syncing with database...</td></tr>
                  ) : filteredSubadmins.map((user) => (
                    <tr key={user._id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm uppercase">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest">{user.phone || 'NO PHONE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-500">{user.email}</td>
                     
                      {/* 🌟 YAHAN CHANGE HUA HAI: MULTIPLE ROLES + ASSIGN BUTTON 🌟 */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {/* Role Names Tags */}
                          <div className="flex flex-wrap gap-2">
                            {user.roleType && user.roleType.length > 0 ? (
                              user.roleType.map((role, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">No Role Assigned</span>
                            )}
                          </div>
 
                          {/* Assign Role Button (Right Side) */}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              // Pre-fill the first role if exists, otherwise blank
                              setSelectedRoleId(user.roleType && user.roleType.length > 0 ? user.roleType[0]._id : "");
                              setAssignModalOpen(true);
                            }}
                            title="Assign New Role"
                            className="p-2 rounded-xl bg-emerald-50 text-[#08B36A] border border-emerald-100 hover:bg-[#08B36A] hover:text-white transition-all cursor-pointer active:scale-95 flex-shrink-0"
                          >
                            <FaUserShield size={16} />
                          </button>
                        </div>
                      </td>
 
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-3">
                          <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" onClick={() => { setSelectedUser(user); setOpenEdit(true); }}>
                            <FaEdit size={14} />
                          </button>
                          <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" onClick={() => { setSelectedUser(user); setDeleteModalOpen(true); }}>
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
        )}
      </div>
 
      {/* 🌟 ROLE ASSIGNMENT MODAL 🌟 */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Assign Permissions</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-300 hover:text-slate-600"><FaTimes /></button>
            </div>
 
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Subadmin</p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{selectedUser?.name}</div>
              </div>
 
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Role Template</p>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-[#08B36A] font-bold text-slate-700 text-sm cursor-pointer"
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>
 
              <button
                onClick={handleAssignSubmit}
                className="w-full py-4 bg-[#08B36A] text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 transition-all uppercase text-[11px] tracking-widest mt-4"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-gray-800 mb-2">Remove Admin?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">Are you sure you want to delete <span className="font-bold text-red-500">{selectedUser?.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
              <button onClick={() => {
                // Yahan delete ki API lagayenge jab backend ready ho jaye
                setDeleteModalOpen(false);
              }} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 