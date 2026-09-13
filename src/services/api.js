import { authService } from './auth';
import localListings from '../../data/listings.json';

// Helper to create authenticated headers
async function getAuthHeaders() {
  const token = authService.getToken();
  const apiKey = authService.getApiKey();
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

const BASE_URL = typeof __API_BASE_URL__ !== 'undefined' && __API_BASE_URL__ 
  ? __API_BASE_URL__ 
  : '/api';

// In-memory cache for fast listing lookup on direct detail page refresh
let listingsCache = new Map();

// Initialize cache with local dataset to ensure instantaneous lookup on direct URLs & refreshes
if (Array.isArray(localListings)) {
  localListings.forEach(item => {
    if (item.listing_id) {
      listingsCache.set(item.listing_id, item);
      listingsCache.set(item.listing_id.toLowerCase(), item);
    }
  });
}

export const apiService = {
  // 1. Fetch Sales Listings
  fetchListings: async ({ offset = 0, limit = 50, locality = '', bedroom = '', isLive = '', search = '', furnishing = '', minPrice = '', maxPrice = '' } = {}) => {
    try {
      // Source complete dataset from localListings / cache
      let results = Array.isArray(localListings) && localListings.length > 0 
        ? [...localListings] 
        : Array.from(listingsCache.values());

      // Deduplicate by listing_id in case cache has lowercased keys
      const seen = new Set();
      results = results.filter(item => {
        if (!item || !item.listing_id || seen.has(item.listing_id)) return false;
        seen.add(item.listing_id);
        return true;
      });

      // 1. Locality Filter
      if (locality && locality !== 'all' && locality !== 'All') {
        const loc = locality.toLowerCase().trim();
        results = results.filter(item => item.locality && item.locality.toLowerCase().includes(loc));
      }

      // 2. Bedroom / BHK Filter
      if (bedroom && bedroom !== 'all' && bedroom !== 'All') {
        const bedNum = parseInt(bedroom, 10);
        results = results.filter(item => item.bedroom === bedNum);
      }

      // 3. Status Filter (Live vs Inactive)
      if (isLive === 'true') {
        results = results.filter(item => item.is_live === true);
      } else if (isLive === 'false') {
        results = results.filter(item => item.is_live === false);
      }

      // 4. Furnishing Filter (All, Furnished, Semi-Furnished, Unfurnished)
      if (furnishing && furnishing !== 'all' && furnishing !== 'All') {
        const fQuery = furnishing.toLowerCase().trim();
        results = results.filter(item => {
          if (!item.furnishing) return false;
          const itemF = item.furnishing.toLowerCase().trim();
          if (fQuery === 'furnished' || fQuery === 'fully-furnished' || fQuery === 'fully furnished') {
            return itemF === 'fully-furnished' || itemF === 'furnished' || itemF === 'fully furnished';
          }
          if (fQuery === 'semi-furnished' || fQuery === 'semi furnished' || fQuery === 'semifurnished') {
            return itemF === 'semi-furnished' || itemF === 'semi furnished';
          }
          if (fQuery === 'unfurnished' || fQuery === 'un-furnished') {
            return itemF === 'unfurnished' || itemF === 'un-furnished';
          }
          return itemF.includes(fQuery);
        });
      }

      // 5. Min Price Filter
      if (minPrice !== '' && minPrice != null && !isNaN(minPrice)) {
        const minP = parseFloat(minPrice);
        results = results.filter(item => item.price >= minP);
      }

      // 6. Max Price Filter
      if (maxPrice !== '' && maxPrice != null && !isNaN(maxPrice)) {
        const maxP = parseFloat(maxPrice);
        results = results.filter(item => item.price <= maxP);
      }

      // 7. Search Query Filter
      if (search && search.trim()) {
        const query = search.toLowerCase().trim();
        results = results.filter(item => 
          (item.apartment_name && item.apartment_name.toLowerCase().includes(query)) ||
          (item.locality && item.locality.toLowerCase().includes(query)) ||
          (item.listing_id && item.listing_id.toLowerCase().includes(query))
        );
      }

      const total = results.length;
      const pageResults = results.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          total,
          totalMatching: total,
          offset,
          limit,
          has_more: offset + limit < total,
          results: pageResults,
          displayedCount: pageResults.length
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // 2. Fetch Single Listing By ID (Supports direct refresh)
  fetchListingById: async (listingId) => {
    try {
      if (!listingId) return { success: false, error: 'Listing ID is required' };
      const cleanId = listingId.trim();

      // 1. Check in-memory cache first (exact match or lowercased)
      if (listingsCache.has(cleanId)) {
        return { success: true, listing: listingsCache.get(cleanId) };
      }
      if (listingsCache.has(cleanId.toLowerCase())) {
        return { success: true, listing: listingsCache.get(cleanId.toLowerCase()) };
      }

      // 2. Fetch all pages (up to 900 records, 5 batches of 200) to find the listing and populate cache
      const headers = await getAuthHeaders();
      let offset = 0;
      const limit = 200;

      while (offset < 1000) {
        const res = await fetch(`${BASE_URL}/v1/listings?limit=${limit}&offset=${offset}`, {
          method: 'GET',
          headers
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const results = data.results || [];

        results.forEach(item => {
          if (item.listing_id) {
            listingsCache.set(item.listing_id, item);
            listingsCache.set(item.listing_id.toLowerCase(), item);
          }
        });

        const found = results.find(item => 
          item.listing_id === cleanId || 
          (item.listing_id && item.listing_id.toLowerCase() === cleanId.toLowerCase())
        );
        if (found) {
          return { success: true, listing: found };
        }

        if (!data.has_more || results.length === 0) {
          break;
        }

        offset += limit;
      }

      // Final check in cache
      if (listingsCache.has(cleanId)) {
        return { success: true, listing: listingsCache.get(cleanId) };
      }
      if (listingsCache.has(cleanId.toLowerCase())) {
        return { success: true, listing: listingsCache.get(cleanId.toLowerCase()) };
      }

      return { success: false, error: `Listing ${listingId} not found in database.` };
    } catch (err) {
      const cleanId = (listingId || '').trim();
      if (listingsCache.has(cleanId)) {
        return { success: true, listing: listingsCache.get(cleanId) };
      }
      if (listingsCache.has(cleanId.toLowerCase())) {
        return { success: true, listing: listingsCache.get(cleanId.toLowerCase()) };
      }
      return { success: false, error: err.message || 'Error loading listing detail' };
    }
  },

  // 3. Fetch Rentals
  fetchRentals: async ({ offset = 0, limit = 50, locality = '', search = '', isLive = '' } = {}) => {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      params.append('offset', offset.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${BASE_URL}/v1/rentals?${params.toString()}`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch rentals: HTTP ${res.status}`);
      }

      const data = await res.json();
      let results = data.results || [];

      if (locality && locality !== 'all') {
        const locQuery = locality.toLowerCase();
        results = results.filter(item => item.locality && item.locality.toLowerCase().includes(locQuery));
      }

      if (isLive === 'true') {
        results = results.filter(item => item.is_live === true);
      } else if (isLive === 'false') {
        results = results.filter(item => item.is_live === false);
      }

      if (search) {
        const q = search.toLowerCase().trim();
        results = results.filter(item => 
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.apartment_name && item.apartment_name.toLowerCase().includes(q)) ||
          (item.locality && item.locality.toLowerCase().includes(q)) ||
          (item.listing_id && item.listing_id.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        data: {
          ...data,
          results,
          displayedCount: results.length
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // 4. Fetch Projects
  fetchProjects: async ({ offset = 0, limit = 50, status = '', locality = '', search = '' } = {}) => {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      params.append('offset', offset.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${BASE_URL}/v1/projects?${params.toString()}`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch projects: HTTP ${res.status}`);
      }

      const data = await res.json();
      let results = data.results || [];

      if (status && status !== 'all') {
        results = results.filter(item => item.project_status && item.project_status.toLowerCase() === status.toLowerCase());
      }

      if (locality && locality !== 'all') {
        const locQuery = locality.toLowerCase();
        results = results.filter(item => item.locality && item.locality.toLowerCase().includes(locQuery));
      }

      if (search) {
        const q = search.toLowerCase().trim();
        results = results.filter(item => 
          (item.apartment_name && item.apartment_name.toLowerCase().includes(q)) ||
          (item.developer_name && item.developer_name.toLowerCase().includes(q)) ||
          (item.locality && item.locality.toLowerCase().includes(q)) ||
          (item.project_id && item.project_id.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        data: {
          ...data,
          results,
          displayedCount: results.length
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
