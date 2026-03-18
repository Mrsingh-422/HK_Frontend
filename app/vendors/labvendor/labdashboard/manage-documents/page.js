'use client'
import React from 'react'
import { FaFolderOpen, FaCheckCircle, FaEye, FaDownload } from 'react-icons/fa'

export default function ManageDocumentsPage() {
  
  // ==========================================
  // DUMMY DATA FOR DOCUMENTS (Based on your image)
  // ==========================================
  const documents =[
    {
      id: 1,
      title: "Profile Image",
      status: null, // No status shown in image
      image: "https://placehold.co/600x400/ea580c/ffffff?text=Profile+Image"
    },
    {
      id: 2,
      title: "License Image",
      status: "Approved",
      image: "https://placehold.co/600x400/08B36A/ffffff?text=License+Document"
    },
    {
      id: 3,
      title: "Certificate Image",
      status: "Approved",
      image: "https://placehold.co/600x400/3b82f6/ffffff?text=Certificate+Image" // Broken in your image, added placeholder
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-8">
      
      {/* Main Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-10">
        
        {/* Header Section */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] flex items-center gap-3 mb-4">
            <FaFolderOpen className="text-[#08B36A]"/> Our Documents
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify max-w-5xl">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
            when an unknown printer took a galley of type and scrambled it to make a type 
            specimen book. It has survived not only five centuries, but also the leap into 
            electronic typesetting, remaining essentially unchanged. It was popularised in 
            the 1960s with the release of Letraset sheets containing Lorem Ipsum passages.
          </p>
        </div>

        {/* Documents Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mt-8">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              
              {/* Image Container with Hover Actions */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <img 
                  src={doc.image} 
                  alt={doc.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Status Badge (Absolute Positioned) */}
                {doc.status === 'Approved' && (
                  <div className="absolute top-3 right-3 bg-[#08B36A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-10">
                    <FaCheckCircle size={12} /> {doc.status}
                  </div>
                )}

                {/* Dark Overlay with Action Buttons on Hover (Optional but gives premium feel) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-0">
                  <button className="p-3 bg-white text-gray-800 hover:text-[#08B36A] rounded-full shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                    <FaEye size={18} />
                  </button>
                  <button className="p-3 bg-white text-gray-800 hover:text-[#08B36A] rounded-full shadow-lg transform hover:scale-110 transition-all cursor-pointer">
                    <FaDownload size={18} />
                  </button>
                </div>
              </div>

              {/* Title & Status Area (Below Image) */}
              <div className="p-5 text-center flex-1 flex flex-col justify-center items-center bg-gray-50/30 group-hover:bg-green-50/20 transition-colors border-t border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{doc.title}</h3>
                
                {/* Sub-status (Kept green as per your original image styling) */}
                {doc.status ? (
                  <span className="text-[#08B36A] text-sm font-bold tracking-wide">
                    ({doc.status})
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm font-medium">
                    No status available
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}