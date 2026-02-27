"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  city: string;
  societyName: string;
  status: string;
  createdAt: any;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      const q = query(
        collection(db, "inquiries"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Inquiry[];

      setInquiries(list);
      setLoading(false);
    };

    fetchInquiries();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: string
  ) => {
    try {
      await updateDoc(doc(db, "inquiries", id), {
        status: newStatus,
      });

      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: newStatus }
            : item
        )
      );

      console.log("Status updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update status. Check console.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Service Inquiries
        </h1>
        <p className="text-gray-500 mt-2">
          New societies requesting service
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No inquiries found
          </div>
        ) : (
          inquiries.map((item) => (
            <div
              key={item.id}
              className="p-6 border-b hover:bg-gray-50 transition"
            >
              {/* TITLE + STATUS BADGE */}
              <div className="flex justify-between mb-2 items-start">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-xl font-semibold">
                    {item.societyName}
                  </h2>

                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium
                      ${
                        item.status === "closed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "contacted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {item.status || "new"}
                  </span>
                </div>
              </div>

              {/* DATE */}
              <div className="text-sm text-gray-500 mb-3">
                {item.createdAt
                  ?.toDate()
                  .toLocaleString()}
              </div>

              {/* DETAILS */}
              <div className="text-gray-700 space-y-1">
                <p><strong>Name:</strong> {item.name}</p>
                <p><strong>Phone:</strong> {item.phone}</p>
                <p><strong>City:</strong> {item.city}</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    handleStatusChange(
                      item.id,
                      "contacted"
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Mark Contacted
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(
                      item.id,
                      "closed"
                    )
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}