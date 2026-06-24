'use client';

import React, { useState } from 'react';
import { 
  FaArrowRight, 
  FaArrowLeft, 
  FaInfoCircle, 
  FaFileAlt, 
  FaEdit,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import PoliceAPI from '@/app/services/PoliceAPI'; // 👈 Apna path check kar lijiye

export default function SettingPage() {
  const [activeView, setActiveView] = useState('main'); // Views: 'main', 'about', 'terms'
  const [currentApiType, setCurrentApiType] = useState(''); // 'help' ya 'terms'
  
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // States for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  // --- GET API Call ---
  const handleViewChange = async (apiType, viewName) => {
      setActiveView(viewName);
      setCurrentApiType(apiType);
      setIsEditing(false); // Naye page par jane par edit mode band kardo
      setLoading(true);
      
      try {
          const response = await PoliceAPI.getStationContent(apiType);
          if (response.success) {
              setPageData(response.data);
              setEditData(response.data); // Edit state ko bhi initial data se bhar do
          }
      } catch (error) {
          console.error(`Error fetching ${apiType} content:`, error);
      } finally {
          setLoading(false);
      }
  };

  // --- PUT API Call (Save Changes) ---
  const handleSaveChanges = async () => {
      setUpdating(true);
      try {
          const response = await PoliceAPI.updateStationContent(currentApiType, editData);
          if (response.success) {
              setPageData(response.data); // UI update with new data
              setIsEditing(false); // Edit mode band kardo
              alert(`${currentApiType.toUpperCase()} content updated successfully!`);
          }
      } catch (error) {
          console.error(`Error updating ${currentApiType} content:`, error);
          alert("Failed to update content.");
      } finally {
          setUpdating(false);
      }
  };

  const handleInputChange = (e) => {
      setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // --- VIEW: MAIN SELECTION ---
  const renderMainView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-10">
      
      {/* About / Help Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-2xl flex items-center justify-center mb-6">
          <FaInfoCircle size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">About & Support</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-1">
          Learn more about our mission, get technical support, and find emergency contact details for the platform.
        </p>
        <button 
          onClick={() => handleViewChange('help', 'about')} 
          className="flex items-center justify-center gap-3 bg-[#08B36A] hover:bg-[#07a25f] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-100 w-full md:w-fit"
        >
          View Details <FaArrowRight />
        </button>
      </div>

      {/* Terms Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <FaFileAlt size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Terms & Conditions</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-1">
          Review the legal framework, usage policies, and security agreements that govern our digital ecosystem.
        </p>
        <button 
          onClick={() => handleViewChange('terms', 'terms')} 
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-100 w-full md:w-fit"
        >
          Read Policy <FaArrowRight />
        </button>
      </div>
    </div>
  );

  // --- DYNAMIC CONTENT BLOCKS ---
  const renderAboutContent = () => (
    <div className="space-y-6">
      {isEditing ? (
          // EDIT MODE UI FOR ABOUT
          <div className="space-y-4 animate-in fade-in">
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                  <input type="text" name="title" value={editData.title || ''} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-[#08B36A]" />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Main Description Content</label>
                  <textarea name="content" value={editData.content || ''} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-[#08B36A] resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Support Phone</label>
                      <input type="text" name="contactPhone" value={editData.contactPhone || ''} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-[#08B36A]" />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Support Email</label>
                      <input type="email" name="contactEmail" value={editData.contactEmail || ''} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-[#08B36A]" />
                  </div>
              </div>
          </div>
      ) : (
          // READ MODE UI FOR ABOUT
          <>
            <p className="whitespace-pre-wrap">{pageData?.content || "No information available."}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Phone</p>
                    <p className="text-slate-800 font-black text-lg tracking-tight">{pageData?.contactPhone || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tech Support Email</p>
                    <p className="text-[#08B36A] font-black text-lg tracking-tight leading-none break-all">{pageData?.contactEmail || 'N/A'}</p>
                </div>
            </div>
          </>
      )}
    </div>
  );

  const renderTermsContent = () => (
    <div className="space-y-6">
      {isEditing ? (
           // EDIT MODE UI FOR TERMS
           <div className="space-y-4 animate-in fade-in">
               <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Document Title</label>
                   <input type="text" name="title" value={editData.title || ''} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500" />
               </div>
               <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Terms & Conditions Full Text</label>
                   <textarea name="content" value={editData.content || ''} onChange={handleInputChange} rows={15} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 resize-none" />
               </div>
           </div>
      ) : (
          // READ MODE UI FOR TERMS
          <p className="text-slate-500 whitespace-pre-wrap leading-relaxed text-base">
              {pageData?.content || "No terms available."}
          </p>
      )}
    </div>
  );

  // --- VIEW: FULL INFO PAGES (Dynamic Template) ---
  const renderInnerPage = (title, contentRenderer, icon, accentColor) => (
    <div className="animate-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-50">
        
        {/* Top Actions (Back & Edit/Save) */}
        <div className="flex justify-between items-center mb-12">
            <button 
                onClick={() => setActiveView('main')}
                disabled={isEditing}
                className={`flex items-center gap-2 font-black transition-colors uppercase tracking-[0.2em] text-[10px] ${isEditing ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-[#08B36A]'}`}
            >
                <FaArrowLeft /> Back to Options
            </button>

            {/* Action Buttons based on Mode */}
            {!loading && (
                isEditing ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setIsEditing(false); setEditData(pageData); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest transition">
                            <FaTimes /> Cancel
                        </button>
                        <button onClick={handleSaveChanges} disabled={updating} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest transition shadow-md ${updating ? 'bg-slate-400' : 'bg-[#08B36A] hover:bg-emerald-600 shadow-green-100'}`}>
                            {updating ? 'Saving...' : <><FaSave /> Save Changes</>}
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition">
                        <FaEdit /> Edit Document
                    </button>
                )
            )}
        </div>
        
        {/* Dynamic Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className={`p-5 ${accentColor} rounded-3xl text-3xl shadow-inner`}>
            {icon}
          </div>
          <div>
            {/* Title changes dynamically based on Editing state or API data */}
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                {isEditing ? editData?.title : (pageData?.title || title)} 
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                {isEditing ? 'Editing Mode' : 'Official Document'}
            </p>
          </div>
        </div>

        {/* Content Render with Loading State */}
        {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-slate-300 border-t-[#08B36A] mb-4"></div>
                <p className="font-bold text-sm tracking-widest uppercase">Fetching Records...</p>
            </div>
        ) : (
            <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed font-medium">
                {contentRenderer()}
            </div>
        )}

      </div>
    </div>
  );

  return (
    <div className="h-full font-sans pb-10">
      <main className="max-w-6xl mx-auto">
        {activeView === 'main' && renderMainView()}
        {activeView === 'about' && renderInnerPage('About Us', renderAboutContent, <FaInfoCircle />, 'bg-emerald-50 text-[#08B36A]')}
        {activeView === 'terms' && renderInnerPage('Terms & Conditions', renderTermsContent, <FaFileAlt />, 'bg-blue-50 text-blue-600')}
      </main>
    </div>
  );
}