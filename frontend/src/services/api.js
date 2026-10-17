const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('ev_token') || sessionStorage.getItem('ev_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 204 No Content
      if (response.status === 204) {
        return { data: null };
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMsg = data?.error?.message || response.statusText || 'Request failed';
        const error = new Error(errorMsg);
        error.status = response.status;
        error.code = data?.error?.code || 'API_ERROR';
        error.details = data?.error?.details || null;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status && err.name === 'TypeError') {
        // Network connection error
        const networkError = new Error('Unable to connect to the backend server. Please verify the backend is running.');
        networkError.code = 'NETWORK_ERROR';
        networkError.status = 0;
        throw networkError;
      }
      throw err;
    }
  }

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const queryString = query.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

// --- Domain Services ---

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
};

export const stationApi = {
  getStations: (params) => api.get('/stations', params),
  getStation: (id) => api.get(`/stations/${id}`),
  getChargers: (id) => api.get(`/stations/${id}/chargers`),
  getAvailability: (id, date) => api.get(`/stations/${id}/availability`, { date }),
};

export const bookingApi = {
  createBooking: (payload) => api.post('/bookings', payload),
  getMyBookings: (params) => api.get('/bookings/my', params),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getStations: (params) => api.get('/admin/stations', params),
  createStation: (payload) => api.post('/admin/stations', payload),
  updateStation: (id, payload) => api.put(`/admin/stations/${id}`, payload),
  toggleStationStatus: (id, isActive) => api.patch(`/admin/stations/${id}/status`, { is_active: isActive }),
  deleteStation: (id) => api.delete(`/admin/stations/${id}`),
  getChargers: (stationId) => api.get('/admin/chargers', stationId ? { station_id: stationId } : null),
  createCharger: (payload) => api.post('/admin/chargers', payload),
  updateCharger: (id, payload) => api.put(`/admin/chargers/${id}`, payload),
  toggleChargerStatus: (id, payload) => api.patch(`/admin/chargers/${id}/status`, payload),
  deleteCharger: (id) => api.delete(`/admin/chargers/${id}`),
  getBookings: (params) => api.get('/admin/bookings', params),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
};

export const statsApi = {
  getPublicStats: () => api.get('/stats'),
};
