import { describe, test, expect } from '@jest/globals';
import { getRequiredMajority, calculateNetScore, determineStatus } from './approvalEngine';

describe('Approval Engine - voting calculations', () => {
  
  describe('getRequiredMajority', () => {
    test('calculates correct majority thresholds for group sizes 1 to 10', () => {
      // 1 Member = 1
      expect(getRequiredMajority(1)).toBe(1);
      // 2 Members = 2
      expect(getRequiredMajority(2)).toBe(2);
      // 3 Members = 2
      expect(getRequiredMajority(3)).toBe(2);
      // 4 Members = 3
      expect(getRequiredMajority(4)).toBe(3);
      // 5 Members = 3
      expect(getRequiredMajority(5)).toBe(3);
      // 6 Members = 4
      expect(getRequiredMajority(6)).toBe(4);
      // 7 Members = 4
      expect(getRequiredMajority(7)).toBe(4);
      // 8 Members = 5
      expect(getRequiredMajority(8)).toBe(5);
      // 9 Members = 5
      expect(getRequiredMajority(9)).toBe(5);
      // 10 Members = 6
      expect(getRequiredMajority(10)).toBe(6);
    });

    test('handles fallback case for zero or negative member counts', () => {
      expect(getRequiredMajority(0)).toBe(1);
      expect(getRequiredMajority(-5)).toBe(1);
    });
  });

  describe('calculateNetScore', () => {
    test('calculates net score of positive and negative votes', () => {
      // Only creator voted approved
      expect(calculateNetScore({ creator_uid: 1 })).toBe(1);
      
      // Two approvals
      expect(calculateNetScore({ creator_uid: 1, user2_uid: 1 })).toBe(2);
      
      // One approval, one rejection
      expect(calculateNetScore({ creator_uid: 1, user2_uid: -1 })).toBe(0);
      
      // Two approvals, one rejection
      expect(calculateNetScore({ creator_uid: 1, user2_uid: 1, user3_uid: -1 })).toBe(1);

      // Mixed voting
      expect(calculateNetScore({ u1: 1, u2: -1, u3: 1, u4: 1, u5: -1 })).toBe(1);
    });
  });

  describe('determineStatus', () => {
    test('resolves pending when net score is below required majority and rejects are below majority', () => {
      expect(determineStatus({ u1: 1, u2: -1 }, 2)).toBe('pending');
      expect(determineStatus({ u1: 1 }, 2)).toBe('pending');
      expect(determineStatus({ u1: 1, u2: -1, u3: -1 }, 3)).toBe('pending');
    });

    test('resolves approved when net score meets or exceeds required majority', () => {
      expect(determineStatus({ u1: 1, u2: 1 }, 2)).toBe('approved');
      expect(determineStatus({ u1: 1, u2: 1, u3: 1 }, 2)).toBe('approved');
      expect(determineStatus({ u1: 1, u2: 1, u3: 1 }, 3)).toBe('approved');
    });

    test('resolves rejected when reject count meets or exceeds required majority', () => {
      expect(determineStatus({ u1: 1, u2: -1, u3: -1 }, 2)).toBe('rejected');
      expect(determineStatus({ u1: -1, u2: -1 }, 2)).toBe('rejected');
      expect(determineStatus({ u1: -1, u2: -1, u3: -1 }, 3)).toBe('rejected');
    });
  });
});
