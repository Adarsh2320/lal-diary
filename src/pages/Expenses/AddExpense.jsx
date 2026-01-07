import { useEffect, useState } from "react";
import { addExpense } from "../../services/expense.service";
import { addGroupExpense } from "../../services/groupExpense.service";
import {
  listenToLabels,
  addLabel,
  deleteLabel,
} from "../../services/label.service";
import { listenToGroups } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const AddExpense = () => {
  const { user } = useAuth();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Labels
  const [labels, setLabels] = useState([]);
  const [label, setLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");

  // Groups
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  /* ================= LOAD LABELS ================= */
  useEffect(() => {
    if (!user) return;
    const unsub = listenToLabels(user.uid, setLabels);
    return () => unsub();
  }, [user]);

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    if (!user) return;
    const unsub = listenToGroups(user.uid, setGroups);
    return () => unsub();
  }, [user]);

  /* ================= ADD LABEL ================= */
  const handleAddLabel = async () => {
    if (!newLabel.trim()) return alert("Label name required");

    const exists = labels.some(
      (l) => l.name.toLowerCase() === newLabel.trim().toLowerCase()
    );
    if (exists) return alert("Label already exists ❌");

    await addLabel(newLabel.trim(), user.uid);
    setNewLabel("");
  };

  /* ================= DELETE LABEL ================= */
  const handleDeleteLabel = async (id) => {
    if (window.confirm("Delete this label?")) {
      await deleteLabel(id);
      if (label === id) setLabel("");
    }
  };

  /* ================= ADD TRANSACTION ================= */
  const handleAddTransaction = async (type) => {
    if (!amount) return alert("Amount is required");

    if (selectedGroup) {
      const group = groups.find((g) => g.id === selectedGroup);
      if (!group) return alert("Invalid group");

      await addGroupExpense({
        groupId: group.id,
        amount: Number(amount),
        paidBy: user.uid,
        paidByName: user.displayName || user.email,
        paidByEmail: user.email,
        participants: group.members,
        note,
        transactionType: type,
      });
    } else {
      await addExpense({
        amount: Number(amount),
        label: label || null,
        note,
        userId: user.uid,
        transactionType: type,
      });
    }

    setAmount("");
    setNote("");
    setLabel("");
    setSelectedGroup("");
  };

  return (
    <div className="bg-[#fffafa] rounded-xl shadow-md p-6 space-y-6 mt-2">

      {/* AMOUNT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          placeholder="₹ 0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#7a1d1d]"
        />
      </div>

      {/* GROUP + LABEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* GROUP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group (optional)
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Personal</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* LABEL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label (optional)
          </label>
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select label</option>
            {labels.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NOTE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note (optional)
        </label>
        <input
          placeholder="Add a note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <button
          onClick={() => handleAddTransaction("debit")}
          className="bg-red-600 hover:bg-red-800 text-white py-2 rounded-lg font-medium"
        >
          Debit
        </button>

        <button
          onClick={() => handleAddTransaction("credit")}
          className="bg-green-600 hover:bg-green-800 text-white py-2 rounded-lg font-medium"
        >
          Credit
        </button>
        <button
          onClick={() => handleAddTransaction("lend")}
          className="bg-orange-600 hover:bg-orange-800 text-white py-2 rounded-lg font-medium"
        >
          Lend
        </button>

        
      </div>

      {/* LABEL MANAGEMENT */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Manage Labels
        </h3>

        <div className="flex gap-2 mb-3">
          <input
            placeholder="New label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            onClick={handleAddLabel}
            className="bg-[#7a1d1d] text-white px-4 rounded-lg"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {labels.map((l) => (
            <span
              key={l.id}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {l.name}
              <button
                onClick={() => handleDeleteLabel(l.id)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
