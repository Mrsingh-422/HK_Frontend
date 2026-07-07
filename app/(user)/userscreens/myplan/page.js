"use client";

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Stethoscope, 
  Activity, 
  Truck, 
  FlaskConical, 
  Ambulance, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI'; // Adjust path to your UserAPI
import { toast } from 'react-hot-toast';

export default function SubscriptionDetailsPage() {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await UserAPI.getUserPlanDetail();
      if (res.success) {
        setPlanData(res);
      }
    } catch (error) {
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!planData?.hasActivePlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-slate-400 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No Active Plan Found</h1>
        <p className="text-slate-500 mt-2 max-w-xs">You don't have an active subscription yet. Explore our plans to get started.</p>
        <button 
          onClick={() => window.location.href = '/nursing-plans'}
          className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
        >
          View Plans
        </button>
      </div>
    );
  }

  const { data } = planData;
  const { planId, remainingBenefits } = data;

  // Helper to format dates
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Benefit Mapping for the UI
  const benefitsList = [
    { label: "Doctor Consults", remaining: remainingBenefits.freeDoctorAppointmentsCount, total: planId.benefits.freeDoctorAppointmentsCount, icon: <Stethoscope />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Nurse Visits", remaining: remainingBenefits.freeNurseVisitsCount, total: planId.benefits.freeNurseVisitsCount, icon: <Activity />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pharmacy Deliveries", remaining: remainingBenefits.freePharmacyDeliveriesCount, total: planId.benefits.freePharmacyDeliveriesCount, icon: <Truck />, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Lab Collections", remaining: remainingBenefits.freeLabDeliveriesCount, total: planId.benefits.freeLabDeliveriesCount, icon: <FlaskConical />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Ambulance Trips", remaining: remainingBenefits.freeAmbulanceTripsCount, total: planId.benefits.freeAmbulanceTripsCount, icon: <Ambulance />, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* --- HERO SECTION --- */}
      <div className="bg-slate-900 pt-16 pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Active Subscription</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {planId.name}
              </h1>
              <p className="text-slate-400 mt-2 text-sm font-medium">
                Plan Type: <span className="text-white">{planId.planType}</span> • ID: {data._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[240px]">
              <div className="flex items-center gap-3 text-slate-300 mb-3">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Validity Period</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-black">Starts</p>
                  <p className="text-sm font-bold text-white">{formatDate(data.startDate)}</p>
                </div>
                <ChevronRight className="text-slate-600" size={16} />
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-black">Expires</p>
                  <p className="text-sm font-bold text-emerald-400">{formatDate(data.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-5xl mx-auto px-6 -mt-16">
        
        {/* 1. BENEFITS TRACKER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {benefitsList.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xl font-black text-slate-900">{item.remaining} <span className="text-slate-300 text-sm">/ {item.total}</span></p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                  style={{ width: `${(item.remaining / item.total) * 100}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">
                {item.remaining > 0 ? `${item.remaining} services left to use` : "All benefits used"}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. PLAN DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={20} /> Plan Coverage
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {planId.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planId.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Terms & Conditions</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  {planId.termsAndConditions}
                </p>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-500" size={20} /> Payment Info
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Amount Paid</span>
                  <span className="text-xl font-black text-slate-900">₹{data.paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Method</span>
                  <span className="text-xs font-bold text-slate-700 capitalize">{data.paymentDetails.method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Bank</span>
                  <span className="text-xs font-bold text-slate-700">{data.paymentDetails.bank || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Status</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-md uppercase">
                    {data.paymentDetails.status}
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Transaction ID</p>
                  <p className="text-[11px] font-mono font-bold text-slate-600 break-all">
                    {data.razorpayPaymentId}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 text-slate-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Paid on {formatDate(data.paymentDetails.paidAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}