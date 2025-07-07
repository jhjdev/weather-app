/**
 * API Test Script
 *
 * This script tests the API communication without requiring the full app to compile
 */

import {API_URL} from './types';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime?: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  message: string;
  user?: User;
}

interface WeatherResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const testAPI = async (): Promise<void> => {
  console.log('🔧 Testing API Communication...');
  console.log('API URL:', API_URL);

  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData: HealthResponse = await healthResponse.json();

    if (healthResponse.ok) {
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status, healthData);
      return;
    }

    // Test user registration
    console.log('\n2. Testing user registration...');
    const testUser: RegisterRequest = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'TestPassword123!', // Strong password
    };

    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const registerData: RegisterResponse = await registerResponse.json();

    if (registerResponse.ok && registerData.success) {
      console.log('✅ Registration successful:', {
        success: registerData.success,
        userId: registerData.user?.id,
        email: registerData.user?.email,
      });

      // Test login with new user
      console.log('\n3. Testing login with new user...');
      const loginCredentials: LoginRequest = {
        email: testUser.email,
        password: testUser.password,
      };

      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginCredentials),
      });

      const loginData: LoginResponse = await loginResponse.json();

      if (loginResponse.ok && loginData.token) {
        console.log('✅ Login successful, token received');

        // Test authenticated weather endpoint
        console.log('\n4. Testing weather endpoint...');
        const weatherResponse = await fetch(
          `${API_URL}/api/weather?city=Tokyo`,
          {
            headers: {
              Authorization: `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        const weatherData: WeatherResponse = await weatherResponse.json();

        if (weatherResponse.ok) {
          console.log('✅ Weather endpoint works:', {
            success: weatherData.success,
            hasData: !!weatherData.data,
          });
        } else {
          console.log('❌ Weather endpoint failed:', weatherData);
        }

        // Test profile endpoint
        console.log('\n5. Testing profile endpoint...');
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${loginData.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const profileData = await profileResponse.json();

        if (profileResponse.ok) {
          console.log('✅ Profile endpoint works:', {
            email: profileData.data?.email,
            firstName: profileData.data?.firstName,
          });
        } else {
          console.log('❌ Profile endpoint failed:', profileData);
        }
      } else {
        console.log('❌ Login failed:', loginData);
      }
    } else {
      console.log('❌ Registration failed:', registerData);

      // Try with existing user if registration failed
      console.log('\n3. Testing with existing user credentials...');
      const existingCredentials: LoginRequest = {
        email: 'jhj@jhjdev.com',
        password: 'password123',
      };

      const existingLoginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(existingCredentials),
      });

      const existingLoginData: LoginResponse =
        await existingLoginResponse.json();

      if (existingLoginResponse.ok && existingLoginData.token) {
        console.log('✅ Login with existing user successful');

        // Test weather history
        console.log('\n4. Testing weather history...');
        const historyResponse = await fetch(`${API_URL}/api/weather/history`, {
          headers: {
            Authorization: `Bearer ${existingLoginData.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const historyData: WeatherResponse = await historyResponse.json();

        if (historyResponse.ok) {
          console.log('✅ Weather history works:', {
            success: historyData.success,
            itemCount: Array.isArray(historyData.data)
              ? historyData.data.length
              : 0,
          });
        } else {
          console.log('❌ Weather history failed:', historyData);
        }
      }
    }

    console.log('\n🎉 API testing completed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

testAPI();
