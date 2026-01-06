export const calculateBalances = (expenses, members) => {
  const balance = {};
  members.forEach(m => balance[m] = 0);

  expenses.forEach(exp => {
    exp.participants.forEach(p => {
      balance[p] -= exp.splitAmount;
    });
    balance[exp.paidBy] += exp.amount;
  });

  return balance;
};
