"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

import LoginAsUser from "../loginComponents/loginAsUser/LoginAsUser";
import LoginAsHospital from "../loginComponents/loginAsHospital/LoginAsHospital";
import LoginAsDoctor from "../loginComponents/loginAsDoctor/LoginAsDoctor";
import LoginAsServiceProvider from "../loginComponents/loginAsServiceProvider/LoginAsServiceProvider";
import LoginAsDoctorAppointment from "../loginComponents/loginAsDoctorAppointment/LoginAsDoctorAppointment";
import PoliceStationHead from "./policeStationHead/PoliceStationHead";
import LoginAsPoliceStation from "./policeStation/LoginAsPoliceStation";
import LoginAsFireHead from "./fireStationHead/LoginAsFireHead";
import LoginAsFireStation from "./fireStation/LoginAsFireStation";

function MainLogin() {
    const [activeTab, setActiveTab] = useState("user");

    // ✅ Get modal controls from global context
    const { closeModal } = useGlobalContext();

    const renderContent = () => {
        switch (activeTab) {
            case "user":
                return <PoliceStationHead />;
            case "policeStation":
                return <LoginAsPoliceStation />;
            case "fireHead":
                return <LoginAsFireHead />;
            case "fireStation":
                return <LoginAsFireStation />;
            default:
                return null;
        }
    };

    return (
        <div className="login-modal-container">
            <div className="loginAsContainer">
                <span>Login As</span>

                {/* CLOSE BUTTON */}
                <span onClick={closeModal}>✖</span>
            </div>

            <div className="login-tabs">
                <button
                    className={activeTab === "user" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("user")}
                >
                    Login As Police Station Headquarter
                </button>

                <button
                    className={activeTab === "policeStation" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("policeStation")}
                >
                    Login As Police Station
                </button>

                <button
                    className={activeTab === "fireHead" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("fireHead")}
                >
                    Login As Fire Station Headquarter
                </button>

                <button
                    className={activeTab === "fireStation" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("fireStation")}
                >
                    Login As Fire Station
                </button>

            </div>

            <div className="login-body">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainLogin;