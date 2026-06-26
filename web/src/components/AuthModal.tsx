import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { X, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { USE_FIREBASE } from '../firebase/config';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, registerUser, loginWithGoogle, loading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!email || !password) {
      setValidationError("Please fill out all fields.");
      return;
    }
    if (mode === 'register' && !name) {
      setValidationError("Please enter your name.");
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await registerUser(name, email, password);
      }
      onClose();
    } catch (err) {
      // Handled by state store
    }
  };

  const handleGoogleSignIn = async () => {
    setValidationError(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      // Handled
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.4rem' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
          <button onClick={onClose} className="btn-text" style={{ padding: '4px', borderRadius: '50%' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(error || validationError) && (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'hsl(var(--red))', 
              fontSize: '0.85rem',
              fontWeight: 500,
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{validationError || error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Gautam Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <UserIcon size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-control" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>

          {USE_FIREBASE && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '10px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn} 
                className="btn-secondary" 
                style={{ width: '100%', gap: '10px', padding: '11px' }}
                disabled={loading}
              >
                {/* Embedded simplified Google logo */}
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.6 9.2c0-.6-.05-1.2-.15-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4z"/>
                  <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 16.1 5.5 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.9 10.7c-.2-.6-.3-1.2-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.6 0 9s.3 2.8.9 4l3-2.3z"/>
                  <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.4 3.4 1.3l2.6-2.6C13.5.8 11.4 0 9 0 5.5 0 2.4 1.9.9 5L3.9 7.3c.7-2.2 2.7-3.7 5.1-3.7z"/>
                </svg>
                Sign In with Google
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', fontSize: '0.88rem', marginTop: '10px', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
              style={{ color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer' }}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
