import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const STATUS_CONFIG = {
  submitted: { color: COLORS.primaryLight, label: 'Submitted', icon: 'time-outline' },
  reviewed: { color: COLORS.medium, label: 'Reviewed', icon: 'eye-outline' },
  winner: { color: COLORS.accentGold, label: '🏆 Winner!', icon: 'trophy' },
};

export default function MySolutionsScreen({ navigation }) {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await api.get('/solutions/my-solutions');
      setSolutions(res.data.solutions);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchSolutions(); }, []);

  const wins = solutions.filter((s) => s.isWinner).length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#1E4DB7']} style={styles.header}>
        <Text style={styles.headerTitle}>My Solutions</Text>
        <Text style={styles.headerSub}>{solutions.length} total · {wins} wins</Text>
      </LinearGradient>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{solutions.length}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.medium }]}>
            {solutions.filter(s => s.status === 'reviewed').length}
          </Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: COLORS.accentGold }]}>{wins}</Text>
          <Text style={styles.statLabel}>Won</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={solutions}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSolutions(); }} tintColor={COLORS.primary} />}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.submitted;
            return (
              <View style={[styles.card, item.isWinner && styles.winnerCard]}>
                {item.isWinner && (
                  <LinearGradient colors={[COLORS.accentGold, '#F97316']} style={styles.winnerBanner}>
                    <Text style={styles.winnerBannerText}>🏆 WINNER — {item.challenge?.startupName}</Text>
                  </LinearGradient>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.challengeTitle} numberOfLines={2}>{item.challenge?.title}</Text>
                  <Text style={styles.startupName}>{item.challenge?.startupName}</Text>
                  <Text style={styles.approachPreview} numberOfLines={3}>{item.approach}</Text>

                  <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
                      <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  {item.startupFeedback ? (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>Startup Feedback:</Text>
                      <Text style={styles.feedbackText}>{item.startupFeedback}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No solutions yet</Text>
              <Text style={styles.emptySub}>Go solve a startup challenge!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.certBtn}
        onPress={() => navigation.navigate('Certificates')}
      >
        <Ionicons name="ribbon" size={18} color={COLORS.accentGold} />
        <Text style={styles.certBtnText}>View My Certificates</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 28 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  statsRow: {
    flexDirection: 'row', margin: 16, marginTop: -16, gap: 12,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.card,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '900', color: COLORS.primary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.card },
  winnerCard: { borderWidth: 2, borderColor: COLORS.accentGold },
  winnerBanner: { paddingVertical: 8, paddingHorizontal: 16 },
  winnerBannerText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  cardBody: { padding: 16 },
  challengeTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  startupName: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },
  approachPreview: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '700' },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  feedbackBox: { marginTop: 12, backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.md, padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.primaryLight },
  feedbackLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  feedbackText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  certBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: 16, padding: 16, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.accentGold + '60',
    ...SHADOW.card,
  },
  certBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginLeft: 10 },
});
