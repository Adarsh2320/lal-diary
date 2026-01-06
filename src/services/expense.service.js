import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebase.db";

/* ================= ADD PERSONAL EXPENSE ================= */
export const addExpense = async ({
  amount,
  label = null,
  note = null,
  userId,
  transactionType = "debit", // ✅ NEW (default safe)
}) => {
  return await addDoc(collection(db, "expenses"), {
    amount,
    label,
    note,
    userId,
    transactionType, // ✅ STORED IN DB
    createdAt: serverTimestamp(),
  });
};

/* ================= REAL-TIME LISTENER ================= */
export const listenToUserExpenses = (userId, callback) => {
  const q = query(
    collection(db, "expenses"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      transactionType: doc.data().transactionType || "debit", // ✅ BACKWARD SAFE
    }));
    callback(expenses);
  });
};

/* ================= DELETE EXPENSE ================= */
export const deleteExpense = async (expenseId) => {
  return await deleteDoc(doc(db, "expenses", expenseId));
};
