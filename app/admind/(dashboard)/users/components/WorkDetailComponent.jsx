"use client";
import React, { useState, useMemo } from "react";
import { FaFileAlt } from "react-icons/fa";

function WorkDetailComponent() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Dummy Data
  const data = [
    {
      id: 1,
      userName: "abc",
      companyName: "Tech Solutions Pvt Ltd",
      address: "123 Main Street",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      phone: "9876543210",
    },
    {
      id: 2,
      userName: "Rahul",
      companyName: "HealthCare Systems",
      address: "45 Park Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "9123456789",
    },
    {
      id: 3,
      userName: "Anita",
      companyName: "Global Tech",
      address: "78 Business Hub",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      phone: "9988776655",
    },
  ];

  // ✅ Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.userName.toLowerCase().includes(search.toLowerCase()) ||
        item.companyName.toLowerCase().includes(search.toLowerCase()) ||
        item.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredData.length / entries);
  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + entries
  );

  const goToFirst = () => setCurrentPage(1);
  const goToLast = () => setCurrentPage(totalPages);
  const goToNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrev = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-blue-600 text-xl">
              <FaFileAlt />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              My Work Details
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Show</span>
            <select
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span>entries</span>
          </div>

          <input
            type="text"
            placeholder="Search records"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3 font-semibold">User Name</th>
                <th className="p-3 font-semibold">Company Name</th>
                <th className="p-3 font-semibold">Address</th>
                <th className="p-3 font-semibold">City</th>
                <th className="p-3 font-semibold">State</th>
                <th className="p-3 font-semibold">Pincode</th>
                <th className="p-3 font-semibold">Phone</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{item.userName}</td>
                    <td className="p-3">{item.companyName}</td>
                    <td className="p-3">{item.address}</td>
                    <td className="p-3">{item.city}</td>
                    <td className="p-3">{item.state}</td>
                    <td className="p-3">{item.pincode}</td>
                    <td className="p-3">{item.phone}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4 text-gray-600">
          <div>
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + entries, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToFirst}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              FIRST
            </button>

            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              PREVIOUS
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md border ${currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "bg-white"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              NEXT
            </button>

            <button
              onClick={goToLast}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border rounded-md disabled:bg-gray-100 disabled:text-gray-400"
            >
              LAST
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default WorkDetailComponent;