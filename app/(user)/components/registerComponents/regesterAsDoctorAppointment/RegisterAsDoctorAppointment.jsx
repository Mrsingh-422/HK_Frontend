import React, { useState } from "react";
import "./RegisterAsDoctorAppointment.css";

function RegisterAsDoctorAppointment({ onClose, openModal }) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    specialist: "",
    licenseNumber: "",
    councilNumber: "",
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
    alert("Doctor registration successful! Please wait for admin approval.");
  };

  return (
    <div className="doctor-register-wrapper">
      <div className="doctor-register-container">

        <div className="doctor-register-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602508doctor3.jpg"
            alt="Doctor"
          />
        </div>

        <div className="doctor-register-right">
          <h1>Get Started</h1>

          <form className="doctor-form" onSubmit={handleSubmit}>

            <input type="text" placeholder="Enter your name" name="name" onChange={handleChange} />

            <div className="email-verify-group">
              <input type="email" placeholder="Enter your email" name="email" onChange={handleChange} />
              <button type="button" className="verify-btn">Verify</button>
            </div>

            <input type="text" placeholder="Enter your phone number" name="phone" onChange={handleChange} />
            <p className="field-description">
              We'll never share your Phone with anyone else.
            </p>

            <input type="text" placeholder="Enter your Address" name="address" onChange={handleChange} />

            <select name="qualification" onChange={handleChange}>
              <option value="">Select qualification</option>
              <option>MBBS</option>
              <option>MD</option>
              <option>MS</option>
              <option>BAMS</option>
              <option>BHMS</option>
            </select>

            <select name="specialist" onChange={handleChange}>
              <option value="">Specialist</option>
              <option>Cardiologist</option>
              <option>Dermatologist</option>
              <option>Orthopedic</option>
              <option>Pediatrician</option>
              <option>Neurologist</option>
            </select>

            <input type="text" placeholder="Enter your License Number" name="licenseNumber" onChange={handleChange} />
            <input type="text" placeholder="Enter your Council Number" name="councilNumber" onChange={handleChange} />
            <input type="password" placeholder="Enter your password" name="password" onChange={handleChange} />

            <div className="checkbox-group">
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

      <div className="bottom-description">
        <h2>Vendor Doctor</h2>
        <p>
          ✓ Join our platform as a certified medical professional and start
          managing your appointments, patients and availability easily.
        </p>
      </div>
    </div>
  );
}

export default RegisterAsDoctorAppointment;