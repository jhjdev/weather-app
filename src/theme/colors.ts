export interface ColorScheme {
  primary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
  divider: string;
  card: {
    background: string;
    shadow: string;
  };
  statusBar: {
    background: string;
    style: 'light-content' | 'dark-content';
  };
}

export const lightColors: ColorScheme = {
  primary: '#1565C0',
  background: '#F9F9F9',
  surface: '#FFFFFF',
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  divider: '#E5E5EA',
  card: {
    background: '#FFFFFF',
    shadow: '#000000',
  },
  statusBar: {
    background: '#FFFFFF',
    style: 'dark-content',
  },
};

export const darkColors: ColorScheme = {
  primary: '#90CAF9',
  background: '#121212',
  surface: '#1E1E1E',
  text: {
    primary: '#FFFFFF',
    secondary: '#BDBDBD',
  },
  divider: '#2C2C2C',
  card: {
    background: '#1E1E1E',
    shadow: '#000000',
  },
  statusBar: {
    background: '#121212',
    style: 'light-content',
  },
};

export const getColors = (isDark: boolean): ColorScheme =>
  isDark ? darkColors : lightColors;

