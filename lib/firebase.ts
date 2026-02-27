import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCjpY_9_-C5_8ShIj4gwkgVcYwzf2wbDgU",
  authDomain: "tokko-society.firebaseapp.com",
  projectId: "tokko-society",
  storageBucket: "tokko-society.firebasestorage.app",
  messagingSenderId: "842132813928",
  appId: "1:842132813928:web:6c9bae746e795f10cb63dd",
  measurementId: "G-ZKFB1EMF9J"
};
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);