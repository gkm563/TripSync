import { describe, test, expect } from '@jest/globals';
import { calculateSettlement } from './settlementEngine';
import { Expense } from '../types';

describe('Settlement Engine - calculateSettlement', () => {
  const members = ['gautam_uid', 'rohit_uid', 'praveen_uid'];

  test('no expenses - all balances zero, no transactions', () => {
    const expenses: Expense[] = [];
    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(0);
    expect(result.perMember).toBe(0);
    expect(result.transactions).toHaveLength(0);
    expect(result.balances['gautam_uid']).toBe(0);
    expect(result.balances['rohit_uid']).toBe(0);
    expect(result.balances['praveen_uid']).toBe(0);
  });

  test('all members paid equally - no transactions required', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        tripId: 't1',
        title: 'Food',
        amount: 3000,
        category: 'Food',
        paidBy: { gautam_uid: 3000 },
        createdBy: 'gautam_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'gautam_uid',
      },
      {
        id: '2',
        tripId: 't1',
        title: 'Travel',
        amount: 3000,
        category: 'Travel',
        paidBy: { rohit_uid: 3000 },
        createdBy: 'rohit_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'rohit_uid',
      },
      {
        id: '3',
        tripId: 't1',
        title: 'Hotel',
        amount: 3000,
        category: 'Hotel',
        paidBy: { praveen_uid: 3000 },
        createdBy: 'praveen_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'praveen_uid',
      },
    ];

    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(9000);
    expect(result.perMember).toBe(3000);
    expect(result.balances['gautam_uid']).toBe(0);
    expect(result.balances['rohit_uid']).toBe(0);
    expect(result.balances['praveen_uid']).toBe(0);
    expect(result.transactions).toHaveLength(0);
  });

  test('single payer covers all - other two owe third share each', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        tripId: 't1',
        title: 'Hotel Total',
        amount: 12000,
        category: 'Hotel',
        paidBy: { praveen_uid: 12000 },
        createdBy: 'praveen_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'praveen_uid',
      },
    ];

    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(12000);
    expect(result.perMember).toBe(4000);
    expect(result.balances['praveen_uid']).toBe(8000);
    expect(result.balances['gautam_uid']).toBe(-4000);
    expect(result.balances['rohit_uid']).toBe(-4000);
    
    // Transactions check (2 transfers)
    expect(result.transactions).toHaveLength(2);
    
    const gautamTx = result.transactions.find(tx => tx.from === 'gautam_uid');
    const rohitTx = result.transactions.find(tx => tx.from === 'rohit_uid');
    
    expect(gautamTx).toBeDefined();
    expect(gautamTx?.to).toBe('praveen_uid');
    expect(gautamTx?.amount).toBe(4000);
    
    expect(rohitTx).toBeDefined();
    expect(rohitTx?.to).toBe('praveen_uid');
    expect(rohitTx?.amount).toBe(4000);
  });

  test('multiple payers split - greedy optimization', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        tripId: 't1',
        title: 'Food',
        amount: 3000,
        category: 'Food',
        paidBy: { praveen_uid: 2000, gautam_uid: 1000 },
        createdBy: 'gautam_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'gautam_uid',
      },
      {
        id: '2',
        tripId: 't1',
        title: 'Hotel',
        amount: 9000,
        category: 'Hotel',
        paidBy: { praveen_uid: 3000, rohit_uid: 4000, gautam_uid: 2000 },
        createdBy: 'gautam_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'gautam_uid',
      },
    ];

    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(12000);
    expect(result.perMember).toBe(4000);
    expect(result.balances['gautam_uid']).toBe(-1000);
    expect(result.balances['rohit_uid']).toBe(0);
    expect(result.balances['praveen_uid']).toBe(1000);

    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].from).toBe('gautam_uid');
    expect(result.transactions[0].to).toBe('praveen_uid');
    expect(result.transactions[0].amount).toBe(1000);
  });

  test('rounding decimal division - mathematically balanced', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        tripId: 't1',
        title: 'Snack',
        amount: 100,
        category: 'Food',
        paidBy: { gautam_uid: 100 },
        createdBy: 'gautam_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'gautam_uid',
      },
    ];

    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(100);
    expect(result.perMember).toBe(33.33);
    expect(result.balances['gautam_uid']).toBe(66.67);
    expect(result.balances['rohit_uid']).toBe(-33.33);
    expect(result.balances['praveen_uid']).toBe(-33.33);

    expect(result.transactions).toHaveLength(2);
    
    const rohitTx = result.transactions.find(tx => tx.from === 'rohit_uid');
    const praveenTx = result.transactions.find(tx => tx.from === 'praveen_uid');

    expect(rohitTx?.to).toBe('gautam_uid');
    expect(rohitTx?.amount).toBe(33.33);

    expect(praveenTx?.to).toBe('gautam_uid');
    expect(praveenTx?.amount).toBe(33.33);
  });

  test('only approved expenses are calculated', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        tripId: 't1',
        title: 'Apples',
        amount: 600,
        category: 'Food',
        paidBy: { gautam_uid: 600 },
        createdBy: 'gautam_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'approved',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'gautam_uid',
      },
      {
        id: '2',
        tripId: 't1',
        title: 'Pending Hotel Booking',
        amount: 9000,
        category: 'Hotel',
        paidBy: { rohit_uid: 9000 },
        createdBy: 'rohit_uid',
        createdAt: new Date().toISOString(),
        date: '2026-06-09',
        time: '12:00',
        status: 'pending',
        votes: {},
        rejectReasons: {},
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: 'rohit_uid',
      },
    ];

    const result = calculateSettlement(members, expenses);

    expect(result.totalExpense).toBe(600);
    expect(result.perMember).toBe(200);
    expect(result.balances['gautam_uid']).toBe(400);
    expect(result.balances['rohit_uid']).toBe(-200);
    expect(result.balances['praveen_uid']).toBe(-200);
  });
});
