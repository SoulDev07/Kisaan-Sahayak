import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const API_BASE = NetworkConfig.API_BASE;
const FARMER_ID = 'f001';
const CALENDAR_CACHE_KEY = 'calendar-events-cache';

const SmartCalendar = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const styles = makeStyles(theme);

  // AI insights with t() for translation
  const AI_INSIGHTS = [
    {
      icon: 'water-outline',
      title: t('calendar.ai_insights.irrigation.title', 'Irrigation Schedule'),
      description: t('calendar.ai_insights.irrigation.description', 'Your tomato field needs watering in 2 days based on soil moisture and weather patterns.'),
      color: '#10b981'
    },
    {
      icon: 'leaf-outline',
      title: t('calendar.ai_insights.crop_growth.title', 'Crop Growth'),
      description: t('calendar.ai_insights.crop_growth.description', 'Wheat is entering flowering stage. Consider applying nitrogen fertilizer this week.'),
      color: '#3b82f6'
    },
    {
      icon: 'bug-outline',
      title: t('calendar.ai_insights.pest_alert.title', 'Pest Alert'),
      description: t('calendar.ai_insights.pest_alert.description', 'Weather conditions favor aphid growth. Monitor your crops closely.'),
      color: '#f59e0b'
    },
    {
      icon: 'sunny-outline',
      title: t('calendar.ai_insights.weather.title', 'Weather Insight'),
      description: t('calendar.ai_insights.weather.description', 'Perfect conditions for outdoor activities next 3 days. Plan your harvesting.'),
      color: '#ef4444'
    }
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [events, setEvents] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [addMethodModalVisible, setAddMethodModalVisible] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [eventModalEvent, setEventModalEvent] = useState({
    date: '', time: '', task: '', type: '', priority: 'medium', details: ''
  });
  const [currentEventPopupVisible, setCurrentEventPopupVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const carouselScrollX = useRef(new Animated.Value(0)).current;
  const eventDetailsOpacity = useRef(new Animated.Value(0)).current;

  const carouselRef = useRef(null);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    fetchCalendarEvents();
    startCarouselAutoScroll();
    checkCurrentEvent();
  }, []);

  const startCarouselAutoScroll = () => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const nextIndex = (currentInsightIndex + 1) % AI_INSIGHTS.length;
        carouselRef.current.scrollTo({
          x: nextIndex * (width - 40),
          animated: true,
        });
        setCurrentInsightIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(interval);
  };

  const checkCurrentEvent = () => {
    const now = new Date();
    const todayKey = formatDateKey(now);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const todayEvents = events[todayKey] || [];
    const currentEvents = todayEvents.filter(event => {
      const [eventHour, eventMinute] = event.time.split(':').map(Number);
      const eventTimeMinutes = eventHour * 60 + eventMinute;
      return Math.abs(currentTimeMinutes - eventTimeMinutes) <= 15;
    });

    if (currentEvents.length > 0) {
      setCurrentEvent(currentEvents[0]);
      setCurrentEventPopupVisible(true);
      setTimeout(() => {
        setCurrentEventPopupVisible(false);
      }, 5000);
    }
  };

  const fetchCalendarEvents = async () => {
    setDataLoading(true);
    try {
      const cached = await AsyncStorage.getItem(CALENDAR_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCalendarEvents(parsed);
        const eventsByDate = {};
        parsed.forEach(ev => {
          if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
          eventsByDate[ev.date].push(ev);
        });
        setEvents(eventsByDate);
        setDataLoading(false);
        return;
      }
    } catch (e) {
      console.error('Cache load error:', e);
    }

    const mockEvents = [
      { eventId: 'ev1', date: formatDateKey(new Date()), time: '08:00', task: 'Water tomato plants', type: 'irrigation', priority: 'high', details: 'Check soil moisture and apply drip irrigation' },
      { eventId: 'ev2', date: formatDateKey(new Date(Date.now() + 86400000)), time: '15:00', task: 'Apply fertilizer to wheat field', type: 'treatment', priority: 'medium', details: 'Use nitrogen-rich fertilizer' }
    ];

    setCalendarEvents(mockEvents);
    const eventsByDate = {};
    mockEvents.forEach(ev => {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });
    setEvents(eventsByDate);
    setDataLoading(false);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatDateKey = (date) => date.toISOString().split('T')[0];
  const isToday = (date) => new Date().toDateString() === date.toDateString();
  const hasEvents = (date) => events[formatDateKey(date)]?.length > 0;

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    const dayEvents = events[formatDateKey(date)];

    if (dayEvents && dayEvents.length > 0) {
      setSelectedEventDetails(dayEvents[0]);
      Animated.timing(eventDetailsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(eventDetailsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setSelectedEventDetails(null);
        });
      }, 3000);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    let week = [];

    for (let i = 0; i < firstDay; i++) {
      week.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelectedDate = selectedDate.toDateString() === date.toDateString();
      const isTodayDate = isToday(date);

      week.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isTodayDate && styles.todayCell, isSelectedDate && styles.selectedCell]}
          onPress={() => handleDatePress(date)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dayNumber, isTodayDate && styles.todayNumber, isSelectedDate && styles.selectedNumber]}>{day}</Text>
          {hasEvents(date) && (
            <View style={styles.eventIndicator}>
              <View style={[styles.eventDot, { backgroundColor: events[formatDateKey(date)][0].priority === 'high' ? theme.colors.danger : theme.colors.primary }]} />
            </View>
          )}
        </TouchableOpacity>
      );

      if (week.length === 7 || day === daysInMonth) {
        if (day === daysInMonth && week.length < 7) {
          for (let j = week.length; j < 7; j++) {
            week.push(<View key={`empty-end-${day}-${j}`} style={styles.emptyDay} />);
          }
        }
        days.push(<View key={`week-${day}`} style={styles.weekRow}>{week}</View>);
        week = [];
      }
    }
    return days;
  };

  const getNextUpcomingTask = () => {
    const today = new Date();
    const sortedEvents = calendarEvents
      .filter(event => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedEvents[0] || null;
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'irrigation': return 'water-outline';
      case 'planting': return 'leaf-outline';
      case 'livestock': return 'paw-outline';
      case 'treatment': return 'medical-outline';
      case 'harvest': return 'cut-outline';
      default: return 'calendar-outline';
    }
  };

  const openAddMethodModal = () => setAddMethodModalVisible(true);

  const handleManualAdd = () => {
    setAddMethodModalVisible(false);
    setEventModalEvent({ date: formatDateKey(selectedDate), time: '', task: '', type: '', priority: 'medium', details: '' });
    setEventModalVisible(true);
  };

  const handleAIAdd = async () => {
    setAddMethodModalVisible(false);
    setAiGenerating(true);
    setTimeout(() => {
      const aiSuggestions = [
        { task: 'Check soil moisture levels', time: '07:00', type: 'irrigation', priority: 'high', details: 'Monitor field sections A-C for optimal watering schedule' },
        { task: 'Inspect crop health', time: '16:00', type: 'monitoring', priority: 'medium', details: 'Look for signs of pest damage or disease in tomato plants' }
      ];
      const suggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setEventModalEvent({ date: formatDateKey(selectedDate), ...suggestion });
      setAiGenerating(false);
      setEventModalVisible(true);
    }, 2500);
  };

  const handleSaveEvent = async () => {
    if (!eventModalEvent.task || !eventModalEvent.time) {
      Alert.alert(t('calendar.errors.missing_info_title', 'Missing Info'), t('calendar.errors.missing_info_message', 'Please fill task and time fields.'));
      return;
    }
    const newEvent = { ...eventModalEvent, eventId: `ev${Date.now()}`, date: eventModalEvent.date || formatDateKey(selectedDate) };
    const newEvents = [newEvent, ...calendarEvents];
    setCalendarEvents(newEvents);
    const eventsByDate = {};
    newEvents.forEach(ev => {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });
    setEvents(eventsByDate);
    await AsyncStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify(newEvents));
    setEventModalVisible(false);
  };

  const nextTask = getNextUpcomingTask();

  if (dataLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={theme.colors.statusBarStyle} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Ionicons name="calendar" size={48} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>{t('calendar.loading', 'Loading your farm calendar...')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBarStyle} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('calendar.header.title', 'Farm Calendar')}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t('calendar.header.subtitle', 'Plan your farming activities')}</Text>
          </View>
          <View style={styles.headerRight} />
        </Animated.View>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.calendarSection, { opacity: fadeAnim }]}>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.monthText}>{currentDate.toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}</Text>
              <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarContainer}>
              <TouchableOpacity style={styles.addTaskButton} onPress={openAddMethodModal}>
                <Ionicons name="add" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={styles.weekHeader}>
                {t('calendar.week_days', 'S M T W T F S').split(' ').map((day, index) => (
                  <Text key={index} style={styles.weekDay}>{day}</Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>{renderCalendar()}</View>
            </View>
          </Animated.View>

          {selectedEventDetails && (
            <Animated.View style={[styles.eventDetailsPopup, { opacity: eventDetailsOpacity }]}>
              <View style={styles.eventDetailsContent}>
                <Ionicons name={getTaskIcon(selectedEventDetails.type)} size={20} color="#10b981" />
                <View style={styles.eventDetailsText}>
                  <Text style={[styles.eventDetailsTitle, { color: theme.colors.text }]}>{selectedEventDetails.task}</Text>
                  <Text style={[styles.eventDetailsTime, { color: theme.colors.textSecondary }]}>{selectedEventDetails.time}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {nextTask && (
            <View style={styles.upcomingSection}>
              <Text style={[styles.upcomingSectionTitle, { color: theme.colors.text }]}>{t('calendar.next_task.title', 'Next Upcoming Task')}</Text>
              <View style={styles.upcomingTaskCard}>
                <View style={styles.upcomingTaskIcon}>
                  <Ionicons name={getTaskIcon(nextTask.type)} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.upcomingTaskContent}>
                  <Text style={[styles.upcomingTaskTitle, { color: theme.colors.text }]}>{nextTask.task}</Text>
                  <Text style={[styles.upcomingTaskDate, { color: theme.colors.textSecondary }]}>
                    {new Date(nextTask.date).toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' })}
                    {t('calendar.next_task.at', ' at ')}{nextTask.time}
                  </Text>
                  {nextTask.details && (
                    <Text style={[styles.upcomingTaskDetails, { color: theme.colors.textSecondary }]}>{nextTask.details}</Text>
                  )}
                </View>
                <View style={[styles.upcomingTaskPriority, { backgroundColor: nextTask.priority === 'high' ? theme.colors.danger : nextTask.priority === 'medium' ? theme.colors.info : theme.colors.primary }]} />
              </View>
            </View>
          )}

          <View style={styles.aiAnalysisSection}>
            <View style={styles.aiAnalysisHeader}>
              <MaterialCommunityIcons name="brain" size={24} color={theme.colors.primary} />
              <Text style={[styles.aiAnalysisTitle, { color: theme.colors.text }]}>{t('calendar.ai_insights.section_title', 'AI Farm Insights')}</Text>
            </View>
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.insightsCarousel}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: carouselScrollX } } }], { useNativeDriver: false })}
            >
              {AI_INSIGHTS.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <View style={[styles.insightIconContainer, { backgroundColor: `${insight.color}20` }]}>
                    <Ionicons name={insight.icon} size={28} color={insight.color || theme.colors.primary} />
                  </View>
                  <Text style={[styles.insightTitle, { color: theme.colors.text }]}>{insight.title}</Text>
                  <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>{insight.description}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.carouselIndicators}>
              {AI_INSIGHTS.map((_, index) => (
                <View key={index} style={[styles.indicator, index === currentInsightIndex && styles.activeIndicator]} />
              ))}
            </View>
          </View>
        </ScrollView>

        <Modal visible={currentEventPopupVisible} animationType="fade" transparent>
          <View style={styles.currentEventOverlay}>
            <Animated.View style={styles.currentEventPopup}>
              <View style={styles.currentEventHeader}>
                <View style={styles.currentEventIconContainer}><Ionicons name={currentEvent ? getTaskIcon(currentEvent.type) : 'calendar'} size={24} color={theme.colors.primary} /></View>
                <View style={styles.currentEventTextContainer}>
                  <Text style={[styles.currentEventTitle, { color: theme.colors.text }]}>{t('calendar.current_task.title', 'Current Task')}</Text>
                  <Text style={[styles.currentEventTask, { color: theme.colors.text }]}>{currentEvent?.task}</Text>
                  <Text style={[styles.currentEventTime, { color: theme.colors.textSecondary }]}>{t('calendar.current_task.scheduled', 'Scheduled:')} {currentEvent?.time}</Text>
                </View>
                <TouchableOpacity style={styles.currentEventCloseButton} onPress={() => setCurrentEventPopupVisible(false)}><Ionicons name="close" size={20} color={theme.colors.textSecondary} /></TouchableOpacity>
              </View>
              {currentEvent?.details && <Text style={[styles.currentEventDetails, { color: theme.colors.textSecondary }]}>{currentEvent.details}</Text>}
            </Animated.View>
          </View>
        </Modal>

        <Modal visible={addMethodModalVisible} animationType="slide" transparent>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
            <View style={styles.addMethodModal}>
              <Text style={[styles.addMethodTitle, { color: theme.colors.text }]}>{t('calendar.add_task.title', 'Add New Task')}</Text>
              <Text style={[styles.addMethodSubtitle, { color: theme.colors.textSecondary }]}>{t('calendar.add_task.subtitle', 'Choose how you\'d like to add your farming task')}</Text>
              <TouchableOpacity style={styles.addMethodOption} onPress={handleManualAdd}>
                <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
                <View style={styles.addMethodOptionContent}>
                  <Text style={[styles.addMethodOptionTitle, { color: theme.colors.text }]}>{t('calendar.add_task.manual_option', 'Fill Manually')}</Text>
                  <Text style={[styles.addMethodOptionDesc, { color: theme.colors.textSecondary }]}>{t('calendar.add_task.manual_desc', 'Enter task details yourself')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMethodOption} onPress={handleAIAdd}>
                <MaterialCommunityIcons name="brain" size={24} color={theme.colors.info} />
                <View style={styles.addMethodOptionContent}>
                  <Text style={[styles.addMethodOptionTitle, { color: theme.colors.text }]}>{t('calendar.add_task.ai_option', 'Fill with AI')}</Text>
                  <Text style={[styles.addMethodOptionDesc, { color: theme.colors.textSecondary }]}>{t('calendar.add_task.ai_desc', 'Let AI suggest optimal tasks')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMethodCancel} onPress={() => setAddMethodModalVisible(false)}>
                <Text style={[styles.addMethodCancelText, { color: theme.colors.text }]}>{t('calendar.add_task.cancel', 'Cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={aiGenerating} animationType="fade" transparent>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
            <View style={styles.aiLoadingModal}>
              <Animated.View style={styles.aiLoadingAnimation}><MaterialCommunityIcons name="brain" size={48} color={theme.colors.info} /></Animated.View>
              <Text style={[styles.aiLoadingTitle, { color: theme.colors.text }]}>{t('calendar.ai_generating.title', 'Generating using Reinforcement Learning')}</Text>
              <Text style={[styles.aiLoadingSubtitle, { color: theme.colors.textSecondary }]}>{t('calendar.ai_generating.subtitle', 'Analyzing your farm data and weather patterns...')}</Text>
              <View style={styles.loadingBar}><Animated.View style={styles.loadingBarFill} /></View>
            </View>
          </View>
        </Modal>

        <Modal visible={eventModalVisible} animationType="slide" transparent>
          <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('calendar.event_modal.title', 'Add Farm Task')}</Text>
                <TouchableOpacity onPress={() => setEventModalVisible(false)} style={styles.modalCloseButton}><Ionicons name="close" size={24} color={theme.colors.textSecondary} /></TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <TextInput style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('calendar.event_modal.task_placeholder', 'What needs to be done?')} placeholderTextColor={theme.colors.textSecondary} value={eventModalEvent.task} onChangeText={(text) => setEventModalEvent({...eventModalEvent, task: text})} />
                <TextInput style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('calendar.event_modal.time_placeholder', 'Time (e.g., 09:00)')} placeholderTextColor={theme.colors.textSecondary} value={eventModalEvent.time} onChangeText={(text) => setEventModalEvent({...eventModalEvent, time: text})} />
                <TextInput style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('calendar.event_modal.type_placeholder', 'Type (irrigation, planting, etc.)')} placeholderTextColor={theme.colors.textSecondary} value={eventModalEvent.type} onChangeText={(text) => setEventModalEvent({...eventModalEvent, type: text})} />
                <TextInput style={[styles.modalInput, styles.modalTextArea, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('calendar.event_modal.details_placeholder', 'Additional details (optional)')} placeholderTextColor={theme.colors.textSecondary} value={eventModalEvent.details} onChangeText={(text) => setEventModalEvent({...eventModalEvent, details: text})} multiline numberOfLines={3} />
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEventModalVisible(false)}>
                  <Text style={[styles.modalCancelText, { color: theme.colors.text }]}>{t('calendar.event_modal.cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveEvent}>
                  <Text style={[styles.modalSaveText, { color: theme.colors.background }]}>{t('calendar.event_modal.save', 'Save Task')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const makeStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginTop:50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop:50,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  calendarSection: {
    padding: 20,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.card,
  },
  monthText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  addTaskButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: theme.colors.shadow || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDay: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    width: (width - 72) / 7,
  },
  calendarGrid: {},
  weekRow: {
    flexDirection: 'row',
  },
  emptyDay: {
    width: (width - 72) / 7,
    height: 40,
  },
  dayCell: {
    width: (width - 72) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: theme.colors.surfaceSecondary || '#1a4d3a',
    borderRadius: 8,
  },
  dayNumber: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  todayNumber: {
    color: theme.colors.background,
    fontWeight: '700',
  },
  selectedNumber: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventDetailsPopup: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    zIndex: 1000,
  },
  eventDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailsText: {
    marginLeft: 12,
    flex: 1,
  },
  eventDetailsTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  eventDetailsTime: {
    color: theme.colors.primary,
    fontSize: 14,
    marginTop: 2,
  },
  currentEventOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: theme.colors.overlay,
  },
  currentEventPopup: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: 350,
    width: '90%',
  },
  currentEventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  currentEventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceSecondary || '#1a4d3a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentEventTextContainer: {
    flex: 1,
  },
  currentEventTitle: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  currentEventTask: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentEventTime: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  currentEventCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  currentEventDetails: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  upcomingSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  upcomingSectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  upcomingTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
  },
  upcomingTaskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceSecondary || '#1a4d3a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  upcomingTaskContent: {
    flex: 1,
  },
  upcomingTaskTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  upcomingTaskDate: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingTaskDetails: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  upcomingTaskPriority: {
    width: 4,
    height: 48,
    borderRadius: 2,
  },
  aiAnalysisSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  aiAnalysisTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  insightsCarousel: {
    marginBottom: 16,
  },
  insightCard: {
    width: width - 40,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    marginRight: 0,
    alignItems: 'center',
  },
  insightIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  insightDescription: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface || '#333',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addMethodModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  addMethodTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  addMethodSubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  addMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary || '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addMethodOptionContent: {
    flex: 1,
    marginLeft: 16,
  },
  addMethodOptionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addMethodOptionDesc: {
    color: '#666',
    fontSize: 14,
  },
  addMethodCancel: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  addMethodCancelText: {
    color: '#666',
    fontSize: 16,
  },
  aiLoadingModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  aiLoadingAnimation: {
    marginBottom: 20,
  },
  aiLoadingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  aiLoadingSubtitle: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.surface || '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: theme.colors.info || '#3b82f6',
    width: '70%',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceSecondary || '#222',
    borderRadius: 8,
    padding: 16,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: theme.colors.surfaceSecondary || '#222',
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  modalSaveText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
     },
 });

export default SmartCalendar;