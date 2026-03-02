"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Lead {
  id: string;
  name: string;
  email: string;
  society?: string;
  message: string;
  status: string;
  createdAt?: any;
}

export default function ContactLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const q = query(
        collection(db, "contact_leads"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data: Lead[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Lead, "id">),
      }));

      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }

    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "contact_leads", id), {
      status,
    });

    fetchLeads();
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Contact Leads</h1>

      {loading ? (
        <p>Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className="text-gray-500">No contact leads found.</p>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Society</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="p-4">{lead.name}</td>
                  <td className="p-4">{lead.email}</td>
                  <td className="p-4">{lead.society || "-"}</td>
                  <td className="p-4">{lead.message}</td>
                  <td className="p-4 capitalize">{lead.status}</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        updateStatus(lead.id, "contacted")
                      }
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Contacted
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(lead.id, "converted")
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                    >
                      Converted
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(lead.id, "closed")
                      }
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm"
                    >
                      Closed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}