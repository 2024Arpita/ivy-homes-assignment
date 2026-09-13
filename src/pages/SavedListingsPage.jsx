import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookmarkCheck, 
  Trash2, 
  ArrowRight, 
  MapPin, 
  Bed, 
  Bath, 
  Layers, 
  Home, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { authService } from '../services/auth';
import { apiService } from '../services/api';
import { formatPrice, formatArea } from '../utils/formatters';

export function SavedListingsPage() {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [savedIds, setSavedIds] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedData() {
      setLoading(true);
      if (user?.email) {
        const ids = authService.getSavedListingIds(user.email);
        setSavedIds(ids);

        if (ids.length > 0) {
          const promises = ids.map(id => apiService.fetchListingById(id));
          const results = await Promise.all(promises);
          const loaded = results
            .filter(r => r.success && r.listing)
            .map(r => r.listing);
          setSavedListings(loaded);
        } else {
          setSavedListings([]);
        }
      }
      setLoading(false);
    }
    loadSavedData();
  }, [user?.email]);

  const handleRemove = (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.email) return;
    const { savedIds: updated } = authService.toggleSaveListing(user.email, listingId);
    setSavedIds(updated);
    setSavedListings(prev => prev.filter(item => item.listing_id !== listingId));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Saved Properties & Shortlist</h1>
        <p className="page-subtitle">
          Manage saved listings associated with your user account (<strong>{user?.email || 'Guest'}</strong>).
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading your saved shortlist...</p>
        </div>
      ) : savedListings.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <BookmarkCheck size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>No Saved Properties Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Click the bookmark icon on any sales listing or rental property to add it to your personal shortlist.
          </p>
          <Link to="/" className="btn btn-primary">
            <span>Browse Sales Listings</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              You have <strong>{savedListings.length}</strong> saved {savedListings.length === 1 ? 'property' : 'properties'} in your shortlist
            </div>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {savedListings.map(item => (
              <div 
                key={item.listing_id} 
                className="card listing-card"
                onClick={() => navigate(`/listings/${item.listing_id}`)}
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{item.website || 'Portal'}</span>
                    {item.is_live ? (
                      <span className="badge badge-live">Live</span>
                    ) : (
                      <span className="badge badge-inactive">Inactive</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.listing_url && (
                      <a
                        href={item.listing_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                        title="View Original Listing"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={(e) => handleRemove(e, item.listing_id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.6rem', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Title & Locality */}
                <h3 
                  style={{ fontSize: '1.15rem', marginBottom: '0.35rem', lineHeight: '1.3' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/listings/${item.listing_id}`);
                  }}
                >
                  {item.apartment_name || `${item.bedroom} BHK Property`}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={14} color="#38bdf8" />
                  <span style={{ textTransform: 'capitalize' }}>{item.locality}, Gurgaon</span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#818cf8' }}>
                    {formatPrice(item.price)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ID: {item.listing_id}
                  </div>
                </div>

                {/* Specs & Details Button */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Bed size={14} />
                      <span>{item.bedroom || '-'} BHK</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Bath size={14} />
                      <span>{item.bathroom || '-'} Bath</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Layers size={14} />
                      <span>{formatArea(item.carpet_area)}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/listings/${item.listing_id}`);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    title="View Details"
                  >
                    <span>Details</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
