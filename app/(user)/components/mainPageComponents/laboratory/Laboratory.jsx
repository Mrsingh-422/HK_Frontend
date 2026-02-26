"use client";

import React, { useState, useEffect } from "react";
import "./Laboratory.css";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Laboratory = () => {

    const { getLaboratoryContent } = useGlobalContext();

    const [currentIndex, setCurrentIndex] = useState(0);

    const [labData, setLabData] = useState({
        title: "",
        subtitle: "",
        introduction: "",
        images: [],
    });

    // ✅ Fetch dynamic content
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getLaboratoryContent();

                if (response?.success && response?.data) {
                    const data = response.data;

                    setLabData({
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
                console.error("Error fetching laboratory content:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ Auto slide
    useEffect(() => {
        if (!labData.images.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev === labData.images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [labData.images]);

    return (
        <section className="lab-section">
            <div className="lab-container">

                {/* LEFT SIDE IMAGE CAROUSEL */}
                <div className="lab-left">
                    <div className="lab-carousel">
                        <div
                            className="lab-carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`
                            }}
                        >
                            {labData.images.length > 0 &&
                                labData.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt="Laboratory"
                                        className="lab-image"
                                    />
                                ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE CONTENT */}
                <div className="lab-right">
                    <div className="lab-top-row">
                        <p className="lab-arrow">←</p>
                        <span className="lab-label">
                            {labData.title || "Laboratory"}
                        </span>
                        <p className="lab-arrow">→</p>
                    </div>

                    <h2 className="lab-heading">
                        {labData.subtitle || "Best Laboratories"}
                    </h2>

                    <div className="lab-description">
                        <p>
                            {labData.introduction ||
                                "Loading laboratory content..."}
                        </p>
                    </div>

                    <Link href='/booklabtest' className="lab-btn">
                        Book Now
                    </Link>

                </div>

            </div>
        </section>
    );
};

export default Laboratory;