"use client";

import { useEffect, useState } from "react";
import {
  collectionGroup,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Suggestion {
  id: string;
  residentName?: string;
  unitNo?: string;
  title?: string;
  description?: string;
  status?: string;
  createdAt?: any;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = query(
        collectionGroup(db, "suggestions"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Suggestion[];

      setSuggestions(list);
      setLoading(false);
    };

    fetchSuggestions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          Suggestions
        </h1>
        <p className="text-gray-500 mt-2">
          All suggestions from all societies
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        {suggestions.length === 0 ? (
          <div className="p-8 text-gray-500 text-center">
            No suggestions found
          </div>
        ) : (
          suggestions.map((item) => (
            <div
              key={item.id}
              className="p-6 border-b hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  {/* Resident Name */}
                  <p className="text-lg font-semibold text-gray-800">
                    {item.residentName || "Resident"}
                    {item.unitNo && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.unitNo})
                      </span>
                    )}
                  </p>

                  {/* Title - Big & Bold */}
                  {item.title && (
                    <p className="text-xl font-bold text-black mt-2">
                      {item.title}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {item.createdAt
                      ? item.createdAt
                          .toDate()
                          .toLocaleString()
                      : ""}
                  </p>

                  {item.status && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 mt-2 inline-block">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mt-3 whitespace-pre-line">
                {item.description || "No description available"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}