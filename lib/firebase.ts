import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDBkNHL1BBBQJ9U77q-2CPfI87f8lxOOFc",
  authDomain: "tokko-society-19052026.firebaseapp.com",
  projectId: "tokko-society-19052026",
  storageBucket: "tokko-society-19052026.firebasestorage.app",
  messagingSenderId: "100599934",
  appId: "1:100599934:web:1c23c68b42857096db702f",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);