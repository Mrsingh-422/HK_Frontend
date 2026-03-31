"use client";
import React, { useState, useMemo, useEffect } from "react";
import { FaBuilding, FaEye, FaSearch, FaSpinner } from "react-icons/fa";
import ViewPharmacyComponent from "./components/ViewPharmacyComponent";
import AdminAPI from "@/app/services/AdminAPI"; // Ensure this path is correct

function PharmacyVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const res = await AdminAPI.getAllPharmacyInAdmin();
      // res.data contains the array from your JSON response
      setVendors(res.data || []);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleStatus = (id) => {
    // Note: If you have an API to toggle isActive, call it here
    setVendors(vendors.map(v => v._id === id ? { ...v, isActive: !v.isActive } : v));
  };

  const handleApprove = async (id) => {
    try {
      const res = await AdminAPI.approvePharmacyByAdmin(id);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, profileStatus: 'Approved' } : v));
        // Update the modal if it's open
        if (selectedVendor && selectedVendor._id === id) {
          setSelectedVendor(prev => ({ ...prev, profileStatus: 'Approved' }));
        }
        alert("Pharmacy Approved Successfully");
      }
    } catch (error) {
      alert("Failed to approve pharmacy");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await AdminAPI.rejectPharmacyByAdmin(id, reason);
      if (res.success) {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, profileStatus: 'Rejected', rejectionReason: reason } : v));
        setIsModalOpen(false);
        alert("Pharmacy Rejected Successfully");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject pharmacy");
    }
  };

  const filteredData = useMemo(() => {
    return vendors.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Pending" && item.profileStatus === "Pending") ||
        (statusFilter === "Approved" && item.profileStatus === "Approved") ||
        (statusFilter === "Incomplete" && item.profileStatus === "Incomplete");

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
            <FaBuilding className="text-emerald-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Pharmacy Vendors</h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-medium text-sm">Status Filter:</span>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-72 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[11px] font-black uppercase tracking-widest">
              <tr>
                <th className="py-4 px-6">S No.</th>
                <th className="py-4 px-6">Vendor Details</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Verification</th>
                <th className="py-4 px-6">Join Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-600 text-sm divide-y divide-gray-50">
              {paginatedData.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 font-bold text-gray-400">{(startIndex + index + 1).toString().padStart(2, '0')}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={item.documents?.pharmacyImages?.[0] ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.documents.pharmacyImages[0]}` : "https://via.placeholder.com/40"}
                          className="w-full h-full object-cover"
                          alt="pharmacy"
                        />
                      </div>
                      <span className="font-bold text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium">{item.phone}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(item._id)}
                      className={`w-10 h-5 flex items-center rounded-full px-1 transition-colors ${item.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                    >
                      <div className={`bg-white w-3 h-3 rounded-full transition-transform ${item.isActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.profileStatus === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {item.profileStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => { setSelectedVendor(item); setIsModalOpen(true); }}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition"
                    >
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
        <ViewPharmacyComponent
          vendor={selectedVendor}
          onClose={() => setIsModalOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject} // Pass the reject handler
        />
      )}
    </div>
  );
}

export default PharmacyVendorsPage;