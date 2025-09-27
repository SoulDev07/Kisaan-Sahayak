import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO, parse, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

const { width } = Dimensions.get('window');

const API_BASE = NetworkConfig.API_BASE;
const FARMER_ID = 'f001';
const CHAT_CACHE_KEY = 'chat-history-cache';

export default function ChatHistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = React.useState([]);
  const [filteredHistory, setFilteredHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  // Load chat history from cache, then fetch from backend
  const fetchChatHistory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    // Try to load from cache first (only if not refreshing)
    if (!isRefresh) {
      try {
        const cached = await AsyncStorage.getItem(CHAT_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setHistory(parsed);
          setLoading(false); // Show cached data immediately
        }
      } catch (e) {
        console.log('Cache load failed:', e);
      }
    }
    
    // Always fetch from backend
    try {
      const response = await fetch(`${API_BASE}/farmer/${FARMER_ID}/chat`);
      const data = await response.json();
      setHistory(data);
      applyFilter(data, selectedFilter);
      await AsyncStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', icon: 'format-list-bulleted' },
    { key: 'today', label: 'Today', icon: 'calendar-today' },
    { key: 'week', label: 'This Week', icon: 'calendar-week' },
    { key: 'month', label: 'This Month', icon: 'calendar' },
    { key: 'last3months', label: 'Last 3 Months', icon: 'calendar-range' },
    { key: 'year', label: 'This Year', icon: 'calendar-outline' },
    { key: 'lastyear', label: 'Last Year', icon: 'calendar-star' },
  ];

  // Apply filter to history
  const applyFilter = (data, filterKey) => {
    const now = new Date();
    let filtered = data;

    switch (filterKey) {
      case 'today':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          return isToday(date);
        });
        break;
      case 'week':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          return isThisWeek(date);
        });
        break;
      case 'month':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          return isThisMonth(date);
        });
        break;
      case 'last3months':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          const threeMonthsAgo = subMonths(now, 3);
          return date >= threeMonthsAgo;
        });
        break;
      case 'lastyear':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          const prevYearRef = new Date(now.getFullYear() - 1, 0, 1);
          const lastYearStart = startOfYear(prevYearRef);
          const lastYearEnd = endOfYear(prevYearRef);
          return date >= lastYearStart && date <= lastYearEnd;
        });
        break;
      case 'year':
        filtered = data.filter(item => {
          const date = parseItemDate(item);
          return isThisYear(date);
        });
        break;
      default:
        filtered = data;
    }

    setFilteredHistory(filtered);
  };

  // Helper function to parse date robustly
  const parseItemDate = (item) => {
    try {
      const d = item && item.date;
      if (!d) return new Date();

      // If numeric timestamp (could be seconds), normalize to ms
      if (typeof d === 'number') {
        const ms = d < 1e12 ? d * 1000 : d; // convert seconds -> ms if needed
        const dt = new Date(ms);
        return isNaN(dt.getTime()) ? new Date() : dt;
      }

      if (typeof d === 'string') {
        // Try parseISO first (for ISO strings), then fallback to Date constructor
        try {
          const iso = parseISO(d);
          if (!isNaN(iso.getTime())) return iso;
        } catch (e) {
          // ignore and try other formats
        }

        // Try parsing formats like 'Jul 22, 2025'
        try {
          const fmt = parse(d, 'MMM d, yyyy', new Date());
          if (!isNaN(fmt.getTime())) return fmt;
        } catch (e) {
          // ignore and fallback
        }

        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }

      // Fallback for other types
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? new Date() : dt;
    } catch (e) {
      return new Date();
    }
  };

  // Handle filter change
  const handleFilterChange = (filterKey) => {
    setSelectedFilter(filterKey);
    applyFilter(history, filterKey);
  };

  React.useEffect(() => {
    fetchChatHistory();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchChatHistory();
    }, [])
  );

  const onRefresh = () => {
    fetchChatHistory(true);
  };

  const groupByDate = (items) => {
    const groups = { 
      'Today': [], 
      'Yesterday': [], 
      'This Week': [], 
      'Last Week': [],
      'This Month': [], 
      'Last Month': [],
      'Earlier': [] 
    };
    
    items.forEach(item => {
      try {
        const dateObj = parseItemDate(item);
        const now = new Date();
        const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonthStart = subMonths(now, 1);
        
        if (isToday(dateObj)) {
          groups['Today'].push(item);
        } else if (isYesterday(dateObj)) {
          groups['Yesterday'].push(item);
        } else if (isThisWeek(dateObj)) {
          groups['This Week'].push(item);
        } else if (dateObj >= lastWeekStart && dateObj < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          groups['Last Week'].push(item);
        } else if (isThisMonth(dateObj)) {
          groups['This Month'].push(item);
        } else if (dateObj >= startOfMonth(lastMonthStart) && dateObj <= endOfMonth(lastMonthStart)) {
          groups['Last Month'].push(item);
        } else {
          groups['Earlier'].push(item);
        }
      } catch (e) {
        groups['Earlier'].push(item);
      }
    });
    return groups;
  };

  const openChat = async (chat) => {
    navigation.navigate('VoiceChatInputScreen', { chatId: chat.id, chatData: chat });
  };

  const renameChat = (chat) => {
    Alert.prompt(
      'Rename Chat',
      'Enter a new name for this chat',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save', 
          onPress: async (text) => {
            if (!text || text.trim().length === 0) return;
            const newTitle = text.trim();
            try {
              // Update locally
              const updated = history.map(h => h.id === chat.id ? { ...h, title: newTitle } : h);
              setHistory(updated);
              applyFilter(updated, selectedFilter);
              await AsyncStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(updated));
              
              // Persist to backend
              await fetch(`${API_BASE}/farmer/${FARMER_ID}/chat/${chat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...chat, title: newTitle })
              });
            } catch (e) {
              console.error('Rename failed', e);
              Alert.alert('Error', 'Failed to rename chat');
            }
          }
        }
      ],
      'plain-text',
      chat.title || ''
    );
  };

  const deleteChat = (chat) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update locally
              const updated = history.filter(h => h.id !== chat.id);
              setHistory(updated);
              applyFilter(updated, selectedFilter);
              await AsyncStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(updated));
              
              // Delete from backend
              await fetch(`${API_BASE}/farmer/${FARMER_ID}/chat/${chat.id}`, {
                method: 'DELETE'
              });
            } catch (e) {
              console.error('Delete failed', e);
              Alert.alert('Error', 'Failed to delete chat');
            }
          }
        }
      ]
    );
  };

  const renderChatItem = (chat) => (
    <TouchableOpacity 
      key={chat.id} 
      style={[styles.chatCard, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border 
      }]} 
      onPress={() => openChat(chat)}
      activeOpacity={0.7}
    >
      <View style={styles.chatCardContent}>
        <View style={styles.chatInfo}>
          <View style={[styles.chatIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <MaterialCommunityIcons name="chat-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.chatTextContainer}>
            <Text style={[styles.chatTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {chat.title || 'Untitled Chat'}
            </Text>
            <Text style={[styles.chatDate, { color: theme.colors.textSecondary }]}>
              {chat.date}
            </Text>
            {chat.messages && chat.messages.length > 0 && (
              <Text style={[styles.chatPreview, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {chat.messages[chat.messages.length - 1]?.text || 'No messages'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.chatActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: `${theme.colors.primary}10` }]}
            onPress={() => renameChat(chat)}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF524510' }]}
            onPress={() => deleteChat(chat)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF5245" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${theme.colors.primary}10` }]}>
        <MaterialCommunityIcons name="chat-outline" size={48} color={theme.colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Chat History
      </Text>
      <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
        Start a conversation to see your chat history here
      </Text>
      <TouchableOpacity 
        style={[styles.startChatButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ChoiceScreen')}
      >
        <Text style={styles.startChatText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroupSection = ({ item: groupKey }) => {
    const groups = groupByDate(filteredHistory || []);
    const groupChats = groups[groupKey];
    
    if (groupChats.length === 0) return null;

    return (
      <View style={styles.groupSection}>
        <View style={styles.groupHeaderContainer}>
          <Text style={[styles.groupHeader, { color: theme.colors.text }]}>
            {groupKey}
          </Text>
          <View style={[styles.groupBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Text style={[styles.groupCount, { color: theme.colors.primary }]}>
              {groupChats.length}
            </Text>
          </View>
        </View>
        {groupChats.map(chat => renderChatItem(chat))}
      </View>
    );
  };

  const groups = groupByDate(filteredHistory || []);
  const groupKeys = Object.keys(groups).filter(key => groups[key].length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 7 }]}> 
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border, marginTop: insets.top - 20 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: `${theme.colors.primary}15` }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="history" size={24} color={theme.colors.primary} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Chat History
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {filteredHistory.length} conversation{filteredHistory.length !== 1 ? 's' : ''}
            {selectedFilter !== 'all' && ` • ${filterOptions.find(f => f.key === selectedFilter)?.label}`}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: `${theme.colors.primary}15` }]}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: selectedFilter === filter.key 
                    ? theme.colors.primary 
                    : `${theme.colors.primary}10`,
                  borderColor: selectedFilter === filter.key 
                    ? theme.colors.primary 
                    : `${theme.colors.primary}20`
                }
              ]}
              onPress={() => handleFilterChange(filter.key)}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={16} 
                color={selectedFilter === filter.key ? 'white' : theme.colors.primary} 
              />
              <Text style={[
                styles.filterText,
                { 
                  color: selectedFilter === filter.key 
                    ? 'white' 
                    : theme.colors.primary 
                }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && history.length === 0 ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={32} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading chat history...
            </Text>
          </View>
        ) : error && history.length === 0 ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF5245" />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
              Failed to Load
            </Text>
            <Text style={[styles.errorDescription, { color: theme.colors.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => fetchChatHistory()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : groupKeys.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={groupKeys}
            keyExtractor={item => item}
            renderItem={renderGroupSection}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },

  // Group Styles
  groupSection: {
    marginBottom: 24,
  },
  groupHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginLeft: 4,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Filter Styles
  filterContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Chat Card Styles
  chatCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chatCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatTextContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 13,
    opacity: 0.6,
  },
  chatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.7,
  },
  startChatButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});