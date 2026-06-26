import React from 'react';
import { Smartphone, Bell, Flame, Shield, ArrowDownCircle } from 'lucide-react';

export const MobilePage: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center', minHeight: '65vh' }}>
        
        {/* Visual Graphic Representation: Mobile phone view */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ 
            width: '260px', 
            height: '520px', 
            borderRadius: '36px', 
            border: '8px solid #1e293b', 
            boxShadow: 'var(--shadow-lg)', 
            backgroundColor: '#0f172a',
            padding: '16px',
            color: 'white',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 'bold' }}>TripSync Mobile</span>
              <span style={{ width: '40px', height: '12px', borderRadius: '10px', backgroundColor: '#1e293b' }}></span>
            </div>
            
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid #4f46e5', fontSize: '0.72rem' }}>
              <p style={{ color: '#818cf8', fontWeight: 'bold' }}>🔔 Real-time Push Alert</p>
              <p style={{ marginTop: '2px' }}>Praveen added new expense: Hotel Booking (₹6,000)</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Total Shared Cost</span>
                <b>₹10,500</b>
              </div>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span>Per Member Share</span>
                <b>₹3,500</b>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #334155', paddingTop: '8px', fontSize: '0.6rem', color: '#94a3b8' }}>
              <span>Home</span>
              <span>Activity</span>
              <span style={{ color: '#6366f1', fontWeight: 'bold' }}>+ Add</span>
              <span>Votes</span>
            </div>
          </div>
        </div>

        {/* Text descriptions */}
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
            <Smartphone size={14} /> Android & iOS Core App
          </div>
          
          <h1 style={{ fontSize: '2.8rem', lineHeight: '1.2' }}>
            TripSync on the Go with <br/>
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              tripsyncMobile
            </span>
          </h1>
          
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
            Built using React Native and Expo, tripsyncMobile fits right in your pocket. Sync contributions instantly in the middle of field operations, hackathon venues, or remote camps.
          </p>

          {/* Core mobile features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Bell size={18} style={{ color: 'var(--secondary-color)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>FCM Push Notifications</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Receive instant push warnings on your device when someone invites you, adds a payment, or votes on your contributions.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Flame size={18} style={{ color: 'var(--secondary-color)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Fast Swipe Actions</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Review queue items directly on screen. One-tap approvals or rejection logs without loading lags.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Shield size={18} style={{ color: 'var(--secondary-color)', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Offline Local Cache</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Fully functional offline storage (using Zustand local persistence + SQLite caches) so you can log bills even deep in forests or high in mountains without cellular data.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button className="btn-primary" style={{ padding: '12px 20px', fontSize: '0.85rem' }}><ArrowDownCircle size={16} /> Download Android APK</button>
            <button className="btn-secondary" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>View Source Code</button>
          </div>
        </div>

      </div>
    </div>
  );
};
