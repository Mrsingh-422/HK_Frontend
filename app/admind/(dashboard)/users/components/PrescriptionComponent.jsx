"use client";
import React, { useState, useMemo } from "react";
import { FaFileMedical } from "react-icons/fa";

function PrescriptionComponent() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(5);

  // ✅ Dummy prescriptions for ONE patient
  const prescriptions = [
    {
      id: 1,
      doctor: "Dr. Sharma",
      type: "General Checkup",
      date: "12 Jan 2026",
      file: "https://via.placeholder.com/100x100.png?text=Rx1",
    },
    {
      id: 2,
      doctor: "Dr. Khan",
      type: "Dental",
      date: "20 Jan 2026",
      file: "https://via.placeholder.com/100x100.png?text=Rx2",
    },
    {
      id: 3,
      doctor: "Dr. Mehta",
      type: "Cardiology",
      date: "05 Feb 2026",
      file: "https://via.placeholder.com/100x100.png?text=Rx3",
    },
    {
      id: 4,
      doctor: "Dr. Reddy",
      type: "Orthopedic",
      date: "10 Feb 2026",
      file: "https://via.placeholder.com/100x100.png?text=Rx4",
    },
  ];

  // ✅ Filter
  const filteredData = useMemo(() => {
    return prescriptions.filter(
      (item) =>
        item.doctor.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const displayedData = filteredData.slice(0, entries);

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-2xl shadow-md p-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-emerald-600 text-xl">
            <FaFileMedical />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Patient Prescriptions
          </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Show</span>
            <select
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
            <span>entries</span>
          </div>

          <input
            type="text"
            placeholder="Search prescriptions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3 font-semibold">S No.</th>
                <th className="p-3 font-semibold">Doctor</th>
                <th className="p-3 font-semibold">Prescription Type</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">File</th>
                <th className="p-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {displayedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No prescriptions found
                  </td>
                </tr>
              ) : (
                displayedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.doctor}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">{item.date}</td>
                    <td className="p-3">
                      <img
                        src={item.file}
                        alt="Prescription"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-3">
                      <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md text-sm">
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
        <div className="flex justify-between items-center mt-4 text-gray-600">
          <div>
            Showing {displayedData.length > 0 ? 1 : 0} to{" "}
            {displayedData.length} of {filteredData.length} entries
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionComponent;