import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listenToGroups,
  listenToJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const GroupDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    if (!user) return;
    return listenToGroups(user.uid, setGroups);
  }, [user]);

  /* ================= ADMIN GROUP ================= */
  const adminGroup = groups.find((g) => g.adminId === user?.uid);

  /* ================= JOIN REQUESTS ================= */
  useEffect(() => {
    if (!adminGroup) return;
    return listenToJoinRequests(adminGroup.id, setRequests);
  }, [adminGroup]);

  return (
    <section className="bg-[#fffafa] rounded-2xl p-6 mt-2">
      {/* ================= JOIN REQUESTS ================= */}
      {adminGroup && (
        <div className="bg-white border border-[#f0dede] rounded-xl shadow-sm p-5 mb-8">
          <h3 className="text-lg font-semibold text-[#7a1d1d] mb-3">
            Join Requests
          </h3>

          {requests.length === 0 && (
            <p className="text-sm text-gray-500">
              No pending join requests
            </p>
          )}

          {requests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8eeee] text-sm text-gray-700">
                    <th className="p-3 text-left">User Email</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-sm text-gray-700">
                        {req.userEmail}
                      </td>

                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => approveJoinRequest(req)}
                          className="
                            px-3 py-1 text-sm rounded-md
                            bg-green-600 text-white
                            hover:bg-green-700 transition
                          "
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => rejectJoinRequest(req.id)}
                          className="
                            px-3 py-1 text-sm rounded-md
                            bg-red-500 text-white
                            hover:bg-red-600 transition
                          "
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= YOUR GROUPS ================= */}
      <div className="bg-white border border-[#f0dede] rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-[#7a1d1d] mb-3">
          Your Groups
        </h3>

        {groups.length === 0 && (
          <p className="text-sm text-gray-500">
            You are not part of any group yet
          </p>
        )}

        {groups.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8eeee] text-sm text-gray-700">
                  <th className="p-3 text-left">Group Name</th>
                  <th className="p-3 text-center">Members</th>
                  <th className="p-3 text-center">Role</th>
                  <th className="p-3 text-left">Invite</th>
                </tr>
              </thead>

              <tbody>
                {groups.map((group) => {
                  const isAdmin = group.adminId === user.uid;
                  const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;

                  return (
                    <tr
                      key={group.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* Group name */}
                      <td
                        className="
                          p-3 text-sm font-medium
                          text-[#7a1d1d] cursor-pointer
                          hover:underline
                        "
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        {group.name}
                      </td>

                      <td className="p-3 text-center text-sm">
                        {group.members.length}
                      </td>

                      <td className="p-3 text-center text-sm">
                        {isAdmin ? (
                          <span className="text-green-600 font-medium">
                            Admin
                          </span>
                        ) : (
                          <span className="text-gray-600">Member</span>
                        )}
                      </td>

                      <td className="p-3">
                        {isAdmin ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={inviteLink}
                              readOnly
                              className="
                                w-full px-2 py-1 text-xs
                                border rounded-md bg-gray-50
                              "
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(inviteLink);
                                alert("Invite link copied ✅");
                              }}
                              className="
                                px-3 py-1 text-xs
                                rounded-md
                                border border-[#7a1d1d]
                                text-[#7a1d1d]
                                hover:bg-[#7a1d1d] hover:text-white
                                transition
                              "
                            >
                              Copy
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupDetails;
