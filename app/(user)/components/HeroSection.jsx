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
                            (img) => `${API_URL}${img}`   // ✅ fixed path
                        ),
                    });

                    setCurrent(0); // reset index if images change
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
                        <h1>
                            {heroData.title || "Health Kangaroo "}
                        </h1>
                        <p>
                            {heroData.subtitle ||
                                "Here you will order medicines, book tests, consultations and many more"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Clickable Cards */}
            <div className="hero-cards">
                <Link href="/booklabtest" className="hero-card">
                    <FaFlask className="card-icon orange" />
                    <span>Book Lab Test</span>
                </Link>

                <Link href="/medicine" className="hero-card">
                    <FaPills className="card-icon purple" />
                    <span>Buy Medicines</span>
                </Link>

                <Link href="/doctor-appointment" className="hero-card">
                    <FaUserMd className="card-icon blue" />
                    <span>Dr. Appointment</span>
                </Link>

                <Link href="/nursing" className="hero-card">
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