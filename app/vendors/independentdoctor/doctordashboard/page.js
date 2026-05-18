"use client";

import { useState } from 'react';

export default function DoctorDashboard() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>
    </div>
  );
}