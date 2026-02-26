"use client";
import { useGlobalContext } from '@/app/context/GlobalContext';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function AmbulanceFacility() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [content, setContent] = useState(null);

    const { getAmbulanceContent } = useGlobalContext();

    // Fetch Content
    useEffect(() => {
        const fetchContent = async () => {
            const response = await getAmbulanceContent();
            if (response?.success) {
                setContent(response.data);
            }
        };

        fetchContent();
    }, []);

    // Auto slide every 4 seconds (only if images exist)
    useEffect(() => {
        if (!content?.images?.length) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev === content.images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [content]);

    if (!content) return null;

    return (
        <section className="med-section">
            <div className="med-container">

                {/* LEFT SIDE */}
                <div className="med-left">

                    <div className="med-top-row">
                        <p className="med-arrow">←</p>
                        <span className="med-label">{content.title}</span>
                        <p className="med-arrow">→</p>
                    </div>

                    <h1 className="med-heading">
                        {content.subtitle}
                    </h1>

                    <div className="med-description">
                        <p>{content.introduction}</p>
                    </div>

                    <Link href='/' className="med-btn">
                        Order Now
                    </Link>

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
                            {content.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`${API_URL}${img}`}
                                    alt="Ambulance"
                                    className="med-image"
                                />
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}

export default AmbulanceFacility;