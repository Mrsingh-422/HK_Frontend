"use client";
import React, { useState, useMemo } from "react";
import { FaUsers } from "react-icons/fa";

function HealthLockerComponent() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Dummy Data
  const data = [
    {
      id: 1,
      user: "John Doe",
      lockerPath: "/locker/john-doe",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 2,
      user: "Sarah Smith",
      lockerPath: "/locker/sarah-smith",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 3,
      user: "Michael Johnson",
      lockerPath: "/locker/michael",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 4,
      user: "Emma Williams",
      lockerPath: "/locker/emma",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 5,
      user: "David Brown",
      lockerPath: "/locker/david",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 6,
      user: "Olivia Taylor",
      lockerPath: "/locker/olivia",
      image: "https://via.placeholder.com/60",
    },
    {
      id: 7,
      user: "Daniel Lee",
      lockerPath: "/locker/daniel",
      image: "https://via.placeholder.com/60",
    },
  ];

  // ✅ Filtered Data (Search)
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.user.toLowerCase().includes(search.toLowerCase()) ||
        item.lockerPath.toLowerCase().includes(search.toLowerCase())
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
              <FaUsers />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Health Locker Images
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
                <th className="p-3 font-semibold">S No.</th>
                <th className="p-3 font-semibold">User</th>
                <th className="p-3 font-semibold">Locker Path</th>
                <th className="p-3 font-semibold">Images</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No data available in table
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      {startIndex + index + 1}
                    </td>
                    <td className="p-3">{item.user}</td>
                    <td className="p-3">{item.lockerPath}</td>
                    <td className="p-3">
                      <img
                        src={item.image}
                        alt="locker"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm">
                        View
                      </button>
                    </td>
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

          <div className="flex gap-2">
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

export default HealthLockerComponent;