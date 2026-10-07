"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Shield,
  Zap,
  Heart,
  ArrowRight,
  Star,
  Loader2,
  Gem,
  X,
  Stethoscope,
  Truck,
  Package,
  CheckCircle2,
  BadgeCheck,
  Layers,
  Sparkles,
  Award,
  Calendar,
  Clock,
  ExternalLink,
  Crown,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import UserAPI from "../../../services/UserAPI";

// Dynamic Razorpay Loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function NursingPlans() {
  const router = useRouter();

  // State Management
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState("");

  const [plans, setPlans] = useState([]);
  const [userStatus, setUserStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

  // 1. Fetch Categories and User Active Subscription Status on Mount
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, statusRes] = await Promise.all([
          UserAPI.getSubscriptionCategories
            ? UserAPI.getSubscriptionCategories()
            : fetch("/api/user/subscriptions/categories").then((r) => r.json()),
          UserAPI.getMySubscriptionStatus
            ? UserAPI.getMySubscriptionStatus()
            : fetch("/api/user/subscriptions/my-status").then((r) => r.json()),
        ]);

        if (categoriesRes?.success && categoriesRes.data?.length > 0) {
          setCategories(categoriesRes.data);
          setSelectedCategory(categoriesRes.data[0]);
        }

        if (statusRes?.success && statusRes.hasActivePlan) {
          setUserStatus(statusRes.data);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 2. Fetch Diseases when a Disease-Specific Category is selected
  useEffect(() => {
    const fetchDiseases = async () => {
      if (selectedCategory?.isDiseaseSpecific) {
        try {
          const res = UserAPI.getDiseasesByCategory
            ? await UserAPI.getDiseasesByCategory(selectedCategory._id)
            : await fetch(`/api/user/subscriptions/diseases?categoryId=${selectedCategory._id}`).then((r) => r.json());

          if (res?.success) {
            setDiseases(res.data || []);
          } else {
            setDiseases([]);
          }
        } catch (err) {
          console.error("Error loading diseases:", err);
          setDiseases([]);
        }
      } else {
        setDiseases([]);
        setSelectedDiseaseId("");
      }
    };

    if (selectedCategory) {
      setSelectedDiseaseId("");
      fetchDiseases();
    }
  }, [selectedCategory]);

  // 3. Fetch Plans for selected Category and optional Disease filter
  const fetchPlansList = useCallback(async () => {
    if (!selectedCategory?._id) return;
    try {
      setPlansLoading(true);
      const res = UserAPI.listAvailablePlans
        ? await UserAPI.listAvailablePlans(selectedCategory._id, selectedDiseaseId)
        : await fetch(`/api/user/subscriptions/list?categoryId=${selectedCategory._id}${selectedDiseaseId ? `&diseaseId=${selectedDiseaseId}` : ""}`).then((r) => r.json());

      if (res?.success) {
        setPlans(res.data || []);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      toast.error("Failed to load plans.");
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [selectedCategory, selectedDiseaseId]);

  useEffect(() => {
    fetchPlansList();
  }, [fetchPlansList]);

  // 4. Card Interaction
  const handleCardClick = (plan) => {
    const isCurrentPlan = userStatus?.planId?._id === plan._id;
    if (isCurrentPlan) {
      router.push("/userscreens/myplan");
    } else {
      setSelectedPlanDetails(plan);
    }
  };

  // 5. Razorpay Buy Flow
  const handleBuy = async (e, plan) => {
    e.stopPropagation();

    if (userStatus) {
      toast.error("You already have an active subscription.");
      return;
    }

    try {
      setProcessingId(plan._id);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Payment SDK failed to load. Please try again.");
        return;
      }

      const orderRes = UserAPI.buySubscriptionPlan
        ? await UserAPI.buySubscriptionPlan(plan._id)
        : await fetch("/api/user/subscriptions/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId: plan._id }),
          }).then((r) => r.json());

      if (!orderRes?.success) {
        throw new Error(orderRes?.message || "Order creation failed.");
      }

      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: "INR",
        name: "Health Kangaroo VIP Care",
        description: `Plan: ${plan.name}`,
        order_id: orderRes.razorpayOrderId,
        handler: async function (response) {
          try {
            setProcessingId(plan._id);
            const verifyRes = UserAPI.verifySubscriptionPayment
              ? await UserAPI.verifySubscriptionPayment({
                  subscriptionId: orderRes.subscriptionId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                })
              : await fetch("/api/user/subscriptions/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subscriptionId: orderRes.subscriptionId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                }).then((r) => r.json());

            if (verifyRes?.success) {
              toast.success(verifyRes.message || "VIP Subscription Activated!");
              router.push("/userscreens/myplan");
            } else {
              toast.error(verifyRes?.message || "Verification failed.");
            }
          } catch (err) {
            toast.error("Payment verification encountered an issue.");
          } finally {
            setProcessingId(null);
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: { color: "#08B36A" },
        modal: {
          ondismiss: function () {
            setProcessingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to start checkout process.");
      setProcessingId(null);
    }
  };

  // Format Helper for Expiry Date
  const formatExpiryDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysLeft = (dateString) => {
    if (!dateString) return null;
    const expiry = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#08B36A] animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Loading Plans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white py-12 md:py-20 relative font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">

        {/* --- HEADER --- */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <Crown size={14} className="text-[#08B36A]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#08B36A]">
              VIP Healthcare Memberships
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Discover Your{" "}
            <span className="text-[#08B36A]">
              Care & Protection Plans
            </span>
          </h1>

          <p className="mt-3 text-xs md:text-sm text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Unlimited Cash on Delivery access, zero-fee home nurse visits, prioritized doctor appointments, and free deliveries.
          </p>
        </div>

        {/* ========================================================= */}
        {/* --- PROMINENT ACTIVE PLAN CARD (CLEAN LUXURY WHITE) --- */}
        {/* ========================================================= */}
        {userStatus && userStatus.planId && (
          <div className="mb-12 max-w-5xl mx-auto">
            <div className="relative rounded-[2.5rem] bg-white p-6 sm:p-8 md:p-9 border-2 border-[#08B36A] shadow-xl shadow-emerald-600/10 overflow-hidden">
              
              <div className="space-y-6">
                
                {/* Top Row: Plan Header & Expiry Pill */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#08B36A] flex items-center justify-center border border-emerald-200 shrink-0">
                      <Crown size={32} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#08B36A] bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                          {userStatus.planId.categoryId?.name || "Active Membership"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                          <BadgeCheck size={13} className="text-[#08B36A]" /> VIP COD Unlocked
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {userStatus.planId.name}
                      </h3>
                    </div>
                  </div>

                  {/* Expiry Banner */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5 shrink-0">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-[#08B36A]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Expires On
                      </p>
                      <p className="text-sm md:text-base font-black text-slate-900">
                        {formatExpiryDate(userStatus.endDate)}
                        <span className="text-xs font-bold text-[#08B36A] ml-2">
                          ({getDaysLeft(userStatus.endDate)} Days Left)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Remaining Quota Grid */}
                {userStatus.remainingBenefits && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3.5 flex items-center gap-2">
                      <Sparkles size={13} className="text-[#08B36A]" /> Remaining Benefit Quotas
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {/* Doctor Visits */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <Stethoscope size={18} className="text-[#08B36A]" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Active</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2 leading-none">
                          {userStatus.remainingBenefits.freeDoctorAppointmentsCount ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Doctor Consults</p>
                      </div>

                      {/* Nurse Visits */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <Heart size={18} className="text-rose-500" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">Active</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2 leading-none">
                          {userStatus.remainingBenefits.freeNurseVisitsCount ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Nurse Visits</p>
                      </div>

                      {/* Lab Deliveries */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <Package size={18} className="text-blue-500" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">Active</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2 leading-none">
                          {userStatus.remainingBenefits.freeLabDeliveriesCount ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Free Lab Drops</p>
                      </div>

                      {/* Pharmacy Deliveries */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start">
                          <Zap size={18} className="text-amber-500" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">Active</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2 leading-none">
                          {userStatus.remainingBenefits.freePharmacyDeliveriesCount ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Pharmacy Drops</p>
                      </div>

                      {/* Ambulance Trips */}
                      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl col-span-2 sm:col-span-1">
                        <div className="flex justify-between items-start">
                          <Truck size={18} className="text-indigo-500" />
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Active</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 mt-2 leading-none">
                          {userStatus.remainingBenefits.freeAmbulanceTripsCount ?? 0}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Ambulance</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Row: View Full Benefits Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <ShieldCheck size={18} className="text-[#08B36A] shrink-0" />
                    <span>Your VIP plan benefits apply automatically at all checkout screens.</span>
                  </div>
                  <button
                    onClick={() => router.push("/userscreens/myplan")}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#08B36A] hover:bg-[#079c5c] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
                  >
                    View Plan Passbook <ChevronRight size={15} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- STEP 1: CATEGORY TABS --- */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="bg-slate-50 p-2 rounded-3xl flex flex-wrap items-center justify-center gap-2 border border-slate-200 shadow-sm">
              {categories.map((cat) => {
                const isActive = selectedCategory?._id === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-[#08B36A] text-white shadow-md shadow-emerald-600/20 scale-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white"
                    }`}
                  >
                    {cat.iconImage ? (
                      <img src={cat.iconImage} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Layers size={16} className={isActive ? "text-white" : "text-slate-400"} />
                    )}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP 2: DISEASE PILLS --- */}
        {selectedCategory?.isDiseaseSpecific && diseases.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto animate-in fade-in duration-300">
            <button
              onClick={() => setSelectedDiseaseId("")}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedDiseaseId === ""
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Conditions
            </button>
            {diseases.map((dis) => {
              const isSelected = selectedDiseaseId === dis._id;
              return (
                <button
                  key={dis._id}
                  onClick={() => setSelectedDiseaseId(dis._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#08B36A] text-white border-[#08B36A] shadow-sm shadow-emerald-600/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {dis.iconImage && (
                    <img src={dis.iconImage} alt="" className="w-4 h-4 object-contain" />
                  )}
                  {dis.name}
                </button>
              );
            })}
          </div>
        )}

        {/* --- STEP 3: WHITE LUXURY PRICING / PLANS GRID --- */}
        {plansLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#08B36A]" size={36} />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Loading Plans...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto">
            <Sparkles size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-bold">No active plans found for this selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
            {plans.map((plan) => {
              const isCurrentPlan = userStatus?.planId?._id === plan._id;

              return (
                <div
                  key={plan._id}
                  onClick={() => handleCardClick(plan)}
                  className={`relative flex flex-col rounded-[2.5rem] bg-white border-2 p-7 lg:p-9 transition-all duration-300 group overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-600/10 ${
                    isCurrentPlan 
                      ? "border-slate-900 shadow-md" 
                      : plan.isCodGuaranteed
                      ? "border-[#08B36A]"
                      : "border-slate-200 hover:border-[#08B36A]"
                  }`}
                >
                  {/* Badges */}
                  {isCurrentPlan ? (
                    <div className="absolute top-0 right-0 bg-slate-900 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <Gem size={12} className="text-[#08B36A]" /> Active Plan
                    </div>
                  ) : plan.isCodGuaranteed ? (
                    <div className="absolute top-0 right-0 bg-[#08B36A] text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <BadgeCheck size={13} /> VIP COD Included
                    </div>
                  ) : null}

                  {/* Icon & Title */}
                  <div className="mb-6">
                    <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105 bg-emerald-50 text-[#08B36A] border border-emerald-100 shadow-xs">
                      <Crown size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#08B36A] mb-1">
                      {plan.category?.name || plan.planType || selectedCategory?.name}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Covered Disease Badges */}
                  {plan.diseaseIds?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {plan.diseaseIds.map((d) => (
                        <span
                          key={d._id || d.slug}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="mb-6 border-b border-slate-100 pb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl lg:text-4xl font-black text-slate-900">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-slate-400 font-bold text-xs uppercase">
                        / {plan.validityInDays} Days
                      </span>
                    </div>
                    {plan.codBadge && (
                      <p className="text-[11px] text-[#08B36A] font-black mt-2 flex items-center gap-1">
                        <BadgeCheck size={14} className="shrink-0" /> {plan.codBadge}
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8 flex-1">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-[#08B36A] border border-emerald-100 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-slate-700 text-xs font-bold leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button
                    disabled={processingId !== null}
                    onClick={(e) => {
                      if (isCurrentPlan) {
                        e.stopPropagation();
                        router.push("/userscreens/myplan");
                      } else {
                        handleBuy(e, plan);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer ${
                      isCurrentPlan
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-emerald-600/20 disabled:opacity-50"
                    }`}
                  >
                    {processingId === plan._id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : isCurrentPlan ? (
                      <>
                        Active Membership <ArrowRight size={14} />
                      </>
                    ) : (
                      <>
                        Activate VIP Plan <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- FOOTER INFO --- */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-slate-500">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#08B36A]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              PCI-DSS Secure Razorpay Checkout
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-[#08B36A]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Unrestricted Cash on Delivery Access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Dedicated Medical Concierge 24/7
            </span>
          </div>
        </div>

      </div>

      {/* --- PLAN DETAILS MODAL --- */}
      {selectedPlanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100">
            <button
              onClick={() => setSelectedPlanDetails(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#08B36A] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                {selectedPlanDetails.category?.name || selectedPlanDetails.planType}
              </span>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
                {selectedPlanDetails.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">
                  ₹{selectedPlanDetails.price.toLocaleString()}
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase">
                  / {selectedPlanDetails.validityInDays} Days
                </span>
              </div>

              {selectedPlanDetails.codBadge && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#08B36A] text-xs font-black border border-emerald-200">
                  <BadgeCheck size={16} /> {selectedPlanDetails.codBadge}
                </div>
              )}
            </div>

            {/* Covered Diseases */}
            {selectedPlanDetails.diseaseIds?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Covered Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPlanDetails.diseaseIds.map((d) => (
                    <span
                      key={d._id || d.slug}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800"
                    >
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits Breakdown */}
            {selectedPlanDetails.benefits && (
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Included Free Visits & Deliveries
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <Stethoscope className="text-[#08B36A] shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {selectedPlanDetails.benefits.freeDoctorAppointmentsCount || 0} Visits
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Doctor Consultations</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <Heart className="text-rose-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {selectedPlanDetails.benefits.freeNurseVisitsCount || 0} Visits
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Nurse Dressing & Visits</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <Truck className="text-blue-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {selectedPlanDetails.benefits.freeAmbulanceTripsCount || 0} Trips
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Emergency Ambulance</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <Package className="text-amber-500 shrink-0" size={20} />
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {selectedPlanDetails.benefits.freePharmacyDeliveriesCount || 0} Deliveries
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Pharmacy & Lab Drops</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {selectedPlanDetails.features?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Highlights
                </h4>
                <div className="space-y-2">
                  {selectedPlanDetails.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#08B36A]" />
                      <span className="text-xs font-bold text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanDetails(null)}
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  const targetPlan = selectedPlanDetails;
                  setSelectedPlanDetails(null);
                  handleBuy(e, targetPlan);
                }}
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#08B36A] hover:bg-[#079c5c] text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                Activate VIP Plan <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}