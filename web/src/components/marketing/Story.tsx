import React from 'react';
import { Calendar, Shield } from 'lucide-react';

export const Story: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>The TripSync Backstory</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
          From a university event spark to a cyber-safe field operations ledger.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative', borderLeft: '3px solid var(--border-color)', paddingLeft: '32px', marginLeft: '12px' }}>
        
        {/* Step 1 */}
        <div style={{ position: 'relative' }}>
          {/* Dot */}
          <div style={{ position: 'absolute', left: '-41px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '3px solid var(--bg-primary)' }}></div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={12} /> FEBRUARY 2026
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>💡 The Spark at IIT Delhi</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
              The concept for TripSync was born during a **5-day event at IIT Delhi**. Observing teams of hackathon participants, students, and coordinators struggle to manage logistics (fuel, accommodation, food, and supplies) highlighted a major friction point: traditional splitting apps require itemizing every receipt. This creates friction during the event. We realized a simple, shared ledger tracking **"who paid how much for the group as a whole"** was needed.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ position: 'relative' }}>
          {/* Dot */}
          <div style={{ position: 'absolute', left: '-41px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '3px solid var(--bg-primary)' }}></div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={12} /> MARCH 2026
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>👮 Cyber Security Internship (APCSIP-2026)</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
              The concept was developed into a production-ready application by developer **Gautam Kumar Maurya (gkm563)** during the **12-day Amroha Police Cyber Security Internship Program 2026 (APCSIP-2026)**. The internship was organized by the **Amroha Police (Uttar Pradesh Police) Cyber Crime Cell**.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
              Investigative officers and forensics teams often travel in cooperative groups on cases. Settle arguments during case field operations were counter-productive, making a secure, transparent, and non-hierarchical contribution ledger a perfect operational asset.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ position: 'relative' }}>
          {/* Dot */}
          <div style={{ position: 'absolute', left: '-41px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', border: '3px solid var(--bg-primary)' }}></div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={12} /> APRIL 2026
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>🚀 Open Source Release</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
              Following successful validation by cyber cells and university students, TripSync was published as open-source code on GitHub. We added Microsoft Excel sheet generators, PDF print statement templates, and real-time Firestore listeners, expanding the ecosystem to support both mobile app users and desktop web browser users.
            </p>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '60px', padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Shield size={20} style={{ color: 'var(--primary-color)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          To read Gautam's daily journals covering digital forensics, CDR analysis, IPDR logs, and selection stages during the Amroha Police internship, visit: <br/>
          <a href="https://gkm563.github.io/up-police-internship.html" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>gkm563.github.io/up-police-internship.html</a>
        </div>
      </div>
    </div>
  );
};
