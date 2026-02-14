import React, { useState } from "react";
import "./RegisterAsHospital.css";

function RegisterAsHospital({ onClose, openModal }) {

  const [formData, setFormData] = useState({
    registerAs: "",
    hospitalName: "",
    email: "",
    phone: "",
    licenseNumber: "",
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
    alert("Form submitted! Check console for data.");
    console.log("Form Data:", formData);
  };

  return (
    <div className="service-wrapper">
      <div className="service-container">

        <div className="service-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602447SMS-Hospital.jpeg"
            alt="Hospital"
          />
        </div>

        <div className="service-right">
          <h1>Get Started</h1>

          <form className="service-form" onSubmit={handleSubmit}>

            <select name="registerAs" onChange={handleChange}>
              <option value="">Register As</option>
              <option>Government Hospital</option>
              <option>Private Hospital</option>
              <option>Charity Hospital</option>
            </select>

            <input type="text" placeholder="Hospital name" name="hospitalName" onChange={handleChange} />
            <input type="email" placeholder="Hospital email" name="email" onChange={handleChange} />
            <input type="text" placeholder="Hospital phone number" name="phone" onChange={handleChange} />

            <p className="small-text">
              We'll never share your Phone with anyone else.
            </p>

            <input type="text" placeholder="Enter your license number" name="licenseNumber" onChange={handleChange} />
            <input type="password" placeholder="Enter your password" name="password" onChange={handleChange} />

            <div className="terms">
              <input type="checkbox" id="terms" name="termsAccepted" onChange={handleChange} />
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
          <h2>Hospital</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsHospital;