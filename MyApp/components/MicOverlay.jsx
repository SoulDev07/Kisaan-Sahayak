import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MicOverlay = ({ 
  onPress, 
  isVisible = true, 
  isActive = false, 
  position = 'bottomRight', 
  size = 'large', 
  style = {} 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isActive) {
      // Pulsing animation when active
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive]);

  if (!isVisible) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'bottomLeft':
        return { bottom: 80, left: 20 };
      case 'bottomCenter':
        return { bottom: 80, alignSelf: 'center', left: width / 2 - 35 };
      case 'topRight':
        return { top: 100, right: 20 };
      case 'topLeft':
        return { top: 100, left: 20 };
      default: // bottomRight
        return { bottom: 580, right: 5 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 50, height: 50, borderRadius: 25 };
      case 'medium':
        return { width: 60, height: 60, borderRadius: 30 };
      default: // large
        return { width: 70, height: 70, borderRadius: 35 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      default: // large
        return 28;
    }
  };

  return (
    <View style={[styles.overlay, getPositionStyle()]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.micButton,
            getSizeStyle(),
            isActive && styles.micButtonActive,
            style
          ]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isActive ? "stop" : "mic"} 
            size={getIconSize()} 
            color="black" 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 1000,
  },
  micButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  micButtonActive: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
    shadowColor: '#FF5722',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});

export default MicOverlay;
