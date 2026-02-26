"use client";
import React, { useState, useEffect } from "react";
import "./Hospitals.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Hospitals() {
    const [current, setCurrent] = useState(0);
    const [content, setContent] = useState(null);

    const { getHospitalContent } = useGlobalContext();

    // Fetch Hospital Content
    useEffect(() => {
        const fetchContent = async () => {
            const response = await getHospitalContent();
            if (response?.success) {
                setContent(response.data);
            }
        };

        fetchContent();
    }, []);

    // Dynamic Slider (only if images exist)
    useEffect(() => {
        if (!content?.images?.length) return;

        const interval = setInterval(() => {
            setCurrent((prev) =>
                prev === content.images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [content]);

    if (!content) return null;

    return (
        <section className="hospital-section">
            <div className="hospital-container">

                {/* LEFT SIDE - IMAGE SLIDER */}
                <div className="hospital-left">
                    <div
                        className="slider-track"
                        style={{
                            transform: `translateX(-${current * 100}%)`,
                        }}
                    >
                        {content.images.map((img, index) => (
                            <img
                                key={index}
                                src={`${API_URL}${img}`}
                                alt="Hospital"
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE - CONTENT */}
                <div className="hospital-right">
                    <div className="hospital-header">
                        <span>
                            <FaArrowLeft /> {content.title} <FaArrowRight />
                        </span>
                        <h2>{content.subtitle}</h2>
                    </div>

                    <div className="hospital-description">
                        {content.introduction
                            ?.split("\r\n\r\n")
                            .map((para, index) => (
                                <p key={index}>{para}</p>
                            ))}
                    </div>

                    <Link href="/" className="book-btn">
                        Book Now
                    </Link>
                </div>

            </div>
        </section>
    );
}

export default Hospitals;