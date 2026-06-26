import React from 'react';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

export const Press: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Press & Media Kit</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Official updates, news bulletins, and assets for TripSync.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Release 1 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              <Calendar size={12} /> MARCH 28, 2026
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary-color)' }}>APCSIP-2026</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>TripSync Selected for Amroha Police Cyber Security Internship</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '10px' }}>
            Amroha Police Crime Cell announced that TripSync, designed by lead developer Gautam Kumar Maurya (gkm563), has been approved as an official case logistics expense tracker. The open-source TypeScript ledger simplifies shared food, travel fuel, and camp costs during field digital forensics analysis without central administrative hierarchies, preserving audit trails.
          </p>
        </div>

        {/* Release 2 */}
        <div className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              <Calendar size={12} /> FEBRUARY 12, 2026
            </span>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>Product Launch</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Vite Web Portal Expands TripSync Ecosystem to Desktop Clients</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '10px' }}>
            Following success of the React Native mobile application, developer Gautam Kumar Maurya released the official Vite React web client. The portal links to the Firestore sync database, bringing the consensus approval queue, version-controlled audit trail, and greedy settlement engine to wide-screen laptops and desktops.
          </p>
        </div>

      </div>

      {/* Media Contact Footer */}
      <div style={{ marginTop: '60px', padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Newspaper size={24} style={{ color: 'var(--primary-color)' }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>Media & Press Contact</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>For press requests, assets, logo downloads, or developer interviews: contact Gautam Kumar Maurya.</p>
        </div>
        <a href="mailto:gkmwin563@gmail.com" className="btn-secondary" style={{ fontSize: '0.82rem', padding: '10px 16px' }}>gkmwin563@gmail.com <ArrowRight size={14} /></a>
      </div>
    </div>
  );
};
