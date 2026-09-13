import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    // Clear previous error on new submission attempt
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);

      if (res && res.success && res.token) {
        navigate('/');
      } else {
        const errorText = (res && typeof res.error === 'string' && res.error.trim())
          ? res.error
          : 'Invalid email or password. Please check your credentials and try again.';
        setError(errorText);
      }
    } catch (err) {
      setError('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="brand-icon" style={{ width: '48px', height: '48px', margin: '0 auto 1rem' }}>
            <Building2 size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Welcome to Ivy Homes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real Estate Intelligence & Analytics Portal</p>
        </div>

        {error && (
          <div 
            role="alert"
            style={{ 
              padding: '0.75rem 1rem', 
              background: 'rgba(244, 63, 94, 0.1)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem' 
            }}
          >
            <AlertCircle size={18} color="#fb7185" style={{ flexShrink: 0 }} />
            <span style={{ color: '#fb7185', fontSize: '0.85rem', lineHeight: '1.4' }}>
              {String(error)}
            </span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@ivy.homes"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  outline: 'none',
                  opacity: loading ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              API Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter API password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  outline: 'none',
                  opacity: loading ? 0.7 : 1
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={15} color="#34d399" />
            <span>Authenticated via secure X-API-Key credentials</span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }} 
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
