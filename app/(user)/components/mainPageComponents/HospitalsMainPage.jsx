"use client";
import React from 'react';
import { FaMapMarkerAlt, FaStar, FaClock, FaArrowRight } from 'react-icons/fa';

const hospitals = [
    {
        id: 1,
        name: "City Care Super Specialty",
        location: "New Delhi, Sector 12",
        rating: 4.8,
        reviews: 1200,
        type: "Multi-Specialty",
        image: "https://care-new-dev.s3.ap-south-1.amazonaws.com/assets/images/main/vizag-health-city-704350.png",
        open: "Open 24/7"
    },
    {
        id: 2,
        name: "Apollo Gleneagles Hospital",
        location: "South Kolkata, WB",
        rating: 4.9,
        reviews: 3500,
        type: "Cardiology & Oncology",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
        open: "Open 24/7"
    },
    {
        id: 3,
        name: "St. Mary's General Hospital",
        location: "Mumbai, Marine Drive",
        rating: 4.6,
        reviews: 850,
        type: "General Surgery",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmbwTXs_kTo7GaDMF_92dwfjtWjVBt82qKMQ&s",
        open: "Open 24/7"
    },
    {
        id: 4,
        name: "Fortis Memorial Institute",
        location: "Gurugram, Haryana",
        rating: 4.7,
        reviews: 2100,
        type: "Neurology",
        image: "https://thumbs.dreamstime.com/b/hospital-building-modern-parking-lot-59693686.jpg",
        open: "Open 24/7"
    }
];

function HospitalsMainPage() {
    return (
        <section className="py-8 bg-[#F8FAFC] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                    <div>
                        <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm">Top Rated Facilities</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">Find Hospitals Nearby</h2>
                    </div>
                    <button className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all">
                        View All Hospitals <FaArrowRight />
                    </button>
                </div>

                {/* Single Row Horizontal Scroll Container */}
                <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide no-scrollbar" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    {hospitals.map((hospital) => (
                        <div
                            key={hospital.id}
                            className="min-w-[320px] md:min-w-[380px] snap-start bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 group"
                        >
                            {/* Image Wrapper */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={hospital.image}
                                    alt={hospital.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <FaStar className="text-yellow-400 text-xs" />
                                    <span className="text-xs font-bold text-slate-800">{hospital.rating} ({hospital.reviews})</span>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">
                                        {hospital.type}
                                    </span>
                                </div>
                            </div>

                            {/* Details Wrapper */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors truncate">
                                    {hospital.name}
                                </h3>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" />
                                        <span className="truncate">{hospital.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <FaClock className="text-emerald-500 flex-shrink-0" />
                                        <span className="font-medium">{hospital.open}</span>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2">
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Promotional Banner */}
                <div className="mt-12 bg-emerald-600 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                    <div className="max-w-md text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-4">Are you a Hospital Owner?</h2>
                        <p className="text-emerald-50 opacity-90 font-medium">Register your facility with Health Kangaroo to manage appointments and reach more patients in your city.</p>
                    </div>
                    <button className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-lg hover:bg-slate-100 transition-colors whitespace-nowrap">
                        Partner With Us
                    </button>
                </div>
            </div>

            {/* Custom CSS to hide scrollbar for different browsers */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}

export default HospitalsMainPage;