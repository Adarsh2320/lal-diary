import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { listenToUserExpenses } from "../../services/expense.service";
import { listenToUserGroupExpenses } from "../../services/groupExpense.service";
import { listenToGroups } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

/* ---------- helpers ---------- */
const getMonthKey = (ts) => {
  const d = new Date(ts.seconds * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonth = (key) => {
  const [y, m] = key.split("-");
  return `${m}/${y}`;
};
/* ----------------------------- */

const MonthlyTransactionFlowChart = () => {
  const { user } = useAuth();

  const [personal, setPersonal] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groups, setGroups] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!user) return;
    const u1 = listenToUserExpenses(user.uid, setPersonal);
    const u2 = listenToGroups(user.uid, setGroups);
    return () => {
      u1();
      u2();
    };
  }, [user]);

  useEffect(() => {
    if (!groups.length) return;
    const groupIds = groups.map((g) => g.id);
    const unsub = listenToUserGroupExpenses(groupIds, setGroupExpenses);
    return () => unsub();
  }, [groups]);

  /* ================= MERGE TRANSACTIONS ================= */
  const allTransactions = useMemo(() => {
    return [...personal, ...groupExpenses].map((t) => ({
      ...t,
      transactionType: t.transactionType || "debit",
    }));
  }, [personal, groupExpenses]);

  /* ================= MONTHLY AGGREGATION + BALANCE ================= */
  const chartData = useMemo(() => {
    const map = {};

    allTransactions.forEach((t) => {
      if (!t.createdAt) return;
      const key = getMonthKey(t.createdAt);

      if (!map[key]) {
        map[key] = { credit: 0, debit: 0, lend: 0 };
      }

      map[key][t.transactionType] += t.amount;
    });

    let runningBalance = 0;

    return Object.keys(map)
      .sort()
      .map((key) => {
        const credit = map[key].credit;
        const debit = map[key].debit;
        const lend = map[key].lend;

        // eslint-disable-next-line react-hooks/immutability
        runningBalance += credit - debit - lend;

        return {
          month: formatMonth(key),
          credit,
          debit,
          lend,
          balance: runningBalance,
        };
      });
  }, [allTransactions]);

  return (
    <section className="bg-[#fffafa] rounded-2xl p-6 mt-3">

      {/* CHART CARD */}
      <div className="bg-white rounded-xl border border-[#f0dede] shadow-sm p-4">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No transaction data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#f3eaea" strokeDasharray="4 4" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e7bcbc",
                  fontSize: "13px",
                }}
              />
              <Legend />

              {/* CREDIT */}
              <Line
                type="monotone"
                dataKey="credit"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Credit"
              />

              {/* DEBIT */}
              <Line
                type="monotone"
                dataKey="debit"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Debit"
              />

              {/* LEND */}
              <Line
                type="monotone"
                dataKey="lend"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Lend"
              />

              {/* BALANCE */}
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#7a1d1d"
                strokeWidth={4}
                dot={{ r: 5 }}
                name="Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default MonthlyTransactionFlowChart;
