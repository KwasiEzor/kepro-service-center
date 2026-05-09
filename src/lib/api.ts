const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`);
    
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

    const config: RequestInit = {
      ...options,
      headers,
      // Same as axios withCredentials: true
      credentials: options.credentials || 'include',
    };

    try {
      const response = await fetch(url.toString(), config);
      
      if (response.status === 401) {
        // Handle token refresh
        return this.handleUnauthorized<T>(endpoint, options);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || response.statusText);
        (error as any).response = { data: errorData, status: response.status };
        throw error;
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
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
