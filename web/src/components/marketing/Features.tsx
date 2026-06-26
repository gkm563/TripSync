import React from 'react';
import { Shield, Users, History, AlertTriangle, FileText, CheckSquare, Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>TripSync Feature Suite</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          Say goodbye to budgeting stress. TripSync is engineered with robust mathematical engines, real-time sync, and security tools.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginTop: '40px' }}>
        {/* Feature 1 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <Users size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Democratic Shared Ledger</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            No owners, admins, or hierarchy. Every group member holds identical permissions. Anyone can create a trip, add payments, or cast votes.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <CheckSquare size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Consensus Approval Queue</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Expenses require a majority vote to be factored into settlements. The required majority is calculated dynamically: `floor(N / 2) + 1` approvals.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Reject Reason Enforcement</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Members cannot reject an expense without log notes. If "Other" is chosen, a detailed reasoning of at least 20 characters is mandatory to resolve disputes.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <History size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Tamper-Proof Audit Trail</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Every action (creation, voting, edits) is cataloged. When an approved expense is edited, the state resets and the old version is archived under revision histories.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <Shield size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Smart Duplicate Warnings</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Scans recent entries. Alerts you if a matching category, title, and amount are logged within a 10-minute window, reducing accidental duplicates.
          </p>
        </div>

        {/* Feature 6 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', width: 'fit-content', marginBottom: '16px' }}>
            <FileText size={22} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Multiple Format Exporting</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Generates professional printable layout PDF files, Microsoft Excel (.xlsx) workbooks, or copyable text summaries formatted for WhatsApp messaging.
          </p>
        </div>
      </div>
      
      {/* Visual illustration banner */}
      <div className="glass animate-pulse-slow" style={{ marginTop: '60px', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Greedy Flow Minimizer (Settlement Algorithm)</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            TripSync contains a highly optimized flow-minimization mathematical module. At any given moment, the engine processes members balances, divides them into debtors and creditors, and pairs them to resolve the entire group settlement in the absolute minimum possible transaction steps.
          </p>
        </div>
        <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '6px' }}><Sparkles size={14} /> Settlement Matrix</div>
          <div>Total Group Cost: ₹10,500.00</div>
          <div>Per Person Cost: ₹3,500.00</div>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '6px 0' }}></div>
          <div>• Gautam: paid ₹1,500 (Balance: -₹2,000)</div>
          <div>• Rohit: paid ₹6,000 (Balance: +₹2,500)</div>
          <div>• Praveen: paid ₹3,000 (Balance: -₹500)</div>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '6px 0' }}></div>
          <div style={{ color: 'hsl(var(--green))', fontWeight: 'bold' }}>Settle Transfers:</div>
          <div>- Gautam pays Rohit: ₹2,000</div>
          <div>- Praveen pays Rohit: ₹500</div>
        </div>
      </div>
    </div>
  );
};
