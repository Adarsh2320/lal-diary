import { useEffect, useMemo, useState } from "react";
import { listenToUserExpenses } from "../../services/expense.service";
import { listenToUserGroupExpenses } from "../../services/groupExpense.service";
import { listenToGroups } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const DashboardCards = () => {
  const { user } = useAuth();

  const [personal, setPersonal] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groups, setGroups] = useState([]);

  /* ================= LOAD PERSONAL ================= */
  useEffect(() => {
    if (!user) return;
    const unsub = listenToUserExpenses(user.uid, setPersonal);
    return () => unsub();
  }, [user]);

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    if (!user) return;
    const unsub = listenToGroups(user.uid, setGroups);
    return () => unsub();
  }, [user]);

  /* ================= LOAD GROUP EXPENSES ================= */
  useEffect(() => {
    if (!groups.length) return;
    const groupIds = groups.map((g) => g.id);
    const unsub = listenToUserGroupExpenses(groupIds, user.uid, setGroupExpenses);
    return () => unsub();
  }, [groups]);

  /* ================= NORMALIZE ALL TRANSACTIONS ================= */
  const allTransactions = useMemo(() => {
    const personalTx = personal.map((e) => ({
      amount: e.amount,
      transactionType: e.transactionType || "debit",
    }));

    const groupTx = groupExpenses.map((e) => ({
      amount: e.amount,
      transactionType: e.transactionType || "debit",
    }));

    return [...personalTx, ...groupTx];
  }, [personal, groupExpenses]);

  /* ================= CALCULATIONS ================= */
  const summary = useMemo(() => {
    let debit = 0;
    let credit = 0;
    let lend = 0;

    allTransactions.forEach((t) => {
      if (t.transactionType === "credit") credit += t.amount;
      else if (t.transactionType === "lend") lend += t.amount;
      else debit += t.amount; // default = debit
    });

    const bankBalance = credit - (debit + lend);

    return {
      debit,
      credit,
      lend,
      bankBalance,
    };
  }, [allTransactions]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {/* 🔴 Debit */}
      <div style={cardStyle("#ffe5e5", "red")}>
        <h4>Debit</h4>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          ₹{summary.debit}
        </p>
      </div>

      {/* 🟢 Credit */}
      <div style={cardStyle("#e6fffa", "green")}>
        <h4>Credit</h4>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          ₹{summary.credit}
        </p>
      </div>

      {/* 🟠 Lent */}
      <div style={cardStyle("#fff4e5", "orange")}>
        <h4>Lent</h4>
        <p style={{ fontSize: "20px", fontWeight: "bold" }}>
          ₹{summary.lend}
        </p>
        <small>To be received</small>
      </div>

      {/* 🏦 Bank Balance */}
      <div style={cardStyle("#eef2ff", "#4338ca")}>
        <h4>Bank Balance</h4>
        <p style={{ fontSize: "22px", fontWeight: "bold" }}>
          ₹{summary.bankBalance}
        </p>
      </div>
    </div>
  );
};

/* ================= CARD STYLE ================= */
const cardStyle = (bg, color) => ({
  background: bg,
  color,
  padding: "14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
});

export default DashboardCards;
