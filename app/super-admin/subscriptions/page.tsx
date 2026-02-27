"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Society {
  id: string;
  name: string;
  plan: string;
  status: string;
  expiryDate?: any;
}

export default function SubscriptionsPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    const snapshot = await getDocs(collection(db, "societies"));

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Society[];

    setSocieties(list);
    setLoading(false);
  };

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";

    await updateDoc(doc(db, "societies", id), {
      status: newStatus,
    });

    updateLocal(id, { status: newStatus });
  };

  const extendMonth = async (id: string, currentExpiry: any) => {
    let baseDate: Date;

    if (!currentExpiry) {
      baseDate = new Date();
    } else if (currentExpiry instanceof Date) {
      baseDate = new Date(currentExpiry);
    } else if (typeof currentExpiry.toDate === "function") {
      baseDate = new Date(currentExpiry.toDate());
    } else {
      baseDate = new Date();
    }

    baseDate.setMonth(baseDate.getMonth() + 1);

    await updateDoc(doc(db, "societies", id), {
      expiryDate: baseDate,
    });

    updateLocal(id, { expiryDate: baseDate });
  };

  const reduceMonth = async (id: string, currentExpiry: any) => {
    if (!currentExpiry) return;

    let baseDate: Date;

    if (currentExpiry instanceof Date) {
      baseDate = new Date(currentExpiry);
    } else if (typeof currentExpiry.toDate === "function") {
      baseDate = new Date(currentExpiry.toDate());
    } else {
      return;
    }

    baseDate.setMonth(baseDate.getMonth() - 1);

    await updateDoc(doc(db, "societies", id), {
      expiryDate: baseDate,
    });

    updateLocal(id, { expiryDate: baseDate });
  };

  const updateLocal = (id: string, changes: any) => {
    setSocieties((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      )
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-10">
        Subscription Management
      </h1>

      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        {societies.map((item) => {
          const now = new Date();

          let expiry: Date | null = null;

          if (item.expiryDate instanceof Date) {
            expiry = item.expiryDate;
          } else if (item.expiryDate?.toDate) {
            expiry = item.expiryDate.toDate();
          }

          const isExpired = expiry ? expiry < now : false;

          // 🔥 FINAL RULE
          let displayStatus = "active";
          let badgeColor = "bg-green-100 text-green-700";

          if (item.status === "inactive" || isExpired) {
            displayStatus = "inactive";
            badgeColor = "bg-gray-200 text-gray-700";
          }

          // 🔥 OPTIONAL AUTO SYNC (recommended)
          if (isExpired && item.status !== "inactive") {
            updateDoc(doc(db, "societies", item.id), {
              status: "inactive",
            });
          }

          return (
            <div
              key={item.id}
              className="p-6 border-b hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {item.name}
                  </h2>

                  <p className="text-gray-500">
                    Plan: {item.plan}
                  </p>

                  <p className="text-gray-500">
                    Expiry:{" "}
                    {expiry
                      ? expiry.toLocaleDateString()
                      : "Not Set"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${badgeColor}`}
                  >
                    {displayStatus}
                  </span>

                  <button
                    onClick={() =>
                      toggleStatus(
                        item.id,
                        item.status
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() =>
                      extendMonth(
                        item.id,
                        item.expiryDate
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    +1 Month
                  </button>

                  <button
                    onClick={() =>
                      reduceMonth(
                        item.id,
                        item.expiryDate
                      )
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg"
                  >
                    -1 Month
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}