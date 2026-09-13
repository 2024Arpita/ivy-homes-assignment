import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Bug, 
  Layers, 
  Database, 
  Filter, 
  Ruler, 
  Clock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import submissionData from '../../submission.json';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Categories', count: 11 },
  { id: 'auth', label: 'Auth', count: 1 },
  { id: 'pagination', label: 'Pagination', count: 3 },
  { id: 'completeness', label: 'Completeness', count: 2 },
  { id: 'filters', label: 'Filters', count: 3 },
  { id: 'units', label: 'Units', count: 1 },
  { id: 'timestamps', label: 'Timestamps', count: 1 }
];

const FINDING_TITLES = [
  "Query Parameter API Key Rejection",
  "Rentals Pagination Limit Capped at 50",
  "Rentals Total Count Underreported (1268 vs 1320)",
  "Projects Pagination Limit Capped at 50",
  "Projects Total Count Underreported (384 vs 400)",
  "Page Parameter Ignored (Offset Required)",
  "Inactive Records Returned on Sales Endpoint",
  "MagicHomes Area in Square Meters (Sqm)",
  "Missing 'Z' Timezone Indicator in Timestamps",
  "Bedroom Query Filter Ignored",
  "Live Status Query Filter Ignored"
];

const VERIFIED_BEHAVIORS = [
  {
    endpoint: "/auth/login",
    title: "Header-Based Authentication",
    category: "Auth",
    description: "Accepts API key via X-API-Key request header alongside credentials and returns a valid Bearer access_token with token_type and expires_in metadata."
  },
  {
    endpoint: "/v1/listings",
    title: "Locality Micro-Market Filter",
    category: "Filters",
    description: "Filtering by ?locality=sector 49 correctly isolates listings for Sector 49, executing exact case-insensitive matching on the server."
  },
  {
    endpoint: "/v1/listings",
    title: "Price Sorting Sequences",
    category: "Sorting",
    description: "Query parameter ?sort_by=price&order=asc reliably returns property records sorted in ascending price sequence as documented."
  }
];

const CORRUPT_RECORDS = [
  {
    id: "100-6002071",
    issue: "Negative Sale Price",
    detail: "price: -₹1,50,00,000 (-₹1.50 Cr)",
    rule: "Price must be strictly positive"
  },
  {
    id: "SQU-6003044",
    issue: "Negative Sale Price",
    detail: "price: -₹1,20,00,000 (-₹1.20 Cr)",
    rule: "Price must be strictly positive"
  },
  {
    id: "MAG-6000453",
    issue: "Impossible Floor Placement",
    detail: "floor: 12, total_floors: 5",
    rule: "Floor cannot exceed total building floors"
  },
  {
    id: "MAG-6000527",
    issue: "Inverted Area Dimensions",
    detail: "carpet_area: 1,850 sqft > super_built_up_area: 1,420 sqft",
    rule: "Carpet area must be less than super built-up area"
  },
  {
    id: "MAG-6002834",
    issue: "Inverted Area Dimensions",
    detail: "carpet_area: 2,100 sqft > super_built_up_area: 1,650 sqft",
    rule: "Carpet area must be less than super built-up area"
  }
];

