# Scripts

This folder contains TypeScript test scripts for validating the Hostaway Assessment API integration.

## Available Scripts

All scripts can be run using npm commands from the project root:

### API Testing Scripts

1. **Weather History Integration Test**

   ```bash
   npm run script:weather-history
   ```

   - Tests the `/api/weather/history` endpoint
   - Validates data structure and authentication
   - Verifies weather history functionality

2. **API Discovery**

   ```bash
   npm run script:api-discovery
   ```

   - Tests all known API endpoints
   - Provides comprehensive API coverage report
   - Shows which endpoints require authentication

3. **Login Credentials Test**

   ```bash
   npm run script:login-test
   ```

   - Tests login with known credentials
   - Validates all authenticated endpoints
   - Tests weather, profile, and history APIs

4. **API Parameters Test**

   ```bash
   npm run script:params-test
   ```

   - Tests API with correct parameters
   - Validates weather API with city parameter
   - Tests authentication flow

5. **General API Test**
   ```bash
   npm run script:api-test
   ```
   - Comprehensive API testing
   - Tests registration, login, and all endpoints
   - Includes error handling and fallbacks

## File Structure

```
scripts/
├── tsconfig.json                           # TypeScript configuration
├── test-weather-history-integration.ts    # Weather history testing
├── test-api-discovery.ts                  # API endpoint discovery
├── test-login-credentials.ts              # Login and authentication
├── test-correct-params.ts                 # Parameter validation
├── test-api.ts                           # General API testing
└── *.js                                   # Legacy JavaScript files
```

## TypeScript Configuration

The scripts use their own TypeScript configuration (`tsconfig.json`) that extends the main project configuration but is optimized for Node.js execution.

### Features:

- Full TypeScript support with strict mode
- Type checking for API responses
- ESM/CommonJS interop
- Node.js built-in modules support

## API Endpoints Tested

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Weather**: `/api/weather/history`, `/api/weather?city=Tokyo`
- **Profile**: `/api/profile`
- **Health**: `/api/health`

## Environment Requirements

- Node.js 18+
- TypeScript (included in project dependencies)
- ts-node (included in project dependencies)

## Usage Examples

### Run all tests sequentially:

```bash
npm run script:api-discovery
npm run script:login-test
npm run script:weather-history
```

### Quick API validation:

```bash
npm run script:api-test
```

### Weather history specific testing:

```bash
npm run script:weather-history
```

## Test Credentials

The scripts use test credentials:

- **Email**: `jhj@jhjdev.com`
- **Password**: `password123`

These are hardcoded for testing purposes and should be updated for production use.

## Output

All scripts provide colored console output with:

- ✅ Success indicators
- ❌ Error indicators
- 📊 Data summaries
- 🔧 Status updates

## Troubleshooting

1. **TypeScript Errors**: Check that all dependencies are installed with `npm install`
2. **API Connection**: Verify the API URL is accessible
3. **Authentication**: Ensure test credentials are valid
4. **Network Issues**: Check internet connection and firewall settings
