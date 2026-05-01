'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaCheckCircle, 
  FaEye, 
  FaDownload, 
  FaShieldAlt, 
  FaHistory,
  FaFileAlt,
  FaClock,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaEdit,
  FaPrescriptionBottleAlt
} from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI';
import { toast } from 'react-hot-toast';

export default function PharmacyDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [docList, setDocList] = useState([]);
  const [stats, setStats] = useState({ total: 0, lastUpdated: '---' });
  
  // Update Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('pharmacyImages');
  const [selectedFile, setSelectedFile] = useState(null);

  // Helper to format image URL (Handles both forward and backslashes from DB)
  const formatImagePath = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
  };

  const fetchPharmacyDocs = async () => {
    try {
      setLoading(true);
      const res = await PharmacyVendorAPI.getPharmacyProfile();
      if (res.success) {
        const data = res.data;
        const docs = data.documents || {};
        
        const formattedDocs = [];

        // 1. Handle Profile Image (Top level)
        if (data.profileImage) {
          formattedDocs.push({
            id: 'profile',
            categoryKey: 'profileImage',
            title: "Pharmacy Branding",
            type: "Identity",
            status: data.profileStatus || "Approved",
            image: formatImagePath(data.profileImage)
          });
        }

        // 2. Define categories based on your Pharmacy Backend Response
        const categories = [
          { key: 'pharmacyImages', title: 'Store Photos', type: 'Infrastructure' },
          { key: 'pharmacyCertificates', title: 'Pharmacy Certificate', type: 'Accreditation' },
          { key: 'pharmacyLicenses', title: 'Pharmacy License', type: 'Legal Permit' },
          { key: 'gstCertificates', title: 'GST Document', type: 'Taxation' },
          { key: 'drugLicenses', title: 'Drug License', type: 'Compliance' },
          { key: 'otherCertificates', title: 'Additional Document', type: 'Support Doc' }
        ];

        // 3. Map Array-based documents
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
      toast.error("Failed to load pharmacy documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return toast.error("Please select a file first");

    try {
      setUpdating(true);
      const formData = new FormData();
      
      // The backend expects the file attached to the specific category key
      formData.append(selectedCategory, selectedFile);

      const res = await PharmacyVendorAPI.updatePharmacyProfile(formData);
      if (res.success) {
        toast.success(`Document uploaded successfully!`);
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchPharmacyDocs(); // Refresh UI
      }
    } catch (error) {
      toast.error("Failed to upload document");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateModal = (category = 'pharmacyImages') => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse tracking-widest">OPENING PHARMACY VAULT...</div>;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#08B36A] uppercase tracking-widest mb-2">
              <FaShieldAlt /> Verified Pharmacy Provider
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Compliance Vault
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Securely manage your pharmacy licenses, drug permits, and store certifications. 
              Keeping these documents valid ensures your <span className="text-[#08B36A] font-bold">Trusted Vendor</span> 
              badge remains active.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#08B36A] border border-green-100 shadow-sm">
                <FaCheckCircle size={28} />
             </div>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FaFileAlt size={20}/></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Archive Size</p><p className="font-bold text-slate-800">{stats.total} Documents</p></div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><FaPrescriptionBottleAlt size={20}/></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">License Status</p><p className="font-bold text-slate-800">Operational</p></div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><FaHistory size={20}/></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Last Sync</p><p className="font-bold text-slate-800">{stats.lastUpdated}</p></div>
         </div>
      </div>

      {/* DOCUMENTS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docList.map((doc) => (
          <div key={doc.id} className="group relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:border-[#08B36A] transition-all duration-500 hover:shadow-2xl shadow-sm flex flex-col">
            
            {/* Action Overlay Header */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button onClick={() => openUpdateModal(doc.categoryKey)} className="w-10 h-10 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-[#08B36A] transition-all hover:scale-110">
                    <FaEdit size={16} />
                </button>
                <a href={doc.image} target="_blank" download className="w-10 h-10 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-slate-600 hover:text-[#08B36A] transition-all hover:scale-110">
                    <FaDownload size={16} />
                </a>
            </div>

            {/* Preview Area */}
            <div className="relative aspect-[16/11] overflow-hidden bg-slate-50 p-4">
              <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner border border-slate-100">
                <img 
                  src={doc.image} 
                  alt={doc.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=Pharma+Doc'}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <a href={doc.image} target="_blank" className="bg-white text-slate-900 font-bold px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-[#08B36A] hover:text-white transition-colors">
                        <FaEye /> View
                    </a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-7">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.2em] block mb-1">{doc.type}</span>
                    <h3 className="font-bold text-slate-800 text-lg">{doc.title}</h3>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black rounded-full border border-green-100 uppercase">
                    {doc.status}
                </span>
              </div>
              <div className="pt-5 border-t border-slate-50 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2 text-xs">
                    <FaClock className="text-slate-300"/> Valid Document
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* UPLOAD PLACEHOLDER */}
        <div 
          onClick={() => openUpdateModal()}
          className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-10 hover:border-[#08B36A] hover:bg-green-50/20 transition-all cursor-pointer group min-h-[380px]"
        >
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#08B36A] group-hover:text-white transition-all duration-500">
              <FaPlus size={24} />
           </div>
           <p className="font-bold text-slate-800">Add New Document</p>
           <p className="text-[11px] text-slate-400 mt-2 text-center max-w-[220px]">Upload Pharmacy licenses, GST or store images (JPG, PNG, PDF).</p>
        </div>
      </div>

      {/* UPDATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Upload to Vault</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Document Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:border-[#08B36A] font-bold text-slate-700 transition-all appearance-none"
                >
                  <option value="pharmacyImages">Pharmacy Store Images</option>
                  <option value="pharmacyCertificates">Pharmacy Certificates</option>
                  <option value="pharmacyLicenses">Pharmacy Licenses</option>
                  <option value="gstCertificates">GST Certificates</option>
                  <option value="drugLicenses">Drug License</option>
                  <option value="profileImage">Pharmacy Profile Photo</option>
                  <option value="otherCertificates">Other Certificates</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">File Upload</label>
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden" 
                    id="pharma-file-input"
                    accept="image/*,application/pdf"
                  />
                  <label 
                    htmlFor="pharma-file-input" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 hover:border-[#08B36A] hover:bg-green-50/30 cursor-pointer transition-all"
                  >
                    <FaCloudUploadAlt size={48} className={selectedFile ? "text-[#08B36A] animate-bounce" : "text-slate-200"} />
                    <span className="mt-4 text-sm font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : "Select File"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">High resolution images preferred</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updating || !selectedFile}
                className="w-full bg-[#08B36A] hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {updating ? "Syncing with Server..." : "Upload Document"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}