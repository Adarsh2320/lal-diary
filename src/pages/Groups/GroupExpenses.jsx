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
  const [transactionType, setTransactionType] = useState("debit");
  const [memberFilter, setMemberFilter] = useState("all");

  /* ================= LOAD EXPENSES ================= */
  useEffect(() => {
    if (!group?.id) return;
    return listenToGroupExpenses(group.id, setExpenses);
  }, [group?.id]);

  /* ================= ADD EXPENSE ================= */
  const handleAdd = async () => {
    if (!amount) return alert("Amount required");

    await addGroupExpense({
      groupId: group.id,
      amount: Number(amount),
      paidBy: user.uid,
      paidByName: user.displayName || user.email,
      paidByEmail: user.email,
      participants: group.members,
      note,
      transactionType, // ✅ debit / credit
    });

    setAmount("");
    setNote("");
    setTransactionType("debit");
  };

  /* ================= USER NAME ================= */
  const getUserName = (userId) =>
    expenses.find((e) => e.paidBy === userId)?.paidByName ||
    expenses.find((e) => e.paidBy === userId)?.paidByEmail ||
    userId;

  /* ================= FILTERED EXPENSES ================= */
  const filteredExpenses = useMemo(() => {
    if (memberFilter === "all") return expenses;
    return expenses.filter((e) => e.paidBy === memberFilter);
  }, [expenses, memberFilter]);

  /* ================= TOTAL PAID PER USER ================= */
  const totalPaidByUser = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const sign = e.transactionType === "credit" ? -1 : 1;
      map[e.paidBy] = (map[e.paidBy] || 0) + sign * e.amount;
    });
    return map;
  }, [expenses]);

  /* ================= BALANCES ================= */
  const balances = calculateBalances(expenses, group.members);

  return (
    <div className="space-y-8">

      {/* ================= ADD EXPENSE ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Add Group Transaction
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          {/* TRANSACTION TYPE */}
          <button
            onClick={() => setTransactionType("debit")}
            className={`rounded-lg px-4 py-2 font-medium ${
              transactionType === "debit"
                ? "bg-red-900 text-white"
                : "border border-red-900 text-red-900"
            }`}
          >
            Debit
          </button>

          <button
            onClick={() => setTransactionType("credit")}
            className={`rounded-lg px-4 py-2 font-medium ${
              transactionType === "credit"
                ? "bg-green-600 text-white"
                : "border border-green-600 text-green-600"
            }`}
          >
            Credit
          </button>

          <button
            onClick={handleAdd}
            className="bg-red-900 text-white rounded-lg px-4 py-2 hover:bg-red-800"
          >
            Add
          </button>
        </div>
      </div>

      {/* ================= TOTAL PAID ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Total Paid by Members
        </h3>

        {Object.keys(totalPaidByUser).length === 0 && (
          <p className="text-gray-500">No expenses yet</p>
        )}

        <div className="space-y-2">
          {Object.entries(totalPaidByUser).map(([uid, total]) => (
            <div key={uid} className="flex justify-between">
              <span>{getUserName(uid)}</span>
              <span className="font-semibold">
                ₹{total}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= WHO OWES WHOM ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Who Owes Whom
        </h3>

        {Object.entries(balances).map(([uid, balance]) => (
          <div key={uid}>
            <span className="font-medium">
              {getUserName(uid)}
            </span>{" "}
            {balance > 0 ? (
              <span className="text-green-600">
                gets ₹{balance}
              </span>
            ) : (
              <span className="text-red-600">
                owes ₹{-balance}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ================= MEMBER FILTER ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-red-900 mb-3">
          Filter by Member
        </h3>

        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Members</option>
          {group.members.map((m) => (
            <option key={m} value={m}>
              {getUserName(m)}
            </option>
          ))}
        </select>
      </div>

      {/* ================= EXPENSE LIST ================= */}
      <div className="bg-white border-4 border-red-900 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-red-900 mb-4">
          Expense History
        </h3>

        {filteredExpenses.length === 0 && (
          <p className="text-gray-500">No expenses</p>
        )}

        {filteredExpenses.length > 0 && (
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
                    <td className="p-3">
                      {formatDateTime(exp.createdAt)}
                    </td>

                    <td
                      className={`p-3 font-semibold ${
                        txAmountColor[exp.transactionType]
                      }`}
                    >
                      {exp.transactionType === "credit" ? "+" : "-"} ₹
                      {exp.amount}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${txBadge[exp.transactionType]}`}
                      >
                        {exp.transactionType.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-3">{exp.note || "-"}</td>
                    <td className="p-3">
                      {exp.paidByName || exp.paidByEmail}
                    </td>

                    <td className="p-3 text-right">
                      {exp.paidBy === user.uid ? (
                        <button
                          onClick={() => {
                            if (
                              window.confirm("Delete this expense?")
                            ) {
                              deleteGroupExpense(exp.id);
                            }
                          }}
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
        )}
      </div>
    </div>
  );
};

export default GroupExpenses;
