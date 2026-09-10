"use client";

import React, { useState, useEffect } from 'react';
import { 
  Globe, Link as LinkIcon, Image as ImageIcon, Plus, Trash2, 
  Save, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, 
  Share2, Phone, Mail, MapPin, ExternalLink, X, Loader2,
  Sparkles
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2'; // 👈 Centralized API service

// Platform presets with verified icons and default destination URLs
const PRESETS = [
  { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/yourpage', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/yourhandle', color: 'bg-pink-50 text-pink-600 border-pink-200', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png' },
  { id: 'whatsapp', name: 'WhatsApp', placeholder: 'https://wa.me/919876543210', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
  { id: 'twitter', name: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle', color: 'bg-sky-50 text-sky-600 border-sky-200', icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png' },
  { id: 'telegram', name: 'Telegram', placeholder: 'https://t.me/yourchannel', color: 'bg-cyan-50 text-cyan-600 border-cyan-200', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png' },
  { id: 'custom', name: 'Custom Platform', placeholder: 'https://...', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: '' }
];

export default function AdvancedSocialManager() {
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'Facebook', url: 'https://facebook.com/healthkangaroo', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' },
    { platform: 'Instagram', url: 'https://instagram.com/healthkangaroo', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png' },
    { platform: 'WhatsApp', url: 'https://wa.me/919879879879', icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' }
  ]);

  const [footerData, setFooterData] = useState({
    address: '#omnninos mohali punjab 160055',
    phones: ['+91 9879879879', '+91 9876543210'],
    emails: ['admin@gmail.com', 'support@healthkangaroo.com'],
    aboutTitle: 'Health Kangaroo',
    aboutDescription: 'Providing accessible healthcare solutions including lab tests, doctor appointments, and emergency services at your fingertips.',
    copyrightText: 'Copyright © 2026, All Right Reserved Health Kangaroo'
  });

  const [activeTab, setActiveTab] = useState('social'); // 'social' | 'contact'
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  // --- 1. Load Footer Data Using AdminAPI2 ---
  const fetchFooterData = async () => {
    setFetching(true);
    try {
      const res = await AdminAPI2.getFooterData();

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        if (Array.isArray(data.socialLinks) && data.socialLinks.length > 0) {
          setSocialLinks(data.socialLinks);
        }
        setFooterData({
          address: data.address || '',
          phones: Array.isArray(data.phones) ? data.phones : [''],
          emails: Array.isArray(data.emails) ? data.emails : [''],
          aboutTitle: data.aboutTitle || 'Health Kangaroo',
          aboutDescription: data.aboutDescription || '',
          copyrightText: data.copyrightText || ''
        });
      }
    } catch (err) {
      console.error("Failed to load footer data:", err);
      showAlert(err.response?.data?.message || "Failed to load footer configuration", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  // --- 2. Quick Add Preset ---
  const handleQuickAdd = (preset) => {
    setSocialLinks([
      ...socialLinks,
      { platform: preset.name, url: '', icon: preset.icon }
    ]);
  };

  // --- 3. Add Empty Custom Row ---
  const handleAddCustomRow = () => {
    setSocialLinks([
      ...socialLinks,
      { platform: 'Facebook', url: '', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }
    ]);
  };

  // --- 4. Remove Link ---
  const handleRemoveRow = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // --- 5. Update Field ---
  const handleLinkChange = (index, field, value) => {
    const updated = [...socialLinks];
    updated[index][field] = value;

    if (field === 'platform') {
      const matched = PRESETS.find(p => p.name.toLowerCase() === value.toLowerCase());
      if (matched && matched.icon) {
        updated[index].icon = matched.icon;
      }
    }

    setSocialLinks(updated);
  };

  // --- 6. Save To Backend Using AdminAPI2 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...footerData,
        socialLinks: socialLinks.map(l => ({
          platform: l.platform?.trim() || 'Custom',
          url: l.url?.trim(),
          icon: l.icon?.trim() || ''
        }))
      };

      const res = await AdminAPI2.updateFooterData(payload);

      if (res.data?.success || res.status === 200) {
        showAlert(res.data?.message || 'Footer social links and settings updated successfully!', 'success');
      } else {
        showAlert(res.data?.message || 'Failed to update footer', 'error');
      }
    } catch (err) {
      console.error("Error saving footer:", err);
      showAlert(err.response?.data?.message || 'Error updating footer settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Toast Alert */}
        {alertBanner && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in duration-200 ${
            alertBanner.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)}><X size={16} /></button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Share2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Social Media & Footer Hub</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Client Portal Footer Links & Media Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchFooterData}
              disabled={fetching}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={fetching ? 'animate-spin text-emerald-500' : ''} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition shadow-sm"
            >
              Back
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'social'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Globe size={15} /> Dynamic Social Links ({socialLinks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'contact'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Phone size={15} /> Footer Contact Info & Address
          </button>
        </div>

        {fetching ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Loading footer configurations...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ========================================================= */}
            {/* TAB 1: DYNAMIC SOCIAL LINKS */}
            {/* ========================================================= */}
            {activeTab === 'social' && (
              <div className="space-y-6">

                {/* Quick Add Preset Bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <Sparkles size={14} className="text-amber-500" /> Quick Add Popular Platforms:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.filter(p => p.id !== 'custom').map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleQuickAdd(preset)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition hover:scale-105 active:scale-95 shadow-sm ${preset.color}`}
                      >
                        <img src={preset.icon} alt={preset.name} className="w-4 h-4 object-contain" />
                        + {preset.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCustomRow}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      + Custom Link
                    </button>
                  </div>
                </div>

                {/* Social Links Cards Container */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-black text-slate-900">Active Social Connections</h2>
                      <p className="text-slate-400 text-xs">These icons and links render in the public website footer.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomRow}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus size={14} /> Add Row
                    </button>
                  </div>

                  {socialLinks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      No social links configured yet. Click any platform chip above to add one!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socialLinks.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all duration-200 shadow-sm"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            
                            {/* Live Icon Thumbnail Preview */}
                            <div className="md:col-span-1 flex items-center justify-center">
                              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center">
                                {item.icon ? (
                                  <img
                                    src={item.icon}
                                    alt={item.platform}
                                    className="w-full h-full object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Globe className="text-slate-400" size={20} />
                                )}
                              </div>
                            </div>

                            {/* 1. Platform Dropdown */}
                            <div className="md:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Platform</label>
                              <select
                                value={item.platform}
                                onChange={(e) => handleLinkChange(index, 'platform', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                              >
                                {PRESETS.map((p) => (
                                  <option key={p.id} value={p.name}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* 2. Target Destination URL */}
                            <div className="md:col-span-4">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destination URL</label>
                              <div className="relative">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="url"
                                  required
                                  placeholder="https://..."
                                  value={item.url}
                                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 shadow-sm"
                                />
                              </div>
                            </div>

                            {/* 3. Icon URL */}
                            <div className="md:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Icon Image URL</label>
                              <div className="relative">
                                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="url"
                                  placeholder="https://...png"
                                  value={item.icon || ''}
                                  onChange={(e) => handleLinkChange(index, 'icon', e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[11px] font-mono text-slate-600 outline-none focus:border-emerald-500 shadow-sm"
                                />
                              </div>
                            </div>

                            {/* 4. Action Buttons */}
                            <div className="md:col-span-1 flex items-center justify-end gap-1 pt-1 md:pt-4">
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                                  title="Test Destination Link"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                title="Remove Link"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: FOOTER CONTACT & DETAILS */}
            {/* ========================================================= */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 space-y-5 text-xs">
                <div>
                  <h2 className="text-base font-black text-slate-900">Website Footer Contact & Legal Information</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Update phone helpline numbers, support emails, physical office address, and copyright text.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Corporate Office Address</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={footerData.address}
                        onChange={(e) => setFooterData({ ...footerData, address: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium outline-none focus:border-emerald-500"
                        placeholder="#omnninos mohali punjab 160055"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Helpline Phones (Comma-separated)</label>
                      <input
                        type="text"
                        value={footerData.phones.join(', ')}
                        onChange={(e) => setFooterData({ ...footerData, phones: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                        placeholder="+91 9879879879, +91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Support Emails (Comma-separated)</label>
                      <input
                        type="text"
                        value={footerData.emails.join(', ')}
                        onChange={(e) => setFooterData({ ...footerData, emails: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-emerald-500"
                        placeholder="admin@gmail.com, support@healthkangaroo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">About Us Description</label>
                    <textarea
                      rows={3}
                      value={footerData.aboutDescription}
                      onChange={(e) => setFooterData({ ...footerData, aboutDescription: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-emerald-500"
                      placeholder="Providing accessible healthcare solutions..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Copyright Notice</label>
                    <input
                      type="text"
                      value={footerData.copyrightText}
                      onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-emerald-500"
                      placeholder="Copyright © 2026, All Right Reserved Health Kangaroo"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {loading ? 'Saving Changes...' : 'Save & Publish Footer Changes'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}