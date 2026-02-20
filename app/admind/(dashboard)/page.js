"use client";

import React from "react";
import DashboardTopNavbar from "./components/topNavbar/DashboardTopNavbar";
import Orders from "./dashboardComponents/Orders";

export default function Page() {
  return (
    <>
      <DashboardTopNavbar heading="Dashboard" />
      <Orders />
    </>
  );
}