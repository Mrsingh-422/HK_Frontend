"use client";

import { AdminProvider } from "./context/AdminContext";
import { AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";
import { UserProvider } from "./context/UserContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <AuthProvider>
            <UserProvider>
              <AdminProvider>
                {children}
              </AdminProvider>
            </UserProvider>
          </AuthProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}