import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
  SafeAreaView,
  ImageBackground,
  Alert,
  Easing,
} from 'react-native';
import { PinchGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const TILE_SIZE = Math.floor(width / 12); // Larger tiles for better visibility
const GRID_SIZE = 16; // Smaller grid for mobile optimization
const HEADER_HEIGHT = 140;
const TOOLBAR_HEIGHT = 100;
const SIDEBAR_WIDTH = 60;

// Game State Management
const createInitialGameState = () => {
  const farmGrid = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      id: `${x}-${y}`,
      x, y,
      type: x < 2 && y < 2 ? 'farmhouse' : 
            x === 8 && y === 8 ? 'well' :
            x === 12 && y === 4 ? 'silo' :
            x > 17 || y > 17 ? 'forest' : 'soil',
      isTilled: false,
      crop: null,
      moisture: Math.random() * 40 + 30,
      fertility: Math.random() * 30 + 50,
      ph: Math.random() * 2 + 6,
      pests: Math.floor(Math.random() * 20),
      lastWatered: 0,
      daysPlanted: 0,
      animating: false,
    }))
  );

  return {
    // Player Profile
    farmer: {
      name: "Rajesh 'The Legend' Kumar",
      level: 5,
      xp: 2340,
      nextLevelXP: 3000,
      wallet: 47500,
      energy: 85,
      maxEnergy: 100,
    },
    
    // Time System
    time: {
      hour: 8,
      minute: 30,
      day: 15,
      month: 'March',
      season: 'Spring',
      year: 2024,
      gameSpeed: 1,
    },
    
    // Weather System
    weather: {
      current: 'sunny',
      temperature: 24,
      humidity: 68,
      windSpeed: 12,
      pressure: 1013,
      forecast: [
        { day: 'Today', condition: 'sunny', temp: 24, rain: 0 },
        { day: 'Tomorrow', condition: 'cloudy', temp: 22, rain: 20 },
        { day: 'Day 3', condition: 'rainy', temp: 19, rain: 85 },
      ],
      isRaining: false,
      rainIntensity: 0,
    },
    
    // Farm Ecosystem
    farm: {
      grid: farmGrid,
      ecosystem: {
        soilHealth: 78,
        waterTable: 92,
        biodiversity: 65,
        pestLevel: 12,
        airQuality: 88,
        carbonFootprint: 45,
      },
      structures: {
        farmhouse: { level: 2, comfort: 85, residents: 3 },
        well: { level: 1, capacity: 1200, current: 980, quality: 94 },
        silo: { level: 1, capacity: 800, stored: { wheat: 245, corn: 180, rice: 95 } },
        greenhouse: { level: 0, built: false },
        workshop: { level: 1, efficiency: 75 },
      },
      stats: {
        totalCropsHarvested: 1247,
        totalRevenue: 89600,
        seasonsCompleted: 4,
        achievements: ['First Harvest', 'Water Wise', 'Pest Fighter'],
      },
    },
    
    // Advanced Inventory
    inventory: {
      selectedTool: 'select',
      tools: [
        { id: 'select', name: 'Inspect', emoji: '👁️', color: '#3B82F6', energy: 0 },
        { id: 'plow', name: 'Plow', emoji: '🚜', color: '#8B4513', energy: 5 },
        { id: 'plant', name: 'Plant', emoji: '🌱', color: '#22C55E', energy: 3 },
        { id: 'water', name: 'Water', emoji: '💧', color: '#06B6D4', energy: 2 },
        { id: 'fertilize', name: 'Fertilize', emoji: '🌿', color: '#84CC16', energy: 4 },
        { id: 'pesticide', name: 'Pesticide', emoji: '🦟', color: '#EF4444', energy: 3 },
        { id: 'harvest', name: 'Harvest', emoji: '🌾', color: '#F59E0B', energy: 6 },
      ],
      seeds: {
        wheat: { quantity: 87, price: 8, growthTime: 5, season: 'Spring' },
        corn: { quantity: 45, price: 12, growthTime: 7, season: 'Summer' },
        rice: { quantity: 62, price: 15, growthTime: 8, season: 'Monsoon' },
        tomato: { quantity: 23, price: 20, growthTime: 6, season: 'Spring' },
      },
      resources: {
        water: 89,
        fertilizer: 67,
        pesticide: 34,
        fuel: 78,
        electricity: 92,
      },
    },
    
    // Market System
    market: {
      prices: {
        wheat: { current: 24, trend: 'up', change: +12 },
        corn: { current: 31, trend: 'down', change: -8 },
        rice: { current: 42, trend: 'stable', change: +2 },
        tomato: { current: 65, trend: 'up', change: +18 },
      },
      demand: { wheat: 'high', corn: 'medium', rice: 'low', tomato: 'very_high' },
      globalEvents: [
        'Drought in neighboring regions increases grain prices',
        'New trade agreement opens export opportunities',
      ],
    },
    
    // Factions & Reputation
    factions: {
      townCouncil: { reputation: 72, level: 'Respected', perks: ['Tax Reduction'] },
      ecoWarriors: { reputation: 58, level: 'Friendly', perks: ['Organic Bonus'] },
      agriCorp: { reputation: 34, level: 'Neutral', perks: [] },
      scientists: { reputation: 81, level: 'Trusted', perks: ['Research Access'] },
    },
    
    // Quests & Events
    activeQuests: [
      {
        id: 'harvest_festival',
        title: 'Harvest Festival Preparation',
        description: 'Deliver 500 units of mixed crops for the town festival',
        progress: 340,
        target: 500,
        reward: 15000,
        timeLeft: 5,
      },
      {
        id: 'eco_challenge',
        title: 'Go Green Challenge',
        description: 'Improve soil health to 85% without chemical fertilizers',
        progress: 78,
        target: 85,
        reward: 8000,
        timeLeft: 12,
      },
    ],
    
    // Game State
    gameLog: [
      '🌅 New day begins! Energy restored.',
      '💰 Sold 50 wheat for ₹1,200',
      '🌧️ Light rain detected - crops are happy!',
      '🏆 Achievement unlocked: Master Farmer',
      '📈 Market prices updated',
    ],
    
    notifications: [
      { id: 1, text: 'Wheat in Field A-3 is ready for harvest!', type: 'success', urgent: true },
      { id: 2, text: 'Water level in well is getting low', type: 'warning', urgent: false },
      { id: 3, text: 'Pest activity detected in sector B', type: 'danger', urgent: true },
    ],
    
    selectedTile: null,
    showModal: null,
    weatherEffects: [],
    soundEnabled: true,
    hapticEnabled: true,
  };
};

