"use client";
import React, { useState } from "react";
import "./RegisterAsDoctorAppointment.css";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/GlobalContext";

function RegisterAsDoctorAppointment() {
  const { registerAsDoctorAppointment, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const router = useRouter();

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.qualification ||
      !formData.specialist ||
      !formData.licenseNumber ||
      !formData.councilNumber ||
      !formData.password
    ) {
      return "All fields are required.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (!formData.termsAccepted) {
      return "You must accept terms & conditions.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await registerAsDoctorAppointment(formData);
      setSuccess("Doctor registration successful! Please wait for admin approval.");

      setFormData({
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

      // Optional redirect
      router.push("/");
    } catch (err) {
      setError(err?.message || err);
    }
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

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form className="doctor-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter your name" name="name" value={formData.name} onChange={handleChange} />

            <div className="email-verify-group">
              <input type="email" placeholder="Enter your email" name="email" value={formData.email} onChange={handleChange} />
              <button type="button" className="verify-btn">Verify</button>
            </div>

            <input type="text" placeholder="Enter your phone number" name="phone" value={formData.phone} onChange={handleChange} />
            <p className="field-description">
              We'll never share your Phone with anyone else.
            </p>

            <input type="text" placeholder="Enter your Address" name="address" value={formData.address} onChange={handleChange} />

            <select name="qualification" value={formData.qualification} onChange={handleChange}>
              <option value="">Select qualification</option>
              <option>MBBS</option>
              <option>MD</option>
              <option>MS</option>
              <option>BAMS</option>
              <option>BHMS</option>
            </select>

            <select name="specialist" value={formData.specialist} onChange={handleChange}>
              <option value="">Specialist</option>
              <option>Cardiologist</option>
              <option>Dermatologist</option>
              <option>Orthopedic</option>
              <option>Pediatrician</option>
              <option>Neurologist</option>
            </select>

            <input type="text" placeholder="Enter your License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            <input type="text" placeholder="Enter your Council Number" name="councilNumber" value={formData.councilNumber} onChange={handleChange} />
            <input type="password" placeholder="Enter your password" name="password" value={formData.password} onChange={handleChange} />

            <div className="checkbox-group">
              <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />
              <label>
                Allow All Terms & Conditions on this site
              </label>
            </div>

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register →"}
            </button>

            <p className="login-text">
              Already have an account?{" "}
              <span
                onClick={() => {
                  closeModal
                  openModal("login");
                }}
              >
                Login
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