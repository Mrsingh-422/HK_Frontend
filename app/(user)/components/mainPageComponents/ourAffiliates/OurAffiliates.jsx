import React from "react";
import "./OurAffiliates.css";
import { FaFacebookF, FaTwitter, FaPhoneAlt } from "react-icons/fa";


const OurAffiliates = () => {
    const doctors = [
        {
            img: "https://static.vecteezy.com/system/resources/thumbnails/026/375/249/small/ai-generative-portrait-of-confident-male-doctor-in-white-coat-and-stethoscope-standing-with-arms-crossed-and-looking-at-camera-photo.jpg",
            title: "Heart Specialist",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        {
            img: "https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-7807.jpg?semt=ais_user_personalization&w=740&q=80",
            title: "Emergency Medicine",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        {
            img: "https://media.istockphoto.com/id/1468678624/photo/nurse-hospital-employee-and-portrait-of-black-man-in-a-healthcare-wellness-and-clinic-feeling.jpg?s=612x612&w=0&k=20&c=AGQPyeEitUPVm3ud_h5_yVX4NKY9mVyXbFf50ZIEtQI=",
            title: "Cardiologist",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        {
            img: "https://media.istockphoto.com/id/1468678624/photo/nurse-hospital-employee-and-portrait-of-black-man-in-a-healthcare-wellness-and-clinic-feeling.jpg?s=612x612&w=0&k=20&c=AGQPyeEitUPVm3ud_h5_yVX4NKY9mVyXbFf50ZIEtQI=",
            title: "Neurologist",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        },
        {
            img: "https://media.istockphoto.com/id/1468678624/photo/nurse-hospital-employee-and-portrait-of-black-man-in-a-healthcare-wellness-and-clinic-feeling.jpg?s=612x612&w=0&k=20&c=AGQPyeEitUPVm3ud_h5_yVX4NKY9mVyXbFf50ZIEtQI=",
            title: "Specialist",
            desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        }
    ];

    return (
        <section className="doctors-section">
            <div className="section-header">
                <div className="doctors-top-row">
                    <p className="doctors-arrow">←</p>
                    <span className="doctors-label">Our Affiliates</span>
                    <p className="doctors-arrow">→</p>
                </div>
                <h2>Service Partner's</h2>
            </div>

            <div className="carousel-wrapper">
                <div className="carousel-track">
                    {[...doctors, ...doctors].map((doc, index) => (
                        <div className="doctor-card" key={index}>
                            <img src={doc.img} alt={doc.title} />
                            <div className="card-content">
                                <h4>{doc.title}</h4>
                                <p>{doc.desc}</p>
                            </div>
                            <div className="card-footer">
                                <FaFacebookF />
                                <FaTwitter />
                                <FaPhoneAlt />
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OurAffiliates;
