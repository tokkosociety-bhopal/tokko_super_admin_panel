"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SuperAdminDashboard() {
  const [totalSocieties, setTotalSocieties] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activePlans, setActivePlans] = useState(0);
  const [expiredPlans, setExpiredPlans] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const snapshot = await getDocs(collection(db, "societies"));

      let revenue = 0;
      let active = 0;
      let expired = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();

        revenue += Number(data.planPrice || 0);

        if (data.status === "active") active++;
        if (data.status === "expired") expired++;
      });

      setTotalSocieties(snapshot.size);
      setTotalRevenue(revenue);
      setActivePlans(active);
      setExpiredPlans(expired);
    };

    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Platform overview and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-8">
        {/* Total Societies */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-gray-300 text-sm uppercase tracking-wide">
            Total Societies
          </p>
          <p className="text-4xl font-bold mt-3">
            {totalSocieties}
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-blue-100 text-sm uppercase tracking-wide">
            Total Revenue
          </p>
          <p className="text-4xl font-bold mt-3">
            ₹ {totalRevenue}
          </p>
        </div>

        {/* Active Plans */}
        <div className="bg-gradient-to-br from-green-600 to-green-400 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-green-100 text-sm uppercase tracking-wide">
            Active Plans
          </p>
          <p className="text-4xl font-bold mt-3">
            {activePlans}
          </p>
        </div>

        {/* Expired Plans */}
        <div className="bg-gradient-to-br from-red-600 to-red-400 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-red-100 text-sm uppercase tracking-wide">
            Expired Plans
          </p>
          <p className="text-4xl font-bold mt-3">
            {expiredPlans}
          </p>
        </div>
      </div>

      {/* Secondary Section */}
      <div className="mt-14 bg-white p-10 rounded-2xl shadow-md border">
        <h2 className="text-2xl font-semibold mb-4">
          Platform Insights
        </h2>

        <p className="text-gray-600 leading-relaxed">
          Monitor overall system health, subscription activity,
          and revenue trends. Use the sidebar to manage
          societies, review unit requests, handle inquiries,
          and configure platform settings.
        </p>
      </div>
    </div>
  );
}