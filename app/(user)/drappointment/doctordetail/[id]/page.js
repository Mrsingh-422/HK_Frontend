"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaArrowLeft, FaStar, FaMapMarkerAlt, FaGraduationCap, 
  FaShieldAlt, FaEnvelope, FaPhoneAlt, FaStethoscope, 
  FaArrowRight, FaAward, FaVideo, FaHome, FaHospital,
  FaRegClock, FaCalendarCheck, FaCheckCircle, FaCommentDots
} from 'react-icons/fa';
import UserAPI from "@/app/services/UserAPI";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PremiumDoctorDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getDoctorDetail(id);
        if (res.success) setDoctorData(res.data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070";
    const cleanPath = path.replace(/^public\//, '');
    return `${BASE_URL}/${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
  };

  // NEW: Navigation logic using LocalStorage to avoid URL params
  const handleBooking = (service) => {
    const bookingPayload = {
      doctorId: id,
      doctorName: doctorData.profile.name,
      speciality: doctorData.profile.speciality,
      selectedService: service.type,
      fee: service.fee,
      slotDuration: doctorData.profile.slotDuration,
      profileImage: getImageUrl(doctorData.profile.profileImage)
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingPayload));
    router.push('/drappointment/book-appointment'); // Change this path to your actual route
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (!doctorData) return null;

  const { profile } = doctorData;

  const bookingOptions = [
    {
      id: 'online',
      type: "Virtual Consultation",
      fee: profile.fees?.online,
      available: profile.consultationStatus?.online,
      icon: <FaVideo />,
      tag: "Popular"
    },
    {
      id: 'clinic',
      type: "In-Clinic Visit",
      fee: profile.fees?.clinic,
      available: profile.consultationStatus?.clinic,
      icon: <FaHospital />,
      tag: "Best Results"
    },
    {
      id: 'home',
      type: "Home Care",
      fee: profile.fees?.home,
      available: profile.consultationStatus?.home,
      icon: <FaHome />,
      tag: "Private"
    }
  ].filter(option => option.available === true);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-emerald-100 pb-20">
      
      <nav className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-3 group px-4 py-2 rounded-full hover:bg-slate-50 transition-all"
          >
            <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">Return</span>
          </button>
          
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${profile.dutyStatus === 'Off Duty' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${profile.dutyStatus === 'Off Duty' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></span>
            {profile.dutyStatus}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <div className="pt-12 pb-16 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row gap-12 items-end">
            <div className="relative w-full lg:w-72 aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/10 shrink-0">
               <img 
                src={getImageUrl(profile.profileImage)} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md">
                  {profile.speciality}
                </span>
                <div className="flex text-amber-400 gap-1 italic font-bold">
                  <FaStar size={12} /> {profile.averageRating > 0 ? profile.averageRating : "5.0 Rating"}
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight">
                Dr. {profile.name}
              </h1>
              
              <div className="flex flex-wrap gap-10 pt-4">
                 <StatItem label="Practice" value={`${profile.experienceYears}yr+`} />
                 <StatItem label="Verified License" value={profile.licenseNumber} />
                 <StatItem label="Avg. Session" value={`${profile.slotDuration}m`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-16">
          <div className="lg:col-span-7 space-y-16">
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">The Specialist's Approach</h3>
              <p className="text-xl text-slate-600 leading-relaxed font-light">
                {profile.about}
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <FaGraduationCap className="text-emerald-600 mb-4" size={24} />
                <h4 className="font-bold text-slate-900 mb-2">Qualifications</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{profile.qualification}</p>
              </div>
              
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <FaCalendarCheck className="text-emerald-600 mb-4" size={24} />
                <h4 className="font-bold text-slate-900 mb-4">Availability & Timings</h4>
                <div className="space-y-2">
                  {profile.workingHours && profile.workingHours.length > 0 ? (
                    profile.workingHours.map((wh, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-500 uppercase tracking-wider">{wh.days}</span>
                        <span className={`font-bold ${wh.isClosed ? "text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-md" : "text-slate-700"}`}>
                          {wh.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 leading-relaxed">Mon - Sat<br/>09:00 AM - 06:00 PM</p>
                  )}
                </div>
              </div>
            </section>

            {/* Treated Conditions Section */}
            {profile.treatedConditions && profile.treatedConditions.length > 0 && (
              <section>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">Conditions Treated</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.treatedConditions.map((cond, i) => (
                    <span key={i} className="px-4 py-2 bg-emerald-50/50 border border-emerald-100/60 rounded-xl text-xs font-bold text-emerald-800">
                      {cond}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Competencies Section */}
            {profile.competencies && profile.competencies.length > 0 && (
              <section>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">Key Competencies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.competencies.map((comp, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                      <FaAward className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-xs font-bold text-slate-700 leading-tight">{comp}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">Languages</h3>
               <div className="flex gap-3">
                  {profile.languages.map((l, i) => (
                    <span key={i} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-700 shadow-sm">
                      {l}
                    </span>
                  ))}
               </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-6">
              <h3 className="text-2xl font-black text-slate-900 mb-8 px-2">Book Appointment</h3>
              
              <div className="space-y-4">
                {bookingOptions.map((opt) => (
                  <div 
                    key={opt.id} 
                    onClick={() => handleBooking(opt)}
                    className="group bg-white border border-slate-100 p-6 rounded-3xl hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/5 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {opt.icon}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{opt.tag}</span>
                          <h4 className="text-lg font-bold text-slate-900">{opt.type}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</p>
                        <p className="text-2xl font-black text-slate-900">₹{opt.fee}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                <FaShieldAlt className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-3 py-1 rounded-full">
                    <FaCheckCircle size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Medical Board Verified</span>
                  </div>
                  <h4 className="text-xl font-bold">Safe & Secure</h4>
                  <p className="text-xs text-emerald-50/70 leading-relaxed">
                    Contact information is encrypted. Private and secure medical consultations.
                  </p>
                  <div className="pt-6 grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[9px] font-bold text-emerald-200 uppercase mb-1">Email</p>
                       <p className="text-xs font-bold truncate">{profile.email}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-bold text-emerald-200 uppercase mb-1">Clinic</p>
                       <p className="text-xs font-bold">{profile.city}</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RECENT REVIEWS SECTION --- */}
        {doctorData.recentReviews && doctorData.recentReviews.length > 0 && (
          <div className="pt-16 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-8">
              <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <FaCommentDots size={18} />
              </span>
              <h2 className="text-xl font-black uppercase text-slate-800 tracking-wider">Patient Experience Reviews</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctorData.recentReviews.map((rev) => (
                <div key={rev._id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-extrabold text-slate-950 text-sm leading-tight">{rev.userName || "Verified Patient"}</p>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1">
                      <FaStar size={10} /> {rev.rating}
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>

            {/* Show view all reviews button only if totalReviews is greater than 3 */}
            {profile.totalReviews > 3 && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => router.push(`/userscreens/userallreviews?targetType=Doctor&targetId=${id}`)}
                  className="group flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all active:scale-95"
                >
                  <FaCommentDots className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span>View All Reviews ({profile.totalReviews})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}