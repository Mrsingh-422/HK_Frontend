"use client";
import React, { useState, useEffect } from "react";
import "./Nursing.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Nursing() {
  const [current, setCurrent] = useState(0);
  const [content, setContent] = useState(null);

  const { getNursingContent } = useGlobalContext();

  // Fetch Nursing Content
  useEffect(() => {
    const fetchContent = async () => {
      const response = await getNursingContent();
      if (response?.success) {
        setContent(response.data);
      }
    };

    fetchContent();
  }, []);

  // Auto slide (only if images exist)
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
            {content.images.map((img, index) => (
              <img
                key={index}
                src={`${API_URL}${img}`}
                alt="Nurse"
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="nursing-right">
          <div className="nursing-header">
            <span style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <FaArrowLeft /> {content.title} <FaArrowRight />
            </span>
            <h2>{content.subtitle}</h2>
          </div>

          <div className="nursing-description">
            {content.introduction
              ?.split("\r\n\r\n")
              .map((para, index) => (
                <p key={index}>{para}</p>
              ))}
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