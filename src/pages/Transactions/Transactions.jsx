import { useEffect, useMemo, useState } from "react";
import {
  listenToUserExpenses,
  deleteExpense,
} from "../../services/expense.service";
import {
  listenToUserGroupExpenses,
  listenToGroupExpenses,
  deleteGroupExpense,
} from "../../services/groupExpense.service";
import { listenToGroups } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

  // 🆕 NEW FILTER STATES
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!user) return;
    return listenToUserExpenses(user.uid, setPersonal);
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    return listenToGroups(user.uid, setGroups);
  }, [user]);

  useEffect(() => {
  if (!groups.length) return;

  // 🔥 silently warm Firestore cache
  const unsubs = groups.map((g) =>
    listenToGroupExpenses(g.id, () => {})
  );

  return () => {
    unsubs.forEach((u) => u && u());
  };
}, [groups]);


  useEffect(() => {
    if (!groups.length) return;
    const groupIds = groups.map((g) => g.id);
    return listenToUserGroupExpenses(groupIds,user.uid , setGroupExpenses);
  }, [groups, user.uid]);

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

  /* ================= AVAILABLE LABELS ================= */
  const availableLabels = useMemo(() => {
    const set = new Set();
    allTransactions.forEach((t) => t.label && set.add(t.label));
    return Array.from(set);
  }, [allTransactions]);

  /* ================= AVAILABLE MONTHS ================= */
  const availableMonths = useMemo(() => {
    const set = new Set();

    allTransactions.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt.seconds * 1000);
      set.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    return Array.from(set)
      .map((k) => {
        const [y, m] = k.split("-");
        return {
          key: k,
          label: new Date(y, m).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [allTransactions]);

  /* ================= FILTER ================= */
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

      // 🆕 MONTH FILTER (highest priority)
      if (monthFilter !== "all") {
        const d = new Date(t.createdAt.seconds * 1000);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key !== monthFilter) return false;
      }

      // 🆕 DATE RANGE FILTER
      if (fromDate) {
        const from = new Date(fromDate);
        const d = new Date(t.createdAt.seconds * 1000);
        if (d < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        const d = new Date(t.createdAt.seconds * 1000);
        if (d > to) return false;
      }

      if (dateFilter !== "all" && !isInRange(t.createdAt, dateFilter))
        return false;

      return true;
    });
  }, [
    allTransactions,
    typeFilter,
    labelFilter,
    transactionFilter,
    dateFilter,
    fromDate,
    toDate,
    monthFilter,
  ]);

  /* ================= TOTAL ================= */
  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    let lend = 0;

    filtered.forEach((t) => {
      if (t.transactionType === "debit") debit += t.amount;
      if (t.transactionType === "credit") credit += t.amount;
      if (t.transactionType === "lend") lend += t.amount;
    });

    return {
      debit,
      credit,
      lend,
      net: credit - debit - lend,
    };
  }, [filtered]);

  /* ================= DELETE ================= */
  const handleDelete = async (tx) => {
    if (!window.confirm("Delete this transaction?")) return;
    tx.isGroup ? await deleteGroupExpense(tx.id) : await deleteExpense(tx.id);
  };

  return (
    <div className="min-h-screen bg-[#fffafa] px-6 py-6">
      {/* HEADER */}
      <div className="relative flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-red-900 border border-red-900 rounded-lg px-3 py-1 hover:bg-red-50"
        >
          ← Back
        </button>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-red-900">
          All Transactions
        </h1>
      </div>

      {/* FILTERS */}

      <div className="bg-white border-3 border-red-900 rounded-xl p-4 mt-6 flex flex-wrap gap-3">
        {/* EXISTING FILTERS */}
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
            className="border-2 border-red-900 rounded-lg px-2 py-1 text-lg"
          >
            {f.opts.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        ))}

        {/* 🆕 MONTH FILTER */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="border-2 border-red-900 rounded-lg px-2 py-1 text-lg"
        >
          <option value="all">All Months</option>
          {availableMonths.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white border-3 border-red-900 rounded-xl p-3 mt-1  ">
        {/* 🆕 DATE RANGE */}
        <p className="text-red-900 text-lg ">From</p>

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border-2 border-red-900 rounded-lg px-2 py-1"
        />

        <p className="text-red-900 text-lg">To</p>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border-2 border-red-900 rounded-lg px-2 py-1"
        />
      </div>

      {/* TOTAL SUMMARY */}
      <div className="bg-white border border-red-900 rounded-xl p-4 mt-6">
        <h3 className="text-lg font-semibold text-red-900 mb-3">
          Total (Based on Applied Filters)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-red-50 rounded-lg p-3">
            <p>Total Debit</p>
            <p className="font-bold text-red-700">₹{totals.debit}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p>Total Credit</p>
            <p className="font-bold text-green-700">₹{totals.credit}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <p>Total Lend</p>
            <p className="font-bold text-orange-600">₹{totals.lend}</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <p>Net</p>
            <p
              className={`font-bold ${
                totals.net >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {totals.net >= 0 ? "+" : "−"} ₹{Math.abs(totals.net)}
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm mt-6 overflow-x-auto">
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
