import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function toLocalDayString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    return toLocalDayString(data.lastCheckIn.toDate());
  }

  return null;
}

export async function getLastCheckInPromptDate(uid) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const promptDate = snapshot.data()?.lastCheckInPromptDate;
  if (typeof promptDate === "string") {
    return promptDate;
  }
  if (promptDate?.toDate) {
    return toLocalDayString(promptDate.toDate());
  }

  return null;
}

export async function setLastCheckIn(uid, dayString) {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      lastCheckIn: dayString,
      lastCheckInPromptDate: dayString,
    },
    { merge: true },
  );
}

export async function setLastCheckInPromptDate(uid, dayString) {
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      lastCheckInPromptDate: dayString,
    },
    { merge: true },
  );
}
