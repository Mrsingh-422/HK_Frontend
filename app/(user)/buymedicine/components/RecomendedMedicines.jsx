"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function RecomendedMedicines() {
  const { getRecommendedMedContent } = useGlobalContext();
  const [currentImg, setCurrentImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [data, setData] = useState({
    miniTitle: "Recommended Medicines",
    mainTitle: "Medicines Sponsor By Doctors!",
    description: "Quality medication trusted by leading medical professionals. We provide only verified and high-quality pharmaceutical products.",
    statusText: "Available Antibiotics Medicines",
    buttonText: "Buy Now",
    images: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRecommendedMedContent();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error fetching recommended medicines:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Carousel Logic
  useEffect(() => {
    if (data.images?.length > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === data.images.length - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [data.images]);

  if (loading) return null;

  return (
    <section className="py-12 md:py-24 bg-[#f8fafc] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-slate-50 rounded-[2.5rem] -rotate-2 hidden lg:block"></div>

            <div className="relative h-[300px] sm:h-[450px] md:h-[550px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              {data.images?.length > 0 ? (
                data.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentImg ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
                    }`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `${API_URL}${img}`}
                      alt="Recommended Medicine"
                      className={`w-full h-full object-cover transition-transform duration-[3000ms] ${
                        index === currentImg ? 'scale-100' : 'scale-1.1'
                      }`}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No Images Available</div>
              )}

              {/* Progress Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {data.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImg(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentImg ? "w-10 bg-white" : "w-3 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: CONTENT */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <h4 className="text-[#08B36A] font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                {data.miniTitle}
              </h4>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                {/* Dynamically highlighting the last word in the title */}
                {data.mainTitle.split(' ').slice(0, -1).join(' ')}{" "}
                <span className="text-[#08B36A]">{data.mainTitle.split(' ').slice(-1)}</span>
              </h2>
            </div>

            <p className="text-slate-600 text-base md:text-xl leading-relaxed max-w-xl">
              {data.description}
            </p>

            <div className="flex items-center gap-3 text-[#08B36A] font-bold text-lg md:text-2xl pt-2">
              <FaCheckCircle className="flex-shrink-0 animate-pulse" />
              <span>{data.statusText}</span>
            </div>

            <div className="pt-6">
              <button
                onClick={() => router.push("/buymedicine/seeallmed")}
                className="group relative border-2 border-[#08B36A] text-[#08B36A] font-black px-10 py-4 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-lg shadow-[#08B36A]/10"
              >
                {data.buttonText}
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RecomendedMedicines;