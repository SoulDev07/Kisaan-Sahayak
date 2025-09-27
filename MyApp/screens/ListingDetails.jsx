import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ListingDetails({ route, navigation }) {
  const listing = route?.params?.listing || {};
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.colors.statusBarStyle || 'light-content'} />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.headerTint || theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: listing.image || 'https://via.placeholder.com/400x220/1a1a1a/888888?text=No+Image' }}
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.title}>{listing.name || 'Equipment Name'}</Text>
        <Text style={styles.category}>{listing.category || 'Category'}</Text>
        <Text style={styles.description}>{listing.description || 'No description provided.'}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.metaText}>{listing.location?.village || listing.location || 'Location not specified'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={18} color={theme.colors.primary} />
          <Text style={styles.metaText}>{listing.rating || '4.5'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.price}>{listing.price || listing.price_per_day ? `₹${listing.price || listing.price_per_day}` : 'Price on request'}</Text>
          <Text style={styles.priceUnit}>{listing.price_unit || 'per day'}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={() => navigation.goBack()}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={18} color={theme.colors.background} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 40 },
    topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 8, marginTop: 8 },
    backButton: { padding: 8, borderRadius: 16, backgroundColor: theme.colors.card, marginRight: 8 },
    header: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', flex: 1 },
    content: { padding: 24, alignItems: 'center' },
    image: { width: '100%', height: 200, borderRadius: 18, marginBottom: 20, backgroundColor: theme.colors.surface },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4, textAlign: 'center' },
    category: { fontSize: 16, color: theme.colors.primary, marginBottom: 12, textAlign: 'center' },
    description: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: 18, textAlign: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    metaText: { color: theme.colors.text, fontSize: 15, marginLeft: 6 },
    price: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginLeft: 6 },
    priceUnit: { color: theme.colors.textSecondary, fontSize: 14, marginLeft: 6 },
    bookButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 32 },
    bookButtonText: { color: theme.colors.background, fontWeight: 'bold', fontSize: 17, marginRight: 8 },
  });