import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

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

export async function fetchConversationMessages(uid, conversationId) {
  const messagesQuery = query(
    messagesCollection(uid, conversationId),
    orderBy("timestamp", "asc"),
  );
  const snapshot = await getDocs(messagesQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    role: docItem.data().role,
    content: docItem.data().content,
    timestamp: docItem.data().timestamp,
  }));
}

export async function fetchRecentConversationMessages(
  uid,
  conversationId,
  maxMessages = 20,
) {
  const messagesQuery = query(
    messagesCollection(uid, conversationId),
    orderBy("timestamp", "desc"),
    limit(maxMessages),
  );
  const snapshot = await getDocs(messagesQuery);

  const recentMessages = snapshot.docs
    .map((docItem) => ({
      id: docItem.id,
      role: docItem.data().role,
      content: docItem.data().content,
      timestamp: docItem.data().timestamp,
    }))
    .reverse();

  return recentMessages;
}

export async function saveConversationMessage(
  uid,
  conversationId,
  { role, content },
) {
  const messageRef = await addDoc(messagesCollection(uid, conversationId), {
    role,
    content,
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", uid, "conversations", conversationId), {
    updatedAt: serverTimestamp(),
  });

  return messageRef.id;
}

export async function deleteConversationMessages(uid, conversationId) {
  const snapshot = await getDocs(messagesCollection(uid, conversationId));
  const deletePromises = snapshot.docs.map((docItem) =>
    deleteDoc(
      doc(
        db,
        "users",
        uid,
        "conversations",
        conversationId,
        "messages",
        docItem.id,
      ),
    ),
  );
  await Promise.all(deletePromises);
}
