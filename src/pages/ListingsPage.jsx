import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  Bed, 
  Bath, 
  Layers, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { authService } from '../services/auth';
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

export function ListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [locality, setLocality] = useState('All');
  const [bedroom, setBedroom] = useState('all');
  const [isLive, setIsLive] = useState('all');
  const [furnishing, setFurnishing] = useState('all');
  const [pricePreset, setPricePreset] = useState('all');
  const [customMinCr, setCustomMinCr] = useState('');
  const [customMaxCr, setCustomMaxCr] = useState('');

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 50;
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(900);

  // User auth & saved state
  const user = authService.getUser();
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    if (user?.email) {
      setSavedIds(authService.getSavedListingIds(user.email));
    }
  }, [user?.email]);

  // Parse numeric values from custom Crore inputs
  const parsedMinCr = customMinCr.trim() !== '' && !isNaN(Number(customMinCr)) ? Number(customMinCr) : null;
  const parsedMaxCr = customMaxCr.trim() !== '' && !isNaN(Number(customMaxCr)) ? Number(customMaxCr) : null;

  // Validation: min > max check
  const isInvalidPriceRange = pricePreset === 'custom' && 
    parsedMinCr !== null && 
    parsedMaxCr !== null && 
    parsedMinCr > parsedMaxCr;

  // Derive effective min and max price in INR
  let effectiveMinPrice = '';
  let effectiveMaxPrice = '';

  if (pricePreset === 'under_1cr') {
    effectiveMinPrice = '';
    effectiveMaxPrice = '10000000';
  } else if (pricePreset === '1cr_2cr') {
    effectiveMinPrice = '10000000';
    effectiveMaxPrice = '20000000';
  } else if (pricePreset === '2cr_3cr') {
    effectiveMinPrice = '20000000';
    effectiveMaxPrice = '30000000';
  } else if (pricePreset === 'above_3cr') {
    effectiveMinPrice = '30000000';
    effectiveMaxPrice = '';
  } else if (pricePreset === 'custom') {
    // If range is invalid (min > max), do NOT apply the invalid range
    if (!isInvalidPriceRange) {
      if (parsedMinCr !== null && parsedMinCr >= 0) {
        effectiveMinPrice = Math.round(parsedMinCr * 10000000).toString();
      }
      if (parsedMaxCr !== null && parsedMaxCr >= 0) {
        effectiveMaxPrice = Math.round(parsedMaxCr * 10000000).toString();
      }
    }
  }

  const loadListings = async () => {
    setLoading(true);
    setError(null);

    const res = await apiService.fetchListings({
      offset,
      limit,
      locality: locality === 'All' ? '' : locality.toLowerCase(),
      bedroom,
      isLive,
      furnishing,
      minPrice: effectiveMinPrice,
      maxPrice: effectiveMaxPrice,
      search
    });

    if (res.success) {
      setListings(res.data.results || []);
      setHasMore(res.data.has_more ?? false);
      if (res.data.total != null) setTotalCount(res.data.total);
    } else {
      setError(res.error || 'Failed to load property listings');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, [offset, locality, bedroom, isLive, furnishing, effectiveMinPrice, effectiveMaxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    loadListings();
  };

  const handlePricePresetChange = (val) => {
    setPricePreset(val);
    setOffset(0);
    if (val !== 'custom') {
      setCustomMinCr('');
      setCustomMaxCr('');
    }
  };

  const resetAllFilters = () => {
    setSearch('');
    setLocality('All');
    setBedroom('all');
    setIsLive('all');
    setFurnishing('all');
    setPricePreset('all');
    setCustomMinCr('');
    setCustomMaxCr('');
    setOffset(0);
  };

  const handleToggleSave = (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.email) {
      alert('Please log in to save and manage properties.');
      return;
    }
    const { savedIds: updated } = authService.toggleSaveListing(user.email, listingId);
    setSavedIds(updated);
  };

  const hasActiveFilters = 
    search || 
    locality !== 'All' || 
    bedroom !== 'all' || 
    isLive !== 'all' || 
    furnishing !== 'all' || 
    pricePreset !== 'all' || 
    customMinCr !== '' || 
    customMaxCr !== '';

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Property Sales Listings</h1>
        <p className="page-subtitle">
          Explore and analyze verified residential properties across Gurgaon's prime micro-markets.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Home size={22} />
          </div>
          <div className="stat-content">
            <h4>Total Records</h4>
            <div className="stat-value">900</div>
            <div className="stat-subtext">Sales inventory retrievable</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Sparkles size={22} />
          </div>
          <div className="stat-content">
            <h4>Active Inventory</h4>
            <div className="stat-value">723</div>
            <div className="stat-subtext">Verified live market listings</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Layers size={22} />
          </div>
          <div className="stat-content">
            <h4>Unique Properties</h4>
            <div className="stat-value">888</div>
            <div className="stat-subtext">Deduplicated physical units</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <BookmarkCheck size={22} />
          </div>
          <div className="stat-content">
            <h4>Saved Shortlist</h4>
            <div className="stat-value">{savedIds.length}</div>
            <div className="stat-subtext">Saved by {user?.email || 'guest'}</div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Top Filter Row: Search & Primary Selects */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', flex: '1 1 240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search apartment, locality, or ID..."
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
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </form>

            {/* Locality Filter */}
            <select
              value={locality}
              onChange={(e) => { setLocality(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 0.85rem',
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
                <option key={loc} value={loc} style={{ background: '#0f1422', color: '#f8fafc' }}>
                  {loc === 'All' ? 'All Localities' : loc}
                </option>
              ))}
            </select>

            {/* Bedroom Filter */}
            <select
              value={bedroom}
              onChange={(e) => { setBedroom(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f1422' }}>All BHKs</option>
              <option value="1" style={{ background: '#0f1422' }}>1 BHK</option>
              <option value="2" style={{ background: '#0f1422' }}>2 BHK</option>
              <option value="3" style={{ background: '#0f1422' }}>3 BHK</option>
              <option value="4" style={{ background: '#0f1422' }}>4 BHK</option>
              <option value="5" style={{ background: '#0f1422' }}>5 BHK</option>
            </select>

            {/* Status Filter */}
            <select
              value={isLive}
              onChange={(e) => { setIsLive(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 0.85rem',
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

            {/* Furnishing Filter */}
            <select
              value={furnishing}
              onChange={(e) => { setFurnishing(e.target.value); setOffset(0); }}
              style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f1422' }}>All Furnishings</option>
              <option value="furnished" style={{ background: '#0f1422' }}>Furnished</option>
              <option value="semi-furnished" style={{ background: '#0f1422' }}>Semi-Furnished</option>
              <option value="unfurnished" style={{ background: '#0f1422' }}>Unfurnished</option>
            </select>

            {/* Refresh button */}
            <button onClick={loadListings} className="btn btn-secondary btn-sm" title="Refresh Listings">
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Bottom Filter Row: Price Range & Custom Range Inputs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>
              <Filter size={14} />
              <span>Price Range:</span>
            </div>

            {/* Quick Price Preset Select */}
            <select
              value={pricePreset}
              onChange={(e) => handlePricePresetChange(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f1422' }}>All Prices</option>
              <option value="under_1cr" style={{ background: '#0f1422' }}>Under ₹1 Cr</option>
              <option value="1cr_2cr" style={{ background: '#0f1422' }}>₹1 Cr – ₹2 Cr</option>
              <option value="2cr_3cr" style={{ background: '#0f1422' }}>₹2 Cr – ₹3 Cr</option>
              <option value="above_3cr" style={{ background: '#0f1422' }}>Above ₹3 Cr</option>
              <option value="custom" style={{ background: '#0f1422' }}>Custom Range</option>
            </select>

            {/* Custom Range Decimal Inputs (Visible only when Custom Range is selected) */}
            {pricePreset === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label htmlFor="custom-min-price" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Minimum Price (₹ Cr):
                  </label>
                  <input
                    id="custom-min-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1.25"
                    value={customMinCr}
                    onChange={(e) => {
                      setCustomMinCr(e.target.value);
                      setOffset(0);
                    }}
                    style={{
                      width: '100px',
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: isInvalidPriceRange ? '1px solid #fb7185' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <label htmlFor="custom-max-price" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Maximum Price (₹ Cr):
                  </label>
                  <input
                    id="custom-max-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={customMaxCr}
                    onChange={(e) => {
                      setCustomMaxCr(e.target.value);
                      setOffset(0);
                    }}
                    style={{
                      width: '100px',
                      padding: '0.45rem 0.65rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: isInvalidPriceRange ? '1px solid #fb7185' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Validation Alert for Invalid Price Range (min > max) */}
            {isInvalidPriceRange && (
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#fb7185',
                  fontSize: '0.75rem',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <AlertCircle size={14} />
                <span>Minimum price (₹{customMinCr} Cr) cannot exceed maximum price (₹{customMaxCr} Cr). Range is not applied.</span>
              </div>
            )}

            {/* Filter Result Counter & Reset Button */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: hasActiveFilters ? '#818cf8' : 'var(--text-muted)', fontWeight: '600' }}>
                {totalCount} {totalCount === 1 ? 'property' : 'properties'} found
              </span>

              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                >
                  Reset All Filters
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.9rem' }}>Fetching live property listings...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderColor: 'rgba(244,63,94,0.3)' }}>
          <AlertCircle size={36} color="#fb7185" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fb7185', marginBottom: '0.5rem' }}>Error Loading Listings</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={loadListings} className="btn btn-primary">Retry Request</button>
        </div>
      ) : listings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No Listings Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No properties match the selected filter criteria. Try broadening your filters.
          </p>
          <button 
            onClick={resetAllFilters} 
            className="btn btn-secondary"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
            {listings.map(item => {
              const isSaved = savedIds.includes(item.listing_id);
              const areaDisplay = item.website === 'magichomes' && item.carpet_area < 200 
                ? `${item.carpet_area} sqm (${Math.round(item.carpet_area * 10.7639)} sqft)`
                : formatArea(item.carpet_area);

              return (
                <div 
                  key={item.listing_id}
                  className="card listing-card"
                  onClick={() => navigate(`/listings/${item.listing_id}`)}
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {/* Top Badges & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-primary">{item.website || '100acres'}</span>
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
                        onClick={(e) => handleToggleSave(e, item.listing_id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isSaved ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          color: isSaved ? '#818cf8' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition-fast)'
                        }}
                        title={isSaved ? 'Remove from Saved' : 'Save Property'}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Apartment Title & Locality */}
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
                    <span style={{ textTransform: 'capitalize' }}>{item.locality || 'Gurgaon'}</span>
                  </div>

                  {/* Price Banner */}
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '800', color: item.price < 0 ? '#fb7185' : '#818cf8' }}>
                      {formatPrice(item.price)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {item.listing_id} {item.floor != null ? `• Floor ${item.floor}/${item.total_floors || '-'}` : ''}
                    </div>
                  </div>

                  {/* Amenities & Details Button */}
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
                        <span>{areaDisplay}</span>
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
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing records <strong>{offset + 1}</strong> - <strong>{Math.min(offset + listings.length, totalCount)}</strong> of <strong>{totalCount}</strong>
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
                disabled={!hasMore && listings.length < limit}
                className="btn btn-secondary btn-sm"
                style={{ opacity: (!hasMore && listings.length < limit) ? 0.4 : 1 }}
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
