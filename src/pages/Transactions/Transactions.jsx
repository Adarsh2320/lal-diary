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
import DashboardCards from "../Dashboard/DashboardCards";

/* ---------- helpers ---------- */
const formatDate = (ts) =>
  ts ? new Date(ts.seconds * 1000).toLocaleString() : "";

const isInRange = (ts, range) => {
  if (!ts) return false;
  const d = new Date(ts.seconds * 1000);
  const now = new Date();

  if (range === "today") return d.toDateString() === now.toDateString();
  if (range === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  if (range === "month")
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  if (range === "year") return d.getFullYear() === now.getFullYear();
  return true;
};

const txStyle = {
  debit: "text-red-700",
  credit: "text-green-700",
  lend: "text-orange-600",
};

const txSign = {
  debit: "−",
  credit: "+",
  lend: "→",
};
/* ----------------------------- */

const Transactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [personal, setPersonal] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groups, setGroups] = useState([]);

  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [labelFilter, setLabelFilter] = useState("all");
  const [transactionFilter, setTransactionFilter] = useState("all");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!user) return;
    return listenToUserExpenses(user.uid, setPersonal);
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

  /* ================= NORMALIZE ================= */
  const allTransactions = useMemo(() => {
    const personalTx = personal.map((e) => ({
      ...e,
      isGroup: false,
      typeLabel: "Personal",
      transactionType: e.transactionType || "debit",
    }));

    const groupTx = groupExpenses.map((e) => ({
      ...e,
      isGroup: true,
      typeLabel: groupMap[e.groupId] || "Group",
      label: e.label || "Group Expense",
      transactionType: e.transactionType || "debit",
    }));

    return [...personalTx, ...groupTx].sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }, [personal, groupExpenses, groupMap]);

  /* ================= FILTER ================= */
  const availableLabels = useMemo(() => {
    const set = new Set();
    allTransactions.forEach((t) => t.label && set.add(t.label));
    return Array.from(set);
  }, [allTransactions]);

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      if (typeFilter === "personal" && t.isGroup) return false;
      if (
        typeFilter !== "all" &&
        typeFilter !== "personal" &&
        t.groupId !== typeFilter
      )
        return false;
      if (labelFilter !== "all" && t.label !== labelFilter) return false;
      if (
        transactionFilter !== "all" &&
        t.transactionType !== transactionFilter
      )
        return false;
      if (dateFilter !== "all" && !isInRange(t.createdAt, dateFilter))
        return false;
      return true;
    });
  }, [allTransactions, typeFilter, labelFilter, transactionFilter, dateFilter]);

  /* ================= DELETE ================= */
  const handleDelete = async (tx) => {
    if (!window.confirm("Delete this transaction?")) return;
    tx.isGroup ? await deleteGroupExpense(tx.id) : await deleteExpense(tx.id);
  };

  return (
    <div className="min-h-screen bg-[#fffafa] px-6 py-6">
      {/* HEADER */}
      <div className="relative flex items-center mb-6">
        {/* Back button – left */}
        <button
          onClick={() => navigate(-1)}
          className="
      text-sm text-red-900
      border border-red-900
      rounded-lg px-3 py-1
      hover:bg-red-50
      transition
    "
        >
          ← Back
        </button>

        {/* Center title */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-red-900">
          All Transactions
        </h1>
      </div>

      {/* SUMMARY CARDS */}
      <DashboardCards />

      {/* FILTERS */}
      <div className="bg-white border-3 border-red-900 rounded-xl p-4 mt-6 flex flex-wrap gap-3">
        {[
          {
            v: typeFilter,
            s: setTypeFilter,
            opts: [
              ["all", "All"],
              ["personal", "Personal"],
              ...groups.map((g) => [g.id, g.name]),
            ],
          },
          {
            v: transactionFilter,
            s: setTransactionFilter,
            opts: [
              ["all", "All Transactions"],
              ["debit", "Debit"],
              ["credit", "Credit"],
              ["lend", "Lend"],
            ],
          },
          {
            v: labelFilter,
            s: setLabelFilter,
            opts: [
              ["all", "All Labels"],
              ...availableLabels.map((l) => [l, l]),
            ],
          },
          {
            v: dateFilter,
            s: setDateFilter,
            opts: [
              ["all", "All Time"],
              ["today", "Today"],
              ["week", "This Week"],
              ["month", "This Month"],
              ["year", "This Year"],
            ],
          },
        ].map((f, i) => (
          <select
            key={i}
            value={f.v}
            onChange={(e) => f.s(e.target.value)}
            className="border-2 border-red-900 rounded-lg px-2 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            {f.opts.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-red-900/20 rounded-xl shadow-sm mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-red-900 text-white">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Note</th>
              <th className="p-3 text-left">Label</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Transaction</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b hover:bg-red-50">
                <td className="p-3">{formatDate(e.createdAt)}</td>
                <td
                  className={`p-3 font-semibold ${txStyle[e.transactionType]}`}
                >
                  {txSign[e.transactionType]} ₹{e.amount}
                </td>
                <td className="p-3">{e.note || "-"}</td>
                <td className="p-3">{e.label || "-"}</td>
                <td className="p-3">{e.typeLabel}</td>
                <td
                  className={`p-3 font-semibold uppercase ${
                    txStyle[e.transactionType]
                  }`}
                >
                  {e.transactionType}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(e)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
