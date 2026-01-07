import { useEffect, useMemo, useState } from "react";
import {
  addGroupExpense,
  listenToGroupExpenses,
  deleteGroupExpense,
} from "../../services/groupExpense.service";
import { useAuth } from "../../hooks/useAuth";
import { calculateBalances } from "../../utils/splitCalculator";

/* ---------- helpers ---------- */
const formatDateTime = (ts) =>
  ts ? new Date(ts.seconds * 1000).toLocaleString() : "";

const txBadge = {
  debit: "bg-red-100 text-red-700",
  credit: "bg-green-100 text-green-700",
};

const txAmountColor = {
  debit: "text-red-900",
  credit: "text-green-600",
};
/* ----------------------------- */

const GroupExpenses = ({ group }) => {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");

  // 🆕 NEW FILTER STATES
  const [monthFilter, setMonthFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ================= LOAD EXPENSES ================= */
  useEffect(() => {
    if (!group?.id) return;
    return listenToGroupExpenses(group.id, setExpenses);
  }, [group?.id]);

  /* ================= ADD TRANSACTION ================= */
  const handleTransaction = async (type) => {
    if (!amount) return alert("Amount required");

    await addGroupExpense({
      groupId: group.id,
      amount: Number(amount),
      paidBy: user.uid,
      paidByName: user.displayName || user.email,
      paidByEmail: user.email,
      participants: group.members.map((m) => m.uid),
      note,
      transactionType: type,
    });

    setAmount("");
    setNote("");
  };

  /* ================= USER NAME ================= */
  const getUserName = (uid) => {
    const member = group.members.find((m) => m.uid === uid);
    return member?.name || member?.email || uid;
  };

  /* ================= AVAILABLE MONTHS ================= */
  const availableMonths = useMemo(() => {
    const set = new Set();

    expenses.forEach((e) => {
      if (!e.createdAt) return;
      const d = new Date(e.createdAt.seconds * 1000);
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
  }, [expenses]);

  /* ================= FILTERED EXPENSES ================= */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Member filter
      if (memberFilter !== "all" && e.paidBy !== memberFilter) return false;

      // Month filter
      if (monthFilter !== "all") {
        const d = new Date(e.createdAt.seconds * 1000);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key !== monthFilter) return false;
      }

      // From date
      if (fromDate) {
        const from = new Date(fromDate);
        const d = new Date(e.createdAt.seconds * 1000);
        if (d < from) return false;
      }

      // To date
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        const d = new Date(e.createdAt.seconds * 1000);
        if (d > to) return false;
      }

      return true;
    });
  }, [expenses, memberFilter, monthFilter, fromDate, toDate]);

  /* ================= TOTAL PAID ================= */
  const totalPaidByUser = useMemo(() => {
    const map = {};
    filteredExpenses.forEach((e) => {
      const sign = e.transactionType === "credit" ? -1 : 1;
      map[e.paidBy] = (map[e.paidBy] || 0) + sign * e.amount;
    });
    return map;
  }, [filteredExpenses]);

  /* ================= BALANCES ================= */
  const balances = calculateBalances(
    filteredExpenses,
    group.members.map((m) => m.uid)
  );

  return (
    <div className="space-y-8">

      {/* ================= ADD TRANSACTION ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Add Group Transaction
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />

          <input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />

          <button
            onClick={() => handleTransaction("debit")}
            className="bg-red-900 text-white rounded-lg px-4 py-2 hover:bg-red-800 font-medium"
          >
            Debit
          </button>

          <button
            onClick={() => handleTransaction("credit")}
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-500 font-medium"
          >
            Credit
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-red-900">
          Filters
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Member */}
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Members</option>
            {group.members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.name || m.email}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Months</option>
            {availableMonths.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          {/* From */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />

          {/* To */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* ================= TOTAL PAID ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Total Paid (Filtered)
        </h3>

        {Object.entries(totalPaidByUser).map(([uid, total]) => (
          <div key={uid} className="flex justify-between">
            <span>{getUserName(uid)}</span>
            <span className="font-semibold">₹{total}</span>
          </div>
        ))}
      </div>

      {/* ================= WHO OWES WHOM ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Who Owes Whom
        </h3>

        {Object.entries(balances).map(([uid, balance]) => (
          <div key={uid}>
            <span className="font-medium">{getUserName(uid)}</span>{" "}
            {balance > 0 ? (
              <span className="text-green-600">gets ₹{balance}</span>
            ) : (
              <span className="text-red-600">owes ₹{-balance}</span>
            )}
          </div>
        ))}
      </div>

      {/* ================= EXPENSE LIST ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Expense History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-900 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Note</th>
                <th className="p-3 text-left">Paid By</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="border-b">
                  <td className="p-3">{formatDateTime(exp.createdAt)}</td>
                  <td
                    className={`p-3 font-semibold ${txAmountColor[exp.transactionType]}`}
                  >
                    {exp.transactionType === "credit" ? "+" : "-"} ₹{exp.amount}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${txBadge[exp.transactionType]}`}
                    >
                      {exp.transactionType.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">{exp.note || "-"}</td>
                  <td className="p-3">{getUserName(exp.paidBy)}</td>
                  <td className="p-3 text-right">
                    {exp.paidBy === user.uid ? (
                      <button
                        onClick={() => deleteGroupExpense(exp.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GroupExpenses;
