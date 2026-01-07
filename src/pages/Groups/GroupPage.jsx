import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase.db";
import GroupExpenses from "./GroupExpenses";
import { removeGroupMember } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!groupId) return;

    const unsub = onSnapshot(doc(db, "groups", groupId), (snap) => {
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsub();
  }, [groupId]);

  if (!group || !user) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <p className="text-gray-500">Loading group...</p>
      </div>
    );
  }

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;

    try {
      await removeGroupMember(group.id, memberId);
      alert("Member removed successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const isAdmin = group.adminId === user.uid;

  return (
    <div className="min-h-screen bg-[#fffafa] px-6 py-6 max-w-6xl mx-auto">
      {/* ================= BACK ================= */}
      <button
        onClick={() => navigate(-1)}
        className="
          mb-4 text-sm font-medium
          text-red-900 border border-red-900
          px-4 py-2 rounded-lg
          hover:bg-red-900 hover:text-white
          transition
        "
      >
        ← Back
      </button>

      {/* ================= HEADER ================= */}
      <div className="bg-white border-8 border-red-900 rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-900">{group.name}</h1>
        <p className="text-lg text-gray-600 mt-1">
          {group.members.length} members
        </p>
      </div>

      {/* ================= MEMBERS ================= */}
      <div className="bg-red-900 rounded-xl p-6 mb-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Group Members
        </h2>

        <ul className="space-y-3">
          {group.members.map((member) => {
            const isSelf = member.uid === user.uid;
            const isGroupAdmin = member.uid === group.adminId;

            return (
              <li
                key={member.uid}
                className="flex justify-between items-center rounded-lg bg-[#fff7f5] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {member.name || member.email}
                  </p>
                  <p className="text-xs text-gray-500">{member.email}</p>

                  {isGroupAdmin && (
                    <span className="text-xs text-red-700 font-semibold">
                      Admin
                    </span>
                  )}

                  {isSelf && !isGroupAdmin && (
                    <span className="text-xs text-gray-500">You</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* ADMIN REMOVE */}
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => {
                        handleRemoveMember(member.uid);
                        // if (window.confirm("Remove this member?")) {
                        //   removeGroupMember(group.id, member);
                        // }
                      }}
                      className="text-sm px-3 py-1 rounded-md text-red-600 border border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ================= EXPENSES ================= */}
      <GroupExpenses group={group} />
    </div>
  );
};

export default GroupPage;
