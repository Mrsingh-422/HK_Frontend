"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Plus,
  Globe,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import UserAPI from "@/app/services/UserAPI";


export default function MyTicketsPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter !== "All" && { status: statusFilter }),
        ...(platformFilter !== "All" && { platform: platformFilter }),
        ...(categoryFilter.trim() && { category: categoryFilter.trim() }),
      };
      const res = await UserAPI.getMyIssues(params);
      if (res.data?.success) {
        setIssues(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, platformFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMyTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMyTickets]);

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
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 md:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl shadow-sm transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <ClipboardList className="text-[#08B36A]" size={28} /> My Reported Issue Tickets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Track real-time progress and resolution history across Web & Mobile apps.
              </p>
            </div>
          </div>

          <Link
            href="/reportissue/report-issue"
            className="bg-[#08B36A] hover:bg-[#079b5c] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} /> Report New Issue
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search title, ticketId, or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#08B36A]"
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

          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="All">All Platforms</option>
            <option value="Web">Web</option>
            <option value="App">Mobile App</option>
            <option value="Android">Android</option>
            <option value="iOS">iOS</option>
          </select>

          <input
            type="text"
            placeholder="Filter by custom category..."
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#08B36A]"
          />
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#08B36A] mx-auto mb-2" />
            <span className="text-xs font-bold">Loading your tickets...</span>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <AlertTriangle className="mx-auto text-slate-300 w-12 h-12" />
            <h3 className="text-base font-bold text-slate-700">No Tickets Found</h3>
            <p className="text-xs text-slate-400">You haven't reported any issues matching the filters.</p>
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
                    <span className="font-mono text-[11px] font-bold text-[#08B36A] bg-emerald-50 px-2 py-0.5 rounded">
                      {item.ticketId || `#${item.issueNumber}`}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-1">
                      {item.platform === "Web" ? <Globe size={10} /> : <Smartphone size={10} />}
                      {item.platform || "Web"}
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
                  <Link
                    href={`/reportissue/track?id=${item._id}`}
                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    Track Progress <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}