export function ApiTrustReportPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { findings } = submissionData;

  const filteredFindings = activeCategory === 'all'
    ? findings
    : findings.filter(f => f.category === activeCategory);

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'auth': return <Key size={14} />;
      case 'pagination': return <Layers size={14} />;
      case 'completeness': return <Database size={14} />;
      case 'filters': return <Filter size={14} />;
      case 'units': return <Ruler size={14} />;
      case 'timestamps': return <Clock size={14} />;
      default: return <Bug size={14} />;
    }
  };

  return (
    <div className="page-container">
      {/* Top Breadcrumb / Nav */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/insights" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Assignment Answers</span>
        </Link>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(16, 185, 129, 0.12)', 
          border: '1px solid rgba(16, 185, 129, 0.35)', 
          padding: '0.45rem 0.9rem', 
          borderRadius: 'var(--radius-full)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          <span>Verified against live API</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <ShieldAlert size={28} color="#818cf8" />
          <h1 className="page-title">API Trust Report</h1>
        </div>
        <p className="page-subtitle">
          Comprehensive empirical investigation validating documented API contracts against actual server responses, isolating protocol defects from payload data-quality anomalies.
        </p>
      </div>

      {/* 3 Executive Summary Stat Cards */}
      <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="card stat-card" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Bug size={24} />
          </div>
          <div className="stat-content">
            <h4>Discrepancies Reproduced</h4>
            <div className="stat-value" style={{ color: '#fb7185' }}>11</div>
            <div className="stat-subtext">Across Auth, Pagination, Filters, Units, Timestamps, Completeness</div>
          </div>
        </div>

        <div className="card stat-card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <h4>Documented Behaviours Verified</h4>
            <div className="stat-value" style={{ color: '#34d399' }}>3</div>
            <div className="stat-subtext">Header auth, locality filter, price sorting validated</div>
          </div>
        </div>

        <div className="card stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h4>Corrupt Records Identified</h4>
            <div className="stat-value" style={{ color: '#fbbf24' }}>5</div>
            <div className="stat-subtext">Negative prices, impossible floor, inverted areas</div>
          </div>
        </div>

      </div>

      {/* Architectural Distinction: API Behaviour vs Data Quality */}
      <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(180deg, rgba(30, 39, 64, 0.5) 0%, rgba(15, 20, 34, 0.7) 100%)', padding: '1.5rem 1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={18} color="#818cf8" />
          <span>Architecture Note: API Behavior Discrepancies vs. Data-Quality Anomalies</span>
        </h3>
        <div className="grid-2" style={{ gap: '1.5rem', marginTop: '1rem' }}>
          
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <Bug size={16} />
              <span>11 API Behaviour Discrepancies (Protocol & Contract)</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Discrepancies where the API server behaves differently from documented specifications at runtime: query parameter rejection, hard pagination limits (50 vs 200), uncounted total records, ignored filter parameters (?bedroom, ?is_live), undocumented metric units, and omitted UTC timezone indicators.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <AlertTriangle size={16} />
              <span>5 Data-Quality Anomalies (Payload Domain Invariants)</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Data integrity defects present inside the listing records themselves: negative prices (-₹1.50 Cr, -₹1.20 Cr), an impossible floor placement (Floor 12 in a 5-floor building), and inverted area measurements where carpet area exceeds super built-up area. Plus 1 outlier fake listing (₹17,250 5BHK).
            </p>
          </div>

        </div>
      </div>

      {/* 11 Documented Discrepancies Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bug size={20} color="#fb7185" />
            <h3 style={{ fontSize: '1.3rem' }}>11 Reproduced API Discrepancies</h3>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`btn btn-sm ${activeCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                <span>{cat.label}</span>
                <span style={{ 
                  marginLeft: '0.35rem', 
                  padding: '0.1rem 0.4rem', 
                  borderRadius: 'var(--radius-full)', 
                  background: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  fontSize: '0.7rem' 
                }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Discrepancies Card List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredFindings.map((finding, index) => {
            const originalIndex = findings.findIndex(f => f.endpoint === finding.endpoint && f.documented === finding.documented);
            const title = FINDING_TITLES[originalIndex >= 0 ? originalIndex : index] || `Discrepancy in ${finding.endpoint}`;

            return (
              <div key={index} className="card" style={{ borderLeft: '4px solid #6366f1', padding: '1.5rem' }}>
                
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textTransform: 'uppercase' }}>
                        {getCategoryIcon(finding.category)}
                        <span>{finding.category}</span>
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#818cf8', fontWeight: '700', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {finding.endpoint}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Finding #{originalIndex >= 0 ? originalIndex + 1 : index + 1}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {title}
                    </h4>
                  </div>
                </div>

                {/* Documented vs Actual Behavior Comparison */}
                <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  
                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      Documented Behavior
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '0.35rem', lineHeight: '1.5' }}>
                      {finding.documented}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                    <span style={{ color: '#fb7185', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                      Actual API Behavior
                    </span>
                    <div style={{ color: '#f8fafc', fontSize: '0.9rem', marginTop: '0.35rem', lineHeight: '1.5' }}>
                      {finding.actual}
                    </div>
                  </div>

                </div>

                {/* Reproduction & Impact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Reproduction:</strong> {finding.how_found}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Business Impact:</strong> {finding.impact}
                  </div>
                </div>

                {/* Evidence Listing IDs */}
                {finding.evidence && finding.evidence.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Evidence Records:</span>
                    {finding.evidence.map(evId => (
                      <Link 
                        key={evId} 
                        to={`/listings/${evId}`}
                        className="badge badge-primary" 
                        style={{ fontSize: '0.75rem', transition: 'var(--transition-fast)' }}
                        title={`View listing ${evId}`}
                      >
                        {evId}
                      </Link>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Documented Behaviours Verified */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={20} color="#34d399" />
          <h3 style={{ fontSize: '1.3rem' }}>3 Documented Behaviours Verified</h3>
        </div>

        <div className="grid-3" style={{ gap: '1.25rem' }}>
          {VERIFIED_BEHAVIORS.map((vb, idx) => (
            <div key={idx} className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-live">Verified Functional</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#34d399' }}>{vb.endpoint}</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {vb.title}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginTop: 'auto' }}>
                {vb.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Corrupt Listing Records Identified (Data Quality Anomalies) */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <AlertOctagon size={20} color="#fbbf24" />
          <h3 style={{ fontSize: '1.3rem' }}>5 Corrupt Listing Records Identified (Data Quality)</h3>
        </div>

        <div className="grid-3" style={{ gap: '1.25rem', marginBottom: '1rem' }}>
          {CORRUPT_RECORDS.map((cr) => (
            <div key={cr.id} className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.25)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Link to={`/listings/${cr.id}`}>
                  <span className="badge badge-inactive" style={{ fontSize: '0.8rem' }}>{cr.id}</span>
                </Link>
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '600' }}>{cr.issue}</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fb7185', marginBottom: '0.35rem' }}>
                {cr.detail}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Violation: {cr.rule}
              </div>
            </div>
          ))}
        </div>

        {/* Fake Listing Outlier Note */}
        <div className="card" style={{ padding: '1rem 1.25rem', background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={18} color="#fb7185" />
            <div>
              <strong style={{ color: '#fb7185', fontSize: '0.9rem' }}>Fake Listing Outlier (Q9): </strong>
              <Link to="/listings/MAG-6002941" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'underline', marginLeft: '0.25rem' }}>
                MAG-6002941
              </Link>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                Luxury 5 BHK apartment listed for purchase at an absurd sale price of ₹17,250.
              </span>
            </div>
          </div>
          <Link to="/listings/MAG-6002941" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
            Inspect Listing
          </Link>
        </div>

      </div>

      {/* Bottom CTA to return to Insights */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Review the quantitative calculations and assignment questions on the Insights page.
        </p>
        <Link to="/insights" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>View Assignment Answers</span>
        </Link>
      </div>

    </div>
  );
}
