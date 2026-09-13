import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: '800', color: 'var(--accent-primary)', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The requested page does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>Return to Listings</span>
      </Link>
    </div>
  );
}
