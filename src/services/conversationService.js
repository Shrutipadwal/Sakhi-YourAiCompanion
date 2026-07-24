import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

function conversationsCollection(uid) {
  return collection(db, "users", uid, "conversations");
}

function messagesCollection(uid, conversationId) {
  return collection(
    db,
    "users",
    uid,
    "conversations",
    conversationId,
    "messages",
  );
}

export async function getLatestConversation(uid) {
  const conversationsQuery = query(
    conversationsCollection(uid),
    orderBy("updatedAt", "desc"),
    limit(1),
  );
  const snapshot = await getDocs(conversationsQuery);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function createConversation(uid, title = "New Chat") {
  const conversationRef = await addDoc(conversationsCollection(uid), {
    title,
    category: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: conversationRef.id, title };
}

export async function updateConversationTitle(uid, conversationId, title) {
  const conversationRef = doc(
    db,
    "users",
    uid,
    "conversations",
    conversationId,
  );
  await updateDoc(conversationRef, { title, updatedAt: serverTimestamp() });
}

export async function updateConversationTimestamp(uid, conversationId) {
  const conversationRef = doc(
    db,
    "users",
    uid,
    "conversations",
    conversationId,
  );
  await updateDoc(conversationRef, { updatedAt: serverTimestamp() });
}

export async function deleteConversation(uid, conversationId) {
  const messagesSnapshot = await getDocs(
    messagesCollection(uid, conversationId),
  );
  const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
    deleteDoc(
      doc(
        db,
        "users",
        uid,
        "conversations",
        conversationId,
        "messages",
        messageDoc.id,
      ),
    ),
  );

  await Promise.all(deletePromises);
  await deleteDoc(doc(db, "users", uid, "conversations", conversationId));
}
