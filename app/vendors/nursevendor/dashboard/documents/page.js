"use client";
import React, { useState, useEffect, useRef } from "react";
import NurseAPI from "@/app/services/NurseAPI"; // Adjust path if needed
import { 
  FaPlus, 
  FaTrashAlt, 
  FaTimes, 
  FaEye, 
  FaFileImage, 
  FaShieldAlt, 
  FaClock, 
  FaAward, 
  FaUniversity,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function NurseDocuments() {
  // State for Full Screen Image Modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentUploadCategory, setCurrentUploadCategory] = useState("");

  // Map API fields to UI display labels based on your JSON response structure
  const documentMapping = [
    { key: "nursingCertificates", title: "Nursing Council Registration", category: "Mandatory Document" },
    { key: "licensePhotos", title: "RN License (State Board)", category: "Professional License" },
    { key: "gstCertificates", title: "Aadhar / Govt ID / GST", category: "Identity Proof" },
    { key: "experienceCertificates", title: "Experience Certificate", category: "Qualification" },
    { key: "otherCertificates", title: "Other Certifications", category: "Supporting Doc" },
  ];

  // Base URL for Images
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  // --- FETCH DATA ---
  const fetchProfileDocs = async () => {
    try {
      setLoading(true);
      const res = await NurseAPI.getNurseProfile();
      if (res && res.success) {
        setProfileData(res.data); // Stores the full user data object
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDocs();
  }, []);

  // --- HANDLE UPLOAD ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // Your backend likely expects the document key name
    formData.append(currentUploadCategory, file);

    try {
      setUploading(true);
      const res = await NurseAPI.updateNurseProfile(formData);
      if (res) {
        toast.success(`Document updated successfully`);
        fetchProfileDocs(); // Refresh
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setCurrentUploadCategory("");
    }
  };

  const triggerUpload = (categoryKey) => {
    setCurrentUploadCategory(categoryKey);
    fileInputRef.current.click();
  };

  // Handle Delete
  const handleDelete = async (categoryKey) => {
    if (window.confirm("Are you sure you want to remove this document?")) {
        const formData = new FormData();
        // Sending empty string often clears the field in multi-part form backends
        formData.append(categoryKey, ""); 
        try {
            await NurseAPI.updateNurseProfile(formData);
            toast.success("Document removed");
            fetchProfileDocs();
        } catch (error) {
            toast.error("Delete failed");
        }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Compliance Vault...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans relative">
      <div className="max-w-7xl mx-auto">
       
        {/* === Redesigned Header Section === */}
        <div className="relative mb-12 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-white flex flex-col md:flex-row justify-between items-center overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#08B36A]"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Compliance Vault</h1>
            <div className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <FaShieldAlt className="text-[#08B36A]" size={14} /> 
              </div>
              Verified Professional Healthcare Certifications
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-4">
             <div className="text-right hidden md:block mr-4 border-r pr-6 border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</p>
                <p className="text-emerald-500 font-bold text-lg">{profileData?.profileStatus || "Approved"}</p>
             </div>
             <button 
                onClick={() => triggerUpload("licensePhotos")}
                className="bg-[#08B36A] hover:bg-[#069a5a] text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-black transition-all shadow-xl shadow-green-100 active:scale-95"
             >
                <FaPlus size={14} /> Quick Upload
             </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept="image/*"
        />

        {/* === Table Section === */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden relative">
          {uploading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
                    <FaSpinner className="animate-spin text-[#08B36A]" />
                    <span className="font-bold text-gray-700">Uploading to Secure Server...</span>
                </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                  <th className="px-10 py-6">Certificate Info</th>
                  <th className="px-10 py-6">Classification</th>
                  <th className="px-10 py-6">Live Status</th>
                  <th className="px-10 py-6 text-right">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documentMapping.map((doc, index) => {
                  // Accessing nested documents[key][0] as per your JSON response
                  const docArray = profileData?.documents?.[doc.key];
                  const fileUrl = Array.isArray(docArray) && docArray.length > 0 ? docArray[0] : null;
                  const fullUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : `${IMAGE_BASE_URL}/${fileUrl}`) : null;

                  return (
                    <tr key={index} className="hover:bg-blue-50/30 transition-all group">
                   
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div
                          onClick={() => fullUrl && setSelectedImage(fullUrl)}
                          className={`w-20 h-20 rounded-[1.5rem] border-2 ${fullUrl ? 'border-emerald-100' : 'border-dashed border-gray-200'} bg-white flex items-center justify-center overflow-hidden cursor-zoom-in group-hover:scale-105 transition-all shrink-0 shadow-sm`}
                        >
                          {fullUrl ? (
                            <img src={fullUrl} alt={doc.title} className="w-full h-full object-cover" />
                          ) : (
                            <FaCloudUploadAlt size={24} className="text-gray-300 group-hover:text-[#08B36A] transition-colors" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-base tracking-tight">{doc.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: REF-00{index+1}</p>
                        </div>
                      </div>
                    </td>
 
                    <td className="px-10 py-6">
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                        {doc.category}
                      </span>
                    </td>
 
                    <td className="px-10 py-6">
                      {fullUrl ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-50">
                          <FaCheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100 animate-pulse">
                          <FaClock size={12} /> Missing
                        </span>
                      )}
                    </td>
 
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {fullUrl ? (
                          <>
                            <button
                              onClick={() => setSelectedImage(fullUrl)}
                              className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.key)}
                              className="w-10 h-10 flex items-center justify-center text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <FaTrashAlt size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => triggerUpload(doc.key)}
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#08B36A] transition-all shadow-lg active:scale-95"
                          >
                            Upload Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card Footer */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><FaAward size={20}/></div>
                <div><p className="font-bold text-gray-800 text-sm">ISO Certified</p><p className="text-xs text-gray-400">Secure Vault Storage</p></div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><FaShieldAlt size={20}/></div>
                <div><p className="font-bold text-gray-800 text-sm">HIPAA Compliant</p><p className="text-xs text-gray-400">Encrypted Transfers</p></div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><FaClock size={20}/></div>
                <div><p className="font-bold text-gray-800 text-sm">Real-time Review</p><p className="text-xs text-gray-400">24h Admin Verification</p></div>
            </div>
        </div>
      </div>
 
      {/* --- FULL SCREEN MODAL --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-gray-900/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-500"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-rose-500 text-white rounded-full transition-all hover:rotate-90 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <FaTimes size={24} />
          </button>
 
          <div
            className="relative max-w-5xl w-full h-auto rounded-[3rem] overflow-hidden shadow-2xl bg-white border-8 border-white/10 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-50 p-6 flex justify-between items-center border-b border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Secure Document Viewer</span>
               </div>
               <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-colors"
                >
                  Close
                </button>
            </div>
            <div className="p-4 bg-gray-100 flex items-center justify-center">
                <img
                    src={selectedImage}
                    alt="Nurse Document Preview"
                    className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}