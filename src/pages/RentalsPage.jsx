import React, { useState, useEffect } from 'react';
import { 
  Key, 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle, 
  Bed, 
  Bath, 
  Layers 
} from 'lucide-react';
import { apiService } from '../services/api';
import { formatPrice, formatArea } from '../utils/formatters';

const LOCALITIES = [
  'All',
  'Sector 49',
  'Sector 82',
  'Sector 65',
  'Sector 56',
  'Golf Course Road',
  'Dwarka Expressway',
  'Sohna Road',
  'MG Road',
  'New Gurgaon'
];

export function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [locality, setLocality] = useState('All');
  const [isLive, setIsLive] = useState('all');

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [hasMore, setHasMore] = useState(true);
  const totalCount = 1320;

  const loadRentals = async () => {
    setLoading(true);
    setError(null);

    const res = await apiService.fetchRentals({
      offset,
      limit,
      locality: locality === 'All' ? '' : locality.toLowerCase(),
      isLive,
      search
    });

    if (res.success) {
      setRentals(res.data.results || []);
      setHasMore(res.data.has_more ?? false);
    } else {
      setError(res.error || 'Failed to load rental listings');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRentals();
  }, [offset, locality, isLive]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    loadRentals();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Rental Market Inventory</h1>
        <p className="page-subtitle">
          Real-time rental listings, security deposits, and locality-level rental yield benchmarks.
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Key size={22} />
          </div>
          <div className="stat-content">
            <h4>Total Rental Records</h4>
            <div className="stat-value">1,320</div>
            <div className="stat-subtext">Across 27 paginated batches</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <DollarSign size={22} />
          </div>
          <div className="stat-content">
            <h4>Sector 49 Monthly Rent</h4>
            <div className="stat-value">₹43.28 L</div>
            <div className="stat-subtext">123 rentals (₹34.76 L live)</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-content">
            <h4>Active Market Inventory</h4>
            <div className="stat-value">1,130</div>
            <div className="stat-subtext">85.6% live on rental portals</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', flex: '1 1 300px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, apartment, or rental ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <select
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              {LOCALITIES.map(loc => (
                <option key={loc} value={loc} style={{ background: '#0f1422' }}>
                  {loc === 'All' ? 'All Localities' : loc}
                </option>
              ))}
            </select>

            <select
              value={isLive}
              onChange={(e) => { setIsLive(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f1422' }}>All Statuses</option>
              <option value="true" style={{ background: '#0f1422' }}>Live Only</option>
              <option value="false" style={{ background: '#0f1422' }}>Inactive</option>
            </select>

            <button onClick={loadRentals} className="btn btn-secondary btn-sm" title="Refresh Rentals">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Rentals Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>Loading rental records...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: 'rgba(244,63,94,0.3)' }}>
          <AlertCircle size={36} color="#fb7185" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fb7185', marginBottom: '0.5rem' }}>Error Loading Rentals</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={loadRentals} className="btn btn-primary">Retry</button>
        </div>
      ) : rentals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No Rentals Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No rental records match the selected locality or search criteria.
          </p>
          <button onClick={() => { setLocality('All'); setIsLive('all'); setSearch(''); setOffset(0); }} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
            {rentals.map(item => (
              <div key={item.listing_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{item.listing_id}</span>
                    {item.is_live ? (
                      <span className="badge badge-live">Active</span>
                    ) : (
                      <span className="badge badge-inactive">Off Market</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.furnishing ? item.furnishing.replace('-', ' ') : 'Unspecified'}
                  </span>
                </div>

                {/* Title & Locality */}
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                  {item.title || `${item.bedroom} BHK in ${item.apartment_name}`}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={14} color="#38bdf8" />
                  <span style={{ textTransform: 'capitalize' }}>{item.locality}, Gurgaon</span>
                </div>

                {/* Rent & Deposit Box */}
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399' }}>
                      ₹{item.price?.toLocaleString('en-IN')}<span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-secondary)' }}> / month</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    <span>Deposit: ₹{item.deposit?.toLocaleString('en-IN') || '0'}</span>
                    <span>Maint: ₹{item.maintenance?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                </div>

                {/* Footer Specs */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Bed size={14} />
                    <span>{item.bedroom} BHK</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Bath size={14} />
                    <span>{item.bathroom} Bath</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={14} />
                    <span>{formatArea(item.carpet_area)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing rentals <strong>{offset + 1}</strong> - <strong>{Math.min(offset + rentals.length, totalCount)}</strong> of <strong>{totalCount}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setOffset(prev => Math.max(0, prev - limit))}
                disabled={offset === 0}
                className="btn btn-secondary btn-sm"
                style={{ opacity: offset === 0 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setOffset(prev => prev + limit)}
                disabled={!hasMore && rentals.length < limit}
                className="btn btn-secondary btn-sm"
                style={{ opacity: (!hasMore && rentals.length < limit) ? 0.4 : 1 }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
