import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  verify_code: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    uid: string;
    username: string;
    email: string;
    is_email_verified: boolean;
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/token/`, credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/users/register_email/`, credentials);
    return response.data;
  },

  async sendVerifyCode(email: string): Promise<void> {
    await axios.post(`${API_URL}/users/send_verify_code/`, { email });
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
    return response.data;
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  getTokens(): { access: string | null; refresh: string | null } {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export default authService; 