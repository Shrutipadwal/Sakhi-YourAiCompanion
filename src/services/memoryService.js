import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_MEMORY_PROFILE = {
  name: null,
  profession: null,
  goals: [],
  hobbies: [],
  preferences: [],
  studyHabits: [],
  learningPreferences: [],
  personalChallenges: [],
  motivationSources: [],
  lifestylePreferences: [],
  importantPeople: [],
  dreams: [],
  updatedAt: null,
};

function normalizeText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function defaultMemoryProfile() {
  return { ...DEFAULT_MEMORY_PROFILE };
}

export async function getMemoryProfile(uid) {
  const profileRef = doc(db, "users", uid, "memories", "profile");
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return defaultMemoryProfile();
  }

  return {
    ...defaultMemoryProfile(),
    ...snapshot.data(),
  };
}

export async function saveMemoryProfile(uid, profileData) {
  const profileRef = doc(db, "users", uid, "memories", "profile");
  const dataToStore = {
    ...defaultMemoryProfile(),
    ...profileData,
    updatedAt: serverTimestamp(),
  };

  await setDoc(profileRef, dataToStore, { merge: true });
}

export function mergeMemoryProfiles(existingProfile, extractedProfile) {
  const merged = {
    ...defaultMemoryProfile(),
    ...existingProfile,
  };

  const stringFields = ["name", "profession"];
  const arrayFields = [
    "goals",
    "hobbies",
    "preferences",
    "studyHabits",
    "learningPreferences",
    "personalChallenges",
    "motivationSources",
    "lifestylePreferences",
    "importantPeople",
    "dreams",
  ];

  stringFields.forEach((field) => {
    const extractedValue = normalizeText(extractedProfile?.[field]);
    if (extractedValue) {
      merged[field] = extractedValue;
    }
  });

  arrayFields.forEach((field) => {
    const extractedItems = normalizeArray(extractedProfile?.[field]);
    if (extractedItems.length === 0) {
      return;
    }

    const currentItems = normalizeArray(merged[field]);
    const existingLower = currentItems.map((item) => item.toLowerCase());
    const uniqueNewItems = extractedItems.filter(
      (item) => !existingLower.includes(item.toLowerCase()),
    );

    if (uniqueNewItems.length > 0) {
      merged[field] = [...currentItems, ...uniqueNewItems];
    }
  });

  return merged;
}

export function isMemoryProfileEqual(profileA, profileB) {
  return (
    JSON.stringify({ ...defaultMemoryProfile(), ...profileA }) ===
    JSON.stringify({ ...defaultMemoryProfile(), ...profileB })
  );
}

export function parseJsonFromText(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  const jsonText = cleaned.slice(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse memory JSON:", error, jsonText);
    return null;
  }
}
