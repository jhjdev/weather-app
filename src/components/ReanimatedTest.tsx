import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';

const ReanimatedTest: React.FC = () => {
  const translateX = useSharedValue(0);

  // Test basic worklet functionality
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Test if we can use runOnJS
  const logFromWorklet = () => {
    console.log('Called from main thread via runOnJS');
  };

  // Test worklet with runOnJS
  const testRunOnJS = useAnimatedStyle(() => {
    'worklet';
    if (translateX.value > 50) {
      runOnJS(logFromWorklet)();
    }
    return {};
  });

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(100, { duration: 1000 }),
      -1,
      true
    );
  }, [translateX]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reanimated Test</Text>
      <Animated.View style={[styles.box, animatedStyle, testRunOnJS]} />
      <Text style={styles.subtitle}>
        If the box is animating, worklets are working!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  box: {
    width: 50,
    height: 50,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
});

export default ReanimatedTest;
