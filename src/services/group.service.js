import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  arrayUnion,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase.db";
import { auth } from "../firebase/firebase.auth";

/* ================= HELPERS ================= */
const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 10);

/* ================= CREATE GROUP ================= */
export const createGroup = async ({ name, adminId }) => {
  const inviteCode = generateInviteCode();

  return await addDoc(collection(db, "groups"), {
    name,
    adminId,
    members: [
      {
        uid: adminId,
        name: auth.currentUser.displayName || auth.currentUser.email,
        email: auth.currentUser.email,
      },
    ],
    
    memberIds: [adminId], // 🔑 IMPORTANT
    inviteCode,
    createdAt: serverTimestamp(),
  });
};

/* ================= LISTEN TO USER GROUPS ================= */
export const listenToGroups = (userId, callback) => {
  const q = query(
    collection(db, "groups"),
    where("memberIds", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
};

/* ================= REQUEST TO JOIN ================= */
export const requestToJoinGroup = async ({ groupId, userId, userEmail }) => {
  return await addDoc(collection(db, "groupJoinRequests"), {
    groupId,
    userId,
    userEmail,
    userName: auth.currentUser.displayName || auth.currentUser.email,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

/* ================= LISTEN TO JOIN REQUESTS ================= */
export const listenToJoinRequests = (groupId, callback) => {
  const q = query(
    collection(db, "groupJoinRequests"),
    where("groupId", "==", groupId),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  });
};

/* ================= APPROVE JOIN REQUEST ================= */
export const approveJoinRequest = async (request) => {
  const groupRef = doc(db, "groups", request.groupId);

  await updateDoc(groupRef, {
    members: arrayUnion({
      uid: request.userId,
      name: request.userName,
      email: request.userEmail,
    }),
    memberIds: arrayUnion(request.userId),
  });

  await updateDoc(doc(db, "groupJoinRequests", request.id), {
    status: "approved",
  });
};

/* ================= REJECT JOIN REQUEST ================= */
export const rejectJoinRequest = async (requestId) => {
  await updateDoc(doc(db, "groupJoinRequests", requestId), {
    status: "rejected",
  });
};

/* ================= REMOVE MEMBER (ADMIN) ================= */
export const removeGroupMember = async (groupId, memberId) => {
  const groupRef = doc(db, "groups", groupId);
  const snap = await getDoc(groupRef);

  if (!snap.exists()) {
    throw new Error("Group not found");
  }

  const group = snap.data();

  // ❌ Admin cannot remove themselves
  if (group.adminId === memberId) {
    throw new Error("Admin cannot remove themselves");
  }

  // ✅ Filter out member
  const updatedMembers = group.members.filter(
    (m) => m.uid !== memberId
  );

  await updateDoc(groupRef, {
    members: updatedMembers,
    memberIds: updatedMembers.map((m) => m.uid),
  });
};


/* ================= LEAVE GROUP (MEMBER) ================= */
// export const leaveGroup = async (groupId, userId) => {
//   const groupRef = doc(db, "groups", groupId);
//   const snap = await getDoc(groupRef);

//   if (!snap.exists()) return;

//   const group = snap.data();

//   // ❌ Admin cannot leave directly
//   if (group.adminId === userId) {
//     throw new Error("Admin must transfer ownership before leaving");
//   }

//   // 🔐 Only admin is allowed to update groups
//   // So we simulate "leave" by admin logic
//   const updatedMembers = group.members.filter(
//     (m) => m.uid !== userId
//   );

//   await updateDoc(groupRef, {
//     members: updatedMembers,
//     memberIds: updatedMembers.map((m) => m.uid),
//   });
// };



/* ================= GET GROUP BY INVITE CODE ================= */
export const getGroupByInviteCode = async (inviteCode) => {
  const q = query(
    collection(db, "groups"),
    where("inviteCode", "==", inviteCode)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const docSnap = snap.docs[0];

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };

};
