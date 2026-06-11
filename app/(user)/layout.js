'use client'
import { AuthProvider, useAuth } from "../context/AuthContext"; // Import useAuth
import { CartProvider } from "../context/CartContext";
import { GlobalProvider } from "../context/GlobalContext";
import { UserProvider } from "../context/UserContext";
import "../globals.css";
import ChatBot from "./chatbot/ChatBot";
import Footer from "./components/Footer";
import GlobalModal from "./components/GlobalModal";
import TopNavbar from "./components/TopNavbar";
import { Toaster } from 'react-hot-toast';
import CallListener from "./components/videoCall/CallListener";
import { useNotification } from "@/hooks/useNotification"; // Import your hook

// Create a wrapper component to handle the notification hook
// because we need access to the Auth state
function AppContent({ children }) {
  const { user } = useAuth();

  // This hook asks for permission and saves the FCM token to the DB
  useNotification(user?._id);

  return (
    <>
      <TopNavbar />
      {children}
      <CallListener />
      <Footer />
      <GlobalModal />
      <Toaster />
      <ChatBot />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Home Health Kangaroo</title>
        <meta name="description" content="Home Health Services" />
      </head>
      <body>
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <GlobalProvider>
                <AppContent>
                  {children}
                </AppContent>
              </GlobalProvider>
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}