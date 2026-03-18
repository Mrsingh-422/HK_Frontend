"use client";
import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineFileAdd, AiOutlineCheckCircle, AiOutlineInbox } from 'react-icons/ai';

// Dummy data with mixed statuses
const initialData = [
  { id: 1, name: "Paracetamol", category: "Analgesic", manufacturer: "GSK", price: "₹40.00", status: "Approved" },
  { id: 2, name: "Amoxicillin", category: "Antibiotic", manufacturer: "Pfizer", price: "₹112.50", status: "Pending" },
  { id: 3, name: "Ibuprofen", category: "Anti-inflammatory", manufacturer: "Abbott", price: "₹80.00", status: "Pending" },
  { id: 4, name: "Metformin", category: "Antidiabetic", manufacturer: "Sun Pharma", price: "₹150.00", status: "Pending" },
  { id: 5, name: "Atorvastatin", category: "Statins", manufacturer: "Cipla", price: "₹200.00", status: "Approved" },
  { id: 6, name: "Cetirizine", category: "Antihistamine", manufacturer: "Zydus", price: "₹25.00", status: "Pending" },
];

function MedicineApprovalPage() {
  const themeColor = "#08B36A";
  const [allMedicines, setAllMedicines] = useState(initialData);

  // CRITICAL LOGIC: Only show medicines that are "Pending"
  const pendingMedicines = allMedicines.filter(med => med.status === "Pending");

  const handleApprove = (id) => {
    // In a real app, call your API here: await approveMedicine(id);
    setAllMedicines(prev =>
      prev.map(med => med.id === id ? { ...med, status: "Approved" } : med)
    );
    // Note: Because of the .filter() above, this item will now disappear from the UI
  };

  const handleView = (med) => {
    console.log("Viewing details for:", med.name);
    alert(`Medicine: ${med.name}\nCategory: ${med.category}\nManufacturer: ${med.manufacturer}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9fa]">
      <div className="p-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medicine Approval Queue</h2>
            <p className="text-sm text-gray-500 font-medium">
              You have <span className="text-[#08B36A] font-bold">{pendingMedicines.length}</span> medicines awaiting verification.
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Medicine Details</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Manufacturer</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {pendingMedicines.length > 0 ? (
                  pendingMedicines.map((med) => (
                    <tr key={med.id} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-800">{med.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium tracking-tight">ID: MED-00{med.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {med.manufacturer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                        {med.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3">
                          {/* VIEW BUTTON */}
                          <button
                            onClick={() => handleView(med)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-bold"
                          >
                            <AiOutlineEye size={16} />
                            VIEW
                          </button>

                          {/* APPROVE BUTTON */}
                          <button
                            onClick={() => handleApprove(med.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#08B36A15] text-[#08B36A] hover:bg-[#08B36A] hover:text-white transition-all text-xs font-bold"
                          >
                            <AiOutlineCheckCircle size={16} />
                            APPROVE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-300">
                        <AiOutlineInbox size={60} className="mb-2 opacity-20" />
                        <p className="text-lg font-bold text-gray-400">All caught up!</p>
                        <p className="text-sm">No medicines are currently waiting for approval.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Reviewing {pendingMedicines.length} Pending Items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineApprovalPage;