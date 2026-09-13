import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Compass, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Bookmark, 
  BookmarkCheck, 
  UserCheck, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { formatPrice, formatArea, formatDate } from '../utils/formatters';

export function ListingDetailPage() {
  const { listingId, id } = useParams();
  const currentListingId = listingId || id;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = authService.getUser();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user?.email && currentListingId) {
      setIsSaved(authService.isListingSaved(user.email, currentListingId));
    }
  }, [user?.email, currentListingId]);

  useEffect(() => {
    async function loadDetail() {
      if (!currentListingId) return;
      setLoading(true);
      setError(null);
      const res = await apiService.fetchListingById(currentListingId);
      if (res.success && res.listing) {
        setListing(res.listing);
      } else {
        setError(res.error || `Listing ${currentListingId} could not be loaded.`);
      }
      setLoading(false);
    }
    loadDetail();
  }, [currentListingId]);

  const handleToggleSave = () => {
    if (!user?.email) {
      alert('Please log in to save properties.');
      return;
    }
    const { isSaved: newSavedState } = authService.toggleSaveListing(user.email, currentListingId);
    setIsSaved(newSavedState);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Loading property details for <strong>{currentListingId}</strong>...
        </p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem' }}>
          <AlertTriangle size={36} color="#fb7185" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Property Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error || `Could not retrieve details for listing ID ${currentListingId}.`}
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Return to Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate normalized price per sqft
  const isSqm = listing.website === 'magichomes' && listing.carpet_area < 200;
  const carpetSqft = isSqm ? listing.carpet_area * 10.7639 : listing.carpet_area;
  const pricePerSqft = carpetSqft > 0 ? (listing.price / carpetSqft).toFixed(2) : 'N/A';

  return (
    <div className="page-container">
      {/* Top Navigation */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to All Listings</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {listing.listing_url && (
            <a 
              href={listing.listing_url} 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={15} />
              <span>View Original Listing</span>
            </a>
          )}

          <button 
            onClick={handleToggleSave} 
            className={`btn ${isSaved ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{isSaved ? 'Saved in Shortlist' : 'Save Property'}</span>
          </button>
        </div>
      </div>

      {/* Property Header Banner */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-primary">{listing.listing_id}</span>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>Source: {listing.website}</span>
          {listing.is_live ? (
            <span className="badge badge-live">Live on Market</span>
          ) : (
            <span className="badge badge-inactive">Inactive / Delisted</span>
          )}
          {listing.is_verified && <span className="badge badge-live">Verified</span>}
        </div>

        <h1 className="page-title">
          {listing.apartment_name ? `${listing.apartment_name} - ${listing.bedroom} BHK Apartment` : `Listing ${listing.listing_id}`}
        </h1>

        <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
          <MapPin size={16} color="#38bdf8" />
          <span style={{ textTransform: 'capitalize' }}>{listing.locality}, Gurgaon</span>
          {listing.project_id && (
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              • Project Reference: <strong>{listing.project_id}</strong>
            </span>
          )}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid-3" style={{ gap: '1.5rem' }}>
        
        {/* Left 2 Cols: Details & Specs */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Key Metrics Strip */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Property Specifications</h3>
            
            <div className="grid-3" style={{ gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Bed size={14} /> Configuration
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {listing.bedroom || '-'} BHK
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{listing.bathroom || '-'} Bathrooms</div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} /> Carpet Area
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  {formatArea(Math.round(carpetSqft))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {isSqm ? `Metric: ${listing.carpet_area} sqm` : `Raw: ${listing.carpet_area || '-'} sqft`}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} /> Floor Placement
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Floor {listing.floor != null ? listing.floor : '-'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Floors: {listing.total_floors || '-'}</div>
              </div>
            </div>

            {/* Comprehensive Specs Grid */}
            <div className="grid-2" style={{ marginTop: '1.25rem', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Property Name:</span>
                <span style={{ fontWeight: '600' }}>{listing.apartment_name || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Locality:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{listing.locality || 'Gurgaon'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Super Built-up Area:</span>
                <span style={{ fontWeight: '600' }}>
                  {listing.super_built_up_area ? `${listing.super_built_up_area.toLocaleString('en-IN')} sq.ft` : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Carpet Area:</span>
                <span style={{ fontWeight: '600' }}>
                  {formatArea(Math.round(carpetSqft))} {isSqm ? `(${listing.carpet_area} sqm)` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Furnishing Status:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{listing.furnishing || 'Unspecified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Floor / Total Floors:</span>
                <span style={{ fontWeight: '600' }}>
                  {listing.floor != null ? `Floor ${listing.floor}` : 'N/A'} {listing.total_floors ? `of ${listing.total_floors}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Covered Parking:</span>
                <span style={{ fontWeight: '600' }}>{listing.covered_parking != null ? `${listing.covered_parking} slots` : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Facing Direction:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{listing.facing_direction || 'Unspecified'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Posted Date:</span>
                <span style={{ fontWeight: '600' }}>{formatDate(listing.posted_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Listing Status:</span>
                <span style={{ fontWeight: '600', color: listing.is_live ? '#34d399' : '#94a3b8' }}>
                  {listing.is_live ? 'Live on Market' : 'Inactive / Delisted'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Source Portal:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{listing.website || '100acres'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Listing Reference ID:</span>
                <span style={{ fontWeight: '600' }}>{listing.listing_id}</span>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Property Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem' }}>
              {listing.description || 'No additional description provided for this listing record.'}
            </p>
          </div>
        </div>

        {/* Right 1 Col: Pricing & Seller Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Price Card */}
          <div className="card" style={{ borderColor: 'var(--border-active)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Listing Price
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#818cf8', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
              {formatPrice(listing.price)}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Rate: <strong>₹{pricePerSqft}</strong> / sq.ft (Carpet)
            </div>

            <button 
              onClick={handleToggleSave} 
              className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`} 
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span>{isSaved ? 'Remove from Saved' : 'Save Property'}</span>
            </button>
            
            {listing.listing_url && (
              <a 
                href={listing.listing_url} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <ExternalLink size={14} />
                <span>View Original Listing</span>
              </a>
            )}
          </div>

          {/* Contact Card */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={16} color="#34d399" />
              <span>Contact Information</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Posted By:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{listing.posted_by || 'Owner'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contact Name:</span>
                <span style={{ fontWeight: '600' }}>{listing.posted_by_name || 'Verified Agent'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
