import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const STAT_CARDS = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: 'school', color: COLORS.primary },
    { label: 'Total Startups', value: stats.totalStartups, icon: 'business', color: '#7B2FBE' },
    { label: 'Total Challenges', value: stats.totalChallenges, icon: 'flash', color: COLORS.catTechnical },
    { label: 'Open Challenges', value: stats.openChallenges, icon: 'radio-button-on', color: COLORS.success },
    { label: 'Total Solutions', value: stats.totalSolutions, icon: 'document-text', color: COLORS.medium },
    { label: 'Winners Selected', value: stats.winnersSelected, icon: 'trophy', color: COLORS.accentGold },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#060E26']} style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSub}>SolveX Platform Overview</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={COLORS.accentGold} />}
      >
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accentGold} /></View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>PLATFORM STATS</Text>
            <View style={styles.statsGrid}>
              {STAT_CARDS.map((card, i) => (
                <View key={i} style={[styles.statCard, { borderTopColor: card.color, borderTopWidth: 3 }]}>
                  <View style={[styles.statIcon, { backgroundColor: card.color + '18' }]}>
                    <Ionicons name={card.icon} size={20} color={card.color} />
                  </View>
                  <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                  <Text style={styles.statLabel2}>{card.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionLabel}>ADMIN INFO</Text>
              <View style={styles.adminRow}>
                <Ionicons name="person-circle" size={40} color={COLORS.accentGold} />
                <View>
                  <Text style={styles.adminName}>{user?.name}</Text>
                  <Text style={styles.adminEmail}>{user?.email}</Text>
                  <Text style={styles.adminRole}>Super Admin</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { padding: 20, paddingTop: 20, paddingBottom: 28 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: COLORS.accentGold, letterSpacing: 2, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', backgroundColor: '#1A2A3A', borderRadius: RADIUS.lg,
    padding: 16, alignItems: 'flex-start', ...SHADOW.card,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel2: { fontSize: 12, color: '#7A8FA6', fontWeight: '600' },
  center: { paddingTop: 60, alignItems: 'center' },
  infoCard: { backgroundColor: '#1A2A3A', borderRadius: RADIUS.lg, padding: 20, gap: 14 },
  adminRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  adminName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  adminEmail: { fontSize: 13, color: '#7A8FA6', marginBottom: 2 },
  adminRole: { fontSize: 11, fontWeight: '700', color: COLORS.accentGold, letterSpacing: 1 },
});
