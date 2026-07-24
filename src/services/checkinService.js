import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getLastCheckIn(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  if (!data?.lastCheckIn) {
    return null;
  }

  if (typeof data.lastCheckIn === "string") {
    return data.lastCheckIn;
  }

  if (data.lastCheckIn?.toDate) {
    return data.lastCheckIn.toDate().toISOString().slice(0, 10);
  }

  return null;
}

export async function setLastCheckIn(uid, dayString) {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      lastCheckIn: dayString,
    },
    { merge: true },
  );
}
