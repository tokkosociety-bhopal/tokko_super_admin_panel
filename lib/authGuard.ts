import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const checkSuperAdmin = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));

  if (!snap.exists()) return false;

  const data = snap.data();

  return data.role === "superadmin" && data.isActive === true;
};