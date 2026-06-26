import React from 'react';
import { Briefcase, ShieldAlert, Award, FileSpreadsheet, Lock } from 'lucide-react';

export const Business: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center', minHeight: '60vh', marginBottom: '60px' }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
            color: 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <Briefcase size={14} /> Team & Corporate Logistics
          </div>
          
          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2' }}>
            TripSync for <br/>
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Business & Field Teams
            </span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
            Ensure financial transparency and eliminate budget friction for offsite teams, corporate trips, research squads, and field investigative units.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Lock size={16} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}><b>Zero Trust Shared Ledger:</b> Prevent accounting mistakes with a democratic majority vote system on all logged bills.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <FileSpreadsheet size={16} style={{ color: 'var(--primary-color)', marginTop: '4px' }} />
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}><b>Auditable Logs:</b> Complete version trails for edits and votes. Export worksheets straight to Microsoft Excel for accounting reviews.</p>
            </div>
          </div>
        </div>

        {/* Visual card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={20} style={{ color: 'var(--primary-color)' }} /> Audit-Ready Operations</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Corporate travel often suffers from disjointed paper receipts, lost invoices, and disputed expense splits. TripSync provides field operators with a secure, real-time shared workspace to catalog fuel, accommodation, and food contributions as they happen.
            </p>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <ShieldAlert size={18} style={{ color: 'hsl(var(--orange))', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Integrated with Firestore security access rules, ensuring users can only read and write data in trips they are explicitly invited to.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
