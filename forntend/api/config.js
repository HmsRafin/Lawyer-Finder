/**
 * API Configuration & Fetch Client Helper
 * Configured to communicate with plain PHP backend running on XAMPP (Apache + MySQL)
 */

// Dynamic base URL detection for XAMPP htdocs or local PHP dev server (port 8000)
const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000' // PHP Built-in server / local runner
    : '/api');

// Also allow fallback to XAMPP htdocs if running under standard Apache
const XAMPP_API_URL = 'http://localhost/lawyer-finder-api';

export const API_URL = API_BASE_URL;

/**
 * Universal API Request Wrapper with session cookies and standard error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    credentials: 'include', // Ensure session cookies are sent/received
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const tryFetch = async (targetBaseUrl) => {
    const url = `${targetBaseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const errorMsg = data?.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        data: null,
        message: errorMsg,
        status: response.status
      };
    }
    return data || { success: true, data: null, message: 'OK' };
  };

  try {
    return await tryFetch(API_BASE_URL);
  } catch (err) {
    try {
      // Fallback try XAMPP htdocs
      return await tryFetch(XAMPP_API_URL);
    } catch (fallbackErr) {
      console.warn(`[LawyerFinder API] Network error on ${endpoint}:`, fallbackErr.message);
      return {
        success: false,
        data: null,
        message: `Unable to connect to PHP backend at ${API_BASE_URL} or ${XAMPP_API_URL}. Please ensure run.py or XAMPP is running.`,
        isNetworkError: true
      };
    }
  }
}
