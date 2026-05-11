import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const STATUS_CONFIG = {
  open: { color: COLORS.success, label: 'Open', icon: 'radio-button-on' },
  closed: { color: COLORS.medium, label: 'Closed', icon: 'stop-circle-outline' },
  winner_selected: { color: COLORS.accentGold, label: 'Completed', icon: 'trophy' },
};

export default function StartupHomeScreen({ navigation }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await api.get('/challenges/my-challenges');
      setChallenges(res.data.challenges);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchChallenges(); }, []);

  const total = challenges.length;
  const open = challenges.filter(c => c.status === 'open').length;
  const completed = challenges.filter(c => c.status === 'winner_selected').length;
  const totalSubs = challenges.reduce((acc, c) => acc + (c.totalSubmissions || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#7B2FBE', '#0A2463']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.companyName || user?.name} 🚀</Text>
            <Text style={styles.headerSub}>Manage your challenges & submissions</Text>
          </View>
          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>Challenges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#4ade80' }]}>{open}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.accentGold }]}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#60A5FA' }]}>{totalSubs}</Text>
            <Text style={styles.statLabel}>Solutions</Text>
          </View>
        </View>
      </LinearGradient>

      <Text style={styles.listHeader}>Your Posted Challenges</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChallenges(); }} tintColor="#7B2FBE" />}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
            return (
              <TouchableOpacity
                style={styles.challengeCard}
                onPress={() => navigation.navigate('ViewSubmissions', { challenge: item })}
                activeOpacity={0.88}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
                    <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={styles.catText}>{item.category}</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.footerText}>{item.totalSubmissions} solutions</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.footerText}>
                      {new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View Submissions</Text>
                    <Ionicons name="chevron-forward" size={14} color="#7B2FBE" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="flash-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No challenges posted yet</Text>
              <Text style={styles.emptySub}>Post your first unsolved problem!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(46,196,182,0.2)', borderRadius: RADIUS.round,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: COLORS.success },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.lg, padding: 16, gap: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 2 },
  listHeader: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, padding: 16, paddingBottom: 8 },
  challengeCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, ...SHADOW.card, borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  catText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: COLORS.textMuted },
  viewBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: '#7B2FBE' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },
});
