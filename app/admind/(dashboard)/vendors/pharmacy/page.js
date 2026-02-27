"use client";
import React, { useState, useMemo } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import { FaBuilding, FaEye, FaSearch } from "react-icons/fa";
import { MdOutlineSwapVert } from "react-icons/md";
import ViewPharmacyComponent from "./components/ViewPharmacyComponent";

function PharmacyVendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Dummy Data
  const [vendors, setVendors] = useState([
    { id: 1, name: "New Pharmacy", phone: "7009106957", image: "https://via.placeholder.com/50", status: false, verified: "Pending", joinDate: "2025-03-25 12:06:58" },
    { id: 2, name: "PharmacyHk", phone: "7696591560", image: "https://via.placeholder.com/50", status: true, verified: "Approved", joinDate: "2024-05-14 14:55:55" },
    { id: 3, name: "HkPharmacy", phone: "9814104107", image: null, status: true, verified: "Approved", joinDate: "2024-05-14 14:33:01" },
    { id: 4, name: "new user", phone: "1234567899", image: "https://via.placeholder.com/50", status: true, verified: "Approved", joinDate: "2024-03-05 14:43:53" },
    { id: 5, name: "karan", phone: "8288913724", image: "https://via.placeholder.com/50", status: true, verified: "Approved", joinDate: "2024-02-29 12:35:18" },
    { id: 6, name: "Nitish", phone: "8219310269", image: "https://via.placeholder.com/50", status: true, verified: "Approved", joinDate: "2024-02-02 12:52:59" },
  ]);

  // ✅ Toggle Logic
  const handleToggleStatus = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: !v.status } : v));
  };

  // ✅ Filter Logic (Added Pending Filter)
  const filteredData = useMemo(() => {
    return vendors.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Rejected" && !item.status) ||
        (statusFilter === "Approved" && item.status) ||
        (statusFilter === "Pending" && item.verified === "Pending");

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, vendors]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredData.length / entries) || 1;
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

  return (
    <div className="min-h-screen">
      <DashboardTopNavbar heading="Pharmacy Vendors" />

      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">

          {/* Header Section */}
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 bg-[#ced4da] rounded-xl shadow flex items-center justify-center">
              <FaBuilding className="text-[#3498db] text-2xl" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Pharmacy Vendors
            </h2>
          </div>

          {/* Top Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">

            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-500 font-medium">Sort by status</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-xs uppercase text-gray-400 font-semibold mb-1">
                Search records
              </span>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Entries Control */}
          <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <input
                type="number"
                value={entries}
                onChange={(e) => setEntries(Number(e.target.value))}
                className="w-14 border border-gray-300 rounded-md text-center py-1 focus:ring-2 focus:ring-emerald-400 outline-none"
              />
              <span>entries</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                <tr>
                  <th className="py-4 px-4">S No.</th>
                  <th className="py-4 px-4">Vendor Name</th>
                  <th className="py-4 px-4">Phone</th>
                  <th className="py-4 px-4">Image</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Account Verify</th>
                  <th className="py-4 px-4">Manage</th>
                  <th className="py-4 px-4">Join Date</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="text-gray-600 text-sm">
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 font-medium">
                      {startIndex + index + 1}
                    </td>

                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {item.name}
                    </td>

                    <td className="py-4 px-4">{item.phone}</td>

                    <td className="py-4 px-4">
                      <div className="w-14 h-12 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt="vendor"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Image
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div
                        onClick={() => handleToggleStatus(item.id)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${item.status
                          ? "bg-emerald-500"
                          : "bg-red-600"
                          }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${item.status
                            ? "translate-x-6"
                            : "translate-x-0"
                            }`}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-semibold ${item.verified === "Approved"
                          ? "text-emerald-500"
                          : "text-yellow-500"
                          }`}
                      >
                        {item.verified}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <select className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-400 outline-none">
                        <option>---Details---</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {item.joinDate}
                    </td>

                    <td className="py-4 px-4 text-center cursor-pointer">
                      <button
                        onClick={() => {
                          setSelectedVendor(item);
                          setIsModalOpen(true);
                        }}
                        className="text-orange-500 hover:scale-110 hover:text-orange-600 transition cursor-pointer"
                      >
                        <FaEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm text-gray-500 gap-4">
            <p>
              Showing{" "}
              {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + entries, filteredData.length)} of{" "}
              {filteredData.length} entries
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                First
              </button>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                Prev
              </button>

              <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold">
                {currentPage}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, totalPages)
                  )
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>

        </div>
      </div>
      {isModalOpen && (
        <ViewPharmacyComponent
          vendor={selectedVendor}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>


  );
}

export default PharmacyVendorsPage;