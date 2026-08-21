/**
 * Tasky Mobile — Authentication & Token Storage Service
 * Handles user login, registration, token persistence, and session checks.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ENV } from '../config/environment';
import { AuthUser } from '../types/Task';

const ACCESS_TOKEN_KEY = 'tasky_access_token';
const REFRESH_TOKEN_KEY = 'tasky_refresh_token';
const USER_DATA_KEY = 'tasky_user_data';

// Helper for cross-platform secure storage (falls back to AsyncStorage on Web)
async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  }
}

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  }
}

async function removeStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  }
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const AuthService = {
  /**
   * Register a new student account
   */
  async register(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const url = `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/register`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to register account');
    }

    await this.saveTokens(data);
    const user = await this.getCurrentUser(data.access_token);
    return { user, tokens: data };
  },

  /**
   * Log in with email and password
   */
  async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const url = `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Invalid email or password');
    }

    await this.saveTokens(data);
    const user = await this.getCurrentUser(data.access_token);
    return { user, tokens: data };
  },

  /**
   * Fetch currently authenticated user profile from backend
   */
  async getCurrentUser(token?: string): Promise<AuthUser> {
    const activeToken = token || (await this.getAccessToken());
    if (!activeToken) {
      throw new Error('No authentication token available');
    }

    const url = `${ENV.API_BASE_URL.replace(/\/+$/, '')}/auth/me`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch current user');
    }

    const user: AuthUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      studentId: data.student_id,
      section: data.section,
      about: data.about,
    };

    await setStorageItem(USER_DATA_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Store access and refresh tokens securely
   */
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await setStorageItem(ACCESS_TOKEN_KEY, tokens.access_token);
    await setStorageItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  /**
   * Retrieve access token from secure storage
   */
  async getAccessToken(): Promise<string | null> {
    return await getStorageItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Retrieve refresh token from secure storage
   */
  async getRefreshToken(): Promise<string | null> {
    return await getStorageItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Retrieve cached user data from storage
   */
  async getCachedUser(): Promise<AuthUser | null> {
    const raw = await getStorageItem(USER_DATA_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Clear all stored tokens and cached user data (logout)
   */
  async logout(): Promise<void> {
    await removeStorageItem(ACCESS_TOKEN_KEY);
    await removeStorageItem(REFRESH_TOKEN_KEY);
    await removeStorageItem(USER_DATA_KEY);
  },
};

export default AuthService;
