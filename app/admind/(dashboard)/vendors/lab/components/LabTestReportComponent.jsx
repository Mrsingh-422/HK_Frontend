import React, { useState } from "react";
import { FaEye } from "react-icons/fa";

function LabTestReportComponent() {
  const [search, setSearch] = useState("");

  const data = [
    {
      id: 1,
      vendor: "newlab",
      user: "Ravi Bagga",
      appointmentId: "654420231130055551",
      patient: "Ravi",
      father: "Ravi's Father",
    },
    {
      id: 2,
      vendor: "Nitish",
      user: "Ravi Bagga",
      appointmentId: "330120240125031735",
      patient: "Ravi Bagga",
      father: "Amardeep Bagga",
    },
    {
      id: 3,
      vendor: "Nitish",
      user: "Aarush",
      appointmentId: "803020240201035248",
      patient: "Yash User",
      father: "karan",
    },
    {
      id: 4,
      vendor: "Nitish",
      user: "Ravi Bagga",
      appointmentId: "388320240201102633",
      patient: "Ravi Bagga",
      father: "Amardeep Bagga",
    },
    {
      id: 5,
      vendor: "newlab",
      user: "Ravi Bagga",
      appointmentId: "512620240102041014",
      patient: "Ravi",
      father: "rajesj",
    },
  ];

  const filteredData = data.filter(
    (item) =>
      item.vendor.toLowerCase().includes(search.toLowerCase()) ||
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.patient.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            LabTestReport
          </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Show</span>
            <select className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-gray-600">entries</span>
          </div>

          <input
            type="text"
            placeholder="Search records"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600 uppercase text-sm">
                <th className="px-4 py-3">S No.</th>
                <th className="px-4 py-3">Vendor Name</th>
                <th className="px-4 py-3">User Name</th>
                <th className="px-4 py-3">AppointmentId</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{item.vendor}</td>
                    <td className="px-4 py-3">{item.user}</td>
                    <td className="px-4 py-3">
                      {item.appointmentId}
                    </td>
                    <td className="px-4 py-3">{item.patient}</td>
                    <td className="px-4 py-3">{item.father}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow-md transition">
                        <FaEye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-400"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default LabTestReportComponent;