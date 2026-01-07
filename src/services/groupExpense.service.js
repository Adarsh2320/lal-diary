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
// export const addGroupExpense = async ({
//   groupId,
//   amount,
//   paidBy,
//   paidByName,
//   paidByEmail,
//   participants, // UID ARRAY
//   note = "",
//   transactionType = "debit",
// }) => {
//   if (!groupId || !amount || !paidBy || !participants?.length) {
//     throw new Error("Invalid group expense data");
//   }

//   const splitAmount =
//     transactionType === "debit"
//       ? amount / participants.length
//       : 0;

//   return await addDoc(collection(db, "groupExpenses"), {
//     groupId,
//     amount,
//     paidBy,
//     paidByName,
//     paidByEmail,
//     participants, // ✅ UID array
//     splitAmount,
//     note,
//     transactionType,
//     createdAt: serverTimestamp(),
//   });
// };


export const addGroupExpense = async ({
  groupId,
  amount,
  paidBy,
  paidByName,
  paidByEmail,
  participants, // UID ARRAY
  note = "",
  transactionType = "debit",
}) => {
  if (!groupId || !amount || !paidBy || !participants?.length) {
    throw new Error("Invalid group expense data");
  }

  // ✅ keep existing split logic (UI may depend on it)
  const splitAmount =
    transactionType === "debit"
      ? amount / participants.length
      : 0;

  /* -----------------------------------------
     1️⃣ ADD GROUP EXPENSE (SHARED - SAME AS NOW)
  ------------------------------------------ */
  const groupExpenseRef = await addDoc(
    collection(db, "groupExpenses"),
    {
      groupId,
      amount,
      paidBy,
      paidByName,
      paidByEmail,
      participants,
      splitAmount,
      note,
      transactionType,
      createdAt: serverTimestamp(),
    }
  );

  /* -----------------------------------------
     2️⃣ ADD PERSONAL EXPENSE (ONLY PAYER)
  ------------------------------------------ */
  await addDoc(
    collection(db, "users", paidBy, "expenses"),
    {
      groupId,
      groupExpenseId: groupExpenseRef.id,
      amount,
      note,
      type: "GROUP",
      createdAt: serverTimestamp(),
    }
  );

  /* -----------------------------------------
     3️⃣ ADD TRANSACTION (ONLY PAYER)
  ------------------------------------------ */
  await addDoc(
    collection(db, "users", paidBy, "transactions"),
    {
      groupId,
      referenceId: groupExpenseRef.id,
      amount: -amount, // money paid
      transactionType: "debit",
      note,
      createdAt: serverTimestamp(),
    }
  );

  // 🚫 NO writes for other participants

  return groupExpenseRef.id;
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
      const expenses = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        return {
          id: docSnap.id,
          ...data,

          // ✅ backward safety
          transactionType: data.transactionType || "debit",
          participants: Array.isArray(data.participants)
            ? data.participants
            : [],
          splitAmount: data.splitAmount ?? 0,
        };
      });

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
// export const listenToUserGroupExpenses = (groupIds, callback) => {
//   if (!Array.isArray(groupIds) || groupIds.length === 0) {
//     callback([]);
//     return () => {};
//   }

//   // 🔒 Firestore "in" supports max 10
//   const safeGroupIds = groupIds.slice(0, 10);

//   const q = query(
//     collection(db, "groupExpenses"),
//     where("groupId", "in", safeGroupIds),
//     orderBy("createdAt", "desc")
//   );

//   return onSnapshot(
//     q,
//     (snapshot) => {
//       const data = snapshot.docs.map((docSnap) => {
//         const d = docSnap.data();

//         return {
//           id: docSnap.id,
//           ...d,
//           transactionType: d.transactionType || "debit",
//           participants: Array.isArray(d.participants) ? d.participants : [],
//           splitAmount: d.splitAmount ?? 0,
//         };
//       });

//       callback(data);
//     },
//     (error) => {
//       console.error("User group expense listener error:", error.message);
//       callback([]);
//     }
//   );
// };
export const listenToUserGroupExpenses = (
  groupIds,
  userId,
  callback
) => {
  if (!Array.isArray(groupIds) || groupIds.length === 0 || !userId) {
    callback([]);
    return () => {};
  }

  const safeGroupIds = groupIds.slice(0, 10);

  const q = query(
    collection(db, "groupExpenses"),
    where("groupId", "in", safeGroupIds),
    where("paidBy", "==", userId), // ✅ KEY FIX
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(data);
  });
};
