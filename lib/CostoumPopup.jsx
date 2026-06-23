"use client";

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    FaTimes,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaExclamationCircle
} from 'react-icons/fa';

// Helper to find or create the shared toast stacking container in the DOM
const getToastContainer = () => {
    if (typeof window === "undefined") return null;

    let container = document.getElementById("custom-toast-stack-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "custom-toast-stack-container";
        // Fixed container setup to stack nicely and allow clicks underneath
        container.className = "fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none";
        document.body.appendChild(container);
    }
    return container;
};

// The React Toast Component
function ToastComponent({ message, type, duration, onClose }) {
    const [isRendered, setIsRendered] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRendered(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeConfigs = {
        success: {
            accentColor: "bg-emerald-500",
            textColor: "text-slate-800",
            iconColor: "text-emerald-500",
            icon: <FaCheckCircle className="size-5" />
        },
        error: {
            accentColor: "bg-rose-500",
            textColor: "text-slate-800",
            iconColor: "text-rose-500",
            icon: <FaExclamationCircle className="size-5" />
        },
        warning: {
            accentColor: "bg-amber-500",
            textColor: "text-slate-800",
            iconColor: "text-amber-500",
            icon: <FaExclamationTriangle className="size-5" />
        },
        info: {
            accentColor: "bg-blue-500",
            textColor: "text-slate-800",
            iconColor: "text-blue-500",
            icon: <FaInfoCircle className="size-5" />
        }
    };

    const config = typeConfigs[type] || typeConfigs.success;

    const handleDismiss = () => {
        setIsRendered(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`max-w-sm w-full pointer-events-auto transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) transform ${isRendered
                    ? "translate-x-0 opacity-100 scale-100"
                    : "translate-x-12 opacity-0 scale-95"
                }`}
        >
            {/* Glassmorphism Card Wrapper */}
            <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-white/40 bg-white/75 backdrop-blur-md shadow-lg shadow-slate-200/50 relative overflow-hidden select-none">

                {/* Sleek Vertical Accent Strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.accentColor}`} />

                {/* Visual Indicator Icon */}
                <div className={`flex-shrink-0 mt-0.5 ml-1 ${config.iconColor}`}>
                    {config.icon}
                </div>

                {/* Message Panel */}
                <div className="flex-1 pr-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        {type}
                    </p>
                    <p className={`text-sm font-medium ${config.textColor} leading-snug`}>
                        {message}
                    </p>
                </div>

                {/* Close Interaction */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 p-1 rounded-lg transition-all"
                    aria-label="Dismiss"
                >
                    <FaTimes size={12} />
                </button>

                {/* Dynamic Visual Timer Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50">
                    <div
                        className={`h-full ${config.accentColor} opacity-40`}
                        style={{
                            animation: `shrinkWidth ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

// 3. Dynamic Execution Function (Callable anywhere)
const customToast = (message, type = "success", duration = 3000) => {
    const container = getToastContainer();
    if (!container) return;

    // Create an isolated wrapper element for this specific toast card
    const toastWrapper = document.createElement("div");
    toastWrapper.className = "w-full flex justify-end";
    container.appendChild(toastWrapper);

    const root = createRoot(toastWrapper);

    const handleCleanup = () => {
        root.unmount();
        toastWrapper.remove();

        // Remove container from document body if no active toasts remain
        if (container.childNodes.length === 0) {
            container.remove();
        }
    };

    root.render(
        <ToastComponent
            message={message}
            type={type}
            duration={duration}
            onClose={handleCleanup}
        />
    );
};

export default customToast;