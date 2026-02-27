"use client";

import { useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [selectedSociety, setSelectedSociety] = useState("all");

  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);
  const [scheduledList, setScheduledList] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingBroadcast, setLoadingBroadcast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  //////////////////////////////////////////////////////
  // INIT
  //////////////////////////////////////////////////////

  useEffect(() => {
    fetchSocieties();
    fetchScheduled();
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedSociety]);

  //////////////////////////////////////////////////////
  // FETCH SOCIETIES
  //////////////////////////////////////////////////////

  const fetchSocieties = async () => {
    const snap = await getDocs(collection(db, "societies"));
    setSocieties(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  //////////////////////////////////////////////////////
  // FETCH ANNOUNCEMENTS
  //////////////////////////////////////////////////////

  const fetchAnnouncements = async () => {
    setLoading(true);

    try {
      let snap;

      if (selectedSociety === "all") {
        snap = await getDocs(
          query(
            collectionGroup(db, "announcements"),
            orderBy("createdAt", "desc")
          )
        );
      } else {
        snap = await getDocs(
          query(
            collection(
              db,
              "societies",
              selectedSociety,
              "announcements"
            ),
            orderBy("createdAt", "desc")
          )
        );
      }

      setAnnouncements(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////
  // FETCH SCHEDULED
  //////////////////////////////////////////////////////

  const fetchScheduled = async () => {
    const snap = await getDocs(
      query(
        collection(db, "scheduledAnnouncements"),
        orderBy("scheduledFor", "desc")
      )
    );

    setScheduledList(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  //////////////////////////////////////////////////////
  // MULTI SELECT
  //////////////////////////////////////////////////////

  const handleSelect = (e: any) => {
    const value = e.target.value;

    if (e.target.checked) {
      setSelectedSocieties((prev) => [...prev, value]);
    } else {
      setSelectedSocieties((prev) =>
        prev.filter((id) => id !== value)
      );
    }
  };

  //////////////////////////////////////////////////////
  // INSTANT BROADCAST
  //////////////////////////////////////////////////////

  const handleBroadcast = async () => {
    if (!title || !description) return;

    try {
      setLoadingBroadcast(true);
      setSuccess("");

      const fn = httpsCallable(
        functions,
        "broadcastAnnouncement"
      );

      const res: any = await fn({
        title,
        description,
        targetType:
          selectedSocieties.length > 0
            ? "selected"
            : "all",
        selectedSocieties,
      });

      setTitle("");
      setDescription("");
      setSelectedSocieties([]);

      setSuccess(
        `Broadcast sent to ${res.data.count} societies`
      );

      await fetchAnnouncements();
    } catch (err) {
      console.error(err);
      setSuccess("Broadcast failed");
    } finally {
      setLoadingBroadcast(false);
    }
  };

  //////////////////////////////////////////////////////
  // SCHEDULE (MILLISECONDS METHOD - STABLE)
  //////////////////////////////////////////////////////

  const handleSchedule = async () => {
    if (!scheduleDate) return;

    try {
      const local = new Date(scheduleDate);

      const fn = httpsCallable(
        functions,
        "createScheduledAnnouncement"
      );

      await fn({
        title,
        description,
        scheduledFor: local.getTime(), // ✅ milliseconds
      });

      setTitle("");
      setDescription("");
      setScheduleDate("");

      await fetchScheduled();
    } catch (error) {
      console.error("Schedule failed:", error);
    }
  };

  //////////////////////////////////////////////////////
  // CANCEL SCHEDULE
  //////////////////////////////////////////////////////

  const handleCancel = async (id: string) => {
    const fn = httpsCallable(
      functions,
      "cancelScheduledAnnouncement"
    );

    await fn({ id });
    await fetchScheduled();
  };

  //////////////////////////////////////////////////////
  // EDIT SCHEDULE
  //////////////////////////////////////////////////////

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);

    const date = item.scheduledFor?.toDate();

    if (date) {
      const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setScheduleDate(iso);
    }
  };

  //////////////////////////////////////////////////////
  // DELETE BROADCAST
  //////////////////////////////////////////////////////

  const handleDelete = async (id: string) => {
    const fn = httpsCallable(
      functions,
      "deleteBroadcastAnnouncement"
    );

    await fn({ announcementId: id });
    await fetchAnnouncements();
  };

  //////////////////////////////////////////////////////

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Announcements
      </h1>

      {/* FILTER */}
      <div className="mb-6">
        <select
          value={selectedSociety}
          onChange={(e) =>
            setSelectedSociety(e.target.value)
          }
          className="border p-2 rounded"
        >
          <option value="all">All Societies</option>
          {societies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* BROADCAST FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Broadcast / Schedule
        </h2>

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full border p-3 rounded mb-3"
        />

        <input
          type="datetime-local"
          value={scheduleDate}
          onChange={(e) =>
            setScheduleDate(e.target.value)
          }
          className="w-full border p-3 rounded mb-3"
        />

        <div className="flex gap-3">
          <button
            onClick={handleBroadcast}
            disabled={loadingBroadcast}
            className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
          >
            Send Now
          </button>

          <button
            onClick={handleSchedule}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {editingId ? "Update Schedule" : "Schedule"}
          </button>
        </div>
      </div>

      {/* SCHEDULED LIST */}
      <div className="bg-white p-6 rounded-xl shadow mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Scheduled Announcements
        </h2>

        {scheduledList.map((item) => {
          const date = item.scheduledFor
            ?.toDate()
            .toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            });

          return (
            <div
              key={item.id}
              className="border-b py-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {item.title}
                </p>
                <p className="text-sm text-gray-500">
                  {date}
                </p>
                <p className="text-xs">
                  Status: {item.status}
                </p>
              </div>

              {item.status === "pending" && (
                <div className="space-x-3">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleCancel(item.id)
                    }
                    className="text-red-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ANNOUNCEMENT LIST */}
      {loading && (
        <p className="text-gray-500">Loading...</p>
      )}

      <div className="bg-white rounded-2xl shadow-md border mt-8">
        {announcements.map((item) => {
          const created = item.createdAt
            ?.toDate()
            .toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            });

          return (
            <div
              key={item.id}
              className="p-6 border-b last:border-b-0 flex justify-between"
            >
              <div>
                <h2 className="font-semibold">
                  {item.title}
                </h2>
                <p className="text-gray-600">
                  {item.description}
                </p>
                <div className="text-sm text-gray-500">
                  Society: {item.societyName || "N/A"}
                </div>
                <div className="text-sm text-gray-500">
                  {created}
                </div>
              </div>

              <button
                onClick={() =>
                  handleDelete(item.id)
                }
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}