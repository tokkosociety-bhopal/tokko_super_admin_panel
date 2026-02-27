"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { checkSuperAdmin } from "@/lib/authGuard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      const isSuper = await checkSuperAdmin(res.user.uid);

      if (!isSuper) {
        alert("Access Denied. Not Super Admin.");
        return;
      }

      router.push("/super-admin/dashboard");

    } catch (error) {
      alert("Login Failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96">
        <h2 className="text-xl font-bold mb-4">Super Admin Login</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-black text-white p-2 w-full rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}