// Preloader animation (adapted from FetchingLocationScreen)
const Preloader = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const words = [
    '🌱 Planting Crops...',
    '🐄 Summoning Cows...',
    '🌾 Growing Wheat...',
    '🌧️ Spawning Rain...',
    '🧙‍♂️ Loading Farm Magic...',
    '🚜 Warming Up Tractor...',
    '🪄 Leveling Up Soil...',
    '🏆 Ready for Harvest!'
  ];
  const FADE_IN_DURATION = 200;
  const DELAY_BEFORE_NEXT_WORD = 350;
  const SLIDE_UP_DURATION = 400;
  const SLIDE_UP_DELAY = 50;

  useEffect(() => {
    opacityAnim.setValue(0);
    Animated.timing(opacityAnim, {
      toValue: 0.85,
      duration: FADE_IN_DURATION,
      delay: 30,
      useNativeDriver: true,
    }).start(() => {
      if (index < words.length - 1) {
        setTimeout(() => setIndex(prev => prev + 1), DELAY_BEFORE_NEXT_WORD);
      } else {
        setTimeout(() => {
          Animated.timing(slideUpAnim, {
            toValue: -height,
            duration: SLIDE_UP_DURATION,
            delay: SLIDE_UP_DELAY,
            useNativeDriver: true,
          }).start(() => onComplete && onComplete());
        }, DELAY_BEFORE_NEXT_WORD);
      }
    });
  }, [index]);

  return (
    <Animated.View style={[styles.preloaderContainer, { transform: [{ translateY: slideUpAnim }] }]}> 
      <View style={styles.wordContainer}>
        <Animated.View style={[styles.wordWrapper, { opacity: opacityAnim }]}> 
          <Text style={styles.mainWord}>{words[index]}</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// Main Game Component
const FarmSimLegendary = ({ navigation }) => {
  const [gameState, setGameState] = useState(createInitialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [showWeatherEffects, setShowWeatherEffects] = useState(false);
  const zoomLevel = useRef(new Animated.Value(1)).current;
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedTileAnimation, setSelectedTileAnimation] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rainDrops = useRef([]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const xpBarAnim = useRef(new Animated.Value(0)).current;
  const coinAnim = useRef(new Animated.Value(1)).current;
  const energyBarAnim = useRef(new Animated.Value(1)).current;
  const actionCooldowns = useRef({}).current;
  const notificationAnim = useRef(new Animated.Value(0)).current;

  // Game Loop - Handles time progression and automatic events
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const newState = { ...prev };
        
        // Time progression
        newState.time.minute += 15;
        if (newState.time.minute >= 60) {
          newState.time.minute = 0;
          newState.time.hour += 1;
          
          if (newState.time.hour >= 24) {
            newState.time.hour = 0;
            newState.time.day += 1;
            newState.farmer.energy = Math.min(100, newState.farmer.energy + 25);
          }
        }
        
        // Weather changes
        if (Math.random() < 0.1) {
          const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy'];
          newState.weather.current = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
          newState.weather.isRaining = newState.weather.current === 'rainy' || newState.weather.current === 'stormy';
        }
        
        // Crop growth and maintenance
        newState.farm.grid = newState.farm.grid.map(row =>
          row.map(tile => {
            if (tile.crop) {
              const crop = { ...tile.crop };
              
              // Natural moisture loss
              crop.moisture = Math.max(0, crop.moisture - 3);
              
              // Rain bonus
              if (newState.weather.isRaining) {
                crop.moisture = Math.min(100, crop.moisture + 20);
              }
              
              // Growth progression
              if (crop.moisture > 30 && tile.fertility > 40) {
                crop.growthStage = Math.min(5, crop.growthStage + 0.15);
                crop.health = Math.min(100, crop.health + 2);
              } else {
                crop.health = Math.max(0, crop.health - 3);
              }
              
              // Pest increases over time
              if (Math.random() < 0.07) {
                tile.pests = Math.min(100, tile.pests + Math.floor(Math.random() * 15));
              }
              
              return { ...tile, crop };
            }
            return tile;
          })
        );
        
        // Cooldown management
        Object.keys(actionCooldowns).forEach(key => {
          if (actionCooldowns[key] > 0) {
            actionCooldowns[key] -= 1;
          }
        });
        
        // Random events with enhanced rewards
        if (Math.random() < 0.03) {
          const events = [
            '🌟 LUCKY STRIKE! Found legendary seeds in the forest!',
            '📰 BREAKING: Market surge boosts all crop prices by 25%!',
            '🦋 Butterfly migration super-charges pollination rates!',
            '🌡️ Perfect weather conditions detected - crops growing faster!',
            '💎 Rare mineral deposit discovered - soil fertility increased!',
          ];
          newState.gameLog.unshift(events[Math.floor(Math.random() * events.length)]);
          newState.gameLog = newState.gameLog.slice(0, 50);
          
          // Add bonus resources
          if (Math.random() < 0.5) {
            newState.farmer.wallet += Math.floor(Math.random() * 2000) + 500;
          }
        }
        
        return newState;
      });
    }, 2500); // Faster game loop for more dynamic experience

    return () => clearInterval(gameLoop);
  }, []);

  // Notification animation trigger
  useEffect(() => {
    if (gameState.notifications.length > 0) {
      Animated.sequence([
        Animated.timing(notificationAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(5000),
        Animated.timing(notificationAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [gameState.notifications.length]);

  // Initialize game with loading animation
  useEffect(() => {
    const loadGame = async () => {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };

    loadGame();
  }, []);

  // Weather effects animation
  useEffect(() => {
    if (gameState.weather.isRaining) {
      setShowWeatherEffects(true);
      // Create rain animation
      const rainAnimation = Animated.loop(
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      );
      rainAnimation.start();
      
      return () => rainAnimation.stop();
    } else {
      setShowWeatherEffects(false);
    }
  }, [gameState.weather.isRaining]);

  // Tile interaction handler
  const handleTilePress = useCallback((tile) => {
    const { selectedTool } = gameState.inventory;
    const tool = gameState.inventory.tools.find(t => t.id === selectedTool);
    
    if (gameState.farmer.energy < tool.energy) {
      Alert.alert(
        t('farm.energy_title', '⚡ Insufficient Energy'),
        t('farm.energy_message', 'Rest or consume energy items to continue farming!')
      );
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      const targetTile = newState.farm.grid[tile.y][tile.x];
      const newLog = [...newState.gameLog];
      
      // Animate tile with enhanced effects
      targetTile.animating = true;
      setTimeout(() => {
        setGameState(current => {
          const updated = { ...current };
          updated.farm.grid[tile.y][tile.x].animating = false;
          return updated;
        });
      }, 1500);
      
      // Trigger energy animation
      triggerEnergyAnimation();
      
      switch (selectedTool) {
        case 'select':
          newState.selectedTile = tile;
          newState.showModal = 'tileInfo';
          break;
          
        case 'plow':
          if (targetTile.type === 'soil' && !targetTile.isTilled) {
            targetTile.isTilled = true;
            targetTile.fertility += 15;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 8;
            newLog.unshift(`🚜 Masterfully plowed fertile soil at (${tile.x}, ${tile.y})`);
            
            // Add plowing cooldown
            actionCooldowns['plow'] = 3;
          }
          break;
          
        case 'plant':
          if (targetTile.isTilled && !targetTile.crop && newState.inventory.seeds.wheat.quantity > 0) {
            targetTile.crop = {
              type: 'wheat',
              growthStage: 0,
              health: 100,
              moisture: 70,
              daysPlanted: 0,
              expectedYield: Math.floor(Math.random() * 25) + 15,
            };
            newState.inventory.seeds.wheat.quantity -= 1;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 12;
            newLog.unshift(`🌱 Planted premium wheat seeds at (${tile.x}, ${tile.y})`);
            
            actionCooldowns['plant'] = 2;
          }
          break;
          
        case 'water':
          if (targetTile.crop && newState.inventory.resources.water > 0) {
            targetTile.crop.moisture = Math.min(100, targetTile.crop.moisture + 40);
            targetTile.crop.health += 8;
            targetTile.lastWatered = Date.now();
            newState.inventory.resources.water -= 2;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 5;
            newLog.unshift(`💧 Expertly watered ${targetTile.crop.type} at (${tile.x}, ${tile.y})`);
            
            actionCooldowns['water'] = 1;
          }
          break;
          
        case 'fertilize':
          if (targetTile.crop && newState.inventory.resources.fertilizer > 0) {
            targetTile.fertility += 30;
            targetTile.crop.health += 20;
            newState.inventory.resources.fertilizer -= 1;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 10;
            newLog.unshift(`🌿 Applied premium fertilizer to ${targetTile.crop.type} at (${tile.x}, ${tile.y})`);
            
            actionCooldowns['fertilize'] = 4;
          }
          break;
          
        case 'pesticide':
          if (targetTile.pests > 0 && newState.inventory.resources.pesticide > 0) {
            targetTile.pests = Math.max(0, targetTile.pests - 70);
            newState.inventory.resources.pesticide -= 1;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 8;
            newLog.unshift(`🦟 Eliminated pests with precision at (${tile.x}, ${tile.y})`);
            
            actionCooldowns['pesticide'] = 3;
          }
          break;
          
        case 'harvest':
          if (targetTile.crop && targetTile.crop.growthStage >= 4.5) {
            const cropYield = Math.floor(targetTile.crop.expectedYield * (targetTile.crop.health / 100));
            const basePrice = newState.market.prices[targetTile.crop.type].current;
            const qualityBonus = targetTile.crop.health > 90 ? 1.2 : targetTile.crop.health > 70 ? 1.1 : 1.0;
            const earnings = Math.floor(cropYield * basePrice * qualityBonus);
            
            newState.farmer.wallet += earnings;
            newState.farmer.energy -= tool.energy;
            newState.farmer.xp += 20;
            newState.farm.structures.silo.stored[targetTile.crop.type] += cropYield;
            
            targetTile.crop = null;
            targetTile.fertility -= 10;
            
            newLog.unshift(`🌾 LEGENDARY HARVEST! ${cropYield} ${targetTile.crop?.type || 'crops'} for ₹${earnings.toLocaleString()}`);
            
            // Trigger coin animation
            triggerCoinAnimation();
            actionCooldowns['harvest'] = 5;
          }
          break;
      }
      
      // Level up check with enhanced rewards
      if (newState.farmer.xp >= newState.farmer.nextLevelXP) {
        newState.farmer.level += 1;
        newState.farmer.xp = 0;
        newState.farmer.nextLevelXP += 750;
        newState.farmer.maxEnergy += 15;
        newState.farmer.energy = newState.farmer.maxEnergy; // Full restore on level up
        newState.farmer.wallet += newState.farmer.level * 1000; // Level bonus
        newLog.unshift(`🏆 LEVEL UP! Welcome to Level ${newState.farmer.level}! Bonus: ₹${newState.farmer.level * 1000}`);
        
        // XP bar animation
        Animated.timing(xpBarAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(xpBarAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
      }
      
      newState.gameLog = newLog;
      return newState;
    });
  }, [gameState.inventory.selectedTool, gameState.farmer.energy]);

  // Utility functions
  const getTileColor = (tile) => {
    if (tile.animating) return '#FFD700';
    if (tile.crop) {
      const health = tile.crop.health;
      if (health > 80) return '#16A34A'; // Healthy green
      if (health > 50) return '#CA8A04'; // Warning yellow
      return '#DC2626'; // Critical red
    }
    if (tile.type === 'farmhouse') return '#8B4513';
    if (tile.type === 'well') return '#0EA5E9';
    if (tile.type === 'silo') return '#6B7280';
    if (tile.type === 'forest') return '#15803D';
    if (tile.isTilled) return '#78716C';
    return '#44403C'; // Rich soil color
  };

  const getTileEmoji = (tile) => {
    if (tile.crop) {
      const stage = Math.floor(tile.crop.growthStage);
      const cropStages = {
        wheat: ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'],
        corn: ['🌱', '🌿', '🌽', '🌽', '🌽', '🌽'],
        rice: ['🌱', '🌿', '🌾', '🌾', '🌾', '🌾'],
        tomato: ['🌱', '🌿', '🍅', '🍅', '🍅', '🍅'],
      };
      return cropStages[tile.crop.type]?.[stage] || '🌾';
    }
    if (tile.type === 'farmhouse') return '🏠';
    if (tile.type === 'well') return '🚰';
    if (tile.type === 'silo') return '🏢';
    if (tile.type === 'forest') return '🌲';
    return '';
  };

  const getWeatherEmoji = () => {
    switch (gameState.weather.current) {
      case 'sunny': return '☀️';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'stormy': return '⛈️';
      default: return '🌤️';
    }
  };

  const handleToolSelect = (toolId) => {
    setGameState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, selectedTool: toolId }
    }));
  };

  const triggerCoinAnimation = () => {
    Animated.sequence([
      Animated.timing(coinAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(coinAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerEnergyAnimation = () => {
    Animated.sequence([
      Animated.timing(energyBarAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(energyBarAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Simulate loading time for crazy game loading
    const timer = setTimeout(() => setShowPreloader(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.loadingTitle}>🌾 Farm Sim Legendary</Text>
        <Text style={styles.loadingSubtitle}>Loading your empire...</Text>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.loadingEmoji}>🚜</Text>
        </Animated.View>
        <Text style={styles.loadingTip}>💡 Tip: Check weather forecasts to optimize your farming strategy!</Text>
      </View>
    );
  }
  return (
    <View style={styles.gameContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      
      {/* Professional Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation && navigation.goBack && navigation.goBack()}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonInner}>
          <Text style={styles.backButtonIcon}>←</Text>
        </View>
      </TouchableOpacity>

      {/* Animated Background with Day/Night Cycle */}
      <Animated.View style={[styles.backgroundLayer, { opacity: fadeAnim }]}>
        <View style={styles.skyGradient}>
          {/* Floating Clouds */}
          <Animated.View style={[styles.cloud, { transform: [{ translateX: pulseAnim.interpolate({
            inputRange: [1, 1.05],
            outputRange: [0, 50]
          }) }] }]}>
            <Text style={styles.cloudEmoji}>☁️</Text>
          </Animated.View>
          <Animated.View style={[styles.cloud, styles.cloud2, { transform: [{ translateX: pulseAnim.interpolate({
            inputRange: [1, 1.05],
            outputRange: [0, -30]
          }) }] }]}>
            <Text style={styles.cloudEmoji}>☁️</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Weather Effects Overlay */}
      {showWeatherEffects && (
        <Animated.View style={[styles.weatherEffectsOverlay, { opacity: fadeAnim }]}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.rainParticle,
                {
                  left: Math.random() * width,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: [{ translateY: shakeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, height + 100]
                  }) }]
                }
              ]}
            >
              <Text style={styles.rainDropEmoji}>💧</Text>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {/* Immersive Game Header */}
      <View style={styles.gameHeader}>
        <SafeAreaView>
          {/* Player Profile Section */}
          <View style={styles.playerSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarFrame}>
                <Text style={styles.avatarEmoji}>👨‍🌾</Text>
              </View>
              <View style={styles.playerBadge}>
                <Text style={styles.levelBadge}>Lv.{gameState.farmer.level}</Text>
              </View>
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{gameState.farmer.name}</Text>
              <Text style={styles.playerTitle}>🏆 Master Farmer</Text>
              
              {/* Animated XP Bar */}
              <View style={styles.xpBarContainer}>
                <View style={styles.xpBarBackground}>
                  <Animated.View 
                    style={[
                      styles.xpBarFill,
                      { 
                        width: `${(gameState.farmer.xp / gameState.farmer.nextLevelXP) * 100}%`,
                        transform: [{ scaleX: xpBarAnim }]
                      }
                    ]}
                  />
                </View>
                <Text style={styles.xpText}>{gameState.farmer.xp}/{gameState.farmer.nextLevelXP} XP</Text>
              </View>
            </View>

            {/* Resource Display */}
            <View style={styles.resourceDisplay}>
              <Animated.View style={[styles.resourceItem, { transform: [{ scale: coinAnim }] }]}>
                <Text style={styles.resourceIcon}>💰</Text>
                <Text style={styles.resourceValue}>{gameState.farmer.wallet.toLocaleString()}</Text>
              </Animated.View>
              
              <View style={styles.energyContainer}>
                <Text style={styles.energyIcon}>⚡</Text>
                <View style={styles.energyBarContainer}>
                  <View style={styles.energyBarBackground}>
                    <Animated.View 
                      style={[
                        styles.energyBarFill,
                        { 
                          width: `${(gameState.farmer.energy / gameState.farmer.maxEnergy) * 100}%`,
                          transform: [{ scaleX: energyBarAnim }]
                        }
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.energyText}>{gameState.farmer.energy}</Text>
              </View>

              {/* Weather Display */}
              <TouchableOpacity 
                style={styles.weatherDisplay}
                onPress={() => setGameState(prev => ({ ...prev, showModal: 'weather' }))}
              >
                <Text style={styles.weatherIcon}>{getWeatherEmoji()}</Text>
                <Text style={styles.weatherTemp}>{gameState.weather.temperature}°</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Game Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              🕐 {String(gameState.time.hour).padStart(2, '0')}:{String(gameState.time.minute).padStart(2, '0')}
            </Text>
            <Text style={styles.dateText}>
              {gameState.time.season}, Day {gameState.time.day}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Left Floating Sidebar */}
      <View style={styles.leftSidebar}>
        <TouchableOpacity style={styles.sidebarButton} onPress={() => setGameState(prev => ({ ...prev, showModal: 'calendar' }))}>
          <Text style={styles.sidebarIcon}>📅</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarButton} onPress={() => setGameState(prev => ({ ...prev, showModal: 'market' }))}>
          <Text style={styles.sidebarIcon}>💹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarButton} onPress={() => setGameState(prev => ({ ...prev, showModal: 'inventory' }))}>
          <Text style={styles.sidebarIcon}>🎒</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarButton} onPress={() => setGameState(prev => ({ ...prev, showModal: 'leaderboard' }))}>
          <Text style={styles.sidebarIcon}>🏆</Text>
        </TouchableOpacity>
      </View>

      {/* Right Floating Alerts Panel */}
      <Animated.View style={[styles.rightAlertsPanel, { opacity: notificationAnim }]}>
        {gameState.notifications.slice(0, 3).map((notification, index) => (
          <Animated.View 
            key={notification.id}
            style={[
              styles.alertCard,
              notification.urgent && styles.alertCardUrgent,
              { 
                transform: [{ 
                  translateX: notificationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0]
                  }) 
                }] 
              }
            ]}
          >
            <View style={styles.alertIcon}>
              <Text style={styles.alertEmoji}>
                {notification.type === 'success' ? '🌾' : 
                 notification.type === 'warning' ? '⚠️' : '🚨'}
              </Text>
            </View>
            <Text style={styles.alertText}>{notification.text}</Text>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Central Interactive Farm Grid with Pinch-to-Zoom and Pan */}
      <View style={styles.farmGridContainer}>
        {/* Zoom Controls */}
        <View style={styles.zoomControls} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              zoomLevel.stopAnimation(val => {
                const next = Math.min(2, (val || 1) + 0.1);
                zoomLevel.setValue(next);
              });
            }}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              zoomLevel.stopAnimation(val => {
                const next = Math.max(0.5, (val || 1) - 0.1);
                zoomLevel.setValue(next);
              });
            }}
          >
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.farmScrollView}
          contentContainerStyle={styles.farmContentContainer}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          bounces={true}
          maximumZoomScale={2}
          minimumZoomScale={0.5}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexDirection: 'column' }}
            showsVerticalScrollIndicator={false}
            bounces={true}
            maximumZoomScale={2}
            minimumZoomScale={0.5}
          >
            <PinchGestureHandler
              onGestureEvent={Animated.event([
                { nativeEvent: { scale: zoomLevel } }
              ], { useNativeDriver: false })}
            >
              <Animated.View
                style={[
                  styles.farmGrid,
                  { transform: [{ scale: zoomLevel }] }
                ]}
              >
                {gameState.farm.grid.map((row, y) => (
                  <View key={y} style={styles.farmRow}>
                    {row.map((tile, x) => (
                      <TouchableOpacity
                        key={tile.id}
                        style={[
                          styles.farmTile,
                          { backgroundColor: getTileColor(tile) },
                          tile.animating && styles.tileAnimating,
                          gameState.selectedTile?.id === tile.id && styles.tileSelected,
                        ]}
                        onPress={() => handleTilePress(tile)}
                        activeOpacity={0.7}
                      >
                        {/* Tile Background Effect */}
                        <View style={styles.tileBackground} />
                        {/* Main Tile Content */}
                        <Text style={styles.tileEmoji}>{getTileEmoji(tile)}</Text>
                        {/* Status Indicators */}
                        {tile.crop && (
                          <View style={styles.cropStatusContainer}>
                            {tile.crop.moisture < 30 && (
                              <View style={styles.statusIndicator}>
                                <Text style={styles.statusEmoji}>💦</Text>
                              </View>
                            )}
                            {tile.pests > 50 && (
                              <View style={styles.statusIndicator}>
                                <Text style={styles.statusEmoji}>🐛</Text>
                              </View>
                            )}
                            {tile.crop.growthStage >= 4.5 && (
                              <Animated.View style={[styles.statusIndicator, { transform: [{ scale: pulseAnim }] }]}>
                                <Text style={styles.statusEmoji}>✨</Text>
                              </Animated.View>
                            )}
                          </View>
                        )}
                        {/* Tile Border Effect */}
                        <View style={styles.tileBorder} />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </Animated.View>
            </PinchGestureHandler>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Bottom Action Toolbar - Game-like Skill Bar */}
      <View style={styles.actionToolbar}>
        <View style={styles.toolbarBackground} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarContent}
        >
          {gameState.inventory.tools.map((tool, index) => {
            const isSelected = gameState.inventory.selectedTool === tool.id;
            const isDisabled = gameState.farmer.energy < tool.energy;
            const isOnCooldown = actionCooldowns[tool.id] > 0;
            
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.actionButton,
                  isSelected && styles.actionButtonSelected,
                  isDisabled && styles.actionButtonDisabled,
                  isOnCooldown && styles.actionButtonCooldown,
                ]}
                onPress={() => handleToolSelect(tool.id)}
                disabled={isDisabled || isOnCooldown}
                activeOpacity={0.8}
              >
                {/* Button Glow Effect */}
                {isSelected && <View style={styles.buttonGlow} />}
                
                {/* Action Icon */}
                <View style={styles.actionIconContainer}>
                  <Text style={[styles.actionIcon, { color: tool.color }]}>{tool.emoji}</Text>
                  
                  {/* Cooldown Overlay */}
                  {isOnCooldown && (
                    <View style={styles.cooldownOverlay}>
                      <Text style={styles.cooldownText}>{actionCooldowns[tool.id]}</Text>
                    </View>
                  )}
                </View>
                
                {/* Action Label */}
                <Text style={[
                  styles.actionLabel,
                  isSelected && styles.actionLabelSelected,
                  isDisabled && styles.actionLabelDisabled,
                ]}>
                  {tool.name}
                </Text>
                
                {/* Energy Cost */}
                <View style={styles.energyCostContainer}>
                  <Text style={styles.energyCostIcon}>⚡</Text>
                  <Text style={styles.energyCostText}>{tool.energy}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Resource Status */}
      <View style={styles.floatingResourceStatus}>
        <View style={styles.resourceStatusBackground} />
        {Object.entries(gameState.inventory.resources).slice(0, 4).map(([resource, amount]) => (
          <View key={resource} style={styles.floatingResourceItem}>
            <Text style={styles.floatingResourceIcon}>
              {resource === 'water' ? '💧' :
               resource === 'fertilizer' ? '🌿' :
               resource === 'pesticide' ? '🦟' : '⛽'}
            </Text>
            <Text style={styles.floatingResourceAmount}>{amount}</Text>
          </View>
        ))}
      </View>

      {/* Floating Activity Log */}
      <TouchableOpacity 
        style={styles.floatingActivityLog}
        onPress={() => setGameState(prev => ({ ...prev, showModal: 'activityLog' }))}
      >
        <View style={styles.activityLogBackground} />
        <Text style={styles.activityLogIcon}>📜</Text>
        <View style={styles.activityLogContent}>
          <Text style={styles.activityLogTitle}>Recent Activity</Text>
          <Text style={styles.activityLogPreview} numberOfLines={1}>
            {gameState.gameLog[0] || 'No recent activity'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Enhanced Modals */}
      
      {/* Tile Info Modal */}
      <Modal
        visible={gameState.showModal === 'tileInfo'}
        transparent
        animationType="slide"
        onRequestClose={() => setGameState(prev => ({ ...prev, showModal: null, selectedTile: null }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔍 Field Analysis</Text>
            {gameState.selectedTile && (
              <View style={styles.tileInfoContainer}>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>Coordinates:</Text>
                  <Text style={styles.tileInfoValue}>({gameState.selectedTile.x}, {gameState.selectedTile.y})</Text>
                </View>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>Terrain Type:</Text>
                  <Text style={styles.tileInfoValue}>{gameState.selectedTile.type}</Text>
                </View>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>Soil Moisture:</Text>
                  <Text style={styles.tileInfoValue}>{Math.round(gameState.selectedTile.moisture)}%</Text>
                </View>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>Fertility Level:</Text>
                  <Text style={styles.tileInfoValue}>{Math.round(gameState.selectedTile.fertility)}%</Text>
                </View>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>pH Balance:</Text>
                  <Text style={styles.tileInfoValue}>{gameState.selectedTile.ph.toFixed(1)}</Text>
                </View>
                <View style={styles.tileInfoRow}>
                  <Text style={styles.tileInfoLabel}>Pest Activity:</Text>
                  <Text style={styles.tileInfoValue}>{gameState.selectedTile.pests}%</Text>
                </View>
                {gameState.selectedTile.crop && (
                  <React.Fragment>
                    <View style={styles.cropInfoHeader}>
                      <Text style={styles.cropInfoTitle}>🌱 Crop Status</Text>
                    </View>
                    <View style={styles.tileInfoRow}>
                      <Text style={styles.tileInfoLabel}>Crop Species:</Text>
                      <Text style={styles.tileInfoValue}>{gameState.selectedTile.crop.type}</Text>
                    </View>
                    <View style={styles.tileInfoRow}>
                      <Text style={styles.tileInfoLabel}>Maturity Stage:</Text>
                      <Text style={styles.tileInfoValue}>{Math.round(gameState.selectedTile.crop.growthStage)}/5</Text>
                    </View>
                    <View style={styles.tileInfoRow}>
                      <Text style={styles.tileInfoLabel}>Plant Health:</Text>
                      <Text style={styles.tileInfoValue}>{Math.round(gameState.selectedTile.crop.health)}%</Text>
                    </View>
                    <View style={styles.tileInfoRow}>
                      <Text style={styles.tileInfoLabel}>Yield Estimate:</Text>
                      <Text style={styles.tileInfoValue}>{gameState.selectedTile.crop.expectedYield} units</Text>
                    </View>
                  </React.Fragment>
                )}
              </View>
            )}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setGameState(prev => ({ ...prev, showModal: null, selectedTile: null }))}
            >
              <Text style={styles.modalCloseText}>Close Analysis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Market Modal */}
      <Modal
        visible={gameState.showModal === 'market'}
        transparent
        animationType="slide"
        onRequestClose={() => setGameState(prev => ({ ...prev, showModal: null }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📈 Global Trading Hub</Text>
            <View style={styles.marketContainer}>
              {Object.entries(gameState.market.prices).map(([crop, data]) => (
                <View key={crop} style={styles.marketRow}>
                  <View style={styles.marketCrop}>
                    <Text style={styles.marketCropName}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</Text>
                    <Text style={styles.marketDemand}>Market Demand: {gameState.market.demand[crop]}</Text>
                  </View>
                  <View style={styles.marketPricing}>
                    <Text style={styles.marketPrice}>₹{data.current}/unit</Text>
                    <Text style={[
                      styles.marketTrend,
                      data.trend === 'up' ? styles.trendUp : 
                      data.trend === 'down' ? styles.trendDown : styles.trendStable
                    ]}>
                      {data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️'} {data.change > 0 ? '+' : ''}{data.change}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.globalEventsContainer}>
              <Text style={styles.globalEventsTitle}>🌍 Market Intelligence</Text>
              {gameState.market.globalEvents.map((event, index) => (
                <Text key={index} style={styles.globalEvent}>• {event}</Text>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setGameState(prev => ({ ...prev, showModal: null }))}
            >
              <Text style={styles.modalCloseText}>Exit Market</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Weather Modal */}
      <Modal
        visible={gameState.showModal === 'weather'}
        transparent
        animationType="slide"
        onRequestClose={() => setGameState(prev => ({ ...prev, showModal: null }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🌤️ Meteorological Center</Text>
            
            <View style={styles.currentWeatherContainer}>
              <Text style={styles.currentWeatherTitle}>Current Atmospheric Conditions</Text>
              <View style={styles.weatherStatsRow}>
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatLabel}>Temperature</Text>
                  <Text style={styles.weatherStatValue}>{gameState.weather.temperature}°C</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatLabel}>Humidity</Text>
                  <Text style={styles.weatherStatValue}>{gameState.weather.humidity}%</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatLabel}>Wind Speed</Text>
                  <Text style={styles.weatherStatValue}>{gameState.weather.windSpeed} km/h</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherStatLabel}>Pressure</Text>
                  <Text style={styles.weatherStatValue}>{gameState.weather.pressure} hPa</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>📅 Extended Forecast</Text>
              {gameState.weather.forecast.map((day, index) => (
                <View key={index} style={styles.forecastDay}>
                  <Text style={styles.forecastDayName}>{day.day}</Text>
                  <Text style={styles.forecastCondition}>{day.condition}</Text>
                  <Text style={styles.forecastTemp}>{day.temp}°C</Text>
                  <Text style={styles.forecastRain}>{day.rain}% precipitation</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setGameState(prev => ({ ...prev, showModal: null }))}
            >
              <Text style={styles.modalCloseText}>Close Weather Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quests Modal */}
      <Modal
        visible={gameState.showModal === 'quests'}
        transparent
        animationType="slide"
        onRequestClose={() => setGameState(prev => ({ ...prev, showModal: null }))}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎯 Mission Command Center</Text>
            
            <View style={styles.questsContainer}>
              {gameState.activeQuests.map(quest => (
                <View key={quest.id} style={styles.questCard}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>
                  
                  <View style={styles.questProgress}>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar,
                          { width: `${(quest.progress / quest.target) * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{quest.progress}/{quest.target}</Text>
                  </View>
                  
                  <View style={styles.questFooter}>
                    <Text style={styles.questReward}>🏆 ₹{quest.reward.toLocaleString()}</Text>
                    <Text style={styles.questTimeLeft}>⏳ {quest.timeLeft} days remaining</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setGameState(prev => ({ ...prev, showModal: null }))}
            >
              <Text style={styles.modalCloseText}>Exit Command Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Immersive Game StyleSheet
const styles = StyleSheet.create({
  // Main Container
  gameContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Animated Background
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  skyGradient: {
    flex: 1,
    backgroundColor: '#1e3a8a', // Deep blue sky
  },

  cloud: {
    position: 'absolute',
    top: 60,
    left: 20,
  },

  cloud2: {
    top: 100,
    left: 280,
  },

  cloudEmoji: {
    fontSize: 32,
    opacity: 0.7,
  },

  // Weather Effects
  weatherEffectsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },

  rainParticle: {
    position: 'absolute',
  },

  rainDropEmoji: {
    fontSize: 8,
    opacity: 0.8,
  },

  // Game Header
  gameHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    zIndex: 200,
  },

  // Player Section
  playerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },

  avatarFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
  },

  avatarEmoji: {
    fontSize: 28,
  },

  playerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#FFD700',
  },

  levelBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  playerInfo: {
    flex: 1,
  },

  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  playerTitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 5,
  },

  // XP Bar
  xpBarContainer: {
    width: '100%',
    marginTop: 5,
  },

  xpBarBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6B7280',
    overflow: 'hidden',
  },

  xpBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  xpText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 2,
  },

  // Resource Display
  resourceDisplay: {
    alignItems: 'flex-end',
  },

  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#10B981',
  },

  resourceIcon: {
    fontSize: 14,
    marginRight: 5,
  },

  resourceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Energy Container
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },

  energyIcon: {
    fontSize: 14,
    marginRight: 5,
  },

  energyBarContainer: {
    width: 50,
    marginHorizontal: 5,
  },

  energyBarBackground: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },

  energyBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },

  energyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },

  // Weather Display
  weatherDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },

  weatherIcon: {
    fontSize: 14,
    marginRight: 5,
  },

  weatherTemp: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },

  // Time Display
  timeDisplay: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },

  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // Floating Sidebars
  leftSidebar: {
    position: 'absolute',
    left: 10,
    top: HEADER_HEIGHT + 20,
    zIndex: 300,
    gap: 15,
  },

  sidebarButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },

  sidebarIcon: {
    fontSize: 20,
  },

  // Right Alerts Panel
  rightAlertsPanel: {
    position: 'absolute',
    right: 10,
    top: HEADER_HEIGHT + 20,
    width: 200,
    zIndex: 300,
    gap: 10,
  },

  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  alertCardUrgent: {
    borderLeftColor: '#EF4444',
    backgroundColor: 'rgba(29, 0, 0, 0.95)',
  },

  alertIcon: {
    marginRight: 10,
  },

  alertEmoji: {
    fontSize: 16,
  },

  alertText: {
    flex: 1,
    fontSize: 11,
    color: '#F8FAFC',
    lineHeight: 14,
  },

  // Farm Grid Container
  farmGridContainer: {
    flex: 1,
    marginTop: HEADER_HEIGHT,
    marginBottom: TOOLBAR_HEIGHT + 60,
    paddingHorizontal: 10,
    zIndex: 100,
  },

  farmScrollView: {
    flex: 1,
  },

  farmContentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  farmGrid: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#4B5563',
  },

  farmRow: {
    flexDirection: 'row',
  },

  farmTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  tileBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    opacity: 0.7,
  },

  tileAnimating: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
  },

  tileSelected: {
    borderWidth: 3,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  tileEmoji: {
    fontSize: 16,
    zIndex: 2,
  },

  cropStatusContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    flexDirection: 'row',
    gap: 2,
  },

  statusIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },

  statusEmoji: {
    fontSize: 8,
  },

  tileBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Action Toolbar
  actionToolbar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: TOOLBAR_HEIGHT,
    zIndex: 400,
  },

  toolbarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },

  toolbarContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 12,
    alignItems: 'center',
  },

  actionButton: {
    width: 70,
    height: 80,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    position: 'relative',
  },

  actionButtonSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },

  actionButtonDisabled: {
    opacity: 0.4,
    borderColor: '#6B7280',
  },

  actionButtonCooldown: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },

  buttonGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    zIndex: -1,
  },

  actionIconContainer: {
    position: 'relative',
    marginBottom: 5,
  },

  actionIcon: {
    fontSize: 24,
  },

  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cooldownText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },

  actionLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },

  actionLabelSelected: {
    color: '#FFD700',
    fontWeight: 'bold',
  },

  actionLabelDisabled: {
    color: '#6B7280',
  },

  energyCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  energyCostIcon: {
    fontSize: 8,
    marginRight: 2,
  },

  energyCostText: {
    fontSize: 8,
    color: '#F59E0B',
    fontWeight: 'bold',
  },

  // Floating Resource Status
  floatingResourceStatus: {
    position: 'absolute',
    top: HEADER_HEIGHT + 10,
    left: 80,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 300,
  },

  resourceStatusBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },

  floatingResourceItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  floatingResourceIcon: {
    fontSize: 16,
    marginBottom: 2,
  },

  floatingResourceAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },

  // Floating Activity Log
  floatingActivityLog: {
    position: 'absolute',
    bottom: TOOLBAR_HEIGHT + 80,
    left: 15,
    right: 15,
    height: 60,
    zIndex: 300,
  },

  activityLogBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },

  activityLogIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    fontSize: 20,
  },

  activityLogContent: {
    paddingLeft: 50,
    paddingRight: 15,
    paddingVertical: 10,
  },

  activityLogTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },

  activityLogPreview: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 15,
  },

  loadingSubtitle: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 30,
  },

  loadingEmoji: {
    fontSize: 80,
    marginBottom: 30,
  },

  loadingTip: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontStyle: 'italic',
  },

  // Preloader
  preloaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordWrapper: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mainWord: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#0ff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },

  // Modal Styles (keeping existing modals but with enhanced styling)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  modalCloseButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },

  modalCloseText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Enhanced modal content styles
  tileInfoContainer: {
    gap: 12,
  },

  tileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },

  tileInfoLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },

  tileInfoValue: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },

  cropInfoHeader: {
    marginTop: 20,
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#22C55E',
  },

  cropInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
  },

  // Market modal styles
  marketContainer: {
    gap: 12,
    marginBottom: 20,
  },

  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  marketCrop: {
    flex: 1,
  },

  marketCropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },

  marketDemand: {
    fontSize: 12,
    color: '#94A3B8',
  },

  marketPricing: {
    alignItems: 'flex-end',
  },

  marketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },

  marketTrend: {
    fontSize: 12,
  },

  trendUp: {
    color: '#10B981',
  },

  trendDown: {
    color: '#EF4444',
  },

  trendStable: {
    color: '#94A3B8',
  },

  globalEventsContainer: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  globalEventsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },

  globalEvent: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    lineHeight: 16,
  },

  // Weather modal styles
  currentWeatherContainer: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  currentWeatherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },

  weatherStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  weatherStat: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },

  weatherStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },

  weatherStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },

  forecastContainer: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  forecastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 10,
  },

  forecastDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },

  forecastDayName: {
    fontSize: 12,
    color: '#F8FAFC',
    fontWeight: 'bold',
    flex: 1,
  },

  forecastCondition: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    textAlign: 'center',
  },

  forecastTemp: {
    fontSize: 12,
    color: '#F8FAFC',
    flex: 1,
    textAlign: 'center',
  },

  forecastRain: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
    textAlign: 'right',
  },

  // Quest modal styles
  questsContainer: {
    gap: 15,
  },

  questCard: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },

  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 5,
  },

  questDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
    lineHeight: 16,
  },

  questProgress: {
    marginBottom: 10,
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: '#4B5563',
    borderRadius: 3,
    marginBottom: 5,
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },

  progressText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
  },

  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  questReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },

  questTimeLeft: {
    fontSize: 12,
    color: '#F59E0B',
  },

  // Zoom Controls
  zoomControls: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 20,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 16,
    padding: 4,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },

  backButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonIcon: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default FarmSimLegendary;