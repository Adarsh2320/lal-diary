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

// YYYY-MM-DD
const getDayKey = (ts) => {
  const d = new Date(ts.seconds * 1000);
  return d.toISOString().slice(0, 10);
};

// DD/MM
const formatDay = (key) => {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
};

// current month filter
const isCurrentMonth = (ts) => {
  const d = new Date(ts.seconds * 1000);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
};
/* ----------------------------- */

const DailyTransactionFlowChart = () => {
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
    return listenToUserGroupExpenses(groupIds, user.uid, setGroupExpenses);
  }, [groups]);

  /* ================= MERGE & FILTER CURRENT MONTH ================= */
  const allTransactions = useMemo(() => {
    return [...personal, ...groupExpenses]
      .filter((t) => t.createdAt && isCurrentMonth(t.createdAt))
      .map((t) => ({
        ...t,
        transactionType: t.transactionType || "debit",
      }));
  }, [personal, groupExpenses]);

  /* ================= DAILY AGGREGATION ================= */
  const chartData = useMemo(() => {
    const map = {};

    allTransactions.forEach((t) => {
      const key = getDayKey(t.createdAt);

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
          day: formatDay(key),
          credit,
          debit,
          lend,
          balance: runningBalance,
        };
      });
  }, [allTransactions]);

  return (
    <section className="bg-[#fffafa] rounded-2xl p-6 mt-3">
      <div className="bg-white rounded-xl border border-[#f0dede] shadow-sm p-4">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          Daily Transaction Flow (This Month)
        </h3>

        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No transactions for this month
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#f3eaea" strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 12 }} />
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

export default DailyTransactionFlowChart;
