'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserX,
  UserCheck,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
  X,
  Check,
  Ban,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import AdminAPI from '@/app/services/AdminAPI2';

export default function BannedUsersPage() {
  // --- View Mode State ---
  const [activeTab, setActiveTab] = useState('banned'); // 'banned' | 'requests'

  // --- 1. Banned Users State ---
  const [bannedUsers, setBannedUsers] = useState([]);
  const [bannedLoading, setBannedLoading] = useState(false);
  const [bannedCurrentPage, setBannedCurrentPage] = useState(1);
  const [bannedTotalPages, setBannedTotalPages] = useState(1);
  const [bannedTotalCount, setBannedTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Direct Unban Confirmation Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- 2. Unban Requests State ---
  const [unbanRequests, setUnbanRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected'
  const [requestPage, setRequestPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);
  const [requestTotalCount, setRequestTotalCount] = useState(0);

  // Request Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' | 'Rejected'
  const [adminComments, setAdminComments] = useState('');

  // Global Alert Banner
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  // =========================================================================
  // API CALLS
  // =========================================================================

  // 1. Fetch Banned Users
  const fetchBannedUsers = useCallback(async (page = 1) => {
    setBannedLoading(true);
    try {
      const res = await AdminAPI.getBannedUsers(page, 10);
      if (res.data?.success || res.status === 200) {
        const users = res.data.data || res.data.users || res.data.bannedUsers || [];
        setBannedUsers(users);
        setBannedTotalPages(res.data.totalPages || 1);
        setBannedTotalCount(res.data.totalUsers || res.data.total || users.length);
        setBannedCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching banned users:', err);
      showAlert(err.response?.data?.message || 'Failed to fetch banned users.', 'error');
    } finally {
      setBannedLoading(false);
    }
  }, []);

  // 2. Fetch Unban Appeals / Requests
  const fetchUnbanRequests = useCallback(async (status = 'Pending', page = 1) => {
    setRequestsLoading(true);
    try {
      const res = await AdminAPI.getUnbanRequests(status, page, 10);
      if (res.data?.success || res.status === 200) {
        const requests = res.data.data || res.data.requests || [];
        setUnbanRequests(requests);
        setRequestTotalPages(res.data.totalPages || 1);
        setRequestTotalCount(res.data.totalRequests || res.data.total || requests.length);
        setRequestPage(page);
      }
    } catch (err) {
      console.error('Error fetching unban requests:', err);
      showAlert(err.response?.data?.message || 'Failed to fetch unban requests.', 'error');
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'banned') {
      fetchBannedUsers(bannedCurrentPage);
    } else {
      fetchUnbanRequests(requestStatusFilter, requestPage);
    }
  }, [activeTab, bannedCurrentPage, requestStatusFilter, requestPage, fetchBannedUsers, fetchUnbanRequests]);

  // 3. Handle Direct Unban
  const handleUnbanConfirm = async () => {
    const userId = selectedUser?._id || selectedUser?.id || selectedUser?.userId;
    if (!userId) {
      showAlert('User ID is missing.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await AdminAPI.unbanUser(userId, {});
      if (res.data?.success || res.status === 200) {
        showAlert(
          res.data?.message || `${selectedUser.name || 'User'} has been unbanned successfully!`,
          'success'
        );
        setSelectedUser(null);
        fetchBannedUsers(bannedCurrentPage);
      }
    } catch (err) {
      console.error('Unban error details:', err.response || err);
      showAlert(err.response?.data?.message || 'Failed to unban user.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Handle Review Unban Request (Approve / Reject)
  const handleReviewRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest?._id) return;

    setActionLoading(true);
    try {
      const payload = {
        action: reviewAction,
        adminComments: adminComments.trim(),
      };

      const res = await AdminAPI.reviewUnbanRequest(selectedRequest._id, payload);
      if (res.data?.success || res.status === 200) {
        showAlert(
          res.data?.message || `Request marked as ${reviewAction} successfully!`,
          'success'
        );
        setSelectedRequest(null);
        setAdminComments('');
        fetchUnbanRequests(requestStatusFilter, requestPage);
        // Refresh banned users list as well if approved
        if (reviewAction === 'Approved') {
          fetchBannedUsers(bannedCurrentPage);
        }
      }
    } catch (err) {
      console.error('Review unban request error:', err.response || err);
      showAlert(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Search Filter for Banned Users
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return bannedUsers.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user._id?.toLowerCase().includes(query)
      );
    });
  }, [bannedUsers, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`mb-5 p-4 rounded-2xl flex items-center justify-between text-sm font-medium shadow-sm transition-all animate-in fade-in duration-200 ${
            alertBanner.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertBanner.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{alertBanner.message}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-600 rounded-2xl text-white shadow-sm">
              <UserX className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Banned Users & Unban Governance Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review suspended accounts, process public unban requests, and maintain platform security.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'banned') fetchBannedUsers(bannedCurrentPage);
            else fetchUnbanRequests(requestStatusFilter, requestPage);
          }}
          disabled={bannedLoading || requestsLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${bannedLoading || requestsLoading ? 'animate-spin text-rose-600' : 'text-slate-600'}`} />
          Refresh Data
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Banned Users</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{bannedTotalCount}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{requestStatusFilter} Appeals</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{requestTotalCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Mode</p>
            <h3 className="text-base font-black text-slate-800 mt-1">
              {activeTab === 'banned' ? 'Direct Directory' : 'Appeals Queue'}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('banned')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'banned'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <UserX className="w-4 h-4" /> Banned Users Directory ({bannedTotalCount})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Public Unban Appeals
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BANNED USERS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'banned' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone number, email or User ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">User Details</th>
                    <th className="py-4 px-5">Contact Info</th>
                    <th className="py-4 px-5">Ban Reason</th>
                    <th className="py-4 px-5">Banned Date</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {bannedLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                          <span className="font-bold">Loading banned accounts...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-400 font-medium">
                        No banned users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id || user.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900">{user.name || 'Unnamed User'}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {user._id || user.id}</div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1 text-slate-600">
                            {user.phone && (
                              <span className="flex items-center gap-1.5 font-medium">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {user.phone}
                              </span>
                            )}
                            {user.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {user.email}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className="inline-block px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-lg font-bold">
                            {user.banReason || user.reason || 'Violation of terms & cancellation policy'}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-slate-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {user.bannedAt || user.updatedAt ? new Date(user.bannedAt || user.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold shadow-sm transition active:scale-95"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Unban Account
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{bannedCurrentPage}</span> of{' '}
                <span className="font-bold text-slate-700">{bannedTotalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBannedCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={bannedCurrentPage === 1 || bannedLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBannedCurrentPage((p) => Math.min(p + 1, bannedTotalPages))}
                  disabled={bannedCurrentPage === bannedTotalPages || bannedLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UNBAN REQUESTS & APPEALS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setRequestStatusFilter(status);
                    setRequestPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    requestStatusFilter === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {status} Appeals
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total {requestStatusFilter}: {requestTotalCount}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">User Phone</th>
                    <th className="py-4 px-5">Submitted Reason</th>
                    <th className="py-4 px-5">Submission Date</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {requestsLoading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
                          <span className="font-bold">Loading unban appeals...</span>
                        </div>
                      </td>
                    </tr>
                  ) : unbanRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-400 font-medium">
                        No {requestStatusFilter.toLowerCase()} unban requests found.
                      </td>
                    </tr>
                  ) : (
                    unbanRequests.map((req) => (
                      <tr key={req._id || req.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-5 font-bold text-slate-900">
                          {req.phone || 'N/A'}
                        </td>

                        <td className="py-4 px-5 text-slate-600 max-w-sm">
                          <p className="truncate font-medium" title={req.reason}>
                            {req.reason || 'No explanation provided'}
                          </p>
                        </td>

                        <td className="py-4 px-5 text-slate-500 font-medium">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                        </td>

                        <td className="py-4 px-5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              req.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : req.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          {req.status === 'Pending' ? (
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setReviewAction('Approved');
                                setAdminComments('');
                              }}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Review Appeal
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              {req.adminComments ? `Note: "${req.adminComments}"` : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-700">{requestPage}</span> of{' '}
                <span className="font-bold text-slate-700">{requestTotalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRequestPage((p) => Math.max(p - 1, 1))}
                  disabled={requestPage === 1 || requestsLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRequestPage((p) => Math.min(p + 1, requestTotalPages))}
                  disabled={requestPage === requestTotalPages || requestsLoading}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DIRECT UNBAN CONFIRMATION */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Unban User Account</h3>
                <p className="text-xs text-slate-500">Restore user platform privileges immediately</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Are you sure you want to unban{' '}
                <strong className="text-slate-900">{selectedUser.name || 'this account'}</strong>?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div><span className="font-semibold text-slate-400">User ID:</span> <span className="font-mono">{selectedUser._id || selectedUser.id}</span></div>
                {selectedUser.phone && <div><span className="font-semibold text-slate-400">Phone:</span> {selectedUser.phone}</div>}
                {selectedUser.email && <div><span className="font-semibold text-slate-400">Email:</span> {selectedUser.email}</div>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnbanConfirm}
                disabled={actionLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Confirm Unban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UNBAN REQUEST REVIEW */}
      {/* ========================================================================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" /> Review Public Appeal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Phone: <span className="font-bold text-slate-800">{selectedRequest.phone}</span></p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewRequestSubmit} className="space-y-4 mt-4">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">User's Submitted Reason:</span>
                <p className="text-xs text-slate-700 font-medium italic">"{selectedRequest.reason || 'No explanation provided'}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Review Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('Approved')}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      reviewAction === 'Approved'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-4 h-4" /> Approve & Unban
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('Rejected')}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      reviewAction === 'Rejected'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Ban className="w-4 h-4" /> Reject Appeal
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Admin Comments / Audit Log</label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    reviewAction === 'Approved'
                      ? 'e.g., Approved on genuine explanation. First-time warning issued.'
                      : 'e.g., Repeated fake SOS calls detected.'
                  }
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-slate-900/10 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 inline-flex items-center gap-2 ${
                    reviewAction === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Submit {reviewAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}