"use client";

import React, { useEffect, useState } from "react";
import "./OurIntroduction.css";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function OurIntroduction() {
    const { getIntroductionPageContent } = useGlobalContext();

    const [currentIndex, setCurrentIndex] = useState(0);

    const [introData, setIntroData] = useState({
        title: "",
        subtitle: "",
        introduction: "",
        images: [],
    });

    // ✅ Fetch dynamic content
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getIntroductionPageContent();

                if (response?.success && response?.data) {
                    const data = response.data;

                    setIntroData({
                        title: data.title || "",
                        subtitle: data.subtitle || "",
                        introduction: data.introduction || "",
                        images: (data.images || []).map(
                            (img) => `${API_URL}${img}`
                        ),
                    });

                    setCurrentIndex(0);
                }
            } catch (error) {
                console.error("Error fetching introduction data:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ Auto carousel
    useEffect(() => {
        if (!introData.images.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === introData.images.length - 1
                    ? 0
                    : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [introData.images]);

    return (
        <section className="oi-section">
            <div className="oi-wrapper">

                {/* LEFT SIDE */}
                <div className="oi-left">
                    <div className="oi-label-row">
                        <span className="oi-label-text">
                            {introData.title || "Our Introduction"}
                        </span>
                        <span className="oi-label-arrow">→</span>
                    </div>

                    <h1 className="oi-title">
                        {introData.subtitle ||
                            "Book Online For Doctor's Appointment"}
                    </h1>

                    <div className="oi-description-box">
                        <p>
                            {introData.introduction ||
                                "Loading introduction content..."}
                        </p>
                    </div>

                    <Link href="/appointments" className="oi-cta-button">
                        Get Started
                    </Link>
                </div>

                {/* RIGHT SIDE CAROUSEL */}
                <div className="oi-right">
                    <div className="oi-shape-bg"></div>

                    <div className="oi-carousel">
                        <div
                            className="oi-carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`,
                            }}
                        >
                            {introData.images.length > 0 &&
                                introData.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        className="oi-image"
                                        alt={`slide-${index}`}
                                    />
                                ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default OurIntroduction;