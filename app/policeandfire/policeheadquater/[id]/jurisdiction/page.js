'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FaMapMarkedAlt, 
  FaCompass, 
  FaUsers, 
  FaCarSide, 
  FaCloudUploadAlt, 
  FaFilePdf, 
  FaSave, 
  FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // Aapka API path

export default function JurisdictionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.id; // URL se stationId automatically nikal jayega

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    zoneName: '',
    sqKmArea: '',
    population: '',
    patrolBeats: '',
    boundaryNorth: '',
    boundarySouth: '',
    boundaryEast: '',
    boundaryWest: ''
  });

  // Fetch Data on Load
  useEffect(() => {
    if (stationId) fetchJurisdiction();
  }, [stationId]);

  const fetchJurisdiction = async () => {
    setLoading(true);
    try {
      const response = await PoliceAPI.getStationJurisdiction(stationId);
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          zoneName: data.zoneName || '',
          sqKmArea: data.sqKmArea || '',
          population: data.population || '',
          patrolBeats: data.patrolBeats || '',
          boundaryNorth: data.boundaryLimits?.north || '',
          boundarySouth: data.boundaryLimits?.south || '',
          boundaryEast: data.boundaryLimits?.east || '',
          boundaryWest: data.boundaryLimits?.west || ''
        });
        setCurrentDoc(data.areaDocumentUrl);
      }
    } catch (error) {
      console.error("Failed to load jurisdiction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData to support file upload
      const submitData = new FormData();
      submitData.append('zoneName', formData.zoneName);
      submitData.append('sqKmArea', formData.sqKmArea);
      submitData.append('population', formData.population);
      submitData.append('patrolBeats', formData.patrolBeats);
      submitData.append('boundaryNorth', formData.boundaryNorth);
      submitData.append('boundarySouth', formData.boundarySouth);
      submitData.append('boundaryEast', formData.boundaryEast);
      submitData.append('boundaryWest', formData.boundaryWest);
      
      if (fileToUpload) {
        submitData.append('areaDocument', fileToUpload);
      }

      const response = await PoliceAPI.updateStationJurisdiction(stationId, submitData);
      
      if (response.success) {
        alert("Jurisdiction Updated Successfully!");
        setFileToUpload(null); // reset file input
        fetchJurisdiction();   // Refresh data to show new document
      } else {
        alert(response.message || "Failed to update jurisdiction");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#08B36A] rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Zone Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans pb-24">
      
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <FaMapMarkedAlt className="text-[#08B36A]" /> Jurisdiction Management
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">Configure operational boundaries and zone details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* ================= LEFT COLUMN ================= */}
            <div className="space-y-6">
              
              {/* Basic Zone Info */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FaShieldAlt className="text-blue-500" /> Basic Zone Information
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Zone / District Name</label>
                    <input 
                      type="text" name="zoneName" value={formData.zoneName} onChange={handleInputChange} required
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Central District - Sector 4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1"><FaMapMarkedAlt/> Area (Sq. Km)</label>
                      <input 
                        type="number" step="any" name="sqKmArea" value={formData.sqKmArea} onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1"><FaUsers/> Population</label>
                      <input 
                        type="text" name="population" value={formData.population} onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="e.g. 450k"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1"><FaCarSide/> Patrol Beats (Units)</label>
                    <input 
                      type="number" name="patrolBeats" value={formData.patrolBeats} onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Area Map Document Upload */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FaFilePdf className="text-red-500" /> Operational Map Document
                </h3>
                
                {/* Current Doc View */}
                {currentDoc && (
                  <div className="mb-4 flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3 truncate">
                      <FaFilePdf size={24} className="text-red-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-black text-red-900 uppercase tracking-widest">Current Document</p>
                        <p className="text-sm font-bold text-red-600 truncate">{currentDoc.split('/').pop()}</p>
                      </div>
                    </div>
                    <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}${currentDoc}`} target="_blank" rel="noopener noreferrer" className="text-xs font-black bg-white px-3 py-1.5 rounded-lg text-red-600 border border-red-200 shadow-sm hover:bg-red-100">VIEW</a>
                  </div>
                )}

                {/* Upload New */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Upload New Map (PDF/Image)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-[#08B36A] transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaCloudUploadAlt className="w-8 h-8 text-slate-400 group-hover:text-[#08B36A] mb-2" />
                      <p className="text-sm text-slate-500 font-bold">{fileToUpload ? fileToUpload.name : "Click to select a file"}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">MAX 10MB</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                  </label>
                </div>
              </div>

            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FaCompass className="text-orange-500" /> Boundary Limits
              </h3>
              
              <div className="flex-1 flex flex-col justify-center space-y-6">
                
                {/* North */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-black text-xs">N</div>
                  <input 
                    type="text" name="boundaryNorth" value={formData.boundaryNorth} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 pl-16 pr-4 py-4 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="North Boundary..."
                  />
                </div>

                {/* East */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-black text-xs">E</div>
                  <input 
                    type="text" name="boundaryEast" value={formData.boundaryEast} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 pl-16 pr-4 py-4 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="East Boundary..."
                  />
                </div>

                {/* South */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-black text-xs">S</div>
                  <input 
                    type="text" name="boundarySouth" value={formData.boundarySouth} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 pl-16 pr-4 py-4 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="South Boundary..."
                  />
                </div>

                {/* West */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-black text-xs">W</div>
                  <input 
                    type="text" name="boundaryWest" value={formData.boundaryWest} onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 pl-16 pr-4 py-4 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="West Boundary..."
                  />
                </div>

              </div>
            </div>

          </div>

          {/* --- FIXED BOTTOM BAR FOR SAVE --- */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-end z-40">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#08B36A] hover:bg-[#07a25f] disabled:bg-slate-300 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-green-500/20 transition-all transform hover:-translate-y-1"
            >
              {submitting ? 'Saving Configuration...' : <><FaSave size={14}/> Save Jurisdiction Config</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}