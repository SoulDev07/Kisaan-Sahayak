import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// Improved Preloader Component with better animations
const Preloader = ({ onComplete, theme }) => {
  const [index, setIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Translations for "farmer" in various Indian dialects/languages
  const words = [
    "किसान",        // Hindi - Kisan
    "రైతు",         // Telugu - Raithu
    "ರೈತ",          // Kannada - Raita
    "কৃষক",        // Bengali - Krshok
    "ખેડૂત",        // Gujarati - Khedut
    "ਕਿਸਾਨ",        // Punjabi - Kisan
    "உழவன்",         // Tamil - Uzhavan
    "Farmer"        // English
  ];

  // Improved timing for smoother transitions
  const FADE_IN_DURATION_PRELOADER = 300;
  const DELAY_BEFORE_NEXT_WORD_PRELOADER = 400;
  const SLIDE_UP_DURATION_PRELOADER = 600;
  const SLIDE_UP_DELAY_PRELOADER = 200;

  useEffect(() => {
    // Reset animations for new word
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.8);

    // Animate word entrance with scale and opacity
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: FADE_IN_DURATION_PRELOADER,
        delay: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: FADE_IN_DURATION_PRELOADER,
        delay: 50,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (index < words.length - 1) {
        setTimeout(() => {
          setIndex(prevIndex => prevIndex + 1);
        }, DELAY_BEFORE_NEXT_WORD_PRELOADER);
      } else {
        setTimeout(() => {
          Animated.timing(slideUpAnim, {
            toValue: -height,
            duration: SLIDE_UP_DURATION_PRELOADER,
            delay: SLIDE_UP_DELAY_PRELOADER,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        }, DELAY_BEFORE_NEXT_WORD_PRELOADER);
      }
    });

  }, [index, onComplete, opacityAnim, slideUpAnim, scaleAnim, height, words.length]);

  return (
    <Animated.View
      style={[
        styles.preloaderContainer,
        {
          transform: [{ translateY: slideUpAnim }],
          backgroundColor: theme?.colors?.background || '#000',
        },
      ]}
    >
      <StatusBar barStyle={theme?.colors?.statusBarStyle || 'light-content'} />
      <View style={styles.wordContainer}>
        <Animated.View
          style={[
            styles.wordWrapper,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.mainWord, { color: theme?.colors?.primary || '#10B981' }]}>
            {words[index]}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// Main FetchingLocationScreen Component
const FetchingLocationScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [boundingBox, setBoundingBox] = useState(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [farmArea, setFarmArea] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const { theme, isDark } = useTheme();

  // Enhanced Animation values with better interpolation
  const mapRef = useRef(null);
  const boundingBoxAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const areaAnim = useRef(new Animated.Value(0)).current;
  const instructionsAnim = useRef(new Animated.Value(0)).current;
  const pointPulseAnims = useRef([]).current;

  // Initialize pulse animations for points
  useEffect(() => {
    selectedPoints.forEach((_, index) => {
      if (!pointPulseAnims[index]) {
        pointPulseAnims[index] = new Animated.Value(1);
        // Start pulsing animation for new point
        Animated.loop(
          Animated.sequence([
            Animated.timing(pointPulseAnims[index], {
              toValue: 1.3,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pointPulseAnims[index], {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });
  }, [selectedPoints]);

  // Analysis steps with improved icons and colors
  const analysisSteps = [
    { title: 'Analyzing Farm Land', icon: 'leaf-outline', color: '#10B981' },
    { title: 'Analyzing Soil Conditions', icon: 'earth-outline', color: '#8B4513' },
    { title: 'Fetching Nearby Mandi Prices', icon: 'trending-up-outline', color: '#F59E0B' },
    { title: 'Getting Latest Weather Updates', icon: 'partly-sunny-outline', color: '#3B82F6' },
    { title: 'Finalizing Personalized Insights', icon: 'analytics-outline', color: '#8B5CF6' },
  ];

  // India center coordinates for fallback
  const INDIA_CENTER = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 40,
    longitudeDelta: 40,
  };

  // Improved timing constants for smoother animations
  const MAP_ZOOM_DURATION = 1800;
  const DELAY_BEFORE_MESSAGE = 400;
  const MESSAGE_FADE_DURATION = 600;
  const BOUNDING_BOX_FADE_DURATION = 800;
  const AREA_DISPLAY_FADE_DURATION = 600;
  const DELAY_BEFORE_ANALYSIS_START = 2500;
  const ANALYSIS_OVERLAY_FADE_DURATION = 400;
  const TIME_PER_ANALYSIS_STEP = 1800;
  const STEP_ANIM_DURATION_OUT = 150;
  const STEP_ANIM_DURATION_IN = 400;
  const DELAY_AFTER_LAST_STEP = 1500;

  // Handle preloader completion with smooth transition
  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    getUserLocation();
  };

  // Calculate area in acres using exact polygon area
  const calculateAreaInAcres = (points) => {
    if (points.length !== 4) return 0;

    const toRadians = (degrees) => degrees * (Math.PI / 180);
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += toRadians(points[i].longitude) * toRadians(points[j].latitude);
      area -= toRadians(points[j].longitude) * toRadians(points[i].latitude);
    }

    area = Math.abs(area) / 2;
    const earthRadius = 6371000;
    const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const latRadians = toRadians(centerLat);
    const adjustedRadius = earthRadius * Math.cos(latRadians);
    const areaInSquareMeters = area * adjustedRadius * earthRadius;
    const areaInAcres = areaInSquareMeters / 4046.86;

    return Math.round(areaInAcres * 1000) / 1000;
  };

  // Get user location with improved error handling
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to provide local services.');
        const fallbackLocation = {
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setUserLocation(fallbackLocation);
        setTimeout(() => {
          animateToUserLocation({ latitude: 19.0760, longitude: 72.8777 });
        }, 300);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setTimeout(() => {
        animateToUserLocation(location.coords);
      }, 300);

    } catch (error) {
      console.error('Error getting location:', error);
      const fallbackLocation = {
        latitude: 19.0760,
        longitude: 72.8777,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setUserLocation(fallbackLocation);
      setTimeout(() => {
        animateToUserLocation({ latitude: 19.0760, longitude: 72.8777 });
      }, 300);
    }
  };

  // Enhanced map animation with spring effect
  const animateToUserLocation = (coords) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, MAP_ZOOM_DURATION);
    }

    setTimeout(() => {
      setShowSelectionMessage(true);
      Animated.spring(messageAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, MAP_ZOOM_DURATION + DELAY_BEFORE_MESSAGE);
  };

  // Improved point selection with better feedback
  const startPointSelection = () => {
    setIsSelectingPoints(true);
    setSelectedPoints([]);
    setBoundingBox(null);
    setFarmArea(null);

    // Smooth message transition
    Animated.timing(messageAnim, {
      toValue: 0,
      duration: MESSAGE_FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowSelectionMessage(false);
      // Show instructions with slide-in effect
      Animated.spring(instructionsAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  };

  // Enhanced map press handler with haptic feedback simulation
  const handleMapPress = (event) => {
    if (!isSelectingPoints || selectedPoints.length >= 4) return;

    const newPoint = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
      id: selectedPoints.length + 1,
    };

    const updatedPoints = [...selectedPoints, newPoint];
    setSelectedPoints(updatedPoints);

    if (updatedPoints.length === 4) {
      // Hide instructions smoothly
      Animated.timing(instructionsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      createBoundingBox(updatedPoints);
    }
  };

  // Enhanced bounding box creation with staggered animations
  const createBoundingBox = (points) => {
    const exactBoundingBoxCoords = [
      { latitude: points[0].latitude, longitude: points[0].longitude },
      { latitude: points[1].latitude, longitude: points[1].longitude },
      { latitude: points[2].latitude, longitude: points[2].longitude },
      { latitude: points[3].latitude, longitude: points[3].longitude },
    ];

    setBoundingBox(exactBoundingBoxCoords);
    setIsSelectingPoints(false);

    const area = calculateAreaInAcres(points);
    setFarmArea(area);

    // Staggered animation sequence
    Animated.sequence([
      Animated.spring(boundingBoxAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.spring(areaAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      startAnalysis();
    }, DELAY_BEFORE_ANALYSIS_START);
  };

  // Enhanced analysis with smoother step transitions
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentAnalysisStep(0);

    Animated.spring(loadingAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    analysisSteps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentAnalysisStep(index);

        Animated.sequence([
          Animated.timing(stepAnim, {
            toValue: 0,
            duration: STEP_ANIM_DURATION_OUT,
            useNativeDriver: true,
          }),
          Animated.spring(stepAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          })
        ]).start();

        if (index === analysisSteps.length - 1) {
          setTimeout(() => {
            navigation.replace('ChoiceScreen');
          }, DELAY_AFTER_LAST_STEP);
        }
      }, (index + 1) * TIME_PER_ANALYSIS_STEP);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />

      {showPreloader && (
        <Preloader onComplete={handlePreloaderComplete} theme={theme} />
      )}

      {!showPreloader && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={userLocation || INDIA_CENTER}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            showsTraffic={false}
            showsBuildings={false}
            showsIndoors={false}
            showsIndoorLevelPicker={false}
            showsPointsOfInterest={false}
            mapType="satellite"
            onPress={handleMapPress}
          >
            {selectedPoints.map((point, index) => (
              <Marker
                key={point.id}
                coordinate={point}
                title={`Point ${point.id}`}
              >
                <Animated.View 
                  style={[
                    styles.pointMarker,
                    {
                      transform: [
                        { 
                          scale: pointPulseAnims[index] || 1 
                        }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.pointNumber}>{point.id}</Text>
                </Animated.View>
              </Marker>
            ))}

            {boundingBox && (
              <Polygon
                coordinates={boundingBox}
                fillColor="rgba(16, 185, 129, 0.25)"
                strokeColor="rgba(16, 185, 129, 0.9)"
                strokeWidth={3}
              />
            )}
          </MapView>

          {/* Enhanced Farm Area Overlay */}
          {boundingBox && farmArea && (
            <Animated.View
              style={[
                styles.areaOverlay,
                {
                  opacity: areaAnim,
                  transform: [
                    { 
                      scale: areaAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      })
                    },
                    {
                      translateY: areaAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      })
                    }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.12)']}
                style={[styles.areaGradient, { borderColor: theme.colors.border }]}
              >
                <View style={[styles.areaIconContainer, { backgroundColor: theme.colors.surface }]}> 
                  <Ionicons name="calculator-outline" size={24} color={theme.colors.text} />
                </View>
                <View style={styles.areaTextContainer}>
                  <Text style={[styles.areaValue, { color: theme.colors.text }]}>{farmArea}</Text>
                  <Text style={[styles.areaUnit, { color: theme.colors.textSecondary }]}>acres</Text>
                </View>
                <View style={styles.areaLabelContainer}>
                  <Text style={[styles.areaLabel, { color: theme.colors.textSecondary }]}>Farm Area</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Enhanced Selection Message */}
          {showSelectionMessage && (
            <Animated.View
              style={[
                styles.selectionMessage,
                {
                  opacity: messageAnim,
                  transform: [
                    {
                      translateY: messageAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      })
                    },
                    {
                      scale: messageAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      })
                    }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.06)', 'rgba(5, 150, 105, 0.06)']}
                style={[styles.selectionGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="hand-left-outline" size={28} color={theme.colors.text} />
                <Text style={[styles.selectionTitle, { color: theme.colors.headerTitle }]}>Select Your Farm Land</Text>
                <Text style={[styles.selectionSubtext, { color: theme.colors.textSecondary }]}> 
                  Tap 4 points around your farm boundary to calculate area
                </Text>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: theme.colors.card }]}
                  onPress={startPointSelection}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.startButtonText, { color: theme.colors.primary }]}>Start Selection</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Enhanced Point Selection Instructions */}
          {isSelectingPoints && (
            <Animated.View
              style={[
                styles.instructionsBox,
                {
                  opacity: instructionsAnim,
                  transform: [
                    {
                      translateY: instructionsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      })
                    }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)'] : ['rgba(255,255,255,0.95)', 'rgba(246,247,249,0.95)']}
                style={[styles.instructionsGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.instructionsText, { color: theme.colors.text }]}>
                  Tap {4 - selectedPoints.length} more point(s) to define your farm boundary
                </Text>
                <View style={[styles.pointsCounter, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.pointsText, { color: theme.colors.card }]}>
                    {selectedPoints.length}/4
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Enhanced Bounding Box Message */}
          {boundingBox && !isAnalyzing && (
            <Animated.View
              style={[
                styles.boundingBoxMessage,
                {
                  opacity: boundingBoxAnim,
                  transform: [
                    {
                      translateY: boundingBoxAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      })
                    }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.06)', 'rgba(5, 150, 105, 0.06)']}
                style={[styles.boundingBoxGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.boundingBoxText, { color: theme.colors.text }]}>Farm boundary created!</Text>
                <Text style={[styles.boundingBoxSubText, { color: theme.colors.textSecondary }]}> 
                  Area: {farmArea} acres • Starting analysis...
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Enhanced Analysis Loading Screen */}
          {isAnalyzing && (
            <Animated.View
              style={[
                styles.loadingOverlay,
                {
                  opacity: loadingAnim,
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.9)'] : ['rgba(255,255,255,0.98)', 'rgba(246,247,249,0.98)']}
                style={[styles.loadingGradient, { borderColor: theme.colors.border }]}
              >
                <View style={styles.loadingContent}>
                  <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Analyzing Your Farm</Text>

                  <Animated.View
                    style={[
                      styles.currentStepContainer,
                      {
                        opacity: stepAnim,
                        transform: [
                          {
                            scale: stepAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1],
                            })
                          }
                        ],
                      },
                    ]}
                  >
                    <View style={[styles.stepIconContainer, { backgroundColor: analysisSteps[currentAnalysisStep].color }]}>
                      <Ionicons
                        name={analysisSteps[currentAnalysisStep].icon}
                        size={32}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={[styles.currentStepText, { color: theme.colors.text }]}>
                      {analysisSteps[currentAnalysisStep].title}
                    </Text>
                  </Animated.View>

                  <View style={styles.progressSteps}>
                    {analysisSteps.map((step, index) => (
                      <View key={index} style={styles.stepRow}>
                        <View style={[
                          styles.stepDot,
                          index <= currentAnalysisStep && [styles.stepDotCompleted, { backgroundColor: step.color }]
                        ]}>
                          {index < currentAnalysisStep && (
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={[
                          styles.stepText,
                          index <= currentAnalysisStep && styles.stepTextCompleted,
                          { color: index <= currentAnalysisStep ? theme.colors.text : theme.colors.textSecondary }
                        ]}>
                          {step.title}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.loadingAnimation}>
                    {[0, 1, 2].map((index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.loadingDot,
                          { backgroundColor: theme.colors.primary }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  // Enhanced Preloader Styles
  preloaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 3000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainWord: {
    fontSize: 52,
    fontWeight: '800',
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Enhanced Point Marker
  pointMarker: {
    backgroundColor: '#10B981',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pointNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Enhanced Area Overlay
  areaOverlay: {
    position: 'absolute',
    top: height * 0.15,
    right: 20,
    zIndex: 1000,
  },
  areaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  areaIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 8,
    marginRight: 12,
  },
  areaTextContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  areaValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  areaUnit: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  areaLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.85,
  },
  // Enhanced Selection Message
  selectionMessage: {
    position: 'absolute',
    top: height * 0.16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  selectionGradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  selectionSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#10B981',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Enhanced Instructions Box
  instructionsBox: {
    position: 'absolute',
    top: height * 0.08,
    left: 14,
    right: 14,
    zIndex: 1000,
  },
  instructionsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  pointsCounter: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  // Enhanced Bounding Box Message
  boundingBoxMessage: {
    position: 'absolute',
    bottom: height * 0.18,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  boundingBoxGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  boundingBoxText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  boundingBoxSubText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  // Enhanced Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 50,
    textAlign: 'center',
    letterSpacing: 1,
  },
  currentStepContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  currentStepText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSteps: {
    width: '100%',
    marginBottom: 30,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    flex: 1,
    lineHeight: 20,
  },
  stepTextCompleted: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginHorizontal: 6,
    opacity: 0.7,
  },
});

export default FetchingLocationScreen;
