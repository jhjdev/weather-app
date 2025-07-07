import {getCurrentWeather, getForecast, searchLocations} from './weatherApi';

// Test city name that we know works (as verified by curl command)
const TEST_CITY = 'Tokyo';
const TEST_QUERY = 'Tokyo';

console.log('=================================================');
console.log('STARTING WEATHER API TEST');
console.log('=================================================');
console.log(`Testing with city: ${TEST_CITY}`);
console.log('=================================================');

// Helper function to run tests
const runTests = async () => {
  try {
    console.log('TEST 1: Getting current weather...');
    const currentWeather = await getCurrentWeather(TEST_CITY);
    console.log('✅ Current weather test PASSED!');
    console.log('Weather data:', JSON.stringify(currentWeather, null, 2));
  } catch (error) {
    console.error('❌ Current weather test FAILED!');
    console.error('Error details:', error);
  }

  try {
    console.log('\nTEST 2: Getting forecast...');
    const forecast = await getForecast(TEST_CITY);
    console.log('✅ Forecast test PASSED!');
    console.log('Forecast data:', JSON.stringify(forecast, null, 2));
  } catch (error) {
    console.error('❌ Forecast test FAILED!');
    console.error('Error details:', error);
  }

  try {
    console.log('\nTEST 3: Searching for location...');
    const locations = await searchLocations(TEST_QUERY);
    console.log('✅ Location search test PASSED!');
    console.log('Locations found:', JSON.stringify(locations, null, 2));
  } catch (error) {
    console.error('❌ Location search test FAILED!');
    console.error('Error details:', error);
  }

  console.log('\n=================================================');
  console.log('WEATHER API TEST COMPLETE');
  console.log('=================================================');
};

// Run the tests
runTests()
  .then(() => {
    console.log('All tests executed');
  })
  .catch(err => {
    console.error('Test execution error:', err);
  });

export {};
