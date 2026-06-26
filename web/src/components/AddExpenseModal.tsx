import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import type { Expense, User } from '../types';
import { X, Info, AlertTriangle } from 'lucide-react';

interface AddExpenseModalProps {
  tripId: string;
  tripMembers: string[]; // member UIDs
  expenseToEdit?: Expense; // if provided, modal is in Edit mode
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  tripId, 
  tripMembers, 
  expenseToEdit, 
  onClose 
}) => {
  const { user, usersList } = useAuthStore();
  const { addExpense, editExpense, checkForDuplicates } = useExpenseStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Food');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  // Payer Mode: 'single' | 'multiple'
  const [payerMode, setPayerMode] = useState<'single' | 'multiple'>('single');
  // Single payer UID
  const [singlePayerUid, setSinglePayerUid] = useState('');
  // Multiple payers mapping: UID -> amount text
  const [multiplePayers, setMultiplePayers] = useState<Record<string, string>>({});
  
  // Participant checkboxes: Record<UID, boolean>
  const [participants, setParticipants] = useState<Record<string, boolean>>({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get User object by UID
  const getMemberUser = (uid: string): User | undefined => {
    return usersList.find(u => u.uid === uid);
  };

  useEffect(() => {
    // Initialize date & time to now
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentDay = String(now.getDate()).padStart(2, '0');
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    
    setDate(`${currentYear}-${currentMonth}-${currentDay}`);
    setTime(`${currentHours}:${currentMinutes}`);

    // Default participants to all members checked
    const initialParticipants: Record<string, boolean> = {};
    tripMembers.forEach(uid => {
      initialParticipants[uid] = true;
    });
    setParticipants(initialParticipants);

    // Default single payer to current user
    if (user) {
      setSinglePayerUid(user.uid);
    } else if (tripMembers.length > 0) {
      setSinglePayerUid(tripMembers[0]);
    }

    // Initialize multi payers structure
    const initialMulti: Record<string, string> = {};
    tripMembers.forEach(uid => {
      initialMulti[uid] = '';
    });
    setMultiplePayers(initialMulti);

    // If editing, populate fields
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setAmount(String(expenseToEdit.amount));
      setCategory(expenseToEdit.category);
      setNotes(expenseToEdit.notes || '');
      setDate(expenseToEdit.date);
      setTime(expenseToEdit.time);

      const paidKeys = Object.keys(expenseToEdit.paidBy);
      if (paidKeys.length > 1) {
        setPayerMode('multiple');
        const multiVals: Record<string, string> = {};
        tripMembers.forEach(uid => {
          multiVals[uid] = String(expenseToEdit.paidBy[uid] || '');
        });
        setMultiplePayers(multiVals);
      } else if (paidKeys.length === 1) {
        setPayerMode('single');
        setSinglePayerUid(paidKeys[0]);
      }

      if (expenseToEdit.participants) {
        const parts: Record<string, boolean> = {};
        tripMembers.forEach(uid => {
          parts[uid] = expenseToEdit.participants!.includes(uid);
        });
        setParticipants(parts);
      }
    }
  }, [expenseToEdit, tripMembers, user]);

  const handleSubmit = async (bypassDuplicate = false) => {
    setErrorMsg(null);
    if (!user) return;
    
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setErrorMsg("Expense title is required.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }

    // Calculate paidBy object
    const paidBy: Record<string, number> = {};
    if (payerMode === 'single') {
      paidBy[singlePayerUid] = parsedAmount;
    } else {
      let sum = 0;
      Object.entries(multiplePayers).forEach(([uid, val]) => {
        const itemVal = parseFloat(val) || 0;
        if (itemVal > 0) {
          paidBy[uid] = itemVal;
          sum += itemVal;
        }
      });
      // Validate sum matches total amount
      if (Math.abs(sum - parsedAmount) > 0.05) {
        setErrorMsg(`Sum of split payments (₹${sum.toFixed(2)}) must match the total amount (₹${parsedAmount.toFixed(2)}).`);
        return;
      }
    }

    // Filter participants
    const partsArray = Object.entries(participants)
      .filter(([_, checked]) => checked)
      .map(([uid]) => uid);

    if (partsArray.length === 0) {
      setErrorMsg("At least one member must participate in this expense.");
      return;
    }

    // Check for duplicates in non-edit mode
    if (!expenseToEdit && !bypassDuplicate) {
      const hasDuplicate = checkForDuplicates(tripId, title, parsedAmount, category);
      if (hasDuplicate) {
        setShowDuplicateWarning(true);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (expenseToEdit) {
        await editExpense(
          expenseToEdit.id,
          title,
          parsedAmount,
          category,
          paidBy,
          user.uid,
          user.name,
          date,
          time,
          notes,
          tripMembers.length,
          partsArray
        );
      } else {
        await addExpense(
          tripId,
          title,
          parsedAmount,
          category,
          paidBy,
          user.uid,
          user.name,
          date,
          time,
          notes,
          tripMembers.length,
          partsArray
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.3rem' }}>{expenseToEdit ? 'Edit Shared Expense' : 'Add Shared Expense'}</h3>
          <button onClick={onClose} className="btn-text" style={{ padding: '4px', borderRadius: '50%' }}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'hsl(var(--red))', fontSize: '0.85rem', fontWeight: 500 }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {showDuplicateWarning && (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'hsl(var(--orange))', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} /> Similar Expense Warning
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>
                A similar expense with the same amount and category was created in the last 10 minutes. Are you sure you want to add this expense?
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowDuplicateWarning(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                <button type="button" onClick={() => handleSubmit(true)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--grad-warning)' }}>Yes, Add it</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Expense Title</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Train Ticket" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="600" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Category</label>
            <select 
              className="form-control" 
              value={category}
              onChange={(e) => setCategory(e.target.value as Expense['category'])}
            >
              <option value="Food">Food 🍔</option>
              <option value="Travel">Travel ✈️</option>
              <option value="Hotel">Hotel 🏨</option>
              <option value="Shopping">Shopping 🛍️</option>
              <option value="Other">Other 📦</option>
            </select>
          </div>

          {/* Paid By Split Configuration */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Paid By</span>
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setPayerMode('single')} 
                  style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', background: payerMode === 'single' ? 'var(--bg-secondary)' : 'none', color: payerMode === 'single' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Single Payer
                </button>
                <button 
                  type="button" 
                  onClick={() => setPayerMode('multiple')} 
                  style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px', border: 'none', background: payerMode === 'multiple' ? 'var(--bg-secondary)' : 'none', color: payerMode === 'multiple' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Multiple
                </button>
              </div>
            </div>

            {payerMode === 'single' ? (
              <select 
                className="form-control"
                value={singlePayerUid}
                onChange={(e) => setSinglePayerUid(e.target.value)}
              >
                {tripMembers.map(uid => {
                  const mUser = getMemberUser(uid);
                  return (
                    <option key={uid} value={uid}>
                      {mUser ? mUser.name : 'Unknown User'} ({mUser ? mUser.email : ''})
                    </option>
                  );
                })}
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tripMembers.map(uid => {
                  const mUser = getMemberUser(uid);
                  return (
                    <div key={uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem' }}>{mUser ? mUser.name : 'Unknown'}</span>
                      <input 
                        type="number"
                        placeholder="₹0"
                        className="form-control"
                        style={{ width: '120px', padding: '6px 12px', fontSize: '0.85rem' }}
                        value={multiplePayers[uid] || ''}
                        onChange={(e) => setMultiplePayers({ ...multiplePayers, [uid]: e.target.value })}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expense Participation Checkboxes */}
          <div>
            <label className="form-label">Expense Participants (Who shares this cost?)</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
              {tripMembers.map(uid => {
                const mUser = getMemberUser(uid);
                return (
                  <label key={uid} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)' }}>
                    <input 
                      type="checkbox" 
                      checked={participants[uid] || false}
                      onChange={(e) => setParticipants({ ...participants, [uid]: e.target.checked })}
                    />
                    <span>{mUser ? mUser.name : 'Unknown'}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Time</label>
              <input 
                type="time" 
                className="form-control" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-control" 
              placeholder="e.g. Paid for train tickets via Google Pay" 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
          <button 
            type="button" 
            onClick={() => handleSubmit()} 
            className="btn-primary" 
            disabled={isSubmitting || showDuplicateWarning}
          >
            {isSubmitting ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};
