"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function EditSocietyPage() {
  const { societyId } = useParams() as { societyId: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  useEffect(() => {
    const fetchSociety = async () => {
      const snap = await getDoc(doc(db, "societies", societyId));

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setAddress(data.address || "");
        setPlan(data.plan || "");
        setPlanPrice(data.planPrice || "");
        setBillingCycle(data.billingCycle || "");
      }

      setLoading(false);
    };

    fetchSociety();
  }, [societyId]);

  const handleUpdate = async () => {
    if (!name || !plan) {
      alert("Name and Plan required");
      return;
    }

    await updateDoc(doc(db, "societies", societyId), {
      name,
      address,
      plan,
      planPrice,
      billingCycle,
      updatedAt: new Date(),
    });

    alert("Society Updated Successfully");
    router.push(`/super-admin/societies/${societyId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">
        Edit Society
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-md border max-w-3xl">
        <div className="space-y-6">

          <div>
            <label className="block text-gray-600 mb-2">
              Society Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">
              Plan Name
            </label>
            <input
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">
              Plan Price
            </label>
            <input
              value={planPrice}
              onChange={(e) => setPlanPrice(e.target.value)}
              className="w-full border rounded-lg p-3"
              type="number"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">
              Billing Cycle
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Select</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleUpdate}
              className="px-6 py-3 bg-black text-white rounded-lg"
            >
              Update Society
            </button>

            <button
              onClick={() =>
                router.push(`/super-admin/societies/${societyId}`)
              }
              className="px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}