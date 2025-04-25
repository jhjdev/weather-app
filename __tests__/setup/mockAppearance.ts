// Dead simple mock implementation
const mockGetColorScheme = jest.fn();
mockGetColorScheme.mockReturnValue('light');

jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: mockGetColorScheme,
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
}));

export { mockGetColorScheme };
