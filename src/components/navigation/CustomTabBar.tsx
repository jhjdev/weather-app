import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useThemedStyles, useTheme} from '../../styles/ThemeProvider';
import {Theme} from '../../styles/theme';
import * as Icon from 'react-native-feather';

const {width: screenWidth} = Dimensions.get('window');

interface TabIconProps {
  name: string;
  _focused: boolean;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({name, _focused, color, size}) => {
  const iconProps = {width: size, height: size, stroke: color};

  switch (name) {
    case 'Home':
      return <Icon.Home {...iconProps} />;
    case 'Search':
      return <Icon.Search {...iconProps} />;
    case 'Forecast':
      return <Icon.BarChart {...iconProps} />;
    case 'About':
      return <Icon.Info {...iconProps} />;
    case 'Profile':
      return <Icon.User {...iconProps} />;
    default:
      return <Icon.Home {...iconProps} />;
  }
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const styles = useThemedStyles(createStyles);
  const {theme} = useTheme();
  
  // Animated index for smooth transitions
  const animatedIndex = useSharedValue(state.index);
  
  // Update animated value when index changes
  React.useEffect(() => {
    animatedIndex.value = withSpring(state.index, {
      damping: 15,
      stiffness: 150,
    });
  }, [state.index]);
  
  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = screenWidth / state.routes.length;
    const translateX = interpolate(
      animatedIndex.value,
      [0, state.routes.length - 1],
      [tabWidth / 2 - 20, (state.routes.length - 1) * tabWidth + tabWidth / 2 - 20],
      Extrapolation.CLAMP,
    );
    
    return {
      transform: [{translateX}],
    };
  }, [state.routes.length]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.background.gradient}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.tabBar}>
          {/* Animated Indicator */}
          <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />

          {/* Tab buttons */}
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const buttonStyle = styles.tabButton;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? {selected: true} : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                activeOpacity={0.7}>
                <View style={[styles.iconContainer, buttonStyle]}>
                  <TabIcon
                    name={route.name}
                    _focused={isFocused}
                    color={
                      isFocused
                        ? theme.colors.primary
                        : theme.colors.text.secondary
                    }
                    size={24}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const createStyles = (theme: Theme) => {
  const tabBarHeight = Platform.OS === 'ios' ? 90 : 70;

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
    },
    gradient: {
      paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    tabBar: {
      flexDirection: 'row',
      height: tabBarHeight,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      position: 'relative',
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    indicator: {
      position: 'absolute',
      top: 8,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface.elevated,
      ...theme.shadows.medium,
    },
  });
};

export default CustomTabBar;
