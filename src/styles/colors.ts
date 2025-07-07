export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    primary: string;
    secondary: string;
    gradient: string[];
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  weather: {
    sunny: string;
    cloudy: string;
    rainy: string;
    stormy: string;
    snowy: string;
    clear: string;
  };
  temperature: {
    hot: string;
    warm: string;
    mild: string;
    cool: string;
    cold: string;
  };
  divider: string;
  border: string;
  card: {
    background: string;
    shadow: string;
    border: string;
  };
  statusBar: {
    background: string;
    style: 'light-content' | 'dark-content';
  };
  error: string;
  warning: string;
  success: string;
  info: string;
}

export const lightColors: ColorScheme = {
  primary: '#2196F3', // Sky blue
  secondary: '#FFA726', // Warm orange
  accent: '#4CAF50', // Fresh green
  background: {
    primary: '#F8F9FA',
    secondary: '#FFFFFF',
    gradient: ['#E3F2FD', '#BBDEFB'],
  },
  surface: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },
  weather: {
    sunny: '#FFD54F',
    cloudy: '#90A4AE',
    rainy: '#42A5F5',
    stormy: '#5C6BC0',
    snowy: '#E1F5FE',
    clear: '#81C784',
  },
  temperature: {
    hot: '#FF5722',
    warm: '#FF9800',
    mild: '#4CAF50',
    cool: '#2196F3',
    cold: '#3F51B5',
  },
  divider: '#E0E0E0',
  border: '#E5E5EA',
  card: {
    background: '#FFFFFF',
    shadow: '#000000',
    border: '#F0F0F0',
  },
  statusBar: {
    background: '#FFFFFF',
    style: 'dark-content',
  },
  error: '#F44336',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
};

export const darkColors: ColorScheme = {
  primary: '#64B5F6', // Lighter sky blue
  secondary: '#FFB74D', // Warm orange
  accent: '#81C784', // Fresh green
  background: {
    primary: '#0D1117',
    secondary: '#161B22',
    gradient: ['#0D1117', '#161B22'],
  },
  surface: {
    primary: '#161B22',
    secondary: '#21262D',
    elevated: '#262C36',
  },
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    inverse: '#0D1117',
  },
  weather: {
    sunny: '#FFD54F',
    cloudy: '#78909C',
    rainy: '#42A5F5',
    stormy: '#5C6BC0',
    snowy: '#B3E5FC',
    clear: '#A5D6A7',
  },
  temperature: {
    hot: '#FF7043',
    warm: '#FFB74D',
    mild: '#81C784',
    cool: '#64B5F6',
    cold: '#7986CB',
  },
  divider: '#30363D',
  border: '#30363D',
  card: {
    background: '#161B22',
    shadow: '#000000',
    border: '#21262D',
  },
  statusBar: {
    background: '#0D1117',
    style: 'light-content',
  },
  error: '#F85149',
  warning: '#D29922',
  success: '#3FB950',
  info: '#58A6FF',
};

export const getColors = (isDark: boolean): ColorScheme =>
  isDark ? darkColors : lightColors;
