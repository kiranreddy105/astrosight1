import type {
  User,
  AnalysisRecord,
  PortalStats,
  ModelPerformanceMetrics,
  SampleImageSpecimen,
  SpatialMeasurement,
  CraterItem
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('astrosight_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('astrosight_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('astrosight_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set application/json if not sending FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string }) {
    return request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }) {
    return request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthToken();
    }
  },

  async getMe() {
    return request<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>) {
    return request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: { old_password: string; new_password: string }) {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string) {
    return request<{ message: string; reset_token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(data: { token: string; new_password: string }) {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Portal & Analysis
  async getPortalStats() {
    return request<PortalStats>('/portal/stats');
  },

  async uploadAndAnalyze(formData: FormData) {
    return request<AnalysisRecord>('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async computeSpatialVector(craterA: CraterItem, craterB: CraterItem, resolution: number) {
    return request<SpatialMeasurement>('/spatial-analysis', {
      method: 'POST',
      body: JSON.stringify({
        crater_a: craterA,
        crater_b: craterB,
        resolution_m_per_px: resolution,
      }),
    });
  },

  async getAnalyses() {
    return request<AnalysisRecord[]>('/analyses');
  },

  async getAnalysis(id: string) {
    return request<AnalysisRecord>(`/analyses/${id}`);
  },

  async deleteAnalysis(id: string) {
    return request<{ message: string }>(`/analyses/${id}`, {
      method: 'DELETE',
    });
  },

  async getModelPerformance() {
    return request<ModelPerformanceMetrics>('/model-performance');
  },

  async getSampleImages() {
    return request<SampleImageSpecimen[]>('/sample-images');
  },
};
