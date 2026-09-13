import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Building2, 
  Crown, 
  ShieldAlert, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { apiService } from '../services/api';

const STATUSES = ['All', 'ready to move', 'under construction', 'nearing possession'];
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

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [locality, setLocality] = useState('All');
  const [status, setStatus] = useState('All');

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [hasMore, setHasMore] = useState(true);
  const totalCount = 400;

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    const res = await apiService.fetchProjects({
      offset,
      limit,
      status: status === 'All' ? '' : status,
      locality: locality === 'All' ? '' : locality.toLowerCase(),
      search
    });

    if (res.success) {
      setProjects(res.data.results || []);
      setHasMore(res.data.has_more ?? false);
    } else {
      setError(res.error || 'Failed to load project records');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [offset, locality, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    loadProjects();
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Residential Projects Directory</h1>
        <p className="page-subtitle">
          Master catalog of real estate projects, developers, tower configurations, and RERA registrations.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FolderGit2 size={22} />
          </div>
          <div className="stat-content">
            <h4>Total Projects</h4>
            <div className="stat-value">400</div>
            <div className="stat-subtext">P60001 to P60400 verified</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Crown size={22} />
          </div>
          <div className="stat-content">
            <h4>Costliest Project</h4>
            <div className="stat-value">P60090</div>
            <div className="stat-subtext">Puravankara Willows (₹98.9 Cr)</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <ShieldAlert size={22} />
          </div>
          <div className="stat-content">
            <h4>Listing Discrepancies</h4>
            <div className="stat-value">375</div>
            <div className="stat-subtext">Projects with count mismatches</div>
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
              placeholder="Search apartment name, developer, or project ID..."
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
              value={status}
              onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
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
              {STATUSES.map(st => (
                <option key={st} value={st} style={{ background: '#0f1422' }}>
                  {st === 'All' ? 'All Statuses' : st.toUpperCase()}
                </option>
              ))}
            </select>

            <button onClick={loadProjects} className="btn btn-secondary btn-sm" title="Refresh Projects">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>Loading project developments...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: 'rgba(244,63,94,0.3)' }}>
          <AlertCircle size={36} color="#fb7185" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fb7185', marginBottom: '0.5rem' }}>Error Loading Projects</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={loadProjects} className="btn btn-primary">Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No Projects Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No development matches the current search or status filter.
          </p>
          <button onClick={() => { setLocality('All'); setStatus('All'); setSearch(''); setOffset(0); }} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
            {projects.map(item => (
              <div key={item.project_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="badge badge-primary">{item.project_id}</span>
                      <span className="badge badge-live" style={{ textTransform: 'capitalize' }}>{item.project_status || 'Active'}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{item.apartment_name}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Building2 size={14} color="#818cf8" />
                      <span>Developer: <strong>{item.developer_name}</strong></span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#818cf8' }}>
                      ₹{item.price_min} - ₹{item.price_max} Cr
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price Range</div>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Units</span>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.total_units?.toLocaleString('en-IN') || '-'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Towers / Floors</span>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.total_towers} T / {item.total_floors} F</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Stated Listings</span>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{item.total_listings} units</div>
                  </div>
                </div>

                {/* Dates & RERA */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#38bdf8" />
                    <span style={{ textTransform: 'capitalize' }}>{item.locality}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    RERA: {item.rera_number || 'Registered'}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing projects <strong>{offset + 1}</strong> - <strong>{Math.min(offset + projects.length, totalCount)}</strong> of <strong>{totalCount}</strong>
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
                disabled={!hasMore && projects.length < limit}
                className="btn btn-secondary btn-sm"
                style={{ opacity: (!hasMore && projects.length < limit) ? 0.4 : 1 }}
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
