"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Globe,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import UserAPI from "@/app/services/UserAPI";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://hk-backend-9jm8.onrender.com";

const LIFECYCLE_STEPS = [
  { key: "OPEN", label: "Ticket Logged", desc: "Submitted by user" },
  { key: "UNDER REVIEW", label: "Under Review", desc: "Support team assigned" },
  { key: "IN PROGRESS", label: "In Progress", desc: "Engineering & troubleshooting" },
  { key: "RESOLVED", label: "Resolved", desc: "Issue fixed & closed" },
];

function TrackIssueContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [ticketInput, setTicketInput] = useState(initialId);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getFullAttachmentUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanBase = BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  const fetchTracking = async (idToSearch) => {
    const searchTarget = (idToSearch || ticketInput).trim();
    if (!searchTarget) {
      setErrorMessage("Please enter an Issue Ticket ID or Record ID.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setTicketData(null);

    try {
      if (searchTarget.length === 24) {
        const res = await UserAPI.trackIssue(searchTarget);
        if (res.data?.success && res.data?.data) {
          setTicketData(res.data.data);
          return;
        }
      }

      const listRes = await UserAPI.getMyIssues({ search: searchTarget, limit: 1 });
      if (listRes.data?.data && listRes.data.data.length > 0) {
        const targetIssue = listRes.data.data[0];
        const trackRes = await UserIssueAPI.trackIssue(targetIssue._id);
        if (trackRes.data?.success && trackRes.data?.data) {
          setTicketData(trackRes.data.data);
          return;
        }
      }

      setErrorMessage(`No active support ticket found matching "${searchTarget}".`);
    } catch (err) {
      console.error("Tracking Error:", err);
      setErrorMessage(
        err.response?.data?.message || "Unable to fetch issue status. Please make sure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const getStepStatus = (stepKey) => {
    if (!ticketData) return "pending";
    const currentStatus = ticketData.status?.toUpperCase() || "OPEN";

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 md:px-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#08B36A] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            24/7 Incident Tracking
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Live Issue & Ticket Status
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
            Enter your Ticket ID (e.g., <span className="font-mono font-bold text-slate-700">HK-ISS-100234</span>) to view real-time diagnostic logs.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-xl border border-slate-200/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTracking(ticketInput);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. HK-ISS-100234)..."
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs md:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#08B36A] hover:bg-[#079b5c] text-white px-7 py-3.5 rounded-2xl text-xs md:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span>Track Ticket</span>
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Tracking Details */}
        {ticketData && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#08B36A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      {ticketData.ticketId || `#${ticketData.issueNumber}`}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      {ticketData.category || "General"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {ticketData.platform === "Web" ? <Globe size={10} /> : <Smartphone size={10} />}
                      {ticketData.platform || "Web"}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-2">{ticketData.title}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ticketData.detailedDescription}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Current Status
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      ticketData.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : ticketData.status === "IN PROGRESS"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : ticketData.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {ticketData.status}
                  </span>
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
            {ticketData.resolutionDetails?.resolutionNote && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck size={20} /> Resolution Note from Support Admin
                </div>
                <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                  {ticketData.resolutionDetails.resolutionNote}
                </p>
                {ticketData.resolutionDetails.resolvedAt && (
                  <span className="text-[11px] text-emerald-700 font-mono block pt-1">
                    Resolved On: {new Date(ticketData.resolutionDetails.resolvedAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
              <h3 className="font-black text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Clock size={18} className="text-[#08B36A]" /> Resolution Audit Timeline
              </h3>

              {ticketData.timeline && ticketData.timeline.length > 0 ? (
                <div className="relative border-l-2 border-[#08B36A]/30 ml-4 pl-6 space-y-6">
                  {ticketData.timeline.map((entry, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="w-3.5 h-3.5 bg-[#08B36A] ring-4 ring-emerald-100 rounded-full absolute -left-[31px] top-1" />
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
                          Logged By: {entry.updatedByName} ({entry.updatedByRole || "Support"})
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
            {ticketData.attachments && ticketData.attachments.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Attached Screenshots & Logs
                </h3>
                <div className="flex flex-wrap gap-3">
                  {ticketData.attachments.map((file, i) => (
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

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <Link
                href="/reportissue/my-tickets"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                ← Back to My Reported Tickets
              </Link>
              <Link
                href="/reportissue/report-issue"
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                Report Another Issue <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackIssuePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs font-bold text-slate-400">Loading Tracker...</div>}>
      <TrackIssueContent />
    </Suspense>
  );
}