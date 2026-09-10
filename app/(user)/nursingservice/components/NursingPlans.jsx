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
  Award
} from "lucide-react";
import { toast } from "react-hot-toast";
import UserAPI from "../../../services/UserAPI"; // Adjust this path if needed

// Dynamic Razorpay Loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

const THEMES = [
  {
    theme: "slate",
    icon: <Shield size={24} />,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    accent: "bg-slate-900 hover:bg-slate-800",
    shadow: "hover:shadow-slate-200",
  },
  {
    theme: "emerald",
    icon: <Zap size={24} />,
    bg: "bg-emerald-50/40",
    border: "border-emerald-500",
    text: "text-emerald-700",
    accent: "bg-emerald-500 hover:bg-emerald-600",
    shadow: "shadow-2xl shadow-emerald-100",
    popular: true,
  },
  {
    theme: "indigo",
    icon: <Heart size={24} />,
    bg: "bg-indigo-50/40",
    border: "border-indigo-200",
    text: "text-indigo-700",
    accent: "bg-indigo-600 hover:bg-indigo-700",
    shadow: "hover:shadow-indigo-200",
  },
];

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
          setSelectedCategory(categoriesRes.data[0]); // Default to first category
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
      setSelectedDiseaseId(""); // Reset disease filter when category changes
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
      router.push("http://localhost:3000/userscreens/myplan");
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
        name: "HealthCare VIP Care",
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
              router.push("http://localhost:3000/userscreens/myplan");
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
        theme: { color: "#10b981" },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FDFEFF] flex items-center py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-6 w-full">

        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-4">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              VIP Home Healthcare Subscriptions
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Discover Your{" "}
            <span className="text-emerald-500 bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700">
              Chronic Care & Protection
            </span>
          </h2>
          {userStatus && (
            <p className="mt-4 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
              <Award size={16} /> Active Plan:{" "}
              <span
                className="underline cursor-pointer font-black"
                onClick={() => router.push("http://localhost:3000/userscreens/myplan")}
              >
                {userStatus.planId?.name}
              </span>
            </p>
          )}
        </div>

        {/* --- STEP 1: CATEGORY TABS --- */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100/80 p-1.5 rounded-3xl flex flex-wrap items-center justify-center gap-2 border border-slate-200 shadow-inner">
              {categories.map((cat) => {
                const isActive = selectedCategory?._id === cat._id;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm scale-100"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {cat.iconImage ? (
                      <img src={cat.iconImage} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Layers size={16} className={isActive ? "text-emerald-500" : "text-slate-400"} />
                    )}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP 2: DISEASE PILLS (IF isDiseaseSpecific: true) --- */}
        {selectedCategory?.isDiseaseSpecific && diseases.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto animate-in fade-in duration-300">
            <button
              onClick={() => setSelectedDiseaseId("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDiseaseId === ""
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

        {/* --- STEP 3: PRICING / PLANS GRID --- */}
        {plansLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Loading Plans...
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto">
            <Sparkles size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-bold">No active plans found for this selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
            {plans.map((plan, index) => {
              const ui = THEMES[index % THEMES.length];
              const isCurrentPlan = userStatus?.planId?._id === plan._id;

              return (
                <div
                  key={plan._id}
                  onClick={() => handleCardClick(plan)}
                  className={`relative flex flex-col rounded-[2rem] md:rounded-[2.5rem] border p-7 lg:p-8 transition-all duration-300 group overflow-hidden cursor-pointer hover:-translate-y-1.5 hover:shadow-xl ${ui.bg} ${ui.border} ${ui.shadow}`}
                >
                  {/* Badges */}
                  {isCurrentPlan ? (
                    <div className="absolute top-0 right-0 bg-slate-900 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md">
                      <Gem size={12} className="text-emerald-400" /> Active Plan
                    </div>
                  ) : plan.isCodGuaranteed ? (
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-emerald-200">
                      <BadgeCheck size={13} /> VIP COD Unlocked
                    </div>
                  ) : ui.popular && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white px-5 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                      Best Value
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-6 bg-white shadow-sm ${ui.text}`}>
                      {ui.icon}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 ${ui.text}`}>
                      {plan.category?.name || plan.planType || selectedCategory?.name}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Covered Disease Badges */}
                  {plan.diseaseIds?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {plan.diseaseIds.map((d) => (
                        <span
                          key={d._id || d.slug}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white/80 text-slate-700 border border-slate-200/60 shadow-2xs"
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mb-6 border-b border-slate-200/60 pb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl lg:text-4xl font-black text-slate-900">
                        ₹{plan.price}
                      </span>
                      <span className="text-slate-400 font-bold text-xs uppercase">
                        / {plan.validityInDays} Days
                      </span>
                    </div>
                    {plan.codBadge && (
                      <p className="text-[11px] text-emerald-600 font-black mt-2 flex items-center gap-1">
                        <BadgeCheck size={14} className="shrink-0" /> {plan.codBadge}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3.5 mb-8 flex-1">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm mt-0.5">
                          <Check size={12} className={ui.text} />
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
                        router.push("http://localhost:3000/userscreens/myplan");
                      } else {
                        handleBuy(e, plan);
                      }
                    }}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 text-white shadow-lg ${
                      isCurrentPlan
                        ? "bg-slate-900 hover:bg-slate-800"
                        : `${ui.accent} disabled:opacity-50 disabled:cursor-not-allowed`
                    }`}
                  >
                    {processingId === plan._id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : isCurrentPlan ? (
                      <>
                        View Active Plan <ArrowRight size={14} />
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
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 opacity-70">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Verified Razorpay Checkout
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Unlimited Cash on Delivery Access
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              24/7 Dedicated Support
            </span>
          </div>
        </div>
      </div>

      {/* --- PLAN DETAILS MODAL --- */}
      {selectedPlanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] max-w-xl w-full p-6 md:p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPlanDetails(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                {selectedPlanDetails.category?.name || selectedPlanDetails.planType}
              </span>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
                {selectedPlanDetails.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">
                  ₹{selectedPlanDetails.price}
                </span>
                <span className="text-slate-400 font-bold text-xs uppercase">
                  / {selectedPlanDetails.validityInDays} Days
                </span>
              </div>

              {selectedPlanDetails.codBadge && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
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
                    <Stethoscope className="text-emerald-500 shrink-0" size={20} />
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
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
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
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  const targetPlan = selectedPlanDetails;
                  setSelectedPlanDetails(null);
                  handleBuy(e, targetPlan);
                }}
                className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                Activate Now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}