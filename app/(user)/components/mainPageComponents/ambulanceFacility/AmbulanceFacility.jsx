import Link from 'next/link';
import React, { useEffect, useState } from 'react'

function AmbulanceFacility() {
    const images = [
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925928471680343420ambulancevan.jpg",
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692603043emergency.jpeg",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    return (
        <section className="med-section">
            <div className="med-container">

                {/* LEFT SIDE */}
                <div className="med-left">

                    <div className="med-top-row">
                        <p className="med-arrow">←</p>
                        <span className="med-label">Ambulance Facility</span>
                        <p className="med-arrow">→</p>
                    </div>

                    <h1 className="med-heading">24*7 Service Available
                    </h1>

                    <div className="med-description">
                        <p>
                            Keep emergency phone numbers posted in your home where you can easily access them. Also enter the numbers into your cell phone. Everyone in your household, including children, should know when and how to call these numbers. These numbers include: fire department, poison control center, ambulance center, and work phone numbers.


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
                            {images.map((img, index) => (
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


export default AmbulanceFacility