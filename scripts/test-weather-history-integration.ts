/**
 * Test the weather history integration with our updated API service
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

interface WeatherHistoryItem {
  _id: string;
  userId: string;
  query: string;
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  weatherData: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface HistoryApiResponse {
  success: boolean;
  data: WeatherHistoryItem[];
  message?: string;
}

interface WeatherApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

const testWeatherHistoryIntegration = async (): Promise<void> => {
  const testCredentials: LoginCredentials = {
    email: 'jhj@jhjdev.com',
    password: 'password123',
  };

  try {
    console.log('🔧 Testing weather history integration...');

    // Step 1: Login
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });

    const loginData: LoginResponse = await loginResponse.json();
    if (!loginData.token) {
      throw new Error('Login failed');
    }

    console.log('✅ Login successful');

    // Step 2: Test weather history endpoint
    const historyResponse = await fetch(`${API_URL}/api/weather/history`, {
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      },
    });

    const historyData: HistoryApiResponse = await historyResponse.json();

    if (historyData.success) {
      console.log('✅ Weather history endpoint working');
      console.log(`📊 Found ${historyData.data.length} history items`);

      if (historyData.data.length > 0) {
        console.log('📋 Sample history item:');
        console.log(JSON.stringify(historyData.data[0], null, 2));

        // Test the structure matches our WeatherHistoryItem interface
        const item = historyData.data[0];
        const requiredFields: (keyof WeatherHistoryItem)[] = [
          '_id',
          'userId',
          'query',
          'location',
          'weatherData',
          'createdAt',
          'updatedAt',
        ];
        const missingFields = requiredFields.filter(field => !item[field]);

        if (missingFields.length === 0) {
          console.log('✅ All required fields present in history item');
        } else {
          console.log('❌ Missing fields:', missingFields);
        }

        // Test location structure
        if (item.location && item.location.name && item.location.country) {
          console.log('✅ Location structure is correct');
        } else {
          console.log('❌ Location structure is incorrect');
        }

        // Test weatherData structure
        if (
          item.weatherData &&
          item.weatherData.temperature &&
          item.weatherData.description
        ) {
          console.log('✅ WeatherData structure is correct');
        } else {
          console.log('❌ WeatherData structure is incorrect');
        }
      } else {
        console.log(
          '⚠️ No history items found. Making a weather search first...',
        );

        // Make a weather search to populate history
        const weatherResponse = await fetch(
          `${API_URL}/api/weather?city=Tokyo`,
          {
            headers: {
              Authorization: `Bearer ${loginData.token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const weatherData: WeatherApiResponse = await weatherResponse.json();
        if (weatherData.success) {
          console.log('✅ Weather search successful');
          console.log('🔄 Retrying history fetch...');

          const retryHistoryResponse = await fetch(
            `${API_URL}/api/weather/history`,
            {
              headers: {
                Authorization: `Bearer ${loginData.token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          const retryHistoryData: HistoryApiResponse =
            await retryHistoryResponse.json();
          console.log(
            `📊 Found ${retryHistoryData.data.length} history items after search`,
          );
        }
      }
    } else {
      console.log('❌ Weather history endpoint failed:', historyData.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testWeatherHistoryIntegration();
