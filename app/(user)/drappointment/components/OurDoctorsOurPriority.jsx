"use client";
import React, { useState, useEffect } from "react";
import { FaPlusSquare, FaChevronRight, FaHospitalSymbol, FaUserShield, FaArrowRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function OurDoctorsOurPriority() {
  const { getDoctorsPriorityContent } = useGlobalContext();
  const [currentImg, setCurrentImg] = useState(0);

  const [data, setData] = useState({
    title: "Keeping Our Doctors Our Priority",
    description:
      "Connect with experienced and certified doctors anytime. Our platform ensures fast, reliable, and professional healthcare services right at your doorstep.",

    points: [
      "Instant access to certified medical specialists",
      "24/7 online consultation with expert doctors",
      "Easy appointment booking system",
      "Secure and private medical discussions",
      "Trusted healthcare professionals across multiple specialties"
    ],

    images: [
      "https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png",
      "https://static.vecteezy.com/system/resources/thumbnails/028/287/555/small/an-indian-young-female-doctor-isolated-on-green-ai-generated-photo.jpg",
      "https://plus.unsplash.com/premium_photo-1673953510158-174d4060db8b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWVkaWNhbCUyMGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
    ]
  });

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await getDoctorsPriorityContent();
  //       if (res?.success && res?.data) {
  //         setData({
  //           title: res.data.title || "",
  //           description: res.data.description || "",
  //           points: res.data.points || [],
  //           images: res.data.images || []
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Error fetching Doctors Priority content:", err);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // Carousel Logic
  useEffect(() => {
    if (data.images.length > 0) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [data.images.length]);

  return (
    <section className="py-20 md:py-10 bg-[#FDFEFF] font-sans relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-[120px] -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-[100px] -mr-48 -mb-48" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* LEFT SECTION: PREMIUM IMAGE CAROUSEL */}
          <div className="lg:col-span-6 relative order-1 group">
            {/* Artistic Frame Backdrop */}
            <div className="absolute -inset-4 bg-slate-50 rounded-[4rem] -rotate-2 transition-transform group-hover:rotate-0 duration-700 hidden lg:block border border-slate-100"></div>

            <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] border-[10px] border-white bg-white">
              {data.images.length > 0 ? (
                data.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out transform ${
                      index === currentImg ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
                    }`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `${API_URL}${img}`}
                      alt={`Professional Doctor Slide ${index}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle Shadow Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No Assets Available
                </div>
              )}

              {/* Floating Status Card */}
              <div className="absolute bottom-10 left-10 z-20 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-1000">
                <div className="bg-[#08B36A] w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <FaHospitalSymbol className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Clinic Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-sm font-black text-slate-900">Always On-Call</p>
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
                {data.images.map((_, i) => (
                   <div key={i} className={`w-1.5 transition-all duration-500 rounded-full ${i === currentImg ? 'h-8 bg-white' : 'h-2 bg-white/40'}`}></div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: PREMIUM CONTENT */}
          <div className="lg:col-span-6 space-y-10 order-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                  <div className="h-1.5 w-12 bg-[#08B36A] rounded-full"></div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#08B36A]">Priority Healthcare</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                {data.title.split(' ').map((word, i) => (
                  <span key={i} className={word.toLowerCase() === 'priority' ? 'text-[#08B36A]' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h2>

              <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                {data.description}
              </p>
            </div>

            {/* Dynamic Interactive Points */}
            <div className="space-y-4">
              {data.points.map((point, index) => (
                <div key={index} className="flex items-center gap-5 group p-2 rounded-2xl transition-all duration-300 hover:bg-emerald-50/50">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#08B36A] group-hover:bg-[#08B36A] group-hover:text-white group-hover:scale-110 transition-all duration-500">
                    <FaPlusSquare className="text-lg md:text-xl" />
                  </div>
                  <span className="text-slate-700 font-bold text-base md:text-lg group-hover:text-slate-900 transition-colors">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-[#08B36A] transition-all duration-500 active:scale-95 flex items-center gap-4 uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:-translate-y-1 group">
                Consult With Experts
                <FaArrowRight className="text-xs group-hover:translate-x-2 transition-transform" />
              </button>
              
              <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                              <img src={`https://i.pravatar.cc/100?img=${i+40}`} alt="doctor" />
                          </div>
                      ))}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Trusted by <span className="text-slate-900">500+ Verified Specialists</span>
                  </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default OurDoctorsOurPriority;