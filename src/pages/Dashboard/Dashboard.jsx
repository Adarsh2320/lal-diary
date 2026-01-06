import { useAuth } from "../../hooks/useAuth";
import AddExpense from "../Expenses/AddExpense";
import ExpenseList from "../Expenses/ExpenseList";
import CreateGroup from "../Groups/CreateGroup";
import GroupDetails from "../Groups/GroupDetails";
import DashboardCards from "./DashboardCards";
import MonthlyBalanceChart from "../Reports/MonthlyBalanceChart";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f5] via-[#fdecec] to-[#fffafa] px-4 md:px-8 py-6">
      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Left: Welcome */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#7a1d1d]">
            Welcome{user?.displayName ? `, ${user.displayName}` : ""}
          </h1>
        </div>

        {/* Right: Signed in as */}
        <div className="text-sm text-gray-600 md:text-right">
          Signed in as <br />
          <span className="font-medium text-[#7a1d1d]">{user?.email}</span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* ADD EXPENSE */}
          <div className="bg-red-900 rounded-xl shadow-sm border border-[#f2dada] p-5">
            {/* HEADER */}
            <div className="p-5">
              <h2 className="text-3xl font-semibold text-white">
                Add Transaction
              </h2>
              <p className="text-sm text-gray-200">
                Record what you spent, received, or lent
              </p>
            </div>
            <AddExpense />
          </div>
          {/* DASHBOARD CARDS */}
          <div className="max-w-7xl mx-auto mb-8">
            <DashboardCards />
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-red-900 rounded-xl shadow-sm border border-[#f2dada] p-5">
            <div className="p-5">
              <h2 className="text-3xl font-semibold text-white">
                Recent Transactions
              </h2>
            </div>
            <ExpenseList />
          </div>

          {/* MONTHLY BALANCE CHART */}
          <div className="bg-red-900 rounded-xl shadow-sm border border-[#f2dada] p-5">
            <div className="p-5">
              <h2 className="text-3xl font-semibold text-white">
                Monthly Transaction Overview
              </h2>
              <p className="text-sm text-gray-200">
                Track how your money flows and grows month by month
              </p>
            </div>
            <MonthlyBalanceChart />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* CREATE GROUP */}
          <div className="bg-red-900 rounded-xl shadow-sm border border-[#f2dada] p-5">
            <div className="p-5">
              <h2 className="text-3xl font-semibold text-white">
                Create a Group
              </h2>
              <p className="text-sm text-gray-200">
                Start a group to track and split expenses together
              </p>
            </div>
            <CreateGroup />
          </div>

          {/* GROUP DETAILS */}
          <div className="bg-red-900 rounded-xl shadow-sm border border-[#f2dada] p-5">
            <div className="p-5">
              <h2 className="text-3xl font-semibold text-white">Groups</h2>
            </div>
            <GroupDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
