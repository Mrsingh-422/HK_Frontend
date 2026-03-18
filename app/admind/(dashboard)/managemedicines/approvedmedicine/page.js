"use client";
import React from 'react';
import { AiOutlineEye, AiOutlineFileAdd } from 'react-icons/ai';

const approvedMedicines = [
  { id: 1, name: "Paracetamol", category: "Analgesic", manufacturer: "GSK", price: "₹40.00", approvedDate: "12 Mar 2024", status: "Active" },
  { id: 2, name: "Amoxicillin", category: "Antibiotic", manufacturer: "Pfizer", price: "₹112.50", approvedDate: "10 Mar 2024", status: "Active" },
  { id: 3, name: "Ibuprofen", category: "Anti-inflammatory", manufacturer: "Abbott", price: "₹80.00", approvedDate: "05 Mar 2024", status: "Active" },
  { id: 4, name: "Metformin", category: "Antidiabetic", manufacturer: "Sun Pharma", price: "₹150.00", approvedDate: "01 Mar 2024", status: "Active" },
  { id: 5, name: "Atorvastatin", category: "Statins", manufacturer: "Cipla", price: "₹200.00", approvedDate: "28 Feb 2024", status: "Active" },
  { id: 6, name: "Cetirizine", category: "Antihistamine", manufacturer: "Zydus", price: "₹25.00", approvedDate: "25 Feb 2024", status: "Active" },
];

function ApprovedMedicinesPage() {
  const themeColor = "#08B36A";

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f3f3]">

      <div className="p-6">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Approved Inventory</h2>
            <p className="text-sm text-gray-500 font-medium">List of all medicines verified and approved for sale.</p>
          </div>
          
          <button 
            style={{ backgroundColor: themeColor }}
            className="flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-md hover:brightness-90 transition-all font-bold text-sm"
          >
            <AiOutlineFileAdd size={20} />
            Bulk Import (CSV)
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: themeColor }}>
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Medicine Name</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Manufacturer</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Date Approved</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-white uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-center text-[11px] font-black text-white uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {approvedMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-800">{med.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium">ID: MED-00{med.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {med.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {med.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                      {med.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                      {med.approvedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase">
                        ● {med.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100 transition-all group"
                        title="View Medicine Details"
                      >
                        <AiOutlineEye 
                          size={22} 
                          style={{ color: themeColor }} 
                          className="group-hover:scale-125 transition-transform" 
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer Info */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
              Showing {approvedMedicines.length} Approved Medicines
            </p>
            <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 rounded hover:bg-white transition-colors">Previous</button>
                <button className="px-3 py-1 text-xs font-bold text-white rounded shadow-sm transition-colors" style={{backgroundColor: themeColor}}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovedMedicinesPage;