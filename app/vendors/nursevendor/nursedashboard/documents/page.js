"use client";
import React, { useState } from "react";
// Switched from lucide-react to react-icons to match your project setup
import { 
  FaPlus, 
  FaTrashAlt, 
  FaTimes, 
  FaEye, 
  FaFileImage, 
  FaShieldAlt, 
  FaClock, 
  FaAward, 
  FaUniversity 
} from "react-icons/fa";
 
export default function NurseDocuments() {
  // State for Full Screen Image Modal
  const [selectedImage, setSelectedImage] = useState(null);
 
  // Updated Dummy Data for Nursing Documents
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Nursing Council Registration",
      category: "Mandatory Document",
      uploadDate: "10 Jan 2026",
      status: "Verified",
      imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "RN License (State Board)",
      category: "Professional License",
      uploadDate: "12 Jan 2026",
      status: "Verified",
      imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Aadhar / Govt ID",
      category: "Identity Proof",
      uploadDate: "15 Jan 2026",
      status: "Pending",
      imageUrl: "https://images.unsplash.com/photo-1628731338870-17686dc10c0b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Nurse Signature",
      category: "Profile Detail",
      uploadDate: "16 Jan 2026",
      status: "Verified",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Stylized_signature_of_John_Hancock.svg/1200px-Stylized_signature_of_John_Hancock.svg.png",
    },
    {
      id: 5,
      title: "B.Sc Nursing Degree",
      category: "Qualification",
      uploadDate: "20 Jan 2026",
      status: "Verified",
      imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    },
  ]);
 
  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter((doc) => doc.id !== id));
    }
  };
 
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans relative">
      <div className="max-w-7xl mx-auto">
       
        {/* === Header Section === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Nurse Documents</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FaUniversity size={14} className="text-emerald-500" /> 
              Compliance & Professional Certifications
            </p>
          </div>
          <button className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-green-100 active:scale-95">
            <FaPlus size={16} /> Add New Document
          </button>
        </div>
 
        {/* === Table Section === */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[11px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Document Details</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Date Uploaded</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/30 transition-colors group cursor-default">
                   
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => setSelectedImage(doc.imageUrl)}
                          className="w-14 h-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center overflow-hidden cursor-zoom-in hover:shadow-md transition-all shrink-0"
                        >
                          {doc.imageUrl ? (
                            <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
                          ) : (
                            <FaFileImage size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{doc.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5 sm:hidden">{doc.category}</p>
                        </div>
                      </div>
                    </td>
 
                    <td className="px-8 py-5 text-xs font-semibold text-gray-500 hidden sm:table-cell">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">{doc.category}</span>
                    </td>
 
                    <td className="px-8 py-5 text-xs text-gray-500 font-medium">
                      {doc.uploadDate}
                    </td>
 
                    <td className="px-8 py-5">
                      {doc.status === "Verified" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <FaShieldAlt size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                          <FaClock size={12} /> Pending
                        </span>
                      )}
                    </td>
 
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedImage(doc.imageUrl)}
                          className="p-2.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                          title="View Document"
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2.5 text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                          title="Remove"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
 
            {documents.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center justify-center bg-gray-50/50">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <FaFileImage size={32} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Documents Uploaded</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Please upload your nursing credentials and certifications for verification.</p>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* --- FULL SCREEN MODAL --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all hover:rotate-90"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <FaTimes size={24} />
          </button>
 
          <div
            className="relative max-w-4xl w-full h-auto rounded-3xl overflow-hidden shadow-2xl bg-white border-4 border-white/20 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Nurse Document Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="p-4 bg-white flex justify-between items-center border-t border-gray-50">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Document Preview</span>
               <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}