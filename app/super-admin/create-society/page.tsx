"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { useRouter } from "next/navigation";
import { functions } from "@/lib/firebase";

export default function CreateSociety() {
  const router = useRouter();

  const [units, setUnits] = useState<number>(0);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);

  const [form, setForm] = useState({
    name: "",
    address: "",
    plan: "",
    planPrice: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  //////////////////////////////////////////////////////
  // AUTO CALCULATION (UI ONLY)
  //////////////////////////////////////////////////////

  useEffect(() => {
    const calculated = units * pricePerUnit;

    setForm((prev) => ({
      ...prev,
      planPrice: calculated.toString(),
    }));
  }, [units, pricePerUnit]);

  //////////////////////////////////////////////////////

  const handleCreate = async () => {
    try {
      const createSociety = httpsCallable(
        functions,
        "createSociety"
      );

      const result: any = await createSociety({
        name: form.name,
        address: form.address,
        totalUnits: 0,
        plan: form.plan,
        planPrice: Number(form.planPrice),
        billingCycle: "monthly",
        planType: "paid",
      });

      const societyId = result.data.societyId;

      const createAdmin = httpsCallable(
        functions,
        "createSocietyAdmin"
      );

      await createAdmin({
        name: form.adminName,
        email: form.adminEmail,
        societyId,
      });

      alert("Society & Admin Created Successfully");

      router.push("/super-admin/societies");

    } catch (error: any) {
      alert(error.message);
    }
  };

  //////////////////////////////////////////////////////

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Create Society
      </h1>

      <div className="space-y-4">

        <h2 className="font-semibold text-gray-600">
          Society Details
        </h2>

        <input
          placeholder="Society Name"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Address"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />

        <input
          placeholder="Plan Name"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, plan: e.target.value })
          }
        />

        {/* NEW UI SECTION */}

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Units (UI Only)"
            type="number"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setUnits(Number(e.target.value))
            }
          />

          <input
            placeholder="Price Per Unit (UI Only)"
            type="number"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setPricePerUnit(Number(e.target.value))
            }
          />
        </div>

        {/* AUTO CALCULATED FIELD */}

        <input
          placeholder="Plan Price (Auto Calculated)"
          type="number"
          value={form.planPrice}
          readOnly
          className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
        />

        <hr className="my-4" />

        <h2 className="font-semibold text-gray-600">
          Society Admin Details
        </h2>

        <input
          placeholder="Admin Name"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              adminName: e.target.value,
            })
          }
        />

        <input
          placeholder="Admin Email"
          type="email"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              adminEmail: e.target.value,
            })
          }
        />

        <input
          placeholder="Admin Password"
          type="password"
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({
              ...form,
              adminPassword: e.target.value,
            })
          }
        />

        <button
          onClick={handleCreate}
          className="bg-gray-900 text-white px-4 py-2 rounded w-full mt-4"
        >
          Create Society
        </button>
      </div>
    </div>
  );
}