import { useEffect, useMemo, useState } from "react";
import {
  listenToUserExpenses,
  deleteExpense,
} from "../../services/expense.service";
import {
  listenToUserGroupExpenses,
  deleteGroupExpense,
} from "../../services/groupExpense.service";
import { listenToGroups } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/* ---------- helpers ---------- */
const formatDateTime = (timestamp) =>
  timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";

const txStyle = {
  debit: "text-red-600",
  credit: "text-green-600",
  lend: "text-orange-500",
};

const txSign = {
  debit: "−",
  credit: "+",
  lend: "→",
};
/* ----------------------------- */

const ExpenseList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groups, setGroups] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!user) return;
    return listenToUserExpenses(user.uid, setPersonalExpenses);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return listenToGroups(user.uid, setGroups);
  }, [user]);

  useEffect(() => {
    if (!groups.length) return;
    const groupIds = groups.map((g) => g.id);
    return listenToUserGroupExpenses(groupIds, setGroupExpenses);
  }, [groups]);

  /* ================= GROUP MAP ================= */
  const groupMap = useMemo(() => {
    const map = {};
    groups.forEach((g) => (map[g.id] = g.name));
    return map;
  }, [groups]);

  /* ================= MERGE + TOP 5 ================= */
  const latestFive = useMemo(() => {
    const personal = personalExpenses.map((e) => ({
      ...e,
      isGroup: false,
      typeLabel: "Personal",
      transactionType: e.transactionType || "debit",
    }));

    const group = groupExpenses.map((e) => ({
      ...e,
      isGroup: true,
      typeLabel: groupMap[e.groupId] || "Group",
      label: e.label || "Group Expense",
      transactionType: e.transactionType || "debit",
    }));

    return [...personal, ...group]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5);
  }, [personalExpenses, groupExpenses, groupMap]);

  /* ================= DELETE ================= */
  const handleDelete = async (exp) => {
    if (!window.confirm("Delete this transaction?")) return;
    exp.isGroup
      ? await deleteGroupExpense(exp.id)
      : await deleteExpense(exp.id);
  };

  return (
    <div className="bg-[#fffafa] rounded-2xl shadow-sm border border-[#f0dede] mt-2 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        

        <button
          onClick={() => navigate("/transactions")}
          className="
            text-sm font-medium
            text-[#7a1d1d]
            border-2 border-red-900
            px-4 py-2 rounded-lg
            hover:bg-[#7a1d1d] hover:text-white
            transition
          "
        >
          View All →
        </button>
      </div>

      {latestFive.length === 0 && (
        <p className="text-sm text-gray-500">No transactions yet</p>
      )}

      {latestFive.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8eeee] text-sm text-gray-700">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Account</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Label</th>
                <th className="p-3 text-left">Note</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {latestFive.map((exp) => {
                const type = exp.transactionType;

                return (
                  <tr
                    key={exp.id}
                    className="border-b last:border-b-0 hover:bg-[#fbf3f3] transition"
                  >
                    <td className="p-3 text-sm text-gray-600">
                      {formatDateTime(exp.createdAt)}
                    </td>

                    <td className={`p-3 font-semibold ${txStyle[type]}`}>
                      {txSign[type]} ₹{exp.amount}
                    </td>

                    <td className="p-3 text-sm text-gray-700">
                      {exp.typeLabel}
                    </td>

                    <td className={`p-3 font-semibold uppercase ${txStyle[type]}`}>
                      {type}
                    </td>

                    <td className="p-3 text-sm">
                      {exp.label || "-"}
                    </td>

                    <td className="p-3 text-sm text-gray-600">
                      {exp.note || "-"}
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(exp)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
