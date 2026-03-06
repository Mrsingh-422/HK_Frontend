"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

function LoginAsDoctor() {
  const { openModal, closeModal } = useGlobalContext();

  // ✅ State for form fields
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // ✅ Submit Function
  const handleSubmit = (e) => {
    e.preventDefault();

    const doctorData = {
      mobile,
      password,
      remember,
    };

    console.log("Doctor Login Data:", doctorData);
    alert("Login API called (dummy)!");
  };

  return (
    <div className="w-full bg-white">
      {/* TOP LOGIN BOX */}
      <div className="flex flex-col md:flex-row items-center justify-center bg-white p-0 md:p-10 rounded-lg w-full max-w-[1100px] mx-auto">
        
        {/* LEFT IMAGE - Hidden on mobile, visible from md up */}
        <div className="hidden md:block flex-shrink-0">
          <img
            src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692600701doctor4.jpg"
            alt="Login Illustration"
            className="w-[280px] lg:w-[350px] max-w-full rounded-lg"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 w-full md:ml-8 lg:ml-15 text-center md:text-left">
          <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold mb-5 leading-tight">
            Get Started
          </h2>

          <input
            type="text"
            placeholder="Enter your mobile number"
            className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-1 focus:ring-1 focus:ring-[#42b883]"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <p className="text-[13px] text-gray-500 mb-3 text-left">
            We'll never share your mobile or email with anyone else.
          </p>

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-[#42b883] rounded outline-none text-sm mb-3 focus:ring-1 focus:ring-[#42b883]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 text-sm gap-2">
            <label className="inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#2f8f5b]"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Password
            </label>

            <span className="cursor-pointer hover:underline text-[#333]">
              Forget Password?
            </span>
          </div>

          <button
            className="w-full md:w-auto mt-5 bg-[#2f8f5b] hover:bg-[#256f47] text-white py-3 px-7 rounded text-base transition-colors"
            onClick={handleSubmit}
          >
            Login →
          </button>

          <p className="mt-4 text-[15px] text-gray-700">
            Don't have an account{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
              onClick={() => {
                closeModal(); // Fixed: Added parentheses
                openModal("register");
              }}
            >
              Register?
            </span>
          </p>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="max-w-[1100px] mx-auto mt-10 px-4 md:px-0 pb-10">
        <h3 className="text-lg sm:text-xl md:text-[28px] font-bold mb-5">
          Doctor
        </h3>

        <div className="flex gap-3 text-sm md:text-base leading-relaxed text-[#333]">
          <span className="text-[#2f8f5b] font-bold text-lg leading-none mt-1">✔</span>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias
            eius, quas ipsa quam maiores nobis eveniet quasi repellat aliquid
            dolorem omnis nostrum quia hic facere nam ab quo consequatur quisquam!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginAsDoctor;