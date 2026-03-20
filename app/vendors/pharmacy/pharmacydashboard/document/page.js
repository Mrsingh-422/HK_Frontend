"use client";
import React, { useState } from "react";
import { Plus, Trash2, X, Eye, FileImage, ShieldCheck, Clock } from "lucide-react";

export default function DoctorDocuments() {
  // State for Full Screen Image Modal
  const [selectedImage, setSelectedImage] = useState(null);

  // Dummy Data for Documents
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Council Certificate",
      category: "Mandatory Document",
      uploadDate: "12 Oct 2025",
      status: "Verified",
      // Dummy Document Image
      imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop", 
    },
    {
      id: 2,
      title: "Medical Licence",
      category: "Mandatory Document",
      uploadDate: "15 Oct 2025",
      status: "Verified",
      imageUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Photo ID (Aadhar/PAN)",
      category: "Identity Proof",
      uploadDate: "20 Nov 2025",
      status: "Pending",
      imageUrl: "https://images.unsplash.com/photo-1628731338870-17686dc10c0b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Doctor Signature",
      category: "Profile Detail",
      uploadDate: "22 Nov 2025",
      status: "Verified",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Stylized_signature_of_John_Hancock.svg/1200px-Stylized_signature_of_John_Hancock.svg.png",
    },
    {
      id: 5,
      title: "MBBS Degree",
      category: "Qualification",
      uploadDate: "01 Dec 2025",
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* === Header Section === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and view all your uploaded certificates and proofs.</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shadow-emerald-200">
            <Plus size={18} strokeWidth={2.5} /> Add New Document
          </button>
        </div>

        {/* === Table Section === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Document</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Upload Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Image & Title Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div 
                          onClick={() => setSelectedImage(doc.imageUrl)}
                          className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all shrink-0"
                        >
                          {doc.imageUrl ? (
                            <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover bg-white" />
                          ) : (
                            <FileImage size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{doc.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 sm:hidden">{doc.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {doc.category}
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {doc.uploadDate}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {doc.status === "Verified" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <ShieldCheck size={14} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedImage(doc.imageUrl)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Full Document"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Empty State Fallback */}
            {documents.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <FileImage size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No Documents Found</h3>
                <p className="text-gray-500 text-sm mt-1">Upload your certificates and IDs to get verified.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* FULL SCREEN IMAGE MODAL                   */}
      {/* ========================================= */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 opacity-100 transition-opacity"
          onClick={() => setSelectedImage(null)} // Click outside to close
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={24} />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-full w-auto h-auto rounded-lg overflow-hidden shadow-2xl bg-white flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking ON the image
          >
            <img 
              src={selectedImage} 
              alt="Document Full View" 
              className="max-w-full max-h-[85vh] object-contain block"
            />
          </div>
        </div>
      )}
    </div>
  );
}