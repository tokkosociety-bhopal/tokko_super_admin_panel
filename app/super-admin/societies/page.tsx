"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface Society {
  id: string;
  name: string;
  plan: string;
  status: string;
  totalUnits: number;
  unitsUsed: number;
  planPrice?: number; // ✅ ADDED
  planExpiryDate: any;
}

export default function SocietiesPage() {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
  const fetch = async () => {

    // 🔥 FIRST get societies
    const snapshot = await getDocs(
      collection(db, "societies")
    );

    // 🔥 THEN map with dynamic unit count
    const list = await Promise.all(
      snapshot.docs.map(async (docSnap) => {

        const unitsSnap = await getDocs(
          collection(db, "societies", docSnap.id, "units")
        );

        return {
          id: docSnap.id,
          ...docSnap.data(),
          totalUnits: unitsSnap.size, // real total
        };

      })
    );

    setSocieties(list as Society[]);
  };

  fetch();
}, []);

  //////////////////////////////////////////////////////

  const filteredSocieties = societies.filter((soc) => {
    const matchesSearch = soc.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : soc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  //////////////////////////////////////////////////////

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Societies</h1>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search society..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            onClick={() =>
              router.push("/super-admin/create-society")
            }
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Create Society
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-base">
          <thead className="bg-gray-50 border-b">
  <tr>
    <th className="p-4 text-left">Name</th>
    <th className="p-4 text-left">Plan</th>
    <th className="p-4 text-left">Price</th>
    <th className="p-4 text-left">Status</th>
    <th className="p-4 text-left">Units</th>
    <th className="p-4 text-left">Used</th>
    <th className="p-4 text-left">Expiry</th>
    <th className="p-4 text-right">Action</th>
  </tr>
</thead>

          <tbody>
            {filteredSocieties.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center p-6 text-gray-500"
                >
                  No societies found
                </td>
              </tr>
            )}

            {filteredSocieties.map((soc) => (
              <tr
                key={soc.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium">
                  {soc.name}
                </td>

                <td className="p-4">{soc.plan}</td>

                <td className="p-4 font-medium text-gray-700">
                  ₹{" "}
                  {soc.planPrice
                    ? soc.planPrice.toLocaleString()
                    : 0}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      soc.status === "active"
                        ? "bg-green-100 text-green-700"
                        : soc.status === "expired"
                        ? "bg-red-100 text-red-700"
                        : soc.status === "suspended"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {soc.status}
                  </span>
                </td>

                <td className="p-4">
                  {soc.totalUnits}
                </td>

                <td className="p-4">
                  {soc.unitsUsed}
                </td>

                <td className="p-4">
                  {soc.planExpiryDate
                    ? soc.planExpiryDate
                        .toDate()
                        .toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() =>
                      router.push(
                        `/super-admin/societies/${soc.id}`
                      )
                    }
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}