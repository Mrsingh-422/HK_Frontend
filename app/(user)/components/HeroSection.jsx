"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../components/styles/HeroSection.css";
import {
    FaFlask,
    FaPills,
    FaUserMd,
    FaUserNurse,
    FaAmbulance,
    FaHospital,
    FaPhoneAlt
} from "react-icons/fa";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [heroData, setHeroData] = useState({
        title: "",
        subtitle: "",
        images: [],
    });

    const { getHomePageContent } = useGlobalContext();

    // ✅ Fetch Dynamic Content
    useEffect(() => {
        const fetchHeroContent = async () => {
            try {
                const response = await getHomePageContent();

                if (response?.success && response?.data) {
                    const data = response.data;

                    setHeroData({
                        title: data.title || "",
                        subtitle: data.subtitle || "",
                        images: (data.images || []).map(
                            (img) => `${API_URL}${img}`
                        ),
                    });

                    setCurrent(0);
                }
            } catch (error) {
                console.error("Error fetching hero content:", error);
            }
        };

        fetchHeroContent();
    }, []);

    // ✅ Auto Carousel
    useEffect(() => {
        if (!heroData.images.length) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroData.images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [heroData.images]);

    return (
        <div className="hero-wrapper">
            {/* Background Carousel */}
            <div
                className="hero-background"
                style={{
                    backgroundImage: heroData.images.length
                        ? `url(${heroData.images[current]})`
                        : "none",
                }}
            >
                <div className="hero-overlay">
                    <div className="hero-content">
                        {/* ✅ NEW: Emergency CTA */}
                        <div className="emergency-badge">
                            <div className="pulse-icon">
                                <FaAmbulance />
                            </div>
                            <div className="emergency-text">
                                <span className="free-tag">Free Service</span>
                                <h4>Emergency Ambulance</h4>
                                <p>No Login Required • 24/7 Available</p>
                            </div>
                            <Link href="/ambulance" className="emergency-btn">
                                Book Now
                            </Link>
                        </div>

                        <h1>
                            {heroData.title || "Health Kangaroo"}
                        </h1>
                        <p>
                            {heroData.subtitle ||
                                "Here you will order medicines, book tests, consultations and many more"}
                        </p>

                        {/* ✅ Mobile Quick Action for Ambulance (only shows on small screens) */}
                        <Link href="/ambulance" className="mobile-emergency-trigger">
                            <FaPhoneAlt /> Book Free Ambulance
                        </Link>
                    </div>
                </div>
            </div>

            {/* Clickable Cards */}
            <div className="hero-cards">
                <Link href="/booklabtest" className="hero-card">
                    <FaFlask className="card-icon orange" />
                    <span>Book Lab Test</span>
                </Link>

                <Link href="/buymedicine" className="hero-card">
                    <FaPills className="card-icon purple" />
                    <span>Buy Medicines</span>
                </Link>

                <Link href="/drappointment" className="hero-card">
                    <FaUserMd className="card-icon blue" />
                    <span>Dr. Appointment</span>
                </Link>

                <Link href="/nursingservice" className="hero-card">
                    <FaUserNurse className="card-icon green" />
                    <span>Nursing Service</span>
                </Link>

                <Link href="/ambulance" className="hero-card">
                    <FaAmbulance className="card-icon red" />
                    <span>Ambulance</span>
                </Link>

                <Link href="/hospital" className="hero-card">
                    <FaHospital className="card-icon darkred" />
                    <span>Hospital</span>
                </Link>
            </div>
        </div>
    );
}

export default HeroSection;