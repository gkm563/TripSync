import React, { useState } from 'react';
import { Mail, Globe, MapPin, Send, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="container animate-fadeIn" style={{ padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Contact Gautam (gkm563)</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Have suggestions, feature requests, or custom integration queries? Reach out.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Get In Touch</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            TripSync is maintained and expanded by **Gautam Kumar Maurya (gkm563)**. If you are representing a student organization, event team, or security investigative agency and want customized settlement systems, let's connect.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</h4>
                <a href="mailto:gkmwin563@gmail.com" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>gkmwin563@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Portfolio Website</h4>
                <a href="https://gkm563.github.io" target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>gkm563.github.io</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location</h4>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Uttar Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass" style={{ padding: '40px 30px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          {isSent ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={48} style={{ color: 'hsl(var(--green))' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Message Sent!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Thank you for reaching out. Gautam will get back to you as soon as possible.
              </p>
              <button onClick={() => setIsSent(false)} className="btn-secondary" style={{ marginTop: '10px' }}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Gautam Kumar" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Feature suggestion / custom API" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Message Details</label>
                <textarea 
                  className="form-control" 
                  placeholder="Hi Gautam, I'd like to integrate TripSync into our corporate hackathon event budget sheet..." 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: 'none' }}
                  required 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Send Message <Send size={16} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
