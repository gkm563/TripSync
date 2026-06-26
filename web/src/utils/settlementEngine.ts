import type { Expense, SettlementTransaction } from '../types';

export interface SettlementResult {
  totalExpense: number;
  perMember: number;
  contributions: Record<string, number>; // userId -> contributed amount
  balances: Record<string, number>;      // userId -> net balance (contrib - share)
  transactions: SettlementTransaction[];
}

/**
 * Calculate the total contributions, per-member share, net balances, 
 * and optimized transactions to settle the debts.
 * 
 * @param members UIDs of active trip members
 * @param approvedExpenses Approved expenses for the trip
 */
export function calculateSettlement(
  members: string[],
  approvedExpenses: Expense[]
): SettlementResult {
  const totalMembers = members.length;
  
  // 1. Initialize contributions and balances for all active members
  const contributions: Record<string, number> = {};
  const balances: Record<string, number> = {};
  members.forEach((uid) => {
    contributions[uid] = 0;
    balances[uid] = 0;
  });

  // 2. Sum contributions and compute balances expense-by-expense
  approvedExpenses.forEach((exp) => {
    if (exp.status !== 'approved') return;
    
    // Sum who paid what
    Object.entries(exp.paidBy).forEach(([uid, amount]) => {
      if (members.includes(uid)) {
        contributions[uid] = (contributions[uid] || 0) + amount;
        balances[uid] = (balances[uid] || 0) + amount;
      }
    });

    // Identify participants of this expense
    const expParticipants = exp.participants && exp.participants.length > 0
      ? exp.participants.filter((uid) => members.includes(uid))
      : members;

    const participantCount = expParticipants.length;
    if (participantCount > 0) {
      const sharePerParticipant = exp.amount / participantCount;
      expParticipants.forEach((uid) => {
        balances[uid] = (balances[uid] || 0) - sharePerParticipant;
      });
    }
  });

  // 3. Compute total group expense
  const totalExpense = Object.values(contributions).reduce((sum, val) => sum + val, 0);

  // 4. Compute per-member share
  const perMember = totalMembers > 0 ? parseFloat((totalExpense / totalMembers).toFixed(2)) : 0;

  // 5. Round final balances
  members.forEach((uid) => {
    balances[uid] = parseFloat((balances[uid] || 0).toFixed(2));
  });

  // 6. Greedy Transaction Minimizer
  const transactions: SettlementTransaction[] = [];

  // Split into debtors and creditors
  // Represented as arrays of [userId, balance]
  let debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -0.01)
    .map(([uid, bal]) => ({ uid, balance: Math.abs(bal) }));

  let creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0.01)
    .map(([uid, bal]) => ({ uid, balance: bal }));

  // Sort descending by balance to resolve largest debts first
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  let dIdx = 0;
  let cIdx = 0;

  // Keep track of rounding tolerances
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    if (debtor.balance < 0.01) {
      dIdx++;
      continue;
    }
    if (creditor.balance < 0.01) {
      cIdx++;
      continue;
    }

    // Amount to transfer is the minimum of debtor's debt and creditor's credit
    const amountToTransfer = Math.min(debtor.balance, creditor.balance);
    const roundedAmount = parseFloat(amountToTransfer.toFixed(2));

    if (roundedAmount > 0.01) {
      transactions.push({
        from: debtor.uid,
        to: creditor.uid,
        amount: roundedAmount,
      });
    }

    // Update balances
    debtor.balance = parseFloat((debtor.balance - roundedAmount).toFixed(2));
    creditor.balance = parseFloat((creditor.balance - roundedAmount).toFixed(2));

    // Move pointers if balance is settled
    if (debtor.balance < 0.01) {
      dIdx++;
    }
    if (creditor.balance < 0.01) {
      cIdx++;
    }
  }

  return {
    totalExpense: parseFloat(totalExpense.toFixed(2)),
    perMember,
    contributions,
    balances,
    transactions,
  };
}
