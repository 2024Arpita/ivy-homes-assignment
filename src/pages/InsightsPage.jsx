import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles,
  Award,
  Layers,
  Home,
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import submissionData from '../../submission.json';

export function InsightsPage() {
  const { answers } = submissionData;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Assignment Insights & Answers</h1>
        <p className="page-subtitle">
          Verified answers for all 10 quantitative assignment questions based on data extraction and deduplication.
        </p>
      </div>

      {/* API Trust Report CTA Banner */}
      <div className="card" style={{ 
        marginBottom: '2.5rem', 
        padding: '1.5rem 1.75rem', 
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(6, 182, 212, 0.05) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', width: '48px', height: '48px' }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                API Trust Report
              </h3>
              <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>Live API Verified</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '640px' }}>
              11 reproduced discrepancies, 3 verified functional behaviors, and 5 corrupt records audited across Auth, Pagination, Filters, Units, and Timestamps.
            </p>
          </div>
        </div>

        <Link to="/api-trust-report" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap' }}>
          <span>View API Trust Report</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* 10 Verified Assignment Answers */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={22} color="#34d399" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>10 Verified Assignment Answers</h2>
        </div>

        <div className="grid-2" style={{ gap: '1.25rem' }}>
          
          {/* Q1 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q1. Retrievable Listings</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#818cf8', margin: '0.25rem 0' }}>
              {answers.total_listing_records} records
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Total sales listing records fetched sequentially via GET /v1/listings across 5 batches of limit=200.
            </p>
          </div>

          {/* Q2 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q2. Unique Physical Properties</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', margin: '0.25rem 0' }}>
              {answers.unique_properties} properties
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Deduplication by (apartment, locality, floor, bedroom) identifies 12 multi-listed properties across 5 portal scrapers.
            </p>
          </div>

          {/* Q3 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q3. Active Sales Listings</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', margin: '0.25rem 0' }}>
              {answers.active_listings} live
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Listings in /v1/listings with is_live=true (177 inactive listings are also present in the response).
            </p>
          </div>

          {/* Q4 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q4. Corrupt Listing IDs ({answers.corrupt_listing_ids.length})</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
              {answers.corrupt_listing_ids.map(id => (
                <Link key={id} to={`/listings/${id}`}>
                  <span className="badge badge-inactive" style={{ fontSize: '0.8rem' }}>{id}</span>
                </Link>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Negative prices (SQU-6003044, 100-6002071), floor 12/5 (MAG-6000453), and carpet &gt; super area (MAG-6000527, MAG-6002834).
            </p>
          </div>

          {/* Q5 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q5. Total Rent in Sector 49</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24', margin: '0.25rem 0' }}>
              ₹{(answers.total_monthly_rent / 100000).toFixed(2)} Lakhs
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Sum of monthly rent across all 123 rental listings in Sector 49 (₹34.76 Lakhs for 101 live rentals).
            </p>
          </div>

          {/* Q6 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q6. Avg Price / Sqft (Live 2BHK)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#818cf8', margin: '0.25rem 0' }}>
              ₹{answers.avg_price_per_sqft_2bhk.toLocaleString('en-IN')} / sq.ft
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Normalized average rate across 238 valid live 2BHK listings after converting MagicHomes metric areas (10.7639x).
            </p>
          </div>

          {/* Q7 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q7. Costliest Project</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fb7185', margin: '0.25rem 0' }}>
              {answers.costliest_project.project_id} (₹{(answers.costliest_project.price_max_inr / 10000000).toFixed(1)} Cr)
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Puravankara Willows in New Gurgaon with highest stated maximum project price of ₹98.9 Crores.
            </p>
          </div>

          {/* Q8 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q8. Listings in Date Range</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#22d3ee', margin: '0.25rem 0' }}>
              {answers.listings_last_7_days} listings
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Posted in the half-open interval [2026-09-03T00:00:00, 2026-09-10T00:00:00) IST.
            </p>
          </div>

          {/* Q9 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q9. Fake Listing IDs</span>
            <div style={{ display: 'flex', gap: '0.4rem', margin: '0.5rem 0' }}>
              {answers.fake_listing_ids.map(id => (
                <Link key={id} to={`/listings/${id}`}>
                  <span className="badge badge-inactive" style={{ fontSize: '0.8rem' }}>{id}</span>
                </Link>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              MAG-6002941: Luxury 5 BHK apartment listed for purchase at an absurd sale price of ₹17,250.
            </p>
          </div>

          {/* Q10 */}
          <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Q10. Projects with Wrong Listing Count</span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fb7185', margin: '0.25rem 0' }}>
              {answers.projects_with_wrong_listing_count} / 400 projects
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Discrepancies between project total_listings and actual linked listings in data/listings.json.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
