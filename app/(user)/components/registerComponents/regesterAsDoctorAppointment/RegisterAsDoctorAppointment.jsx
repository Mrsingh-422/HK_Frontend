"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useUserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import DoctorAPI from "@/app/services/DoctorAPI";

function RegisterAsDoctorAppointment() {
  const { closeModal, openModal } = useGlobalContext();
  const { setUser } = useAuth();
  const { getAllCountries, getStatesByCountry, getCitiesByState } = useUserContext();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Register, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Location Data States
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
    otp: "",
  });

  // ================= FETCH LOCATION LOGIC =================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getAllCountries();
        setCountries(data || []);
      } catch {
        console.error("Failed to load countries");
      }
    };
    fetchCountries();
  }, [getAllCountries]);

  const fetchStates = async (countryId) => {
    try {
      const data = await getStatesByCountry(countryId);
      setStates(data || []);
      setCities([]);
    } catch {
      console.error("Failed to load states");
    }
  };

  const fetchCities = async (stateId) => {
    try {
      const data = await getCitiesByState(stateId);
      setCities(data || []);
    } catch {
      console.error("Failed to load cities");
    }
  };

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "country") {
      fetchStates(value);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
    if (name === "state") {
      fetchCities(value);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Find the names from IDs to send to API
      const selectedCountry = countries.find((c) => c.id == formData.country);
      const selectedState = states.find((s) => s.id == formData.state);
      const selectedCity = cities.find((c) => c.id == formData.city);

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        country: selectedCountry?.name || "",
        state: selectedState?.name || "",
        city: selectedCity?.name || "",
      };

      await DoctorAPI.register(payload);
      setSuccess("OTP sent successfully to your phone!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await DoctorAPI.verifyOtp(formData.phone, formData.otp);

      localStorage.setItem("doctorToken", res.token);
      if (setUser) setUser(res.user);

      setSuccess("Phone verified! Redirecting...");

      setTimeout(() => {
        router.push("/vendors/doctor/documents");
        closeModal();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* TOP REGISTER BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">

        {/* LEFT IMAGE */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602351user-login.png"
            alt="Doctor Register"
            className="w-[280px] lg:w-[350px] max-w-full rounded-lg"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            {step === 1 ? "Get Started" : "Verify OTP"}
          </h2>

          {success && <div className="bg-[#e6ffed] text-[#1a7f37] border border-[#1a7f37] p-2.5 rounded-md mb-4 text-sm font-medium">{success}</div>}
          {error && <div className="bg-[#ffe6e6] text-[#d93025] border border-[#d93025] p-2.5 rounded-md mb-4 text-sm font-medium">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="w-full">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                value={formData.name}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                value={formData.email}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                value={formData.phone}
                required
              />
              <p className="text-[12px] text-gray-500 mb-3 text-left">We'll never share your phone with others.</p>

              {/* LOCATION ROW */}
              <div className="flex flex-col md:flex-row gap-3 mb-3">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white"
                  required
                >
                  <option value="">Country</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!formData.country}
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-50"
                  required
                >
                  <option value="">State</option>
                  {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.state}
                  className="flex-1 p-3 border border-[#42b883] rounded outline-none text-sm bg-white disabled:bg-gray-50"
                  required
                >
                  <option value="">City</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                value={formData.password}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                value={formData.confirmPassword}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-10 rounded text-base transition-colors"
              >
                {loading ? "Processing..." : "Register →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="w-full">
              <p className="text-gray-600 text-sm mb-4 text-left">Please enter the 4-digit OTP sent to {formData.phone}</p>
              <input
                type="text"
                name="otp"
                placeholder="0000"
                maxLength={4}
                className="w-full p-3 border border-[#42b883] rounded outline-none text-center text-xl tracking-widest mb-4 focus:ring-1 focus:ring-[#42b883]"
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-10 rounded text-base transition-colors"
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
            </form>
          )}

          <p className="mt-4 text-[15px] text-gray-700">
            Already have an account?{" "}
            <span
              onClick={() => {
                closeModal();
                openModal("login");
              }}
              className="font-bold cursor-pointer hover:underline text-[#2f8f5b]"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          Vendor Doctor
        </h3>
        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
          <span className="text-[#2f8f5b] font-bold text-lg leading-none mt-1">✔</span>
          <p>
            Join our platform as a certified medical professional and start managing
            your appointments, patients and availability easily. Registration requires
            basic details followed by phone verification and document verification for approval.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAsDoctorAppointment;