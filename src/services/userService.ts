import api from './api';

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  organization?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  organizationId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  role?: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF';
  organizationId?: string;
}

/**
 * User Management Service
 * API client wrapper for managing system users, team members, and role permissions.
 */
export const userService = {
  /**
   * Fetch list of all system users
   */
  async getUsers(): Promise<UserItem[]> {
    const res = await api.get<UserItem[]>('/users');
    return res.data;
  },

  /**
   * Fetch single user profile by ID
   */
  async getUserById(id: string): Promise<UserItem> {
    const res = await api.get<UserItem>(`/users/${id}`);
    return res.data;
  },

  /**
   * Register a new user account
   */
  async createUser(payload: CreateUserPayload): Promise<UserItem> {
    const res = await api.post<UserItem>('/users', payload);
    return res.data;
  },

  /**
   * Update existing user details or role
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserItem> {
    const res = await api.put<UserItem>(`/users/${id}`, payload);
    return res.data;
  },

  /**
   * Delete user account
   */
  async deleteUser(id: string): Promise<{ success: boolean; id: string }> {
    const res = await api.delete<{ success: boolean; id: string }>(`/users/${id}`);
    return res.data;
  },
};

export default userService;
