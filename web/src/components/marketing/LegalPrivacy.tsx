import React from 'react';
import { Scale, ShieldAlert, FileText } from 'lucide-react';

export const LegalPrivacy: React.FC = () => {
  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px', maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Legal & Privacy Center</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Terms of service, privacy protocols, and open-source licensing.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
        
        {/* Section 1 */}
        <section className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ShieldAlert size={20} style={{ color: 'var(--primary-color)' }} /> Privacy Policy & Data Security
          </h3>
          <p>
            Your privacy is our utmost priority. Because TripSync was designed during a cybersecurity internship (APCSIP-2026) for secure group logistics, we enforce the following strict protocols:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><b>Firestore Storage:</b> Shared trip ledgers, votes, rejections, and notifications are stored securely in Google Firebase Firestore databases.</li>
            <li><b>Biometrics & Credentials:</b> We do not collect passwords or sensitive biometrics. Email authentications are validated through secure Firebase Auth channels.</li>
            <li><b>Cache Clearance:</b> To prevent physical device session hijacks, signing out of the mobile app or web portal completely flushes all local cached store data.</li>
            <li><b>Audit Trail Integrity:</b> Deleted transaction items log a system action, ensuring history states cannot be silently tampered with.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Scale size={20} style={{ color: 'var(--primary-color)' }} /> MIT License Agreement
          </h3>
          <p>
            TripSync is published as open-source software under the terms of the MIT License:
          </p>
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginTop: '12px', overflowX: 'auto' }}>
            <p>Copyright (c) {new Date().getFullYear()} Gautam Kumar Maurya (gkm563)</p>
            <p style={{ marginTop: '8px' }}>
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...
            </p>
            <p style={{ marginTop: '8px' }}>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT...
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="glass" style={{ padding: '30px', borderRadius: '18px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <FileText size={20} style={{ color: 'var(--primary-color)' }} /> Terms of Service
          </h3>
          <p>
            By using TripSync (either the Expo mobile client or the React Web portal), you agree that all group expense logs are democratic. Settle payments are calculated mathematically based on greedy algorithms. TripSync does not handle actual money transfers; settlements must be settled manually by users (e.g. cash, direct UPI bank transfers).
          </p>
        </section>

      </div>
    </div>
  );
};
