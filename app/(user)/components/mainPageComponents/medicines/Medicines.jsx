"use client";

import React, { useState, useEffect } from "react";
import "./Medicines.css";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Medicines = () => {

    const { getFeaturedProductsContent } = useGlobalContext();

    const [currentIndex, setCurrentIndex] = useState(0);

    const [medData, setMedData] = useState({
        title: "",
        subtitle: "",
        introduction: "",
        images: [],
    });

    // ✅ Fetch dynamic content
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getFeaturedProductsContent();

                if (response?.success && response?.data) {
                    const data = response.data;

                    setMedData({
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
                console.error("Error fetching featured products:", error);
            }
        };

        fetchData();
    }, []);

    // ✅ Auto slide every 4 seconds
    useEffect(() => {
        if (!medData.images.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev === medData.images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [medData.images]);

    return (
        <section className="med-section">
            <div className="med-container">

                {/* LEFT SIDE */}
                <div className="med-left">

                    <div className="med-top-row">
                        <p className="med-arrow">←</p>
                        <span className="med-label">
                            {medData.title || "Medicines"}
                        </span>
                        <p className="med-arrow">→</p>
                    </div>

                    <h1 className="med-heading">
                        {medData.subtitle || "Featured Products"}
                    </h1>

                    <div className="med-description">
                        <p>
                            {medData.introduction ||
                                "Loading featured products content..."}
                        </p>
                    </div>

                    <Link href='/' className="med-btn">Order Now</Link>

                </div>

                {/* RIGHT SIDE IMAGE CAROUSEL */}
                <div className="med-right">

                    <div className="med-carousel">
                        <div
                            className="med-carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`
                            }}
                        >
                            {medData.images.length > 0 &&
                                medData.images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt="Medicine"
                                        className="med-image"
                                    />
                                ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Medicines;