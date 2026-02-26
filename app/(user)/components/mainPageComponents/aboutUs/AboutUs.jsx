"use client";

import React, { useState, useEffect } from "react";
import "./AboutUs.css";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const AboutUs = () => {
    const { getAboutUsContent } = useGlobalContext();

    const [aboutData, setAboutData] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [activeTab, setActiveTab] = useState("Work");

    /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
        const fetchData = async () => {
            const response = await getAboutUsContent();

            if (response?.success) {
                const data = response.data;

                setAboutData(data);

                // ✅ FIX: Replace wrong folder name and attach backend URL
                const fullImageUrls = (data.images || []).map((img) => {
                    // Replace "frontend" with "homepage"
                    const correctedPath = img.replace("/uploads/frontend/", "/uploads/homepage/");
                    return `${API_URL}${correctedPath}`;
                });

                setImages(fullImageUrls);
            }
        };

        fetchData();
    }, []);

    /* ---------------- AUTO IMAGE SLIDER ---------------- */
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            setCurrentImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images]);

    /* ---------------- TAB DATA FROM API ---------------- */
    const tabContent = {
        Work: aboutData?.workDescription || "adasdsad",
        Mission: aboutData?.missionDescription || "adasdsad",
        Achievement: aboutData?.achievementDescription || "adasdsad",
    };

    return (
        <section className="au-section">
            <div className="au-container">

                {/* LEFT IMAGE SIDE (CAROUSEL) */}
                <div className="au-image-area">
                    <div className="au-dots"></div>

                    <div className="au-carousel">
                        <div
                            className="au-carousel-track"
                            style={{
                                transform: `translateX(-${currentImage * 100}%)`,
                            }}
                        >
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Doctor Consultation"
                                    className="au-main-image"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT SIDE */}
                <div className="au-content-area">

                    <div className="au-top-label">
                        <span className="au-small-title">
                            {aboutData?.title || "About Us"}
                        </span>
                        <span className="au-small-arrow">→</span>
                    </div>

                    <h2 className="au-heading">
                        {aboutData?.subtitle}
                    </h2>

                    {/* TABS */}
                    <div className="au-tabs">
                        {Object.keys(tabContent).map((tab) => (
                            <span
                                key={tab}
                                className={`au-tab ${activeTab === tab ? "active-tab" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="au-description">
                        <p>{tabContent[activeTab]}</p>
                    </div>

                    <div className="au-more-link">
                        <span className="au-more-arrow">→</span>
                        <a href="#" className="au-more-text">
                            More
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
};
export default AboutUs; 



