import { apiRequest } from './config';

export const appointmentsApi = {
  /**
   * Book a new appointment (Calls PHP create.php with transaction & conflict guard)
   */
  create: async (appointmentData) => {
    return await apiRequest('/appointments/create.php', {
      method: 'POST',
      body: appointmentData,
    });
  },

  /**
   * List appointments with joins and filters (Calls PHP read.php)
   * params can include: client_id, lawyer_id, status, upcoming, search
   */
  list: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest(`/appointments/read.php${queryString}`, {
      method: 'GET',
    });
  },

  /**
   * Get single appointment with joins
   */
  getById: async (id) => {
    return await apiRequest(`/appointments/read.php?id=${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update appointment status / reschedule (Calls PHP update.php)
   */
  updateStatus: async ({ id, status, appointment_date, appointment_time, cancellation_reason }) => {
    return await apiRequest('/appointments/update.php', {
      method: 'POST',
      body: {
        id,
        status,
        appointment_date,
        appointment_time,
        cancellation_reason,
      },
    });
  },

  /**
   * Soft-cancel an appointment (Calls PHP delete.php)
   */
  cancel: async (id, reason = 'Cancelled by user') => {
    return await apiRequest('/appointments/delete.php', {
      method: 'POST',
      body: { id, reason },
    });
  },

  /**
   * Get appointment aggregates / stats (Calls PHP stats.php)
   */
  getStats: async (lawyerId = null) => {
    const query = lawyerId ? `?lawyer_id=${lawyerId}` : '';
    return await apiRequest(`/appointments/stats.php${query}`, {
      method: 'GET',
    });
  },
};
