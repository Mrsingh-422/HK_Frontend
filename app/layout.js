"use client";

import { AdminProvider } from "./context/AdminContext";
import { AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";
import { UserProvider } from "./context/UserContext";
import { VendorProvider } from "./context/VendorContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <AuthProvider>
            <VendorProvider>
              <UserProvider>
                <AdminProvider>
                  {children}
                </AdminProvider>
              </UserProvider>
            </VendorProvider>
          </AuthProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}