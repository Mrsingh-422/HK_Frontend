'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaFolderOpen, 
  FaCheckCircle, 
  FaEye, 
  FaDownload, 
  FaInfoCircle, 
  FaShieldAlt, 
  FaHistory,
  FaFileAlt,
  FaClock,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaEdit
} from 'react-icons/fa'
import LabVendorAPI from '@/app/services/LabVendorAPI';
import { toast } from 'react-hot-toast';

export default function ManageDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [docList, setDocList] = useState([]);
  const [stats, setStats] = useState({ total: 0, lastUpdated: '---' });
  
  // Update Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('labImages');
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper to format image URL
  const formatImagePath = (path) => {
    if (!path) return null;
    const cleanPath = path.replace('public/', '');
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  const fetchProfileDocs = async () => {
    try {
      setLoading(true);
      const res = await LabVendorAPI.getLabProfile();
      if (res.success) {
        const data = res.data;
        const docs = data.documents || {};
        
        const formattedDocs = [];

        if (data.profileImage) {
          formattedDocs.push({
            id: 'profile',
            categoryKey: 'profileImage',
            title: "Profile Identity",
            type: "Identification",
            status: data.profileStatus || "Approved",
            image: formatImagePath(data.profileImage)
          });
        }

        const categories = [
          { key: 'labImages', title: 'Lab Interior', type: 'Infrastructure' },
          { key: 'labCertificates', title: 'Quality Certificate', type: 'Accreditation' },
          { key: 'labLicenses', title: 'Regulatory License', type: 'Legal Permit' },
          { key: 'gstCertificates', title: 'GST Certificate', type: 'Tax Document' },
          { key: 'drugLicenses', title: 'Drug License', type: 'Compliance' },
          { key: 'otherCertificates', title: 'Additional Certificate', type: 'Support Doc' }
        ];

        categories.forEach(cat => {
          if (docs[cat.key] && Array.isArray(docs[cat.key])) {
            docs[cat.key].forEach((img, index) => {
              formattedDocs.push({
                id: `${cat.key}-${index}`,
                categoryKey: cat.key,
                title: docs[cat.key].length > 1 ? `${cat.title} ${index + 1}` : cat.title,
                type: cat.type,
                status: "Approved",
                image: formatImagePath(img)
              });
            });
          }
        });

        setDocList(formattedDocs);
        setStats({
          total: formattedDocs.length,
          lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '---'
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDocs();
  }, []);

  // ==========================================
  // UPDATE LOGIC
  // ==========================================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("Please select a file first");

    try {
      setUpdating(true);
      const formData = new FormData();
      
      // Append the file to the specific category key expected by backend
      formData.append(selectedCategory, selectedFile);

      const res = await LabVendorAPI.updateLabProfile(formData);
      if (res.success) {
        toast.success(`${selectedCategory} updated successfully!`);
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchProfileDocs(); // Refresh list
      }
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (category = 'labImages') => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Loading Document Vault...</div>;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#08B36A] uppercase tracking-widest mb-2">
              <FaShieldAlt /> Secure Verification Vault
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Compliance Documents
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Manage and verify your laboratory's legal credentials and certifications. 
              Keep these updated to maintain your <span className="text-[#08B36A] font-bold">Verified Status</span> 
              and visibility on the platform.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Overall Status</p>
                <p className="text-lg font-black text-slate-800">Verified</p>
             </div>
             <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#08B36A] border border-green-100 shadow-inner">
                <FaCheckCircle size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FaFileAlt /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Total Files</p><p className="font-bold text-slate-800">{stats.total} Uploaded</p></div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><FaCheckCircle /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Verification</p><p className="font-bold text-slate-800">All Synced</p></div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><FaHistory /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Last Update</p><p className="font-bold text-slate-800">{stats.lastUpdated}</p></div>
         </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docList.map((doc) => (
          <div 
            key={doc.id} 
            className="group relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-[#08B36A] transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 shadow-sm flex flex-col"
          >
            
            {/* Action Overlay Header (Top Right) */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button 
                  onClick={() => openUpdateModal(doc.categoryKey)}
                  className="w-9 h-9 bg-white shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-[#08B36A] transition-colors"
                  title="Update Document"
                >
                    <FaEdit size={14} />
                </button>
                <a href={doc.image} target="_blank" download className="w-9 h-9 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-[#08B36A] transition-colors active:scale-90">
                    <FaDownload size={14} />
                </a>
            </div>

            {/* Document Preview Area */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 p-3">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <img 
                  src={doc.image} 
                  alt={doc.title} 
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Doc+Preview'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <a href={doc.image} target="_blank" className="flex items-center gap-2 text-white font-bold text-sm bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/30 hover:bg-[#08B36A] transition-all">
                        <FaEye /> Full Preview
                    </a>
                </div>
              </div>
            </div>

            {/* Document Data Body */}
            <div className="p-7 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest block mb-1">{doc.type}</span>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">{doc.title}</h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase border border-green-100">
                        {doc.status}
                    </span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                    <FaClock size={12} className="text-slate-300"/>
                    <span className="text-xs font-medium">Verified Status</span>
                </div>
                <button className="text-slate-300 hover:text-blue-500 transition-colors">
                    <FaInfoCircle size={16} />
                </button>
              </div>
            </div>

            {/* Side Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#08B36A] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
          </div>
        ))}

        {/* UPLOAD PLACEHOLDER - NOW FUNCTIONAL */}
        <div 
          onClick={() => openUpdateModal()}
          className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-10 hover:border-[#08B36A] hover:bg-green-50/20 transition-all cursor-pointer group min-h-[400px]"
        >
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#08B36A] group-hover:text-white transition-all duration-500">
              <FaPlus size={24} />
           </div>
           <p className="font-bold text-slate-800">Add New Document</p>
           <p className="text-xs text-slate-400 mt-2 text-center max-w-[200px]">Upload certificates or legal permits in PDF, JPG or PNG format.</p>
        </div>
      </div>

      {/* UPDATE / UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Upload Document</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-[#08B36A] font-bold text-slate-700 transition-all"
                >
                  <option value="labImages">Lab Interior Photos</option>
                  <option value="labCertificates">Quality Certificates</option>
                  <option value="labLicenses">Regulatory Licenses</option>
                  <option value="gstCertificates">GST Documents</option>
                  <option value="drugLicenses">Drug License</option>
                  <option value="profileImage">Profile Image</option>
                  <option value="otherCertificates">Other Certificates</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">File Attachment</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden" 
                    id="file-upload-input"
                    accept="image/*,application/pdf"
                  />
                  <label 
                    htmlFor="file-upload-input" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-10 hover:border-[#08B36A] hover:bg-green-50/30 cursor-pointer transition-all"
                  >
                    <FaCloudUploadAlt size={40} className={selectedFile ? "text-[#08B36A]" : "text-slate-300"} />
                    <span className="mt-4 text-sm font-bold text-slate-600">
                      {selectedFile ? selectedFile.name : "Choose file to upload"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 italic">JPG, PNG or PDF (Max 5MB)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updating || !selectedFile}
                className="w-full bg-[#08B36A] hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {updating ? "Uploading..." : "Confirm & Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}