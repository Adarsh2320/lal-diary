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
  arrayRemove,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase/firebase.db";

/* Generate invite code */
const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 10);

/* Create Group (Admin = creator) */
export const createGroup = async ({ name, adminId }) => {
  const inviteCode = generateInviteCode();

  return await addDoc(collection(db, "groups"), {
    name,
    adminId,
    members: [adminId],
    inviteCode,
    createdAt: serverTimestamp()
  });
};

/* Listen to groups where user is member */
export const listenToGroups = (userId, callback) => {
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  });
};

/* Request to join group */
export const requestToJoinGroup = async ({ groupId, userId, userEmail }) => {
  return await addDoc(collection(db, "groupJoinRequests"), {
    groupId,
    userId,
    userEmail,
    status: "pending",
    createdAt: serverTimestamp()
  });
};

/* Listen to join requests (Admin only) */
export const listenToJoinRequests = (groupId, callback) => {
  const q = query(
    collection(db, "groupJoinRequests"),
    where("groupId", "==", groupId),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  });
};

/* Approve join request */
export const approveJoinRequest = async (request) => {
  await updateDoc(doc(db, "groups", request.groupId), {
    members: arrayUnion(request.userId)
  });

  await updateDoc(doc(db, "groupJoinRequests", request.id), {
    status: "approved"
  });
};

/* Reject join request */
export const rejectJoinRequest = async (requestId) => {
  await updateDoc(doc(db, "groupJoinRequests", requestId), {
    status: "rejected"
  });
};

/* Remove member (Admin only) */
export const removeMember = async (groupId, userId) => {
  await updateDoc(doc(db, "groups", groupId), {
    members: arrayRemove(userId)
  });
};

/* Find group by invite code */
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
    ...docSnap.data()
  };
};


/* Admin removes a member */
export const removeGroupMember = async (groupId, memberId) => {
  const groupRef = doc(db, "groups", groupId);

  await updateDoc(groupRef, {
    members: arrayRemove(memberId)
  });
};

/* Member leaves group */
export const leaveGroup = async (groupId, userId) => {
  const groupRef = doc(db, "groups", groupId);

  await updateDoc(groupRef, {
    members: arrayRemove(userId)
  });
};


