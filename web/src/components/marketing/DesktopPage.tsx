import React from 'react';
import { Monitor, Cpu, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

export const DesktopPage: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center', minHeight: '65vh' }}>
        <div>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            backgroundColor: 'rgba(20, 184, 166, 0.1)', 
            color: 'var(--secondary-color)',
            fontWeight: 600,
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <Monitor size={14} /> Wide Screen Experience
          </div>
          
          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2' }}>
            Introducing <br/>
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              TripSync Desktop
            </span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
            A powerful, widescreen desktop portal designed for team organizers, coordinators, and accountants to analyze contributions, print detailed reports, and run settlement checks on the big screen.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Terminal size={18} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Dual-Pane Layout</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Analyze active transactions on the left and see optimized greedy calculations update live on the right.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Cpu size={18} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Keyboard Hotkeys & Fast Actions</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Add multiple expenses rapidly without typing delays, using preset split configurations and smart duplicate indicators.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Graphic Representation */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '520px', backgroundColor: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '12px', fontFamily: 'monospace' }}>app.tripsync.org/dashboard</span>
            </div>
            
            {/* Visual representation of dual-pane view */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', minHeight: '220px' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>LEDGER ENTRIES</span>
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Train Tickets</span>
                  <b>₹3,000</b>
                </div>
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hotel Stay</span>
                  <b>₹6,000</b>
                </div>
                <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lunch Cafe</span>
                  <b>₹1,500</b>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>OPTIMIZED DEBTS</span>
                <div style={{ padding: '8px', borderRadius: '8px', border: '1px dashed var(--primary-color)', fontSize: '0.62rem', backgroundColor: 'var(--bg-secondary)' }}>
                  Gautam pays Praveen <b>₹1,000</b>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', border: '1px dashed var(--primary-color)', fontSize: '0.62rem', backgroundColor: 'var(--bg-secondary)', marginTop: '4px' }}>
                  Everything is optimized!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup and offline section */}
      <section style={{ borderTop: '1px solid var(--border-color)', marginTop: '60px', paddingTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', marginBottom: '14px' }}>
            <Cpu size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>PWA Desktop Web-App</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Install TripSync as a standalone application on Windows, macOS, or Linux directly from your browser search bar.</p>
        </div>

        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', marginBottom: '14px' }}>
            <ShieldAlert size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Offline Ledger Backups</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Even if internet connectivity goes offline, your local browser cache retains all transactions, syncing back to Firestore once connection returns.</p>
        </div>

        <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'inline-flex', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', marginBottom: '14px' }}>
            <Sparkles size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Large Screen Exports</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Export sheets with up to 500 transaction rows instantly into Microsoft Excel format or generate printable PDF budgets.</p>
        </div>
      </section>
    </div>
  );
};
