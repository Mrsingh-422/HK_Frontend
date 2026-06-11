import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA4Jszsbc3SUkdWl6kK0WDQLgmwY7s7u3g",
    authDomain: "hk-frontend-5b02d.firebaseapp.com",
    projectId: "hk-frontend-5b02d",
    storageBucket: "hk-frontend-5b02d.firebasestorage.app",
    messagingSenderId: "296544053183",
    appId: "1:296544053183:web:b1f5fd36dc74645216230a",
    measurementId: "G-SE1W23VBXV"
};

// 1. Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore
const db = getFirestore(app);

// 3. Initialize Messaging and Analytics safely
let messaging = null;
let analytics = null;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);

    // --- ADDED: MANUAL SERVICE WORKER REGISTRATION ---
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/firebase-messaging-sw.js")
            .then((registration) => {
                console.log("Service Worker registered successfully:", registration.scope);
            })
            .catch((err) => {
                console.error("Service Worker registration failed:", err);
            });
    }
    // ------------------------------------------------

    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, messaging, analytics, getToken, onMessage };