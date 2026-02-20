"use client";
import React, { useState, useEffect } from "react";
import "./UserRegister.css";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";

function UserRegister() {
  const { registerAsUser, loading } = useAuth();
  const { closeModal, openModal } = useGlobalContext();
  const {
    getAllCountries,
    getStatesByCountry,
    getCitiesByState,
  } = useUserContext();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ================= FETCH DATA =================

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data || []);
      } catch (err) {
        console.error("Failed to load countries");
      }
    };

    fetchCountries();
  }, []);

  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch (err) {
      console.error("Failed to load states");
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch (err) {
      console.error("Failed to load cities");
    }
  };

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "country") {
      fetchStates(value);
    }

    if (name === "state") {
      fetchCities(value);
    }
  };

  // ================= VALIDATION =================

  const validateForm = () => {
    const {
      name,
      email,
      phone,
      country,
      state,
      city,
      password,
      confirmPassword,
      termsAccepted,
    } = formData;

    if (
      !name ||
      !email ||
      !phone ||
      !country ||
      !state ||
      !city ||
      !password ||
      !confirmPassword
    ) {
      return "All fields are required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    if (!termsAccepted) {
      return "You must accept terms & conditions";
    }

    return null;
  };

  // ================= SUBMIT (FIXED HERE ONLY) =================

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
      // 🔥 Convert IDs to Names BEFORE sending to backend

      const selectedCountry = countries.find(
        (c) => c.id == formData.country
      );

      const selectedState = states.find(
        (s) => s.id == formData.state
      );

      const selectedCity = cities.find(
        (c) => c.id == formData.city
      );

      const finalData = {
        ...formData,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      await registerAsUser(finalData);

      setSuccess("Registration successful!");
      closeModal();
    } catch (err) {
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">

        <div className="register-left">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Register"
          />
        </div>

        <div className="register-right">
          <h1>Get Started</h1>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <input
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="text"
              placeholder="Mobile Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="location-row">

              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="">Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!formData.country}
              >
                <option value="">State</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
              >
                <option value="">City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

            </div>

            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <div className="terms">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <span>Allow All Terms & Conditions on this site</span>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register →"}
            </button>
          </form>

          <p className="login-text">
            Already have an account{" "}
            <span
              onClick={() => {
                closeModal();
                openModal("login");
              }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;