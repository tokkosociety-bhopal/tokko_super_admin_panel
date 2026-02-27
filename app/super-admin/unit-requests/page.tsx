"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";

export default function UnitRequestsPage() {
  const [activeTab, setActiveTab] = useState<
    "create" | "delete" | "edit"
  >("create");

  const [createRequests, setCreateRequests] = useState<any[]>([]);
  const [deleteRequests, setDeleteRequests] = useState<any[]>([]);
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [societyMap, setSocietyMap] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const functions = getFunctions();

  const handleCreateFn = httpsCallable(
    functions,
    "handleUnitCreationRequest"
  );

  const handleDeleteFn = httpsCallable(
    functions,
    "handleUnitDeletionRequest"
  );

  const handleEditFn = httpsCallable(
    functions,
    "handleUnitEditRequest"
  );

  useEffect(() => {
    fetchSocieties();
    fetchAllRequests();
  }, []);

  const fetchSocieties = async () => {
    const snap = await getDocs(collection(db, "societies"));
    const map: any = {};
    snap.docs.forEach((doc) => {
      map[doc.id] = doc.data().name;
    });
    setSocietyMap(map);
  };

  const fetchAllRequests = async () => {
    const createSnap = await getDocs(
      query(
        collection(db, "unitCreationRequests"),
        orderBy("createdAt", "desc")
      )
    );

    const deleteSnap = await getDocs(
      query(
        collection(db, "unitDeletionRequests"),
        orderBy("createdAt", "desc")
      )
    );

    const editSnap = await getDocs(
      query(
        collection(db, "unitEditRequests"),
        orderBy("createdAt", "desc")
      )
    );

    setCreateRequests(
      createSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setDeleteRequests(
      deleteSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setEditRequests(
      editSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );

    setLoading(false);
  };

  const handleAction = async (
    fn: any,
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      await fn({ requestId, action });
      fetchAllRequests();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getBadge = (status: string) => {
    const base = "px-3 py-1 text-xs rounded-full font-semibold";

    if (status === "approved")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          Approved
        </span>
      );

    if (status === "rejected")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          Rejected
        </span>
      );

    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        Pending
      </span>
    );
  };

  const renderRequests = (
    requests: any[],
    fn: any,
    type: string
  ) => {
    return requests.map((req) => (
      <div
        key={req.id}
        className="bg-white rounded-xl shadow p-5 mb-4 border"
      >
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">
              {societyMap[req.societyId] || ""}
            </p>

            {type === "create" && (
              <p className="text-sm text-gray-500">
                {req.totalUnits} Units Requested
              </p>
            )}

            {type === "delete" && (
              <p className="text-sm text-gray-500">
                Delete Unit: {req.unitNo}
              </p>
            )}

            {type === "edit" && (
              <p className="text-sm text-gray-500">
                Edit {req.unitNo} → {req.oldType} ➜ {req.newType}
              </p>
            )}
          </div>

          {getBadge(req.status)}
        </div>

        {req.status === "pending" && (
          <div className="mt-3 flex gap-3">
            <button
              onClick={() =>
                handleAction(fn, req.id, "approve")
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
            >
              Approve
            </button>

            <button
              onClick={() =>
                handleAction(fn, req.id, "reject")
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md text-sm"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Unit Management Requests
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 rounded ${
            activeTab === "create"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Creation
        </button>

        <button
          onClick={() => setActiveTab("delete")}
          className={`px-4 py-2 rounded ${
            activeTab === "delete"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Deletion
        </button>

        <button
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 rounded ${
            activeTab === "edit"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Edit
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {activeTab === "create" &&
        renderRequests(createRequests, handleCreateFn, "create")}

      {activeTab === "delete" &&
        renderRequests(deleteRequests, handleDeleteFn, "delete")}

      {activeTab === "edit" &&
        renderRequests(editRequests, handleEditFn, "edit")}
    </div>
  );
}