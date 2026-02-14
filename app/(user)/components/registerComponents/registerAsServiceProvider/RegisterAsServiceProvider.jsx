import React, { useState } from "react";
import "./RegisterAsServiceProvider.css";

function RegisterAsServiceProvider({ onClose, openModal }) {

  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    category: "Nursing",
    phone: "",
    location: "",
    password: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Service Provider Registered Successfully!");
  };

  return (
    <div className="service-wrapper">
      <div className="service-container">

        <div className="service-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602393service.png"
            alt="Pharmacy Illustration"
          />
        </div>

        <div className="service-right">
          <h1>Get Started</h1>

          <form className="service-form" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Enter your name"
              name="name"
              onChange={handleChange}
            />

            <select name="gender" onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label className="category-label">select Category</label>
            <select name="category" onChange={handleChange}>
              <option>Nursing</option>
              <option>Pharmacy</option>
              <option>Phlebotomist / Lab</option>
            </select>

            <input
              type="text"
              placeholder="Enter your phone number"
              name="phone"
              onChange={handleChange}
            />

            <p className="small-text">
              We'll never share your Phone with anyone else.
            </p>

            <input
              type="text"
              placeholder="Enter your location"
              name="location"
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Enter your password"
              name="password"
              onChange={handleChange}
            />

            <div className="terms">
              <input
                type="checkbox"
                id="terms"
                name="termsAccepted"
                onChange={handleChange}
              />
              <label htmlFor="terms">
                Allow All Terms & Conditions on this site
              </label>
            </div>

            <button className="register-btn" type="submit">
              Register →
            </button>

            <p className="login-text">
              You have all Register{" "}
              <span
                onClick={() => {
                  onClose();
                  openModal("login");
                }}
              >
                Login?
              </span>
            </p>

          </form>
        </div>
      </div>

      <div className="bottom-section">

        <div className="service-info">
          <h2>Nursing</h2>
          <p>
            Provide professional home care services including elderly care,
            post-surgery assistance and patient monitoring.
          </p>
        </div>

        <div className="service-info">
          <h2>Pharmacy</h2>
          <p>
            Register your pharmacy to deliver medicines quickly and safely.
          </p>
        </div>

        <div className="service-info">
          <h2>Lab / Phlebotomist</h2>
          <p>
            Offer home sample collection and diagnostic services.
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterAsServiceProvider;