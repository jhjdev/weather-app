/**
 * Test login credentials jhj@jhjdev.com / password123
 */

import {API_URL} from './types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface WeatherApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

interface ProfileApiResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    preferences?: any;
  };
  message?: string;
}

const testLoginCredentials = async (): Promise<void> => {
  console.log('🔐 Testing login credentials: jhj@jhjdev.com / password123');
  console.log('API URL:', API_URL);
  console.log('=====================================\n');

  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginCredentials: LoginCredentials = {
      email: 'jhj@jhjdev.com',
      password: 'password123',
    };

    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(loginCredentials),
    });

    console.log('Login status:', loginResponse.status);
    const loginData: LoginResponse = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('❌ Login failed!');
      return;
    }

    if (!loginData.token) {
      console.log('❌ No token received!');
      return;
    }

    console.log('✅ Login successful! Token received.');
    const token = loginData.token;

    // 2. Test weather API
    console.log('\n2. Testing weather API...');
    const weatherResponse = await fetch(
      `${API_URL}/api/weather/current?city=Tokyo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    console.log('Weather status:', weatherResponse.status);
    const weatherData: WeatherApiResponse = await weatherResponse.json();
    console.log('Weather response:', JSON.stringify(weatherData, null, 2));

    if (weatherResponse.ok) {
      console.log('✅ Weather API works!');
    } else {
      console.log('❌ Weather API failed!');
    }

    // 3. Test weather history
    console.log('\n3. Testing weather history...');
    const historyResponse = await fetch(
      `${API_URL}/api/weather/history?city=Tokyo&days=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    console.log('History status:', historyResponse.status);
    const historyData: WeatherApiResponse = await historyResponse.json();
    console.log('History response:', JSON.stringify(historyData, null, 2));

    if (historyResponse.ok) {
      console.log('✅ Weather history works!');
    } else {
      console.log('❌ Weather history failed!');
    }

    // 4. Test profile API
    console.log('\n4. Testing profile API...');
    const profileResponse = await fetch(`${API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('Profile status:', profileResponse.status);
    const profileData: ProfileApiResponse = await profileResponse.json();
    console.log('Profile response:', JSON.stringify(profileData, null, 2));

    if (profileResponse.ok) {
      console.log('✅ Profile API works!');
    } else {
      console.log('❌ Profile API failed!');
    }

    // 5. Test health endpoint
    console.log('\n5. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/api/health`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health response:', JSON.stringify(healthData, null, 2));

    if (healthResponse.ok) {
      console.log('✅ Health endpoint works!');
    } else {
      console.log('❌ Health endpoint failed!');
    }

    console.log('\n=====================================');
    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Error testing login credentials:', error);
  }
};

testLoginCredentials();
