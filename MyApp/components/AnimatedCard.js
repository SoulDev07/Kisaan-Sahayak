import React, { useEffect } from 'react';
import { Animated } from 'react-native';

const AnimatedCard = ({ children, delay = 0 }) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: animatedValue,
      transform: [{
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      }],
    }}>
      {children}
    </Animated.View>
  );
};

export default AnimatedCard; 