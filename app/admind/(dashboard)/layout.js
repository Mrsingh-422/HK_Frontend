"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Sidebar from "./components/sidebar/Sidebar";
// Check path!

export default function AdminDashboardLayout({ children }) {
  const { loading, admin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, send them to login
    if (!loading && !admin) {
      router.push("/admind/login");
    }
  }, [admin, loading, router]);

  // While checking auth status, show nothing or a loader
  if (loading || !admin) {
    return <div className="h-screen flex items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Sidebar />
      </aside>
      <div className="admin-main-wrapper">
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}