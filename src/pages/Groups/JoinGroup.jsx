import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  requestToJoinGroup,
  getGroupByInviteCode,
} from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);

  /* 🔐 Redirect ONLY if auth is finished and user is missing */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", {
        replace: true,
        state: { from: `/join/${inviteCode}` },
      });
    }
  }, [authLoading, user, navigate, inviteCode]);

  /* 📦 Fetch group AFTER login */
  useEffect(() => {
    if (!user) return;

    const fetchGroup = async () => {
      const data = await getGroupByInviteCode(inviteCode);
      setGroup(data);
      setLoading(false);
    };

    fetchGroup();
  }, [inviteCode, user]);

  const handleJoin = async () => {
    await requestToJoinGroup({
      groupId: group.id,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
    });
    setRequested(true);
  };

  /* ================= STATES ================= */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Invalid Invite
          </h2>
          <p className="text-sm text-gray-600">
            This invite link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 rounded-lg bg-red-900 text-white hover:bg-red-800 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#fffafa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-red-900/20 rounded-2xl p-8 shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-900 mb-1">
          Join Group
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          You’ve been invited to join
        </p>

        <p className="text-lg font-semibold text-gray-800 mb-6">
          {group.name}
        </p>

        {requested ? (
          <>
             <p className="text-green-600 font-medium">
               Join request sent ⏳
             </p>
             <p className="text-sm text-gray-500 mt-1">
               Waiting for admin approval
             </p>
           </>
        ) : (
          <button
            onClick={handleJoin}
            className="w-full bg-red-900 text-white py-3 rounded-xl font-medium hover:bg-red-800 transition"
          >
            Request to Join
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-sm text-red-900 hover:underline"
        >
          ← Home
        </button>
      </div>
    </div>
  );
};

export default JoinGroup;
