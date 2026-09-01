import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function conversationsCollection(uid) {
  return collection(db, "users", uid, "conversations");
}

export async function fetchConversations(uid) {
  const conversationsQuery = query(
    conversationsCollection(uid),
    orderBy("updatedAt", "desc"),
  );
  const snapshot = await getDocs(conversationsQuery);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
