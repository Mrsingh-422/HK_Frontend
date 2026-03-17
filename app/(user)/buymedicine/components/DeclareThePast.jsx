"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function DeclareThePast() {
  const router = useRouter();
  const { getDeclarePastContent } = useGlobalContext();

  const [data, setData] = useState({
    title: "Declare the past, diagnose the present, foretell the future.",
    description: "Loading content...",
    subtitle: "Take Care Also",
    buttonText: "Buy Online Medicine",
    images: []
  });
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getDeclarePastContent();
        if (res?.success && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Backend fetch failed.");
      }
    };
    fetchContent();
  }, [getDeclarePastContent]);

  useEffect(() => {
    const imageList = data.images || [];
    if (imageList.length > 1) {
      const timer = setInterval(() => {
        setCurrentImg((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [data.images]);

  return (
    <section className="py-12 md:py-14 bg-[#f8fafc] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SECTION: IMAGE CAROUSEL */}
          <div className="relative order-1 lg:order-1">
            <div className="absolute -inset-4 bg-emerald-50 rounded-[2.5rem] rotate-2 hidden lg:block"></div>

            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200">
              {data.images && data.images.length > 0 ? (
                data.images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                  >
                    <img
                      src={img.startsWith("http") ? img : `${API_URL}${img}`}
                      alt="Pharmacy"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/800x1000?text=Medicine"; }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">Loading Images...</div>
              )}

              <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex items-center gap-3 border border-emerald-50">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">🧪</div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 leading-none">Pharmacy</p>
                  <p className="text-sm font-bold text-slate-800">Verified Stocks</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: CONTENT */}
          <div className="space-y-8 order-2 lg:order-2">
            <div className="relative">
              <FaQuoteLeft className="text-4xl md:text-6xl text-emerald-100 absolute -top-8 -left-6 md:-top-10 md:-left-10 -z-10" />
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight whitespace-pre-line">
                {data.title}
              </h2>
            </div>

            <p className="text-slate-600 text-base md:text-xl leading-relaxed max-w-xl italic border-l-4 border-emerald-500 pl-6 py-2">
              "{data.description}"
            </p>

            <div className="space-y-6 pt-4">
              <p className="text-emerald-600 font-bold tracking-widest uppercase text-sm flex items-center gap-3">
                {data.subtitle}
                <span className="h-px w-20 bg-emerald-200"></span>
              </p>

              <button
                onClick={() => router.push("/buymedicine/seeallmed")}
                className="inline-block border-2 border-emerald-500 text-emerald-600 font-black px-8 py-4 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-lg shadow-emerald-50 active:scale-95 uppercase tracking-wider text-sm">
                {data.buttonText}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default DeclareThePast;