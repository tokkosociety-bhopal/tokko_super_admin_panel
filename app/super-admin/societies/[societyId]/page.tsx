"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useParams, useRouter } from "next/navigation";
import * as QRCode from "qrcode";


export default function SocietyDetail() {
  const { societyId } = useParams() as { societyId: string };
  const router = useRouter();

  const [society, setSociety] = useState<any>(null);
  const [stats, setStats] = useState({
    residents: 0,
    guards: 0,
    staff: 0,
    visitors: 0,
  });

  //////////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////////

  const fetchData = async () => {
    const snap = await getDoc(doc(db, "societies", societyId));
    if (snap.exists()) setSociety(snap.data());

    const residents = await getDocs(
      collection(db, "societies", societyId, "residents")
    );
    const guards = await getDocs(
      collection(db, "societies", societyId, "guards")
    );
    const staff = await getDocs(
      collection(db, "societies", societyId, "staff")
    );
    const visitors = await getDocs(
      collection(db, "societies", societyId, "visitors")
    );

    setStats({
      residents: residents.size,
      guards: guards.size,
      staff: staff.size,
      visitors: visitors.size,
    });
  };

  useEffect(() => {
    fetchData();
  }, [societyId]);

  if (!society) return <div>Loading...</div>;

  //////////////////////////////////////////////////////
  // ACTIONS
  //////////////////////////////////////////////////////

  const toggleStatus = async () => {
    await updateDoc(doc(db, "societies", societyId), {
      status: society.status === "active" ? "inactive" : "active",
    });
    fetchData();
  };

  const extendPlan = async () => {
    const current = society.planExpiryDate
      ? society.planExpiryDate.toDate()
      : new Date();

    current.setMonth(current.getMonth() + 1);

    await updateDoc(doc(db, "societies", societyId), {
      planExpiryDate: current,
      status: "active",
    });

    fetchData();
  };

  const reducePlan = async () => {
    if (!society.planExpiryDate) return;

    const current = society.planExpiryDate.toDate();
    current.setMonth(current.getMonth() - 1);

    await updateDoc(doc(db, "societies", societyId), {
      planExpiryDate: current,
    });

    fetchData();
  };

  const hardDelete = async () => {
    if (!confirm("This will permanently delete everything. Continue?"))
      return;

    const fn = httpsCallable(functions, "hardDeleteSociety");
    await fn({ societyId });

    router.push("/super-admin/societies");
  };

  //////////////////////////////////////////////////////
  // QR DOWNLOAD FEATURE (NEW - SAFE ADDITION)
  //////////////////////////////////////////////////////

  const downloadQR = async () => {
  if (!society) {
    alert("Society data not loaded yet");
    return;
  }

  if (!society.qrKey) {
    alert("QR Key not found in this society record");
    return;
  }

  try {
    const url = `https://tokko-society-admin-panel.vercel.app/visitor-entry/${societyId}?key=${society.qrKey}`;

    const qrImage = await QRCode.toDataURL(url);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor QR - ${society.name}</title>
        </head>
        <body style="text-align:center;font-family:Arial;padding-top:40px;">
          <h2>${society.name}</h2>
          <p>Scan to Request Entry</p>
          <img src="${qrImage}" style="width:250px;height:250px;" />
          <p style="margin-top:20px;font-size:12px;">
            ${url}
          </p>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  } catch (err) {
    console.error(err);
    alert("QR generation failed");
  }
};
const handleRegenerateQR = async () => {
  try {
    const regenerate = httpsCallable(functions, "regenerateSocietyQR");

    const res: any = await regenerate({
      societyId,
    });

    alert("QR regenerated successfully");

    // Page refresh taaki new QR reflect ho
    window.location.reload();

  } catch (error: any) {
    console.error(error);
    alert(error.message || "QR regenerate failed");
  }
};

  //////////////////////////////////////////////////////

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">{society.name}</h1>

        <button
          onClick={() =>
            router.push(`/super-admin/edit-society/${societyId}`)
          }
          className="px-4 py-2 border rounded-lg"
        >
          Edit
        </button>
        <button
  onClick={handleRegenerateQR}
  className="px-5 py-2 bg-red-600 text-white rounded"
>
  Regenerate QR
</button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white p-8 rounded-2xl shadow-md border hover:shadow-lg transition"
          >
            <p className="text-gray-500 capitalize">{key}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* SUBSCRIPTION */}
      <div className="bg-white p-8 rounded-2xl shadow-md border mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          Subscription & Status
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-500">Plan</p>
            <p className="text-lg font-medium">{society.plan}</p>
          </div>

          <div>
            <p className="text-gray-500">Status</p>
            <p className="text-lg font-medium capitalize">
              {society.status}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Expiry Date</p>
            <p className="text-lg font-medium">
              {society.planExpiryDate
                ? society.planExpiryDate
                    .toDate()
                    .toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Units</p>
            <p className="text-lg font-medium">
              {society.unitsUsed} / {society.totalUnits}
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={toggleStatus}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg"
          >
            {society.status === "active" ? "Disable" : "Enable"}
          </button>

          <button
            onClick={extendPlan}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Extend +1 Month
          </button>

          <button
            onClick={reducePlan}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg"
          >
            Reduce -1 Month
          </button>

          <button
            onClick={downloadQR}
            className="px-5 py-2 bg-green-600 text-white rounded-lg"
          >
            Download Visitor QR
          </button>
        </div>
      </div>

      {/* FEATURE CONFIGURATION */}
      <div className="bg-white p-8 rounded-2xl shadow-md border mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          Feature Configuration
        </h2>

        {["visitor", "maintenance", "notices", "staff"].map(
          (feature) => (
            <div
              key={feature}
              className="flex justify-between items-center py-3 border-b"
            >
              <p className="capitalize text-lg">{feature}</p>

              <button
                onClick={async () => {
                  await updateDoc(
                    doc(db, "societies", societyId),
                    {
                      [`features.${feature}`]:
                        !society.features?.[feature],
                    }
                  );
                  fetchData();
                }}
                className={`px-4 py-2 rounded-lg ${
                  society.features?.[feature]
                    ? "bg-green-600 text-white"
                    : "bg-gray-300"
                }`}
              >
                {society.features?.[feature]
                  ? "Enabled"
                  : "Disabled"}
              </button>
            </div>
          )
        )}
      </div>

      {/* DANGER ZONE */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-red-700 mb-3">
          Danger Zone
        </h2>

        <button
          onClick={hardDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Hard Delete Society
        </button>
      </div>
    </div>
  );
}