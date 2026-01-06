import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../firebase/firebase.db";

/* Add label */
export const addLabel = async (name, userId) => {
  return await addDoc(collection(db, "labels"), {
    name,
    userId
  });
};

/* Listen to user labels */
export const listenToLabels = (userId, callback) => {
  const q = query(
    collection(db, "labels"),
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    );
  });
};

/* Delete label */
export const deleteLabel = async (labelId) => {
  return await deleteDoc(doc(db, "labels", labelId));
};
