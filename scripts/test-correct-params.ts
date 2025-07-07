/**
 * Test with correct parameters
 */

import {API_URL} from './types';

interface WeatherApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

interface AuthResponse {
  token: string;
  message: string;
  user?: any;
}

const testCorrectParams = async (): Promise<void> => {
  console.log('🔧 Testing API with correct parameters...');

  try {
    // Test weather API with city parameter (no auth needed apparently)
    console.log('\n1. Testing weather API with city parameter...');
    const weatherResponse = await fetch(
      `${API_URL}/api/weather/current?city=Tokyo`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    const weatherData: WeatherApiResponse = await weatherResponse.json();
    console.log('Weather status:', weatherResponse.status);
    console.log('Weather response:', JSON.stringify(weatherData, null, 2));

    if (weatherResponse.ok) {
      console.log('✅ Weather API works with city parameter!');

      // Test weather search
      console.log('\n2. Testing weather search...');
      const searchResponse = await fetch(`${API_URL}/api/weather/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({location: 'Tokyo'}),
      });

      const searchData: WeatherApiResponse = await searchResponse.json();
      console.log('Search status:', searchResponse.status);
      console.log('Search response:', JSON.stringify(searchData, null, 2));

      if (searchResponse.ok) {
        console.log('✅ Weather search works!');
      }

      // Test weather history (requires authentication)
      console.log('\n3. Testing weather history...');
      const historyResponse = await fetch(`${API_URL}/api/weather/history`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const historyData: WeatherApiResponse = await historyResponse.json();
      console.log('History status:', historyResponse.status);
      console.log('History response:', JSON.stringify(historyData, null, 2));

      if (historyResponse.status === 401) {
        console.log('⚠️ Weather history requires authentication (expected)');

        // Test with authentication
        console.log('\n4. Testing with authentication...');
        const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
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
          console.log('✅ Login successful');

          const authHistoryResponse = await fetch(
            `${API_URL}/api/weather/history`,
            {
              headers: {
                Authorization: `Bearer ${loginData.token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          const authHistoryData: WeatherApiResponse =
            await authHistoryResponse.json();
          console.log('Auth history response:', authHistoryData);

          if (authHistoryResponse.ok) {
            console.log('✅ Weather history works with authentication!');
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error testing parameters:', error);
  }
};

testCorrectParams();
