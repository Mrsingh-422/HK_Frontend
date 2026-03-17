"use client";
import React, { useState, useEffect } from "react";
import { FaPlusSquare, FaChevronRight, FaHospitalSymbol } from "react-icons/fa";
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
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      "https://images.unsplash.com/photo-1580281657527-47f249e8f4df",
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7"
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorsPriorityContent();
        if (res?.success && res?.data) {
          setData({
            title: res.data.title || "",
            description: res.data.description || "",
            points: res.data.points || [],
            images: res.data.images || []
          });
        }
      } catch (err) {
        console.error("Error fetching Doctors Priority content:", err);
      }
    };
    fetchData();
  }, []);

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
    <section className="py-16 md:py-15 bg-[#f8fafc] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative order-1 lg:order-1">
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] -rotate-2 hidden lg:block"></div>

            <div className="relative h-[350px] sm:h-[450px] md:h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              {data.images.length > 0 ? (
                data.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                  >
                    <img
                      src={`${API_URL}${img}`}
                      alt={`Slide ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-200">No Images Uploaded</div>
              )}

              <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#08B36A]/20 flex items-center gap-4">
                <div className="bg-[#08B36A] p-3 rounded-xl text-white">
                  <FaHospitalSymbol className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                  <p className="text-sm font-bold text-slate-800">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: CONTENT */}
          <div className="space-y-8 order-2 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {/* Dynamically wrap words in span if needed, or just display title */}
                {data.title}
              </h2>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
                {data.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.points.map((point, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="flex-shrink-0 text-[#08B36A] transition-transform group-hover:scale-125 duration-300">
                    <FaPlusSquare className="text-xl md:text-2xl" />
                  </div>
                  <span className="text-slate-700 font-bold text-sm md:text-base group-hover:text-[#08B36A] transition-colors">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button className="group border-2 border-[#08B36A] text-[#08B36A] font-black px-10 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm shadow-lg shadow-[#08B36A]/10">
                Know More
                <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default OurDoctorsOurPriority;