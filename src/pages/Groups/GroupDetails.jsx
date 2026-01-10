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
            <p className="text-sm text-gray-500">No pending join requests</p>
          )}

          {requests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8eeee] text-sm text-gray-700">
                    <th className="p-3 text-left">Name</th>
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
                        {req.userName}
                      </td>

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
      <div className="bg-white border border-[#f0dede] rounded-xl shadow-sm p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-[#7a1d1d] mb-4">
          Your Groups
        </h3>

        {groups.length === 0 && (
          <p className="text-sm text-gray-500">
            You are not part of any group yet
          </p>
        )}

        {groups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {groups.map((group) => {
              const isAdmin = group.adminId === user.uid;
              const inviteLink = `${window.location.origin}/join/${group.inviteCode}`;

              return (
                <div
                  key={group.id}
                  className="
              border border-[#f0dede]
              rounded-xl
              p-4
              bg-[#fffafa]
              hover:shadow-md
              transition
            "
                >
                  {/* GROUP HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="
                  text-lg sm:text-xl font-semibold text-[#7a1d1d]
                  cursor-pointer hover:underline
                  truncate
                "
                    >
                      {group.name}
                    </h4>

                    <span
                      className={`text-sm font-medium ${
                        isAdmin ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>

                  {/* META */}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>👥 {group.members.length} members</span>
                  </div>

                  {/* INVITE SECTION (ADMIN ONLY) */}
                  {isAdmin && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-500 mb-1">
                        Invite Link
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          value={inviteLink}
                          readOnly
                          className="
                      flex-1 px-3 py-2 text-sm
                      border rounded-md bg-white
                      truncate
                    "
                        />

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(inviteLink);
                            alert("Invite link copied ✅");
                          }}
                          className="
                      px-4 py-2
                      text-sm font-medium
                      rounded-md
                      border border-[#7a1d1d]
                      text-[#7a1d1d]
                      hover:bg-[#7a1d1d]
                      hover:text-white
                      transition
                      w-full sm:w-auto
                    "
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupDetails;
