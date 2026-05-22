import { config } from './config';

const API_URL = config.apiUrl;

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
  _retry?: boolean;
};

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private csrfToken: string | null = null;

  private async fetchCsrfToken() {
    try {
      const response = await fetch(`${API_URL}/api/csrf-token`, { credentials: 'include' });
      const { token } = await response.json();
      this.csrfToken = token;
      return token;
    } catch (error) {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`);
    
    // Skip CSRF for the token endpoint itself
    if (!endpoint.includes('/api/csrf-token')) {
      const needsCsrf = options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method);
      if (needsCsrf && !this.csrfToken) {
        await this.fetchCsrfToken();
      }
    }
    
    if (options.params) {
      Object.keys(options.params).forEach(key => 
        url.searchParams.append(key, options.params![key])
      );
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (this.csrfToken) {
      headers.set('X-CSRF-Token', this.csrfToken);
    }

    const fetchConfig: RequestInit = {
      ...options,
      headers,
      // Same as axios withCredentials: true
      credentials: options.credentials || 'include',
    };

    try {
      const response = await fetch(url.toString(), fetchConfig);
      
      if (response.status === 401 && !options._retry) {
        // Handle token refresh
        return this.handleUnauthorized<T>(endpoint, { ...options, _retry: true });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || response.statusText;
        const error = new Error(errorMessage) as Error & { response: { data: any, status: number } };
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      throw error;
    }
  }

  private async handleUnauthorized<T>(endpoint: string, options: RequestOptions): Promise<{ data: T }> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!refreshResponse.ok) throw new Error('Refresh failed');

        const { data } = await refreshResponse.json();
        const newToken = data.accessToken;
        
        localStorage.setItem('accessToken', newToken);
        this.isRefreshing = false;
        this.onTokenRefreshed(newToken);
        
        return this.request<T>(endpoint, options);
      } catch (error) {
        this.isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw error;
      }
    }

    // Wait for the refresh to finish
    return new Promise((resolve) => {
      this.subscribeTokenRefresh((token) => {
        resolve(this.request<T>(endpoint, options));
      });
    });
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  public get<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  public post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public put<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public patch<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  public delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
