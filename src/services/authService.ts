import api from './api';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface UserSession {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  organizationId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserSession;
}

/**
 * Authentication Service
 * Manages user login API calls, JWT token persistence, and local session state.
 */
export const authService = {
  /**
   * Authenticate user via POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { accessToken, user } = response.data;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Terminate active user session
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Retrieve cached user profile from session storage
   */
  getCurrentUser(): UserSession | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserSession;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve active JWT Access Token
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  },

  /**
   * Check if valid authentication session exists
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
