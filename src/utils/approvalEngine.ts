/**
 * Returns the majority threshold required for approval.
 * Majority formula: floor(totalMembers / 2) + 1
 */
export function getRequiredMajority(membersCount: number): number {
  if (membersCount <= 0) return 1;
  return Math.floor(membersCount / 2) + 1;
}

/**
 * Calculates the net score of the votes map.
 * Approve (+1), Reject (-1)
 */
export function calculateNetScore(votes: Record<string, number>): number {
  return Object.values(votes).reduce((sum, val) => sum + val, 0);
}

/**
 * Determines the status of an expense based on the votes map and majority threshold.
 */
export function determineStatus(
  votes: Record<string, number>, 
  requiredMajority: number
): 'approved' | 'rejected' | 'pending' {
  const netScore = Object.values(votes).reduce((sum, val) => sum + val, 0);
  const rejectCount = Object.values(votes).filter(v => v === -1).length;

  if (netScore >= requiredMajority) return 'approved';
  if (rejectCount >= requiredMajority) return 'rejected';
  return 'pending';
}
