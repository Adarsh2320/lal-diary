import {
  addDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase.db";

/* ================= ADD GROUP EXPENSE ================= */
export const addGroupExpense = async ({
  groupId,
  amount,
  paidBy,
  paidByName,
  paidByEmail,
  participants,
  note = "",
  transactionType = "debit", // ✅ NEW (default safe)
}) => {
  if (!groupId || !amount || !paidBy || !participants?.length) {
    throw new Error("Invalid group expense data");
  }

  const splitAmount = amount / participants.length;

  return await addDoc(collection(db, "groupExpenses"), {
    groupId,
    amount,
    paidBy,
    paidByName,
    paidByEmail,
    participants,
    splitAmount,
    note,
    transactionType, // ✅ STORED IN DB
    createdAt: serverTimestamp(),
  });
};

/* ================= LISTEN TO SINGLE GROUP ================= */
export const listenToGroupExpenses = (groupId, callback) => {
  if (!groupId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "groupExpenses"),
    where("groupId", "==", groupId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        transactionType: doc.data().transactionType || "debit", // ✅ BACKWARD SAFE
      }));
      callback(expenses);
    },
    (error) => {
      console.error("Group expense listener error:", error.message);
      callback([]);
    }
  );
};

/* ================= DELETE GROUP EXPENSE ================= */
/* Firestore rules enforce: only payer can delete */
export const deleteGroupExpense = async (expenseId) => {
  if (!expenseId) return;
  return await deleteDoc(doc(db, "groupExpenses", expenseId));
};

/* ================= LISTEN TO USER GROUP EXPENSES ================= */
/* Used by Dashboard & Transactions */
export const listenToUserGroupExpenses = (groupIds, callback) => {
  // 🔒 Firestore "in" query requires 1–10 values
  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    callback([]);
    return () => {};
  }

  const safeGroupIds = groupIds.slice(0, 10);

  const q = query(
    collection(db, "groupExpenses"),
    where("groupId", "in", safeGroupIds),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        transactionType: doc.data().transactionType || "debit", // ✅ BACKWARD SAFE
      }));
      callback(data);
    },
    (error) => {
      console.error("User group expense listener error:", error.message);
      callback([]);
    }
  );
};
