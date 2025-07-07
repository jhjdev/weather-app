/**
 * API Discovery - Test all known endpoints
 */

import {API_URL} from './types';

interface AuthResponse {
  token?: string;
  message: string;
  user?: any;
}

interface ApiResponse {
  success?: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const API_BASE_URL = API_URL;

const discoverApiEndpoints = async (): Promise<void> => {
  console.log('🔍 API Discovery - Testing all known endpoints');
  console.log('=================================================\n');

  const endpoints = [
    // Health endpoint
    {
      name: 'Health Check',
      method: 'GET',
      url: `${API_BASE_URL}/api/health`,
      requiresAuth: false,
    },

    // Auth endpoints
    {
      name: 'Auth Login',
      method: 'POST',
      url: `${API_BASE_URL}/api/auth/login`,
      requiresAuth: false,
      body: {
        email: 'jhj@jhjdev.com',
        password: 'password123',
      },
    },
    {
      name: 'Auth Register',
      method: 'POST',
      url: `${API_BASE_URL}/api/auth/register`,
      requiresAuth: false,
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'testpassword123',
      },
    },

    // Weather endpoints
    {
      name: 'Weather Current',
      method: 'GET',
      url: `${API_BASE_URL}/api/weather/current?city=Tokyo`,
      requiresAuth: false,
    },
    {
      name: 'Weather Search',
      method: 'GET',
      url: `${API_BASE_URL}/api/weather?city=Tokyo`,
      requiresAuth: false,
    },
    {
      name: 'Weather History',
      method: 'GET',
      url: `${API_BASE_URL}/api/weather/history`,
      requiresAuth: true,
    },

    // Profile endpoints
    {
      name: 'User Profile',
      method: 'GET',
      url: `${API_BASE_URL}/api/profile`,
      requiresAuth: true,
    },
  ];

  let authToken: string | null = null;

  // First, try to get auth token
  console.log('🔐 Getting authentication token...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jhj@jhjdev.com',
        password: 'password123',
      }),
    });

    const loginData: AuthResponse = await loginResponse.json();
    if (loginData.token) {
      authToken = loginData.token;
      console.log('✅ Authentication token obtained\n');
    } else {
      console.log('⚠️ Could not obtain auth token\n');
    }
  } catch (error) {
    console.log('❌ Failed to get auth token:', error);
  }

  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint.name}`);
    console.log(`   ${endpoint.method} ${endpoint.url}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (endpoint.requiresAuth && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers,
      };

      if (endpoint.body) {
        requestOptions.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(endpoint.url, requestOptions);
      const data: ApiResponse = await response.json();

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log('   ✅ Success');
        if (data.success !== undefined) {
          console.log(`   API Success: ${data.success}`);
        }
        if (Array.isArray(data.data)) {
          console.log(`   Data Count: ${data.data.length} items`);
        } else if (data.data) {
          console.log('   Data: Present');
        }
      } else {
        console.log('   ❌ Failed');
        if (data.message) {
          console.log(`   Message: ${data.message}`);
        }
        if (data.error) {
          console.log(`   Error: ${data.error}`);
        }
      }
    } catch (error) {
      console.log('   ❌ Request failed:', error);
    }

    console.log(''); // Empty line for readability
  }

  console.log('=================================================');
  console.log('🏁 API Discovery completed!');
};

discoverApiEndpoints();
