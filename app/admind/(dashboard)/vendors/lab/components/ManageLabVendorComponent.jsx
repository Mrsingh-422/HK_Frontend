"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaBuilding, FaEye, FaSearch, FaSpinner, FaFlask } from "react-icons/fa";
import ShowLabVendorDetail from "./ShowLabVendorDetail";
import AdminAPI from "@/app/services/AdminAPI";

function ManageLabVendorComponent() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const res = await AdminAPI.getLabsList();
      setVendors(res.data || []);
    } catch (error) {
      console.error("Error fetching labs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await AdminAPI.approveLab(id);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, profileStatus: 'Approved' } : v));
        setIsModalOpen(false);
        alert("Lab Approved Successfully");
      }
    } catch (error) {
      alert("Failed to approve lab");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await AdminAPI.rejectLab(id, reason);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, profileStatus: 'Rejected', rejectionReason: reason } : v));
        setIsModalOpen(false);
        alert("Lab Rejected Successfully");
      }
    } catch (error) {
      alert("Failed to reject lab");
    }
  };

  const filteredData = useMemo(() => {
    return vendors.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.includes(search);

      const matchesStatus =
        statusFilter === "All" || item.profileStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, vendors]);

  const totalPages = Math.ceil(filteredData.length / entries) || 1;
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <FaSpinner className="animate-spin text-emerald-500 text-4xl" />
    </div>
  );

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-[1600px] mx-auto bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
            <FaFlask className="text-blue-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Lab Vendors</h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium text-sm">Sort by Status:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search Labs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-72 border border-gray-300 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-4 px-6">S No.</th>
                <th className="py-4 px-6">Lab Details</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Verification</th>
                <th className="py-4 px-6">Join Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {paginatedData.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-bold text-gray-400">{startIndex + index + 1}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border">
                        <img src={item.profileImage ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.profileImage}` : "https://via.placeholder.com/40"} className="w-full h-full object-cover" alt="" />
                      </div>
                      <span className="font-bold text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">{item.phone}</td>
                  <td className="py-4 px-6">
                    <div className={`w-10 h-5 flex items-center rounded-full px-1 ${item.isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                        <div className={`bg-white w-3 h-3 rounded-full transition-transform ${item.isActive ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.profileStatus === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {item.profileStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => { setSelectedVendor(item); setIsModalOpen(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition">
                      <FaEye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ShowLabVendorDetail
          vendor={selectedVendor}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default ManageLabVendorComponent;