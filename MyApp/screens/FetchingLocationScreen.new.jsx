import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  TouchableOpacity,
  Easing,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Preloader Component (adjusted)
const Preloader = ({ onComplete, theme, isDark }) => {
  const [index, setIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(0)).current;

  const words = [
    "किसान",
    "రైతు",
    "ಶೇತಕ",
    "কৃষক",
    "ખેડૂત",
    "ਕਿਸਾਨ",
    "உழவன்",
    "Farmer",
  ];
  words[2] = "ರೈತ";

  const FADE_IN_DURATION_PRELOADER = 300;
  const DELAY_BEFORE_NEXT_WORD_PRELOADER = 400;
  const SLIDE_UP_DURATION_PRELOADER = 600;
  const SLIDE_UP_DELAY_PRELOADER = 200;

  useEffect(() => {
    opacityAnim.setValue(0);
    Animated.timing(opacityAnim, {
      toValue: 0.75,
      duration: FADE_IN_DURATION_PRELOADER,
      delay: 30,
      useNativeDriver: true,
    }).start(() => {
      if (index < words.length - 1) {
        setTimeout(() => setIndex(prev => prev + 1), DELAY_BEFORE_NEXT_WORD_PRELOADER);
      } else {
        setTimeout(() => {
          Animated.timing(slideUpAnim, {
            toValue: -height,
            duration: SLIDE_UP_DURATION_PRELOADER,
            delay: SLIDE_UP_DELAY_PRELOADER,
            useNativeDriver: true,
          }).start(() => onComplete && onComplete());
        }, DELAY_BEFORE_NEXT_WORD_PRELOADER);
      }
    });
  }, [index, onComplete, opacityAnim, slideUpAnim, height, words.length]);

  return (
    <Animated.View
      style={[
        styles.preloaderContainer,
        { transform: [{ translateY: slideUpAnim }], backgroundColor: theme?.colors?.background || (isDark ? '#000' : '#000') },
      ]}
    >
      <StatusBar barStyle={theme?.colors?.statusBarStyle || 'light-content'} />
      <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(16,25,40,0.95)']} style={styles.preloaderGradient}>
        <View style={styles.wordContainer}>
          <Animated.View style={[styles.wordWrapper, { opacity: opacityAnim }]}>
            <Text style={[styles.mainWord, { color: theme?.colors?.primary || '#10B981' }]}>{words[index]}</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// FetchingLocationScreen
const FetchingLocationScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [boundingBox, setBoundingBox] = useState(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [showSelectionMessage, setShowSelectionMessage] = useState(false);
  const [farmArea, setFarmArea] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true); // Control preloader visibility
  const { theme, isDark } = useTheme();

  // Animation values
  const mapRef = useRef(null);
  const boundingBoxAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;
  const areaAnim = useRef(new Animated.Value(0)).current;

  // Analysis steps (unchanged timings from previous full code, as only preloader was modified)
  const analysisSteps = [
    { title: 'Analyzing Farm Land', icon: 'leaf', color: '#10B981' },
    { title: 'Analyzing Soil Conditions', icon: 'earth', color: '#8B4513' },
    { title: 'Fetching Nearby Mandi Prices', icon: 'trending-up', color: '#F59E0B' },
    { title: 'Getting Latest Weather Updates', icon: 'partly-sunny', color: '#3B82F6' },
    { title: 'Finalizing Personalized Insights', icon: 'analytics', color: '#8B5CF6' },
  ];

  // India center coordinates for fallback
  const INDIA_CENTER = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 40,
    longitudeDelta: 40,
  };

  // --- TIMING CONSTANTS FOR MAIN SCREEN (unchanged from previous version) ---
  const MAP_ZOOM_DURATION = 1500;
  const DELAY_BEFORE_MESSAGE = 500;
  const MESSAGE_FADE_DURATION = 500;
  const BOUNDING_BOX_FADE_DURATION = 1000;
  const AREA_DISPLAY_FADE_DURATION = 800;
  const DELAY_BEFORE_ANALYSIS_START = 3000;
  const ANALYSIS_OVERLAY_FADE_DURATION = 500;
  const TIME_PER_ANALYSIS_STEP = 1500;
  const STEP_ANIM_DURATION_OUT = 200;
  const STEP_ANIM_DURATION_IN = 300;
  const DELAY_AFTER_LAST_STEP = 2000;


  // Handle preloader completion
  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    // Start getting user location after preloader
    getUserLocation();
  };

  // Calculate area in acres using exact polygon area
  const calculateAreaInAcres = (points) => {
    if (points.length !== 4) return 0;

    // Convert coordinates to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    // Calculate area using shoelace formula for exact polygon
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += toRadians(points[i].longitude) * toRadians(points[j].latitude);
      area -= toRadians(points[j].longitude) * toRadians(points[i].latitude);
    }

    area = Math.abs(area) / 2;

    // Convert to square meters using exact Earth radius at the location
    const earthRadius = 6371000; // meters
    const centerLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const latRadians = toRadians(centerLat);

    // Adjust for latitude (Earth is not perfectly spherical)
    const adjustedRadius = earthRadius * Math.cos(latRadians);
    const areaInSquareMeters = area * adjustedRadius * earthRadius;

    // Convert to acres (1 acre = 4046.86 square meters)
    const areaInAcres = areaInSquareMeters / 4046.86;

    return Math.round(areaInAcres * 1000) / 1000; // Round to 3 decimal places for accuracy
  };

  // Get user location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to provide local services.');
        // Fallback to a default location in India
        setUserLocation({
          latitude: 19.0760, // Mumbai
          longitude: 72.8777,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        // Animate to fallback location if permission denied
        setTimeout(() => {
          animateToUserLocation({ latitude: 19.0760, longitude: 72.8777 });
        }, 500); // Small delay to allow map to render
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

      // Start location animation immediately after 0.5 seconds
      setTimeout(() => {
        animateToUserLocation(location.coords);
      }, 500);

    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to a default location in India on error
      setUserLocation({
        latitude: 19.0760, // Mumbai
        longitude: 72.8777,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setTimeout(() => {
        animateToUserLocation({ latitude: 19.0760, longitude: 72.8777 });
      }, 500);
    }
  };

  // Animate map to user location
  const animateToUserLocation = (coords) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, MAP_ZOOM_DURATION); // Moderate zoom animation
    }

    // Show selection message after zoom completes
    setTimeout(() => {
      setShowSelectionMessage(true);
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: MESSAGE_FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }, MAP_ZOOM_DURATION + DELAY_BEFORE_MESSAGE);
  };

  // Start point selection process
  const startPointSelection = () => {
    setIsSelectingPoints(true);
    setSelectedPoints([]);
    setBoundingBox(null);
    setFarmArea(null);

    // Hide selection message
    Animated.timing(messageAnim, {
      toValue: 0,
      duration: MESSAGE_FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      setShowSelectionMessage(false);
    });
  };

  // Handle map press to add points with improved visual feedback
  const handleMapPress = (event) => {
    if (!isSelectingPoints || selectedPoints.length >= 4) return;

    // Create point with animation properties
    const newPoint = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude,
      id: selectedPoints.length + 1,
    };

    const updatedPoints = [...selectedPoints, newPoint];
    setSelectedPoints(updatedPoints);
    
    // Add haptic feedback if available
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Ignore errors if haptics not available
    }

    // If 4 points are selected, create bounding box
    if (updatedPoints.length === 4) {
      createBoundingBox(updatedPoints);
    }
  };

  // Create exact bounding box from 4 points (no approximation)
  const createBoundingBox = (points) => {
    // Use the exact 4 points selected by the user
    const exactBoundingBoxCoords = [
      { latitude: points[0].latitude, longitude: points[0].longitude },
      { latitude: points[1].latitude, longitude: points[1].longitude },
      { latitude: points[2].latitude, longitude: points[2].longitude },
      { latitude: points[3].latitude, longitude: points[3].longitude },
    ];

    setBoundingBox(exactBoundingBoxCoords);
    setIsSelectingPoints(false);

    // Calculate farm area using exact points
    const area = calculateAreaInAcres(points);
    setFarmArea(area);

    // Animate bounding box appearance
    Animated.timing(boundingBoxAnim, {
      toValue: 1,
      duration: BOUNDING_BOX_FADE_DURATION,
      useNativeDriver: true,
    }).start();

    // Animate area overlay appearance
    Animated.timing(areaAnim, {
      toValue: 1,
      duration: AREA_DISPLAY_FADE_DURATION,
      delay: BOUNDING_BOX_FADE_DURATION / 2, // Start halfway through the bounding box animation
      useNativeDriver: true,
    }).start();

    // Start analysis after a delay
    setTimeout(() => {
      startAnalysis();
    }, DELAY_BEFORE_ANALYSIS_START);
  };

  // Start analysis process
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentAnalysisStep(0);

    // Animate analysis overlay appearance
    Animated.timing(loadingAnim, {
      toValue: 1,
      duration: ANALYSIS_OVERLAY_FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Animate first step appearance
      animateStepIn(0);
    });
  };

  // Animate step in
  const animateStepIn = (stepIndex) => {
    // Reset step animation value
    stepAnim.setValue(0);

    // Set current step
    setCurrentAnalysisStep(stepIndex);

    // Animate step in
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: STEP_ANIM_DURATION_IN,
      useNativeDriver: true,
    }).start(() => {
      // Wait for step display time then animate out
      setTimeout(() => {
        if (stepIndex < analysisSteps.length - 1) {
          animateStepOut(stepIndex);
        } else {
          // This is the last step, finish the analysis after display time
          setTimeout(() => {
            finishAnalysis();
          }, DELAY_AFTER_LAST_STEP);
        }
      }, TIME_PER_ANALYSIS_STEP);
    });
  };

  // Animate step out
  const animateStepOut = (stepIndex) => {
    Animated.timing(stepAnim, {
      toValue: 0,
      duration: STEP_ANIM_DURATION_OUT,
      useNativeDriver: true,
    }).start(() => {
      // Animate next step in
      animateStepIn(stepIndex + 1);
    });
  };

  // Finish analysis and navigate to results
  const finishAnalysis = () => {
    // Animate analysis overlay out
    Animated.timing(loadingAnim, {
      toValue: 0,
      duration: ANALYSIS_OVERLAY_FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to results screen
      navigation.navigate('CropIntelligenceScreen', {
        farmArea: farmArea,
        boundaryPoints: boundingBox,
      });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />

      {/* Show preloader first */}
      {showPreloader && (
        <Preloader onComplete={handlePreloaderComplete} theme={theme} isDark={isDark} />
      )}

      {/* Main app content - only show after preloader completes */}
      {!showPreloader && (
        <>
          {/* Satellite Map View */}
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={userLocation || INDIA_CENTER} // Use userLocation if available, else INDIA_CENTER
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
            {/* Selected points markers */}
            {selectedPoints.map((point) => (
              <Marker
                key={point.id}
                coordinate={point}
                title={`Point ${point.id}`}
              >
                <View style={styles.pointMarker}>
                  <Text style={styles.pointNumber}>{point.id}</Text>
                </View>
              </Marker>
            ))}

            {/* Accurate bounding box polygon */}
            {boundingBox && (
              <Polygon
                coordinates={boundingBox}
                fillColor="rgba(16, 185, 129, 0.2)"
                strokeColor="rgba(16, 185, 129, 0.9)"
                strokeWidth={4}
              />
            )}
          </MapView>

          {/* Farm Area Overlay */}
          {boundingBox && farmArea && (
            <Animated.View
              style={[
                styles.areaOverlay,
                {
                  opacity: areaAnim,
                  transform: [
                    { scale: areaAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      })},
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.12)']}
                style={[styles.areaGradient, { borderColor: theme.colors.border }]}
              >
                <View style={[styles.areaIconContainer, { backgroundColor: theme.colors.surface }]}> 
                  <Ionicons name="calculator" size={24} color={theme.colors.text} />
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

          {/* Selection Message Overlay */}
          {showSelectionMessage && (
            <Animated.View
              style={[
                styles.selectionMessage,
                {
                  opacity: messageAnim,
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.06)', 'rgba(5, 150, 105, 0.06)']}
                style={[styles.selectionGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="hand-left" size={28} color={theme.colors.text} />
                <Text style={[styles.selectionTitle, { color: theme.colors.headerTitle }]}>Select Your Farm Land</Text>
                <Text style={[styles.selectionSubtext, { color: theme.colors.textSecondary }]}> 
                  Tap 4 points around your farm boundary to calculate area
                </Text>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: theme.colors.card }]}
                  onPress={startPointSelection}
                >
                  <Text style={[styles.startButtonText, { color: theme.colors.primary }]}>Start Selection</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Point Selection Instructions */}
          {isSelectingPoints && (
            <Animated.View
              style={[
                styles.instructionsBox,
                {
                  opacity: 1, // Always visible when selecting
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.8)'] : ['rgba(255,255,255,0.95)', 'rgba(246,247,249,0.95)']}
                style={[styles.instructionsGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="hand-left" size={24} color={theme.colors.text} />
                <Text style={[styles.instructionsText, { color: theme.colors.text }]}>
                  Tap {4 - selectedPoints.length} more point(s) to define your farm boundary
                </Text>
                <Text style={[styles.pointsText, { color: theme.colors.primary }]}>
                  {selectedPoints.length}/4
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Bounding Box Created Message */}
          {boundingBox && !isAnalyzing && (
            <Animated.View
              style={[
                styles.boundingBoxMessage,
                {
                  opacity: boundingBoxAnim,
                },
              ]}
            >
              <LinearGradient
                colors={isDark ? ['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)'] : ['rgba(16, 185, 129, 0.06)', 'rgba(5, 150, 105, 0.06)']}
                style={[styles.boundingBoxGradient, { borderColor: theme.colors.border }]}
              >
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                <Text style={[styles.boundingBoxText, { color: theme.colors.text }]}>Farm boundary created!</Text>
                <Text style={[styles.boundingBoxSubText, { color: theme.colors.textSecondary }]}> 
                  Area: {farmArea} acres • Starting analysis...
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Analysis Loading Screen */}
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

                  {/* Current Step */}
                  <Animated.View
                    style={[
                      styles.currentStepContainer,
                      {
                        opacity: stepAnim,
                      },
                    ]}
                  >
                    <View style={styles.stepIconContainer}>
                      <Ionicons
                        name={analysisSteps[currentAnalysisStep].icon}
                        size={32}
                        color={analysisSteps[currentAnalysisStep].color}
                      />
                    </View>
                    <Text style={[styles.currentStepText, { color: theme.colors.text }]}>
                      {analysisSteps[currentAnalysisStep].title}
                    </Text>
                  </Animated.View>

                  {/* Progress Steps */}
                  <View style={styles.progressSteps}>
                    {analysisSteps.map((step, index) => (
                        <View key={index} style={styles.stepRow}>
                        <View style={[
                          styles.stepDot,
                          index <= currentAnalysisStep && styles.stepDotCompleted
                        ]}>
                          {index < currentAnalysisStep && (
                            <Ionicons name="checkmark" size={12} color={theme.colors.card} />
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

                  {/* Loading Animation (Dots) */}
                  <View style={styles.loadingAnimation}>
                    <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.loadingDot, { backgroundColor: theme.colors.primary }]} />
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // overridden at runtime with theme when rendered
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
    overflow: 'hidden',
  },
  preloaderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: width * 0.8,
  },
  wordWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mainWord: {
    fontSize: 56, // Larger font size for better visibility
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    textShadowColor: 'rgba(16, 185, 129, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
    letterSpacing: 1,
  },
  wordUnderline: {
    height: 3,
    width: '60%',
    backgroundColor: '#10B981',
    marginTop: 8,
    borderRadius: 2,
  },
  // Existing styles below remain unchanged
  pointMarker: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  pointNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  areaOverlay: {
    position: 'absolute',
    top: height * 0.15,
    right: 20,
    zIndex: 1000,
  },
  areaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
    marginRight: 10,
  },
  areaTextContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  areaValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  areaUnit: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  areaLabelContainer: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    paddingLeft: 8,
  },
  areaLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  selectionMessage: {
    position: 'absolute',
    top: height * 0.2,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  selectionGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  selectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  selectionSubtext: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#10B981',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  instructionsBox: {
    position: 'absolute',
    top: height * 0.1,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  instructionsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pointsText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  boundingBoxMessage: {
    position: 'absolute',
    bottom: height * 0.2,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  boundingBoxGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  boundingBoxText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  boundingBoxSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '400',
  },
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
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  currentStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  currentStepText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressSteps: {
    width: '100%',
    marginBottom: 40,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  stepText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    flex: 1,
  },
  stepTextCompleted: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginHorizontal: 4,
    opacity: 0.6,
  },
});

export default FetchingLocationScreen;
