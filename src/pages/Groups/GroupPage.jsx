import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.db";
import GroupExpenses from "./GroupExpenses";
import {
  removeGroupMember,
  leaveGroup,
} from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroup = async () => {
      const snap = await getDoc(doc(db, "groups", groupId));
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() });
      }
    };
    fetchGroup();
  }, [groupId]);

  if (!group) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <p className="text-gray-500">Loading group...</p>
      </div>
    );
  }

  const isAdmin = group.adminId === user.uid;

  return (
    <div className="min-h-screen bg-[#fffafa] px-6 py-6 max-w-6xl mx-auto">

      {/* ================= BACK BUTTON ================= */}
      <button
        onClick={() => navigate(-1)}
        className="
          mb-4
          text-sm font-medium
          text-red-900
          border border-red-900
          px-4 py-2 rounded-lg
          hover:bg-red-900 hover:text-white
          transition
        "
      >
        ← Back
      </button>

      {/* ================= GROUP HEADER ================= */}
      <div className="bg-white border-8 border-red-900 rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-900">
          {group.name}
        </h1>
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
          {group.members.map((memberId) => {
            const isSelf = memberId === user.uid;
            const isGroupAdmin = memberId === group.adminId;

            return (
              <li
                key={memberId}
                className="
                  flex justify-between items-center
                  rounded-lg bg-[#fff7f5]
                  px-4 py-3
                "
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {memberId}
                  </p>

                  {isGroupAdmin && (
                    <span className="text-xs text-red-700 font-semibold">
                      Admin
                    </span>
                  )}

                  {isSelf && !isGroupAdmin && (
                    <span className="text-xs text-gray-500">
                      You
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this member?")) {
                          removeGroupMember(group.id, memberId);
                        }
                      }}
                      className="
                        text-sm px-3 py-1 rounded-md
                        text-red-600 border border-red-300
                        hover:bg-red-50
                      "
                    >
                      Remove
                    </button>
                  )}

                  {isSelf && !isAdmin && (
                    <button
                      onClick={() => {
                        if (window.confirm("Leave this group?")) {
                          leaveGroup(group.id, user.uid);
                        }
                      }}
                      className="
                        text-sm px-3 py-1 rounded-md
                        text-orange-600 border border-orange-300
                        hover:bg-orange-50
                      "
                    >
                      Leave
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ================= GROUP EXPENSES ================= */}
      <GroupExpenses group={group} />
    </div>
  );
};

export default GroupPage;
