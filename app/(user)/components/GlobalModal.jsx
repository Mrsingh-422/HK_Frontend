"use client";

import { useEffect } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";
import MainLogin from "./loginComponents/MainLogin";
import MainLoginPolice from "./policeAndFireLogin/MainLoginPolice";
import MainRegister from "./registerComponents/MainRegister";
import ForgotPassword from "./ForgotPassword";

export default function GlobalModal() {
    const { modalType, closeModal } = useGlobalContext();

    // 🔒 Prevent background scroll
    useEffect(() => {
        if (modalType) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [modalType]);

    // ⌨️ Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        if (modalType) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [modalType, closeModal]);

    if (!modalType) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center px-3 sm:px-6">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={closeModal}
            />

            {/* Modal */}
            <div
                className="
                relative z-10
                w-fit
                max-w-[95vw]
                // max-h-[95vh]
                bg-white
                rounded-t-2xl sm:rounded-xl
                shadow-2xl
                overflow-y-auto
                p-4 sm:p-6 md:p-0
                animate-[fadeIn_0.2s_ease-in-out]
                "


            >
                {modalType === "login" && <MainLogin />}
                {modalType === "register" && <MainRegister />}
                {modalType === "policeandfire" && <MainLoginPolice />}
                {modalType === "forgotPassword" && <ForgotPassword />}
            </div>
        </div>
    );
}