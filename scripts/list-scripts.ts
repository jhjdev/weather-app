/**
 * Script Runner - Shows available test scripts and their descriptions
 */

interface ScriptInfo {
  command: string;
  description: string;
  purpose: string;
}

const availableScripts: ScriptInfo[] = [
  {
    command: 'npm run script:weather-history',
    description: 'Weather History Integration Test',
    purpose:
      'Tests /api/weather/history endpoint, validates data structure and authentication',
  },
  {
    command: 'npm run script:api-discovery',
    description: 'API Discovery',
    purpose:
      'Tests all known API endpoints and provides comprehensive coverage report',
  },
  {
    command: 'npm run script:login-test',
    description: 'Login Credentials Test',
    purpose:
      'Tests login with known credentials and validates all authenticated endpoints',
  },
  {
    command: 'npm run script:params-test',
    description: 'API Parameters Test',
    purpose:
      'Tests API with correct parameters and validates weather API with city parameter',
  },
  {
    command: 'npm run script:api-test',
    description: 'General API Test',
    purpose:
      'Comprehensive API testing including registration, login, and all endpoints',
  },
  {
    command: 'npm run clean:node-modules',
    description: 'Clean Node Modules',
    purpose:
      'Removes unwanted files (.DS_Store, .github) and attributes from node_modules',
  },
];

const showAvailableScripts = (): void => {
  console.log('🚀 Hostaway Assessment API Test Scripts');
  console.log('==========================================\n');

  console.log('Available TypeScript test scripts:\n');

  availableScripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.description}`);
    console.log(`   Command: ${script.command}`);
    console.log(`   Purpose: ${script.purpose}\n`);
  });

  console.log('📁 Script Location: /scripts/');
  console.log('📖 Documentation: /scripts/README.md');
  console.log('⚙️  TypeScript Config: /scripts/tsconfig.json\n');

  console.log(
    '🔧 All scripts are written in TypeScript and can be run independently.',
  );
  console.log(
    '📊 Each script provides detailed console output with status indicators.',
  );
  console.log('🌐 Scripts test the Hostaway Assessment API endpoints.\n');

  console.log('Example usage:');
  console.log(
    '  npm run script:weather-history  # Test weather history functionality',
  );
  console.log(
    '  npm run script:api-discovery    # Discover all available endpoints',
  );
  console.log('  npm run script:login-test       # Test authentication flow\n');

  console.log('For more information, see /scripts/README.md');
};

showAvailableScripts();
