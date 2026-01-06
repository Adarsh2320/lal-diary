import { useState } from "react";
import { createGroup } from "../../services/group.service";
import { useAuth } from "../../hooks/useAuth";

const CreateGroup = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Group name required");

    try {
      setLoading(true);
      await createGroup({
        name: name.trim(),
        adminId: user.uid,
      });
      setName("");
      alert("Group created ✅");
    } catch (err) {
      alert("Failed to create group" + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#fffafa] rounded-2xl p-6 mt-2 ">
      {/* CARD */}
      <div className="bg-white  border border-[#f0dede] rounded-xl shadow-sm p-5 max-w-md">
        
        {/* INPUT */}
        <input
          type="text"
          placeholder="Enter group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            w-full px-4 py-2 mb-4
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2
            focus:ring-[#7a1d1d]/40
          "
        />

        {/* BUTTON */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="
            w-full py-2 rounded-lg
            font-medium text-white
            bg-[#7a1d1d]
            hover:bg-[#651818]
            transition
            disabled:opacity-60
            disabled:cursor-not-allowed
          "
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </div>
    </section>
  );
};

export default CreateGroup;
