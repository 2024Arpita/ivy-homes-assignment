const AUTH_STORAGE_KEY = 'ivy_auth_token';
const USER_STORAGE_KEY = 'ivy_user_profile';

const BASE_URL = typeof __API_BASE_URL__ !== 'undefined' && __API_BASE_URL__ 
  ? __API_BASE_URL__ 
  : '/api';

const API_KEY = typeof __API_KEY__ !== 'undefined' && __API_KEY__ 
  ? __API_KEY__ 
  : '';

export const authService = {
  getBaseUrl: () => BASE_URL,
  getApiKey: () => API_KEY,
  getToken: () => localStorage.getItem(AUTH_STORAGE_KEY),
  getUser: () => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => !!localStorage.getItem(AUTH_STORAGE_KEY),

  login: async (email, password) => {
    try {
      const trimmedEmail = (email || '').trim();
      const cleanPassword = password || '';

      if (!trimmedEmail || !cleanPassword) {
        return {
          success: false,
          error: 'Invalid email or password. Please check your credentials and try again.'
        };
      }

      const headers = {
        'Content-Type': 'application/json'
      };
      if (API_KEY) {
        headers['X-API-Key'] = API_KEY;
      }

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: trimmedEmail, password: cleanPassword })
      });

      if (!res.ok) {
        let userMessage = 'Invalid email or password. Please check your credentials and try again.';
        if (res.status >= 500) {
          userMessage = 'Authentication service is temporarily unavailable. Please try again later.';
        }
        return { 
          success: false, 
          error: userMessage,
          status: res.status 
        };
      }

      const data = await res.json();
      const token = data?.access_token;

      if (!token) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        };
      }

      const user = {
        email: trimmedEmail || 'demo1@ivy.homes',
        role: 'Verified Analyst',
        expiresIn: data.expires_in
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch (storageErr) {
        console.warn('Could not persist auth to localStorage:', storageErr);
      }

      return { success: true, token, user };
    } catch (err) {
      return { 
        success: false, 
        error: 'Unable to connect to the authentication server. Please check your network connection.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Per-user Saved Listings
  getSavedListingIds: (userEmail) => {
    if (!userEmail) return [];
    try {
      const raw = localStorage.getItem(`ivy_saved_${userEmail}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isListingSaved: (userEmail, listingId) => {
    if (!userEmail || !listingId) return false;
    const ids = authService.getSavedListingIds(userEmail);
    return ids.includes(listingId);
  },

  toggleSaveListing: (userEmail, listingId) => {
    if (!userEmail || !listingId) return { isSaved: false, savedIds: [] };
    const ids = authService.getSavedListingIds(userEmail);
    let updated;
    let isSaved;
    if (ids.includes(listingId)) {
      updated = ids.filter(id => id !== listingId);
      isSaved = false;
    } else {
      updated = [...ids, listingId];
      isSaved = true;
    }
    localStorage.setItem(`ivy_saved_${userEmail}`, JSON.stringify(updated));
    return { isSaved, savedIds: updated };
  }
};
