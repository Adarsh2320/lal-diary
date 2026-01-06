import { useState } from "react";
import { addGroupExpense } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const GroupSettlement = ({ groupId, participants }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleAdd = async () => {
    await addGroupExpense({
      groupId,
      amount: Number(amount),
      paidBy: user.uid,
      participants,
      note
    });

    setAmount("");
    setNote("");
    alert("Group expense added ✅");
  };

  return (
    <div>
      <h3>Add Group Expense</h3>

      <input
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <input
        placeholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <button onClick={handleAdd}>Add</button>
    </div>
  );
};

export default GroupSettlement;
