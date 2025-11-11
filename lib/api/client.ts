import { Sake, SakeCreate, SakeDetail, Brewery, User, LoginResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://k5kutx396j.us-east-1.awsapprunner.com/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.setToken(null);
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/me/');
  }

  async getSakes(): Promise<Sake[]> {
    return this.request<Sake[]>('/sakes/');
  }

  async getSakeById(id: number): Promise<SakeDetail> {
    return this.request<SakeDetail>(`/sakes/${id}`);
  }

  async createSake(sake: SakeCreate): Promise<SakeDetail> {
    return this.request<SakeDetail>('/sakes/', {
      method: 'POST',
      body: JSON.stringify(sake),
    });
  }

  async updateSake(id: number, sake: Partial<SakeCreate>): Promise<SakeDetail> {
    return this.request<SakeDetail>(`/sakes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sake),
    });
  }

  async getBreweries(): Promise<Brewery[]> {
    return this.request<Brewery[]>('/breweries/');
  }
}

export const apiClient = new ApiClient();
