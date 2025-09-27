import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView, TouchableOpacity , StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkConfig } from '../utils/NetworkConfig';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = NetworkConfig.API_BASE;
const FARMER_ID = 'f001'; // Replace with dynamic value if needed

export default function MyBookings({ navigation }) {
  const { theme } = useTheme();
  // Hardcoded beautiful data
  const bookings = [
    {
      id: '1',
      equipmentName: 'John Deere Tractor',
      date: '2024-07-01 to 2024-07-05',
      status: 'Confirmed',
      price: 2500,
      icon: 'tractor',
    },
    {
      id: '2',
      equipmentName: 'Rotavator',
      date: '2024-07-10 to 2024-07-12',
      status: 'Completed',
      price: 900,
      icon: 'leaf',
    },
    {
      id: '3',
      equipmentName: 'Power Tiller',
      date: '2024-07-15 to 2024-07-18',
      status: 'Cancelled',
      price: 0,
      icon: 'close-circle',
    },
  ];
  const loading = false;
  const error = '';

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name={item.icon || 'calendar-outline'} size={28} color="#4CAF50" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.equipmentName}</Text>
        <Text style={styles.subtitle}>{item.date}</Text>
        <Text style={[styles.status, item.status === 'Confirmed' && { color: '#4CAF50' }, item.status === 'Completed' && { color: '#0099ff' }, item.status === 'Cancelled' && { color: '#ff4444' }]}>{item.status}</Text>
      </View>
      <Text style={styles.price}>{item.price ? `\u20b9${item.price}` : ''}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <StatusBar barStyle={theme.colors.statusBarStyle || 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.card }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.colors.text }]}>My Bookings</Text>
      </View>
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
        contentContainerStyle={{ padding: 20, paddingTop: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>No bookings found.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 48 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 24, marginTop: 8 },
  backButton: { padding: 8, borderRadius: 16, backgroundColor: '#181818', marginRight: 8 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', letterSpacing: -0.5, flex: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#181818', borderRadius: 18, padding: 20, marginBottom: 18, shadowColor: '#4CAF50', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#cccccc', marginBottom: 2 },
  status: { fontSize: 13, color: '#4CAF50', fontWeight: '600', marginTop: 2 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginLeft: 8 },
  error: { color: 'red', margin: 16 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
}); 