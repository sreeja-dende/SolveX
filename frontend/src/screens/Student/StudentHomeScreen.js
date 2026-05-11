import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW, SPACING } from '../../assets/theme';
import ChallengeCard from '../../components/ChallengeCard';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'process', label: 'Process' },
  { key: 'technical', label: 'Technical' },
  { key: 'data', label: 'Data' },
  { key: 'product', label: 'Product' },
  { key: 'growth', label: 'Growth' },
];

export default function StudentHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const fetchChallenges = useCallback(async () => {
    try {
      let url = '/challenges?status=open';
      if (selectedCat !== 'all') url += `&category=${selectedCat}`;
      if (search) url += `&search=${search}`;
      const res = await api.get(url);
      setChallenges(res.data.challenges);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCat, search]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const onRefresh = () => { setRefreshing(true); fetchChallenges(); };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#1E4DB7']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.headerSub}>Find a challenge to solve today</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color={COLORS.accentGold} />
            <Text style={styles.pointsText}>{user?.points || 0} pts</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={fetchChallenges}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.filterWrap}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedCat === item.key && styles.filterChipActive]}
              onPress={() => setSelectedCat(item.key)}
            >
              <Text style={[styles.filterChipText, selectedCat === item.key && styles.filterChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Challenge List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          renderItem={({ item }) => (
            <ChallengeCard challenge={item} onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No challenges found</Text>
              <Text style={styles.emptySub}>Try a different category or search term</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pointsText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  filterWrap: { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceDark, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#fff' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14 },
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
});
