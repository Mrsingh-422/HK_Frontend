"use client";
import React, { useState, useEffect } from "react";
import { FaUserMd, FaHeartbeat, FaStethoscope, FaCheckCircle, FaArrowRight, FaShieldAlt, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Icon Mapping
const icons = [<FaStethoscope />, <FaHeartbeat />, <FaUserMd />];

const STATIC_DATA = {
  title: "Only the best care for you and your loved ones",
  subheading: "Get a personalised care plan. Here's what we can help with.",
  description: "Our dedicated professionals ensure the highest quality of healthcare services tailored to your specific needs.",
  points: ["Medical Conditions", "Reasons Of Engagement", "Care By Professionals"],
  carouselImages: [
    "https://www.shutterstock.com/image-photo/indian-female-doctor-nurse-power-260nw-2593769723.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZNpUbFvh7HM0Dgwg3w7_HE6g_rGcxcSgJxg&s"
  ]
};

function OnlyTheBestCare() {
  const router = useRouter();
  const { getOnlyTheBestCareData } = useGlobalContext();

  const [data, setData] = useState(STATIC_DATA);
  const [currentImg, setCurrentImg] = useState(0);

  // useEffect(() => {
  //   const fetchContent = async () => {
  //     try {
  //       const res = await getOnlyTheBestCareData();
  //       if (res?.success && res?.data) {
  //         setData(res.data);
  //       }
  //     } catch (err) {
  //       console.error("Backend fetch failed, using static fallback.");
  //     }
  //   };
  //   fetchContent();
  // }, [getOnlyTheBestCareData]);

  useEffect(() => {
    const imagesCount = data.carouselImages?.length || 0;
    if (imagesCount > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === imagesCount - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [data.carouselImages]);

  return (
    <section className="py-12 md:py-20 bg-[#F8FAFC] font-sans relative overflow-hidden">
      {/* Subtle Medical Background Pattern */}
      {/* <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2308B36A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div> */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* CONTENT SIDE */}
            <div className="lg:col-span-7 p-8 md:p-16 lg:p-20 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg text-lg"><FaShieldAlt /></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Nursing Excellence</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                  {data.title}
                </h2>

                <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  {data.description}
                </p>
              </div>

              {/* USER FRIENDLY: Horizontal Scannable Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.points?.map((text, idx) => (
                  <div key={idx} className="group p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
                      {icons[idx] || <FaCheckCircle />}
                    </div>
                    <p className="text-sm font-black text-slate-800 leading-tight">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
                <button
                  onClick={() => router.push('/nursingservice/seeallnurses')}
                  className="w-full sm:w-auto bg-slate-900 text-white font-black px-10 py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
                >
                  Find a Nurse <FaArrowRight />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" />
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trusted by 5k+ Families</p>
                </div>
              </div>
            </div>

            {/* VISUAL SIDE (Integrated Carousel) */}
            <div className="lg:col-span-5 relative min-h-[400px] lg:min-h-full bg-slate-100">
              {data.carouselImages?.map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                >
                  <img
                    src={img.startsWith('http') ? img : `${API_URL}${img}`}
                    alt="Care"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/800x600?text=Care+Service"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 lg:to-white/20"></div>
                </div>
              ))}

              {/* Floating Info Box on Image */}
              <div className="absolute top-8 right-8 z-20 bg-white/90 backdrop-blur px-6 py-4 rounded-[2rem] shadow-xl border border-white/50 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><FaPlus /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Available 24/7</p>
                    <p className="text-sm font-black text-slate-900">Expert Home Care</p>
                  </div>
                </div>
              </div>

              {/* Visual Pagination */}
              <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
                {data.carouselImages?.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 transition-all duration-500 rounded-full ${idx === currentImg ? "h-8 bg-emerald-500" : "h-2 bg-white/40"
                      }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default OnlyTheBestCare;