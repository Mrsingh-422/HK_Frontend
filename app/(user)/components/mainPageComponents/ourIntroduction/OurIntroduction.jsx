"use client";

import React, { useEffect, useState } from "react";
import "./OurIntroduction.css";
import Link from "next/link";

function OurIntroduction() {

    // 🔹 This can later come from backend
    const images = [
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925912431680342928appoint-dr.png",
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925912531680342963kangaroo-wills.jpg"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // 🔹 Change image every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="oi-section">
            <div className="oi-wrapper">

                {/* LEFT SIDE */}
                <div className="oi-left">
                    <div className="oi-label-row">
                        <span className="oi-label-text">Our Introduction</span>
                        <span className="oi-label-arrow">→</span>
                    </div>

                    <h1 className="oi-title">
                        Book Online For Doctor's <br /> Appointment
                    </h1>

                    <div className="oi-description-box">
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque sunt voluptates earum et molestiae repudiandae asperiores fuga illum nemo maxime iste. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Accusantium voluptatibus inventore magnam in. Corrupti ex perferendis vero iure rerum! Nesciunt excepturi minima incidunt corporis culpa deserunt? Repellat, aut harum dignissimos doloribus optio quae nobis perferendis repudiandae voluptates velit qui, neque adipisci maxime quisquam itaque, suscipit quam doloremque nisi fuga accusamus beatae maiores veniam? Laborum expedita repellendus, molestiae corrupti nesciunt excepturi similique itaque modi cupiditate, porro ullam illum? Aspernatur excepturi iure minus omnis neque ex repellendus praesentium in, soluta voluptatibus recusandae ratione quaerat, quo quasi facere tempore non magnam inventore odio consequuntur quam dolores magni fugiat! Architecto ratione quas, cumque alias illo, eaque doloribus consequatur recusandae suscipit dolor quod dolore beatae et id? Necessitatibus rem alias laboriosam culpa nulla voluptas perferendis veritatis possimus animi ipsam quae fugit iusto sequi sint reiciendis, doloribus ad impedit? Dolores nam est eum sed illum magni ipsa sequi velit officia provident qui impedit possimus aut beatae, maxime reprehenderit labore, repudiandae neque ipsum dolore molestiae recusandae cumque. Dignissimos voluptatibus perspiciatis ad non placeat cum eius, ducimus porro doloremque nemo obcaecati labore quibusdam consectetur reiciendis sint aspernatur quas nihil cumque fugit odio aliquam adipisci praesentium! Fugiat, recusandae labore enim sunt, laborum voluptas optio dolore placeat commodi veniam iusto libero. Fugiat ullam aliquid minus earum veniam nisi quasi nihil itaque, soluta aut officia id ducimus illum, magni enim quibusdam odio, ipsum expedita incidunt rem facere cum in ab. Nesciunt aliquid incidunt ab dolorum? Aliquam, possimus quae! Exercitationem laudantium voluptatum dolorum voluptate explicabo blanditiis natus animi, saepe veniam nulla libero modi et recusandae magni nisi nihil quisquam quaerat error, velit vero. Dicta debitis neque eos accusantium et libero veritatis repellendus architecto placeat odit ratione ipsam deleniti ad reprehenderit itaque consequatur tempora ut delectus molestias pariatur officiis velit quibusdam, blanditiis quis? Asperiores voluptates vero aspernatur? Non at velit sit vel doloremque?
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
                                transform: `translateX(-${currentIndex * 100}%)`
                            }}
                        >
                            {images.map((img, index) => (
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
