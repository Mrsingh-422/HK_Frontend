"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Upload,
  CheckCircle2,
  ArrowRight,
  Loader2,
  X,
  FileText,
  ShieldAlert,
  Clock,
  ArrowLeft,
  Globe,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import UserAPI from "@/app/services/UserAPI";

export default function ReportIssuePage() {
  const [formData, setFormData] = useState({
    title: "",
    detailedDescription: "",
    category: "",
    priority: "Medium",
    platform: "Web",
    appVersion: "Web Browser / Next.js",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorBanner, setErrorBanner] = useState("");

  // Category suggestions (user can click or freely type anything)
  const categorySuggestions = [
    "Health Locker",
    "Doctor Video Call Audio",
    "Hospital Bed Booking",
    "Service Booking",
    "Payment Issue",
    "Ambulance Delay",
    "App & Technical Bug",
    "Profile Settings",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFormData((prev) => ({
        ...prev,
        appVersion: `${navigator.userAgent.split(" ").slice(-2).join(" ")} (Web)`,
      }));
    }
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      setErrorBanner("You can upload a maximum of 5 screenshot attachments.");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    setErrorBanner("");
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner("");

    if (!formData.title.trim() || !formData.detailedDescription.trim()) {
      setErrorBanner("Please fill in both the issue title and detailed description.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("detailedDescription", formData.detailedDescription.trim());
      data.append("category", formData.category.trim() || "General Support");
      data.append("priority", formData.priority);
      data.append("platform", formData.platform);
      data.append("appVersion", formData.appVersion);

      files.forEach((file) => {
        data.append("attachments", file);
      });

      const res = await UserAPI.createIssue(data);
      if (res.data?.success) {
        setSubmittedTicket(res.data.data);
      }
    } catch (err) {
      console.error("Submit issue error:", err);
      setErrorBanner(
        err.response?.data?.message || "Failed to submit issue. Please check your login session."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Issue Ticket Submitted!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Our engineering & support team is reviewing your ticket.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Ticket ID</span>
              <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {submittedTicket.ticketId}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Platform / Category</span>
              <span className="font-bold text-slate-700">
                {submittedTicket.platform || "Web"} • {submittedTicket.category}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Initial Status</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                {submittedTicket.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/reportissue/track?id=${submittedTicket._id}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Clock size={16} /> Track Live Progress
            </Link>
            <Link
              href="/reportissue/my-tickets"
              className="flex-1 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              My Tickets <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 md:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Link
            href="/reportissue/my-tickets"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            My Tickets <ArrowRight size={14} />
          </Link>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="text-amber-500" size={28} /> Report an Issue or Glitch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit issue details, open custom category, and error screenshots for quick troubleshooting.
          </p>
        </div>

        {errorBanner && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner("")}><X size={16} /></button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5"
        >
          {/* Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Issue Headline / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Video consultation audio lagging on web chrome"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Open Category (Free-form text) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Category / Domain (Open Text)
            </label>
            <input
              type="text"
              placeholder="Type any custom category (e.g. Doctor Video Call Audio, Ambulance SOS Delay)..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 mb-2"
            />
            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Sparkles size={10} /> Suggestions:
              </span>
              {categorySuggestions.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md text-[10px] font-bold transition"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reporting Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option value="Web">Web (Browser / Desktop)</option>
                <option value="App">Mobile App</option>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
              </select>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Patient voice is breaking every 5 seconds on web chrome. Error code 503 observed..."
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Screenshots Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Attach Screenshots / Logs (Max 5)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 transition relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="mx-auto text-slate-400 mb-2" size={24} />
              <p className="text-xs font-bold text-slate-700">Click or drag & drop screenshots here</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, PDF (Up to 5 files)</p>
            </div>

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <FileText size={12} className="text-indigo-600" />
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#08B36A] hover:bg-[#079b5c] text-white px-8 py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}