import { apiRequest } from './config';

export const analyticsApi = {
  /**
   * Get all query definitions in catalog
   */
  getCatalog: () => apiRequest('/analytics/queries.php?key=all_catalog'),

  /**
   * Run a specific query by key
   */
  runQuery: (key) => apiRequest(`/analytics/queries.php?key=${encodeURIComponent(key)}`),
};
