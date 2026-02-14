"use client";
import React, { useState, useEffect } from "react";
import "./Nursing.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

const images = [
  "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602989nurse3.png",
  "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692603023nurse5.jpg",
];

function Nursing() {
  const [current, setCurrent] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="nursing-section">
      <div className="nursing-container">

        {/* LEFT SIDE - SLIDER */}
        <div className="nursing-left">
          <div
            className="slider-track"
            style={{
              transform: `translateX(-${current * 100}%)`,
            }}
          >
            {images.map((img, index) => (
              <img key={index} src={img} alt="Nurse" />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="nursing-right">
          <div className="nursing-header">
            <span style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <FaArrowLeft /> Nursing <FaArrowRight />
            </span>
            <h2>We Have Experienced Nurses</h2>
          </div>

          <div className="nursing-description">
            <p>
              Nurses work with doctors and other health care workers to make patients
              well and to keep them fit and healthy. Nurses also help with end-of-life
              needs and assist other family members with grieving.
            </p>
            <p>
              Professional nurses play a critical role in patient care, helping
              individuals recover and improve their overall well-being.
            </p>
            <p>
              Our experienced nurses are dedicated to providing compassionate,
              personalized care tailored to each patient's unique needs.
            </p>
          </div>

          <Link href="#" className="book-btn">
            Book Now
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Nursing;
