"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 👈 Fixed: Added useMemo
import { 
  Users, Crown, Search, RefreshCw, Eye, Plus, Edit2, Trash2, 
  CheckCircle2, Clock, 
  CreditCard, HeartPulse, AlertCircle, 
  X, ChevronLeft, ChevronRight, Loader2,
  Stethoscope, UserCheck, Ambulance, Pill, Layers,
  Package, FolderPlus
} from 'lucide-react';
import AdminAPI from '@/app/services/AdminAPI2'; // 👈 Centralized API service

export default function AdminSubscriptionPage() {
  const [activeTab, setActiveTab] = useState('subscribers'); // 'subscribers' | 'plans' | 'categories'

  // =========================================================================
  // 1. SUBSCRIBERS STATE
  // =========================================================================
  const [subscribers, setSubscribers] = useState([]);
  const [overview, setOverview] = useState({ totalActiveSubscribers: 0, totalExpiredSubscribers: 0, totalPaidSubscriptions: 0 });
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotalRecords, setSubTotalRecords] = useState(0);

  // Subscriber Filters
  const [subSearch, setSubSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState('All');
  const [subDiseaseFilter, setSubDiseaseFilter] = useState('All');

  // Single Subscriber Drawer State
  const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);
  const [subscriberDetail, setSubscriberDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =========================================================================
  // 2. MASTER PLANS STATE
  // =========================================================================
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planCurrentPage, setPlanCurrentPage] = useState(1);
  const [planTotalPages, setPlanTotalPages] = useState(1);
  const [planTotalRecords, setPlanTotalRecords] = useState(0);

  // Master Categories & Diseases
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterDiseases, setMasterDiseases] = useState([]);

  // Plan Filters
  const [planSearch, setPlanSearch] = useState('');
  const [planCategoryFilter, setPlanCategoryFilter] = useState('All');
  const [planDiseaseFilter, setPlanDiseaseFilter] = useState('All');

  // Plan Modal (Create / Edit) State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [fetchingPlanDetail, setFetchingPlanDetail] = useState(false);

  const [planFormData, setPlanFormData] = useState({
    categoryId: '',
    diseaseIds: [],
    name: '',
    validityInDays: 30,
    price: 2999,
    description: '',
    termsAndConditions: '',
    features: [''],
    benefits: {
      freeDoctorAppointmentsCount: 2,
      freeNurseVisitsCount: 4,
      freeAmbulanceTripsCount: 1,
      freeLabDeliveriesCount: 2,
      freePharmacyDeliveriesCount: 5,
    },
    isActive: true,
  });

  // =========================================================================
  // 3. CATEGORY & DISEASE CRUD STATES
  // =========================================================================
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    iconImage: '',
    isDiseaseSpecific: true,
    displayOrder: 1,
    isActive: true,
  });

  const [diseaseModalOpen, setDiseaseModalOpen] = useState(false);
  const [editingDiseaseId, setEditingDiseaseId] = useState(null);
  const [diseaseFormData, setDiseaseFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    iconImage: '',
    isActive: true,
  });

  // Global Toast
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  // Detect if currently selected category in modal requires disease selection
  const selectedCategoryMeta = useMemo(() => {
    return masterCategories.find(c => c._id === planFormData.categoryId) || null;
  }, [masterCategories, planFormData.categoryId]);

  const isCurrentCategoryDiseaseSpecific = selectedCategoryMeta 
    ? Boolean(selectedCategoryMeta.isDiseaseSpecific) 
    : false;

  // Filter diseases belonging to selected category
  const availableDiseasesForPlan = useMemo(() => {
    if (!planFormData.categoryId) return masterDiseases;
    return masterDiseases.filter(d => (d.categoryId?._id || d.categoryId) === planFormData.categoryId);
  }, [masterDiseases, planFormData.categoryId]);

  // --- 1. Load Master Categories & Diseases ---
  const fetchMasterDropdowns = useCallback(async () => {
    try {
      const [catsRes, disRes] = await Promise.allSettled([
        AdminAPI.getSubscriptionCategories(),
        AdminAPI.getSubscriptionDiseases()
      ]);

      if (catsRes.status === 'fulfilled' && (catsRes.value.data?.success || catsRes.value.status === 200)) {
        setMasterCategories(catsRes.value.data?.data || []);
      }
      if (disRes.status === 'fulfilled' && (disRes.value.data?.success || disRes.value.status === 200)) {
        setMasterDiseases(disRes.value.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories/diseases dropdowns:', err);
    }
  }, []);

  // --- 2. Fetch Subscribed Users (API 4.1) ---
  const fetchSubscribers = useCallback(async () => {
    setSubscribersLoading(true);
    try {
      const params = {
        page: subCurrentPage,
        limit: 10,
        ...(subSearch.trim() && { search: subSearch.trim() }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(subCategoryFilter !== 'All' && { categoryId: subCategoryFilter }),
        ...(subDiseaseFilter !== 'All' && { diseaseId: subDiseaseFilter }),
      };

      const res = await AdminAPI.getSubscribedUsers(params);
      if (res.data?.success || res.status === 200) {
        setSubscribers(res.data.data || []);
        setSubTotalPages(res.data.totalPages || 1);
        setSubTotalRecords(res.data.totalRecords || res.data.count || 0);
        if (res.data.overview) setOverview(res.data.overview);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      showAlert(err.response?.data?.message || 'Failed to load subscribers list', 'error');
    } finally {
      setSubscribersLoading(false);
    }
  }, [subCurrentPage, subSearch, statusFilter, subCategoryFilter, subDiseaseFilter]);

  // --- 3. Fetch Master Plans (API 3.2) ---
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const params = {
        page: planCurrentPage,
        limit: 10,
        ...(planSearch.trim() && { search: planSearch.trim() }),
        ...(planCategoryFilter !== 'All' && { categoryId: planCategoryFilter }),
        ...(planDiseaseFilter !== 'All' && { diseaseId: planDiseaseFilter }),
      };

      const res = await AdminAPI.getMasterSubscriptionPlans(params);
      if (res.data?.success || res.status === 200) {
        setPlans(res.data.data || []);
        setPlanTotalPages(res.data.totalPages || 1);
        setPlanTotalRecords(res.data.totalRecords || res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      showAlert(err.response?.data?.message || 'Failed to load subscription plans', 'error');
    } finally {
      setPlansLoading(false);
    }
  }, [planCurrentPage, planSearch, planCategoryFilter, planDiseaseFilter]);

  useEffect(() => {
    fetchMasterDropdowns();
  }, [fetchMasterDropdowns]);

  useEffect(() => {
    if (activeTab === 'subscribers') {
      const timer = setTimeout(() => fetchSubscribers(), 350);
      return () => clearTimeout(timer);
    } else if (activeTab === 'plans') {
      const timer = setTimeout(() => fetchPlans(), 350);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchSubscribers, fetchPlans]);

  // --- View Single Subscriber Detail (API 4.2) ---
  const fetchSubscriberDetail = async (id) => {
    setSelectedSubscriberId(id);
    setDetailLoading(true);
    try {
      const res = await AdminAPI.getSingleSubscriber(id);
      if (res.data?.success || res.status === 200) {
        setSubscriberDetail(res.data.data);
      }
    } catch (err) {
      console.error('Error loading subscriber detail:', err);
      showAlert('Could not load subscriber details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================================
  // PLANS: CREATE / EDIT / DELETE (3.1, 3.4, 3.5)
  // =========================================================================
  const handleOpenPlanModal = async (planId = null) => {
    if (planId) {
      setEditingPlanId(planId);
      setPlanModalOpen(true);
      setFetchingPlanDetail(true);

      try {
        const res = await AdminAPI.getSingleSubscriptionPlan(planId);
        if (res.data?.success || res.status === 200) {
          const plan = res.data.data;
          setPlanFormData({
            categoryId: plan.categoryId?._id || plan.categoryId || '',
            diseaseIds: plan.diseaseIds?.map(d => d._id || d) || [],
            name: plan.name || '',
            validityInDays: Number(plan.validityInDays) || 30,
            price: Number(plan.price) || 0,
            description: plan.description || '',
            termsAndConditions: plan.termsAndConditions || '',
            features: plan.features && plan.features.length > 0 ? plan.features : [''],
            benefits: {
              freeDoctorAppointmentsCount: Number(plan.benefits?.freeDoctorAppointmentsCount || 0),
              freeNurseVisitsCount: Number(plan.benefits?.freeNurseVisitsCount || 0),
              freeAmbulanceTripsCount: Number(plan.benefits?.freeAmbulanceTripsCount || 0),
              freeLabDeliveriesCount: Number(plan.benefits?.freeLabDeliveriesCount || 0),
              freePharmacyDeliveriesCount: Number(plan.benefits?.freePharmacyDeliveriesCount || 0),
            },
            isActive: plan.isActive !== false,
          });
        }
      } catch (err) {
        console.error('Error fetching plan:', err);
        showAlert('Failed to retrieve plan details', 'error');
      } finally {
        setFetchingPlanDetail(false);
      }
    } else {
      setEditingPlanId(null);
      const defaultCat = masterCategories[0]?._id || '';
      setPlanFormData({
        categoryId: defaultCat,
        diseaseIds: [],
        name: '',
        validityInDays: 30,
        price: 2999,
        description: '',
        termsAndConditions: '',
        features: ['Priority Doctor Consultations', 'Free Home Nurse Visits'],
        benefits: {
          freeDoctorAppointmentsCount: 2,
          freeNurseVisitsCount: 4,
          freeAmbulanceTripsCount: 1,
          freeLabDeliveriesCount: 2,
          freePharmacyDeliveriesCount: 5,
        },
        isActive: true,
      });
      setPlanModalOpen(true);
    }
  };

  // --- SUBMIT PLAN: HANDLES CASE 1 (ELDER CARE) & CASE 2 (CONDITION MANAGEMENT) ---
  const handlePlanFormSubmit = async (e) => {
    e.preventDefault();
    if (!planFormData.categoryId) {
      showAlert('Please select a Master Category', 'error');
      return;
    }

    setSavingPlan(true);
    try {
      // 1. Base Payload
      const payload = {
        categoryId: planFormData.categoryId,
        name: planFormData.name.trim(),
        validityInDays: Number(planFormData.validityInDays),
        price: Number(planFormData.price),
        description: planFormData.description?.trim() || '',
        termsAndConditions: planFormData.termsAndConditions?.trim() || '',
        features: planFormData.features.filter(f => f.trim().length > 0),
        benefits: {
          freeDoctorAppointmentsCount: Number(planFormData.benefits.freeDoctorAppointmentsCount || 0),
          freeNurseVisitsCount: Number(planFormData.benefits.freeNurseVisitsCount || 0),
          freeAmbulanceTripsCount: Number(planFormData.benefits.freeAmbulanceTripsCount || 0),
          freeLabDeliveriesCount: Number(planFormData.benefits.freeLabDeliveriesCount || 0),
          freePharmacyDeliveriesCount: Number(planFormData.benefits.freePharmacyDeliveriesCount || 0),
        },
        isActive: planFormData.isActive !== false
      };

      // 2. Conditional Disease Attachment (CASE 1 vs CASE 2)
      if (isCurrentCategoryDiseaseSpecific) {
        payload.diseaseIds = planFormData.diseaseIds || [];
      }

      if (editingPlanId) {
        const res = await AdminAPI.updateSubscriptionPlan(editingPlanId, payload);
        showAlert(res.data?.message || 'Subscription plan updated successfully!');
      } else {
        const res = await AdminAPI.createSubscriptionPlan(payload);
        showAlert(res.data?.message || 'Subscription plan created successfully!');
      }

      setPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Plan save error:', err);
      showAlert(err.response?.data?.message || 'Failed to save subscription plan', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId, name) => {
    if (!confirm(`Are you sure you want to delete "${name || 'this plan'}"?`)) return;
    try {
      const res = await AdminAPI.deleteSubscriptionPlan(planId);
      showAlert(res.data?.message || 'Plan deleted successfully.');
      fetchPlans();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete plan', 'error');
    }
  };

  // =========================================================================
  // CATEGORIES: CREATE / EDIT / DELETE (1.1, 1.3, 1.4)
  // =========================================================================
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategoryId(cat._id);
      setCategoryFormData({
        name: cat.name || '',
        description: cat.description || '',
        iconImage: cat.iconImage || '',
        isDiseaseSpecific: cat.isDiseaseSpecific !== false,
        displayOrder: cat.displayOrder || 1,
        isActive: cat.isActive !== false,
      });
    } else {
      setEditingCategoryId(null);
      setCategoryFormData({
        name: '',
        description: '',
        iconImage: '',
        isDiseaseSpecific: true,
        displayOrder: masterCategories.length + 1,
        isActive: true,
      });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        const res = await AdminAPI.updateSubscriptionCategory(editingCategoryId, categoryFormData);
        showAlert(res.data?.message || 'Category updated successfully!');
      } else {
        const res = await AdminAPI.createSubscriptionCategory(categoryFormData);
        showAlert(res.data?.message || 'Category created successfully!');
      }
      setCategoryModalOpen(false);
      fetchMasterDropdowns();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete Category "${catName}"?`)) return;
    try {
      const res = await AdminAPI.deleteSubscriptionCategory(catId);
      showAlert(res.data?.message || 'Category deleted successfully!');
      fetchMasterDropdowns();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Cannot delete category. Active plans are currently linked to it.', 'error');
    }
  };

  // =========================================================================
  // DISEASES: CREATE / EDIT / DELETE (2.1, 2.3, 2.4)
  // =========================================================================
  const handleOpenDiseaseModal = (dis = null) => {
    if (dis) {
      setEditingDiseaseId(dis._id);
      setDiseaseFormData({
        categoryId: dis.categoryId?._id || dis.categoryId || '',
        name: dis.name || '',
        description: dis.description || '',
        iconImage: dis.iconImage || '',
        isActive: dis.isActive !== false,
      });
    } else {
      setEditingDiseaseId(null);
      setDiseaseFormData({
        categoryId: masterCategories.find(c => c.isDiseaseSpecific)?._id || masterCategories[0]?._id || '',
        name: '',
        description: '',
        iconImage: '',
        isActive: true,
      });
    }
    setDiseaseModalOpen(true);
  };

  const handleDiseaseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDiseaseId) {
        const res = await AdminAPI.updateSubscriptionDisease(editingDiseaseId, diseaseFormData);
        showAlert(res.data?.message || 'Disease updated successfully!');
      } else {
        const res = await AdminAPI.createSubscriptionDisease(diseaseFormData);
        showAlert(res.data?.message || 'Disease added successfully!');
      }
      setDiseaseModalOpen(false);
      fetchMasterDropdowns();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save disease', 'error');
    }
  };

  const handleDeleteDisease = async (disId, disName) => {
    if (!confirm(`Are you sure you want to delete Disease "${disName}"?`)) return;
    try {
      const res = await AdminAPI.deleteSubscriptionDisease(disId);
      showAlert(res.data?.message || 'Disease deleted successfully!');
      fetchMasterDropdowns();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete disease', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">● Active</span>;
      case 'Expired':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">Expired</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">{status || 'Pending'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Global Toast Alert */}
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

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Crown className="text-amber-500" size={30} /> Health Kangaroo Dynamic Subscriptions & VIP Club
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Elder Care & Condition Management plans with multi-disease configuration and automated benefit consumption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenPlanModal()}
              className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus size={15} /> + Create Master Plan
            </button>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <FolderPlus size={15} /> + Add Category
            </button>
            <button
              onClick={() => handleOpenDiseaseModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <HeartPulse size={15} /> + Add Disease
            </button>
            <button
              onClick={() => { if (activeTab === 'subscribers') fetchSubscribers(); else fetchPlans(); }}
              disabled={subscribersLoading || plansLoading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={subscribersLoading || plansLoading ? 'animate-spin text-amber-500' : ''} />
            </button>
          </div>
        </div>

        {/* Top 3 KPI Cards from 4.1 Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Subscribers</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{overview.totalActiveSubscribers}</h3>
              <span className="text-[11px] font-semibold text-slate-400">Receiving VIP Care</span>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Subscriptions</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{overview.totalPaidSubscriptions}</h3>
              <span className="text-[11px] font-semibold text-indigo-600">Settled Razorpay Orders</span>
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expired Plans</span>
              <h3 className="text-2xl font-black text-slate-500 mt-1">{overview.totalExpiredSubscribers}</h3>
              <span className="text-[11px] font-semibold text-slate-400">Renewal Candidates</span>
            </div>
            <div className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'subscribers'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users size={15} /> 4. Subscribed Users Queue ({subTotalRecords})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'plans'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Package size={15} /> 3. Master Subscription Packages ({planTotalRecords})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'categories'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers size={15} /> 1 & 2. Master Categories & Diseases ({masterCategories.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: 4. SUBSCRIBED USERS QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search user name, phone, email..."
                  value={subSearch}
                  onChange={(e) => { setSubSearch(e.target.value); setSubCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setSubCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Plans</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={subCategoryFilter}
                onChange={(e) => { setSubCategoryFilter(e.target.value); setSubCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {masterCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={subDiseaseFilter}
                onChange={(e) => { setSubDiseaseFilter(e.target.value); setSubCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Diseases</option>
                {masterDiseases.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-separate border-spacing-y-2 px-4 py-2">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-5 py-2">Subscribed User</th>
                      <th className="px-5 py-2">Plan Details & Category</th>
                      <th className="px-5 py-2">Diseases Covered</th>
                      <th className="px-5 py-2">Validity & Dates</th>
                      <th className="px-5 py-2">Remaining Benefits</th>
                      <th className="px-5 py-2">Status</th>
                      <th className="px-5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribersLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                            <span className="font-bold">Loading subscribers list...</span>
                          </div>
                        </td>
                      </tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20 text-slate-400 font-bold">
                          No subscribed users found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-all">
                          <td className="bg-slate-50/60 py-3.5 px-5 rounded-l-2xl">
                            <div className="font-bold text-slate-900 text-sm">{item.userId?.name || 'Unknown Patient'}</div>
                            <div className="text-[11px] text-slate-500 flex flex-col font-mono mt-0.5">
                              <span>📞 +91 {item.userId?.phone}</span>
                              <span className="text-[10px] text-slate-400">{item.userId?.email}</span>
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="font-bold text-slate-800">{item.planId?.name || 'Care Plan'}</div>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-1 inline-block">
                              {item.planId?.categoryId?.name || 'General Care'}
                            </span>
                          </td>

                          {/* Multi-Disease Badges */}
                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.planId?.diseaseIds && item.planId.diseaseIds.length > 0 ? (
                                item.planId.diseaseIds.map((dis, idx) => (
                                  <span key={idx} className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {dis.name || dis}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">General / Elder Care</span>
                              )}
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 text-slate-600">
                            <div className="font-bold text-slate-900">₹{item.planId?.price} ({item.planId?.validityInDays} Days)</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.startDate ? new Date(item.startDate).toLocaleDateString() : ''} ➔ {item.endDate ? new Date(item.endDate).toLocaleDateString() : ''}
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="flex flex-wrap gap-1 max-w-xs text-[10px] font-bold">
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <Stethoscope size={10} /> {item.remainingBenefits?.freeDoctorAppointmentsCount ?? 0} Docs
                              </span>
                              <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <HeartPulse size={10} /> {item.remainingBenefits?.freeNurseVisitsCount ?? 0} Nurse
                              </span>
                              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <Ambulance size={10} /> {item.remainingBenefits?.freeAmbulanceTripsCount ?? 0} Amb
                              </span>
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            {getStatusBadge(item.status)}
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                            <button
                              onClick={() => fetchSubscriberDetail(item._id)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition shadow-sm inline-flex items-center gap-1.5"
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Subscribers: {subTotalRecords} | Page {subCurrentPage} of {subTotalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSubCurrentPage(p => Math.max(1, p - 1))}
                    disabled={subCurrentPage === 1 || subscribersLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>{subCurrentPage}</span>
                  <button
                    onClick={() => setSubCurrentPage(p => Math.min(subTotalPages, p + 1))}
                    disabled={subCurrentPage === subTotalPages || subscribersLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 3. MASTER SUBSCRIPTION PACKAGES */}
        {/* ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search plan by name..."
                  value={planSearch}
                  onChange={(e) => { setPlanSearch(e.target.value); setPlanCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <select
                value={planCategoryFilter}
                onChange={(e) => { setPlanCategoryFilter(e.target.value); setPlanCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {masterCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={planDiseaseFilter}
                onChange={(e) => { setPlanDiseaseFilter(e.target.value); setPlanCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Diseases</option>
                {masterDiseases.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Plans Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-separate border-spacing-y-2 px-4 py-2">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-5 py-2">Plan Display Name</th>
                      <th className="px-5 py-2">Category & Diseases Covered</th>
                      <th className="px-5 py-2">Price & Duration</th>
                      <th className="px-5 py-2">Quota Benefits Included</th>
                      <th className="px-5 py-2">Active Users</th>
                      <th className="px-5 py-2">Status</th>
                      <th className="px-5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plansLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                            <span className="font-bold">Loading master subscription plans...</span>
                          </div>
                        </td>
                      </tr>
                    ) : plans.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20 text-slate-400 font-bold">
                          No master subscription plans found.
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan) => (
                        <tr key={plan._id} className="hover:bg-slate-50/80 transition-all">
                          <td className="bg-slate-50/60 py-3.5 px-5 rounded-l-2xl">
                            <div className="font-bold text-slate-900 text-sm">{plan.name}</div>
                            <p className="text-[11px] text-slate-400 max-w-xs truncate mt-0.5">{plan.description}</p>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase block w-fit">
                              {plan.categoryId?.name || 'General'}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.diseaseIds && plan.diseaseIds.length > 0 ? (
                                plan.diseaseIds.map((dis, idx) => (
                                  <span key={idx} className="bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    {dis.name || dis}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No Diseases Linked (Elder Care)</span>
                              )}
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="font-black text-slate-900 text-sm">₹{plan.price}</div>
                            <span className="text-[10px] text-slate-500">{plan.validityInDays} Days validity</span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {plan.benefits?.freeDoctorAppointmentsCount || 0} Docs
                              </span>
                              <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded">
                                {plan.benefits?.freeNurseVisitsCount || 0} Nurse
                              </span>
                              <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                                {plan.benefits?.freeAmbulanceTripsCount || 0} Amb
                              </span>
                            </div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 font-bold text-slate-900">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                              {plan.activeSubscribersCount || 0} Active
                            </span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              plan.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {plan.isActive !== false ? 'Active' : 'Disabled'}
                            </span>
                          </td>

                          {/* Plan Actions: Edit / Delete */}
                          <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenPlanModal(plan._id)}
                                className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                title="Edit Master Plan"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeletePlan(plan._id, plan.name)}
                                className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                title="Delete Master Plan"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Plans: {planTotalRecords} | Page {planCurrentPage} of {planTotalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlanCurrentPage(p => Math.max(1, p - 1))}
                    disabled={planCurrentPage === 1 || plansLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>{planCurrentPage}</span>
                  <button
                    onClick={() => setPlanCurrentPage(p => Math.min(planTotalPages, p + 1))}
                    disabled={planCurrentPage === planTotalPages || plansLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 1 & 2. DYNAMIC CATEGORIES & DISEASES */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Categories Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <FolderPlus className="text-emerald-600" size={18} /> 1. Master Categories
                  </h3>
                  <p className="text-xs text-slate-400">Broad categories for grouping healthcare plans</p>
                </div>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                {masterCategories.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs font-bold">No categories created yet.</p>
                ) : (
                  masterCategories.map((cat) => (
                    <div key={cat._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs hover:bg-slate-100/70 transition">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {cat.name}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            cat.isDiseaseSpecific ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cat.isDiseaseSpecific ? 'Disease-Specific' : 'General / Elder Care'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{cat.description || 'No description'}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Diseases Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <HeartPulse className="text-purple-600" size={18} /> 2. Chronic Diseases & Conditions
                  </h3>
                  <p className="text-xs text-slate-400">Specializations linkable to Condition Management plans</p>
                </div>
                <button
                  onClick={() => handleOpenDiseaseModal()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Add Disease
                </button>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                {masterDiseases.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-xs font-bold">No diseases added yet.</p>
                ) : (
                  masterDiseases.map((dis) => (
                    <div key={dis._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex justify-between items-center text-xs hover:bg-slate-100/70 transition">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">{dis.name}</div>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                          {dis.categoryId?.name || 'Category'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenDiseaseModal(dis)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition"
                          title="Edit Disease"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteDisease(dis._id, dis.name)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition"
                          title="Delete Disease"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4.2 SUBSCRIBER FULL DETAIL MODAL */}
        {/* ========================================================================= */}
        {selectedSubscriberId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <Crown className="text-amber-400" size={20} />
                  <div>
                    <h3 className="font-bold text-base">Subscriber Dossier & Benefit Audit</h3>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {selectedSubscriberId}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedSubscriberId(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {detailLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-amber-500" size={28} />
                    <span className="font-bold">Loading detailed subscription profile...</span>
                  </div>
                ) : subscriberDetail && (
                  <>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Patient Identity & Plan</span>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-black text-slate-900">{subscriberDetail.userId?.name}</h4>
                          <p className="text-slate-500 font-mono text-[11px]">+91 {subscriberDetail.userId?.phone} • {subscriberDetail.userId?.gender}</p>
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {subscriberDetail.planId?.categoryId?.name || 'Category'}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(subscriberDetail.status)}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Remaining Free Benefits Balance</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                          <span className="text-slate-400 block font-semibold">Doctor Appointments</span>
                          <span className="text-sm font-black text-blue-900">{subscriberDetail.remainingBenefits?.freeDoctorAppointmentsCount} Left</span>
                        </div>
                        <div className="p-3 bg-pink-50/60 border border-pink-100 rounded-xl">
                          <span className="text-slate-400 block font-semibold">Nurse Visits</span>
                          <span className="text-sm font-black text-pink-900">{subscriberDetail.remainingBenefits?.freeNurseVisitsCount} Left</span>
                        </div>
                        <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                          <span className="text-slate-400 block font-semibold">Ambulance Trips</span>
                          <span className="text-sm font-black text-rose-900">{subscriberDetail.remainingBenefits?.freeAmbulanceTripsCount} Left</span>
                        </div>
                      </div>
                    </div>

                    {subscriberDetail.paymentDetails && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Razorpay Settlement Audit</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div><span className="text-slate-400">Payment ID:</span> <span className="font-bold text-slate-800">{subscriberDetail.paymentDetails.razorpayPaymentId}</span></div>
                          <div><span className="text-slate-400">Order ID:</span> <span className="font-bold text-slate-800">{subscriberDetail.paymentDetails.razorpayOrderId}</span></div>
                          <div><span className="text-slate-400">Paid At:</span> <span className="text-slate-700">{new Date(subscriberDetail.paymentDetails.paidAt).toLocaleString()}</span></div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setSelectedSubscriberId(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3.1 & 3.4 CREATE / EDIT MASTER PLAN MODAL (CASE 1 & CASE 2) */}
        {/* ========================================================================= */}
        {planModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Crown className="text-amber-500" size={18} /> {editingPlanId ? 'Edit Master Plan' : 'Create Master Subscription Plan'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isCurrentCategoryDiseaseSpecific ? 'Case 2: Disease-Specific Plan (Multi-Disease Required)' : 'Case 1: General / Elder Care Plan (No Disease Needed)'}
                  </p>
                </div>
                <button onClick={() => setPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              {fetchingPlanDetail ? (
                <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="animate-spin text-amber-500" size={28} />
                  <span className="font-bold">Fetching plan configuration...</span>
                </div>
              ) : (
                <form onSubmit={handlePlanFormSubmit} className="p-6 space-y-4 text-xs">
                  {/* Category Selection */}
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Target Category <span className="text-rose-500">*</span></label>
                    <select
                      required
                      value={planFormData.categoryId}
                      onChange={(e) => {
                        const newCatId = e.target.value;
                        const catObj = masterCategories.find(c => c._id === newCatId);
                        setPlanFormData({
                          ...planFormData,
                          categoryId: newCatId,
                          diseaseIds: catObj?.isDiseaseSpecific ? planFormData.diseaseIds : []
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none cursor-pointer"
                    >
                      <option value="">Select a Category...</option>
                      {masterCategories.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.isDiseaseSpecific ? '(Condition Management / Disease Specific)' : '(Elder Care / General)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Multi-Disease Selector (RENDERED ONLY FOR CASE 2) */}
                  {isCurrentCategoryDiseaseSpecific && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block font-bold text-slate-600 uppercase mb-1">
                        Covered Diseases / Conditions (Multi-Select) <span className="text-purple-600 font-extrabold">* Required for Condition Management</span>
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {availableDiseasesForPlan.length === 0 ? (
                          <span className="text-slate-400 text-xs italic">No diseases created under this category yet. Click "+ Add Disease" to create one.</span>
                        ) : (
                          availableDiseasesForPlan.map(dis => {
                            const isSelected = planFormData.diseaseIds.includes(dis._id);
                            return (
                              <button
                                key={dis._id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setPlanFormData({
                                      ...planFormData,
                                      diseaseIds: planFormData.diseaseIds.filter(id => id !== dis._id)
                                    });
                                  } else {
                                    setPlanFormData({
                                      ...planFormData,
                                      diseaseIds: [...planFormData.diseaseIds, dis._id]
                                    });
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                                  isSelected 
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{dis.name}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plan Name & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-600 uppercase mb-1">Plan Display Name</label>
                      <input
                        type="text"
                        required
                        placeholder={isCurrentCategoryDiseaseSpecific ? "e.g. Dementia Comprehensive Care Plan" : "e.g. Senior Citizen Annual Elder Care Plan"}
                        value={planFormData.name}
                        onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Price (₹ INR)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={planFormData.price}
                        onChange={(e) => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-emerald-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Validity */}
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Validity (In Days)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 30, 90, 180, 365"
                      value={planFormData.validityInDays}
                      onChange={(e) => setPlanFormData({ ...planFormData, validityInDays: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                    />
                  </div>

                  {/* Quota Benefits Configuration */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Free Benefits Quota (Auto-Deduction Policy)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div>
                        <span className="text-slate-500 font-semibold block">Doctor Appointments:</span>
                        <input
                          type="number"
                          min="0"
                          value={planFormData.benefits.freeDoctorAppointmentsCount}
                          onChange={(e) => setPlanFormData({
                            ...planFormData,
                            benefits: { ...planFormData.benefits, freeDoctorAppointmentsCount: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Nurse In-Person Visits:</span>
                        <input
                          type="number"
                          min="0"
                          value={planFormData.benefits.freeNurseVisitsCount}
                          onChange={(e) => setPlanFormData({
                            ...planFormData,
                            benefits: { ...planFormData.benefits, freeNurseVisitsCount: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Free Ambulance Trips:</span>
                        <input
                          type="number"
                          min="0"
                          value={planFormData.benefits.freeAmbulanceTripsCount}
                          onChange={(e) => setPlanFormData({
                            ...planFormData,
                            benefits: { ...planFormData.benefits, freeAmbulanceTripsCount: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Free Pharmacy Delivery:</span>
                        <input
                          type="number"
                          min="0"
                          value={planFormData.benefits.freePharmacyDeliveriesCount}
                          onChange={(e) => setPlanFormData({
                            ...planFormData,
                            benefits: { ...planFormData.benefits, freePharmacyDeliveriesCount: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold block">Free Lab Collections:</span>
                        <input
                          type="number"
                          min="0"
                          value={planFormData.benefits.freeLabDeliveriesCount}
                          onChange={(e) => setPlanFormData({
                            ...planFormData,
                            benefits: { ...planFormData.benefits, freeLabDeliveriesCount: Number(e.target.value) }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description & Terms */}
                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-600 uppercase mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={planFormData.description}
                        onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPlanModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingPlan}
                      className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-md inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingPlan ? <Loader2 size={14} className="animate-spin" /> : null}
                      {editingPlanId ? 'Update Master Plan' : 'Save & Publish Plan'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1.1 & 1.3 CREATE / EDIT MASTER CATEGORY MODAL */}
        {/* ========================================================================= */}
        {categoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-base text-slate-900">
                  {editingCategoryId ? 'Edit Master Category' : 'Add Master Category'}
                </h3>
                <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Condition Management or Elder Care"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isDiseaseSpecific"
                    checked={categoryFormData.isDiseaseSpecific}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, isDiseaseSpecific: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <label htmlFor="isDiseaseSpecific" className="font-bold text-slate-700 cursor-pointer">
                    Is Disease-Specific (Condition Management)?
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief overview of plans under this category..."
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold">
                    {editingCategoryId ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2.1 & 2.3 CREATE / EDIT DISEASE MODAL */}
        {/* ========================================================================= */}
        {diseaseModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-base text-slate-900">
                  {editingDiseaseId ? 'Edit Disease / Condition' : 'Add Disease / Condition'}
                </h3>
                <button onClick={() => setDiseaseModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDiseaseSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Parent Category</label>
                  <select
                    required
                    value={diseaseFormData.categoryId}
                    onChange={(e) => setDiseaseFormData({ ...diseaseFormData, categoryId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none cursor-pointer"
                  >
                    <option value="">Select Category...</option>
                    {masterCategories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Disease Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dementia & Alzheimer's"
                    value={diseaseFormData.name}
                    onChange={(e) => setDiseaseFormData({ ...diseaseFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of patient condition..."
                    value={diseaseFormData.description}
                    onChange={(e) => setDiseaseFormData({ ...diseaseFormData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDiseaseModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold">
                    {editingDiseaseId ? 'Save Changes' : 'Add Disease'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}