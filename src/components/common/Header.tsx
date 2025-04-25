import React from 'react';
import { View, Text, StyleSheet, ViewStyle, ColorValue } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getColors } from '../../theme';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { isDark } = useSelector((state: RootState) => state.theme);
  const colors = getColors(isDark);
  
  // Define dynamic styles with proper typing
  const dynamicStyles: ViewStyle = {
    backgroundColor: colors.card.background as ColorValue,
    borderBottomColor: colors.divider as ColorValue,
  };

  return (
    <View
      style={[styles.container, dynamicStyles]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={title}
    >
      <Text style={[styles.title, { color: 'red' }]}>
        {title.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64, // Slightly taller for better spacing
    justifyContent: 'center',
    alignItems: 'center', // Center-aligned title as requested
    paddingHorizontal: 16, // Standard Material padding
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24, // Larger text as requested
    fontWeight: '500',
    letterSpacing: 0.15, // Material Design typography spec
  },
});

export default Header;
