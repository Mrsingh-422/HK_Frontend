"use client";

import React, { useState } from 'react';

// --- Zero-Dependency Premium Icons ---
const Icons = {
  Facebook: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Twitter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
  Instagram: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  Youtube: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Grab: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
};

const PLATFORMS = {
  facebook: { name: 'Facebook', icon: Icons.Facebook, color: 'text-blue-600' },
  twitter: { name: 'Twitter', icon: Icons.Twitter, color: 'text-sky-500' },
  instagram: { name: 'Instagram', icon: Icons.Instagram, color: 'text-pink-600' },
  youtube: { name: 'Youtube', icon: Icons.Youtube, color: 'text-red-600' },
};

export default function AdvancedSocialManager() {
  const [links, setLinks] = useState([
    { id: '1', type: 'facebook', url: 'https://facebook.com/healthkangaroo', active: true},
    { id: '2', type: 'instagram', url: 'https://instagram.com/healthkangaroo', active: true},
    { id: '3', type: 'twitter', url: 'https://twitter.com/healthkangaroo', active: false },
  ]);

  const updateLink = (id, field, value) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const toggleActive = (id) => {
    setLinks(links.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const removeLink = (id) => setLinks(links.filter(l => l.id !== id));

  const addLink = () => {
    const newId = Date.now().toString();
    setLinks([...links, { id: newId, type: 'youtube', url: '', active: true, clicks: 0 }]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:px-10 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#5cb85c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-200">
               <Icons.Plus />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Profile Manager</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Health Kangaroo Admin</p>
            </div>
          </div>
          <button className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            Go Back
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">
          
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-8 md:p-14">
            
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-xl font-black text-slate-800">Social Connections</h2>
                <p className="text-slate-400 text-sm mt-1">Enable or disable links to control your public profile.</p>
              </div>
              <button 
                onClick={addLink}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              >
                <Icons.Plus /> Add New Link
              </button>
            </div>

            {/* Links Interactive List */}
            <div className="space-y-6">
              {links.map((link) => {
                const config = PLATFORMS[link.type] || PLATFORMS.facebook;
                const BrandIcon = config.icon;

                return (
                  <div 
                    key={link.id} 
                    className={`group relative bg-white border rounded-3xl p-6 transition-all duration-300 ${link.active ? 'border-slate-100 shadow-md hover:shadow-xl' : 'opacity-60 bg-slate-50 border-transparent grayscale'}`}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Grab Handle & Platform */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing"><Icons.Grab /></div>
                        <div className={`p-3 rounded-2xl ${link.active ? 'bg-slate-50' : 'bg-slate-200'} ${config.color}`}>
                          <BrandIcon />
                        </div>
                      </div>

                      {/* Inputs Section */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Platform</label>
                          <select 
                            value={link.type}
                            disabled={!link.active}
                            onChange={(e) => updateLink(link.id, 'type', e.target.value)}
                            className="w-full bg-white border-b-2 border-slate-100 py-2 outline-none text-slate-700 font-bold text-sm focus:border-emerald-500 transition-colors cursor-pointer"
                          >
                            {Object.keys(PLATFORMS).map(k => <option key={k} value={k}>{PLATFORMS[k].name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Profile Link</label>
                          <input 
                            type="text"
                            value={link.url}
                            disabled={!link.active}
                            onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-transparent border-b-2 border-slate-100 py-2 outline-none text-slate-600 text-sm font-medium focus:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Controls & Stats */}
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        {link.active && link.clicks > 0 && (
                          <div className="text-right">
                             <div className="text-emerald-500 font-black text-sm">{link.clicks}</div>
                             <div className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total Clicks</div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {/* Toggle Switch */}
                          <button 
                            onClick={() => toggleActive(link.id)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${link.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${link.active ? 'left-7' : 'left-1'}`} />
                          </button>

                          <button 
                            onClick={() => removeLink(link.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Action */}
            <div className="mt-16 flex flex-col items-center gap-6">
              <div className="w-full h-px bg-slate-100" />
              <button 
                onClick={() => alert("Dashboard Sync Complete!")}
                className="w-full md:w-auto px-20 py-5 bg-[#5cb85c] text-white font-black rounded-3xl shadow-2xl shadow-green-200 hover:bg-[#4cae4c] hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-[0.2em] text-xs"
              >
                Sync with Live Profile
              </button>
              <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Changes update instantly on your public page</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}