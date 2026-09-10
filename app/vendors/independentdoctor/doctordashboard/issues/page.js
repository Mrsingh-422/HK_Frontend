"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Stethoscope,
  Plus,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  X,
  FileText,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Lock,
  Video,
  Hospital,
} from "lucide-react";
import DoctorAPI from "@/app/services/DoctorAPI";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://hk-backend-9jm8.onrender.com";

const LIFECYCLE_STEPS = [
  { key: "OPEN", label: "Ticket Logged", desc: "Submitted by Doctor" },
  { key: "UNDER REVIEW", label: "Under Review", desc: "Assigned to Support" },
  { key: "IN PROGRESS", label: "In Progress", desc: "Troubleshooting" },
  { key: "RESOLVED", label: "Resolved", desc: "Solved & Verified" },
];

export default function DoctorIssuesPage() {
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'create' | 'track'
  const [doctorType, setDoctorType] = useState("Independent Doctor"); // 'Independent Doctor' | 'Hospital Affiliated Doctor'

  // --- List View States ---
  const [issues, setIssues] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- Create Form States ---
  const [formData, setFormData] = useState({
    title: "",
    detailedDescription: "",
    category: "",
    priority: "High",
    platform: "Web",
    appVersion: "Doctor Consultation Panel",
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // --- Tracking State ---
  const [trackingId, setTrackingId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // Alerts
  const [alertBanner, setAlertBanner] = useState(null);
  const [authError, setAuthError] = useState(false);

  const showAlert = (message, type = "success") => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  const doctorCategorySuggestions = [
    "Doctor Video Call Audio Lag",
    "Video Consultation WebRTC Error",
    "Prescription Pad (Rx) Sync Issue",
    "Patient Appointment Booking Conflict",
    "Doctor Consultation Fee Payout",
    "Hospital OPD Schedule Mismatch",
    "Health Locker Patient Records Access",
    "App & Technical Bug",
  ];

  // Auto-detect doctor role variant from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("selectedRole") || localStorage.getItem("userRole");
      if (storedRole?.toLowerCase().includes("hospital")) {
        setDoctorType("Hospital Affiliated Doctor");
      }
    }
  }, []);

  const getFullAttachmentUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanBase = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  // 3.2 FETCH DOCTOR ISSUES LIST
  const fetchIssues = useCallback(async () => {
    setLoadingList(true);
    setAuthError(false);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter !== "All" && { status: statusFilter }),
      };

      const res = await DoctorAPI.getMyIssues(params);
      const data = res?.data || res;
      if (data?.success) {
        setIssues(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.totalRecords || data.data?.length || 0);
      }
    } catch (err) {
      console.error("Doctor fetch error:", err);
      if (err.response?.status === 401) {
        setAuthError(true);
        showAlert("Doctor session expired or missing token. Please log in again.", "error");
      } else {
        showAlert(err.response?.data?.message || "Failed to load doctor tickets", "error");
      }
    } finally {
      setLoadingList(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    if (activeTab === "list") {
      const timer = setTimeout(() => {
        fetchIssues();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchIssues, activeTab]);

  // 3.1 SUBMIT NEW DOCTOR ISSUE
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) {
      showAlert("You can upload a maximum of 5 screenshot attachments.", "error");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.detailedDescription.trim()) {
      showAlert("Please enter both title and detailed explanation.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("detailedDescription", formData.detailedDescription.trim());
      data.append("category", formData.category.trim() || "Doctor Consultation Support");
      data.append("priority", formData.priority);
      data.append("platform", "Web");
      data.append("appVersion", `${doctorType} Portal / Next.js`);

      files.forEach((file) => {
        data.append("attachments", file);
      });

      const res = await DoctorAPI.createIssue(data);
      const resData = res?.data || res;
      if (resData?.success) {
        showAlert("Doctor consultation ticket logged successfully to 24/7 Support!", "success");
        setFormData({
          title: "",
          detailedDescription: "",
          category: "",
          priority: "High",
          platform: "Web",
          appVersion: "Doctor Consultation Panel",
        });
        setFiles([]);
        if (resData.data?._id) {
          setTrackingId(resData.data._id);
          setTrackingData(resData.data);
          setActiveTab("track");
        } else {
          setActiveTab("list");
        }
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      showAlert(err.response?.data?.message || "Failed to submit ticket. Please check doctor login session.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // 3.3 TRACK TICKET
  const handleTrackSearch = async (idToSearch) => {
    const target = (idToSearch || trackingId).trim();
    if (!target) {
      showAlert("Please enter a Ticket ID or Mongo ID.", "error");
      return;
    }

    setLoadingTrack(true);
    setTrackingData(null);
    try {
      if (target.length === 24) {
        const res = await DoctorAPI.trackIssue(target);
        const resData = res?.data || res;
        if (resData?.success && resData?.data) {
          setTrackingData(resData.data);
          return;
        }
      }

      const listRes = await DoctorAPI.getMyIssues({ search: target, limit: 1 });
      const listData = listRes?.data || listRes;
      if (listData?.data && listData.data.length > 0) {
        const issueItem = listData.data[0];
        const trackRes = await DoctorAPI.trackIssue(issueItem._id);
        const trackData = trackRes?.data || trackRes;
        if (trackData?.success && trackData?.data) {
          setTrackingData(trackData.data);
          return;
        }
      }

      showAlert(`No active ticket found matching "${target}".`, "error");
    } catch (err) {
      console.error("Track error:", err);
      showAlert(err.response?.data?.message || "Failed to retrieve tracking details.", "error");
    } finally {
      setLoadingTrack(false);
    }
  };

  const getStepStatus = (stepKey) => {
    if (!trackingData) return "pending";
    const currentStatus = trackingData.status?.toUpperCase() || "OPEN";
    if (currentStatus === "REJECTED" || currentStatus === "CLOSED") {
      return stepKey === "OPEN" ? "completed" : "pending";
    }
    const stepOrder = ["OPEN", "UNDER REVIEW", "IN PROGRESS", "RESOLVED"];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const thisIndex = stepOrder.indexOf(stepKey);
    if (thisIndex < currentIndex) return "completed";
    if (thisIndex === currentIndex) return "active";
    return "pending";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case "IN PROGRESS":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case "OPEN":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">OPEN</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Global Toast */}
        {alertBanner && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in duration-200 ${
            alertBanner.type === "error" ? "bg-rose-50 border border-rose-200 text-rose-800" : "bg-cyan-50 border border-cyan-200 text-cyan-800"
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)}><X size={16} /></button>
          </div>
        )}

        {/* Header with Back Button & Doctor Role Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl shadow-sm transition"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Stethoscope className="text-cyan-600" size={28} /> Doctor Incident & Consultation Desk
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  {doctorType === "Hospital Affiliated Doctor" ? <Hospital size={10} /> : <Stethoscope size={10} />}
                  {doctorType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Report video call latency, Rx pad synchronization errors, and monitor live troubleshooting.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "list" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ClipboardList size={14} /> My Doctor Tickets
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "create" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Plus size={14} /> Log Consultation Issue
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === "track" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Clock size={14} /> Live Tracker
            </button>
          </div>
        </div>

        {/* 401 Session Warning Alert */}
        {authError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-bold">
            <Lock className="text-amber-600 shrink-0" size={18} />
            <div className="flex-1">
              <span>Authentication token is missing or expired for your doctor session. Please re-login.</span>
            </div>
            <button
              onClick={fetchIssues}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MY DOCTOR TICKETS LIST */}
        {/* ========================================================================= */}
        {activeTab === "list" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search in title, category, or Ticket ID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            {/* List */}
            {loadingList ? (
              <div className="text-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mx-auto mb-2" />
                <span className="text-xs font-bold">Fetching doctor incident records...</span>
              </div>
            ) : issues.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                <AlertTriangle className="mx-auto text-slate-300 w-12 h-12" />
                <h3 className="text-base font-bold text-slate-700">No Incident Records Found</h3>
                <p className="text-xs text-slate-400">No active tickets reported under your doctor account.</p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  Log An Issue Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                          {item.ticketId || `#${item.issueNumber}`}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Priority: {item.priority || "High"}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-500 truncate max-w-xl">{item.detailedDescription}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right text-[11px] text-slate-400 font-mono">
                        <Calendar size={12} className="inline mr-1" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                      <button
                        onClick={() => {
                          setTrackingId(item._id);
                          setTrackingData(item);
                          setActiveTab("track");
                        }}
                        className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        Track Progress <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Doctor Tickets: {totalRecords} | Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loadingList}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loadingList}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LOG NEW DOCTOR ISSUE */}
        {/* ========================================================================= */}
        {activeTab === "create" && (
          <form
            onSubmit={handleCreateSubmit}
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-5 animate-in fade-in duration-200"
          >
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="text-cyan-600" size={20} /> Report Doctor Consultation Anomaly
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit video call latency, patient Rx pad sync errors, or schedule conflicts.
              </p>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Issue Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Video consultation audio lagging on patient connect"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            {/* Open Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category / Domain (Open Text)
              </label>
              <input
                type="text"
                placeholder="Type custom category (e.g. Rx Pad Sync Glitch, OPD Calendar Lag)..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Sparkles size={10} /> Doctor Presets:
                </span>
                {doctorCategorySuggestions.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 rounded-md text-[10px] font-bold transition"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-cyan-500"
              >
                <option value="Urgent">Urgent (Active consultation interrupted)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Detailed Problem Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Include appointment IDs, patient tokens, browser details, or exact error messages..."
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Attach Screenshots or Logs (Max 5)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-cyan-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 transition relative">
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
                      <FileText size={12} className="text-cyan-600" />
                      <span className="truncate max-w-[140px]">{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-rose-500 hover:text-rose-700">
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
                onClick={() => setActiveTab("list")}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Submit Doctor Issue
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LIVE STEPPER TRACKER */}
        {/* ========================================================================= */}
        {activeTab === "track" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-md border border-slate-200/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTrackSearch(trackingId);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter Ticket ID (e.g. HK-ISS-100234) or Mongo _id..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-bold text-slate-800 outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingTrack}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-2xl text-xs md:text-sm font-bold shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingTrack ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>Track Ticket</span>
                </button>
              </form>
            </div>

            {trackingData && (
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">
                          {trackingData.ticketId || `#${trackingData.issueNumber}`}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          {trackingData.category}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 mt-2">{trackingData.title}</h2>
                      <p className="text-xs text-slate-600 mt-1">{trackingData.detailedDescription}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Current Status
                      </span>
                      {getStatusBadge(trackingData.status)}
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {LIFECYCLE_STEPS.map((step, idx) => {
                        const status = getStepStatus(step.key);
                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              status === "completed"
                                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                                : status === "active"
                                ? "bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/20"
                                : "bg-slate-50 border-slate-200/80 text-slate-400"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {status === "completed" ? (
                                <CheckCircle2 size={16} className="text-emerald-600" />
                              ) : status === "active" ? (
                                <Clock size={16} className="text-amber-600 animate-pulse" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                              )}
                              <span className="text-xs font-black uppercase">{step.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">{step.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resolution Note */}
                {trackingData.resolutionDetails?.resolutionNote && (
                  <div className="bg-cyan-50 border border-cyan-200 p-6 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                      <ShieldCheck size={20} /> Resolution Note from Support Team
                    </div>
                    <p className="text-xs text-cyan-950 font-medium leading-relaxed">
                      {trackingData.resolutionDetails.resolutionNote}
                    </p>
                    {trackingData.resolutionDetails.resolvedAt && (
                      <span className="text-[11px] text-cyan-700 font-mono block pt-1">
                        Resolved On: {new Date(trackingData.resolutionDetails.resolvedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                  <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
                    <Clock size={18} className="text-cyan-600" /> Resolution Audit Timeline
                  </h3>

                  {trackingData.timeline && trackingData.timeline.length > 0 ? (
                    <div className="relative border-l-2 border-cyan-500/30 ml-4 pl-6 space-y-6">
                      {trackingData.timeline.map((entry, idx) => (
                        <div key={idx} className="relative space-y-1">
                          <div className="w-3.5 h-3.5 bg-cyan-600 ring-4 ring-cyan-100 rounded-full absolute -left-[31px] top-1" />
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                              {entry.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{entry.note}</p>
                          {entry.updatedByName && (
                            <span className="text-[10px] text-indigo-600 font-bold block pt-0.5">
                              Updated By: {entry.updatedByName} ({entry.updatedByRole || "Support"})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No timeline entries recorded yet.</p>
                  )}
                </div>

                {/* Attachments */}
                {trackingData.attachments && trackingData.attachments.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Uploaded Diagnostic Screenshots & Logs
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {trackingData.attachments.map((file, i) => (
                        <a
                          key={i}
                          href={getFullAttachmentUrl(file)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-28 h-28 rounded-2xl border border-slate-200 overflow-hidden block hover:scale-105 transition shadow-sm relative group"
                        >
                          <img
                            src={getFullAttachmentUrl(file)}
                            alt={`Attachment ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                            <ExternalLink size={16} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}