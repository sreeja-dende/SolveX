import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MEDAL_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data.leaderboard);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const myRank = leaderboard.find((s) => s._id === user?._id);
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const PodiumItem = ({ item, size }) => (
    <View style={[styles.podiumItem, { width: size }]}>
      <Text style={styles.podiumMedal}>{MEDAL[item.rank]}</Text>
      <View style={[styles.podiumAvatar, { backgroundColor: MEDAL_COLORS[item.rank] + '20', borderColor: MEDAL_COLORS[item.rank] }]}>
        <Text style={[styles.podiumInitial, { color: MEDAL_COLORS[item.rank] }]}>
          {item.name?.charAt(0)?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{item.name?.split(' ')[0]}</Text>
      <Text style={styles.podiumPoints}>{item.points} pts</Text>
      <Text style={styles.podiumWins}>{item.wins} wins</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#162D6B']} style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>Top Problem Solvers</Text>
        {myRank && (
          <View style={styles.myRankBadge}>
            <Ionicons name="person" size={14} color={COLORS.accentGold} />
            <Text style={styles.myRankText}>Your Rank: #{myRank.rank} · {myRank.points} pts</Text>
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(i) => i._id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} tintColor={COLORS.primary} />}
          ListHeaderComponent={
            <>
              {/* Podium Top 3 */}
              {top3.length > 0 && (
                <View style={styles.podiumWrap}>
                  {top3[1] && <PodiumItem item={top3[1]} size={90} />}
                  {top3[0] && <PodiumItem item={top3[0]} size={110} />}
                  {top3[2] && <PodiumItem item={top3[2]} size={80} />}
                </View>
              )}
              <Text style={styles.listHeader}>Rankings</Text>
            </>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const isMe = item._id === user?._id;
            return (
              <View style={[styles.rowCard, isMe && styles.rowCardMe]}>
                <Text style={[styles.rankNum, isMe && { color: COLORS.primary }]}>#{item.rank}</Text>
                <View style={[styles.avatar, isMe && { backgroundColor: COLORS.primary }]}>
                  <Text style={[styles.avatarInitial, isMe && { color: '#fff' }]}>
                    {item.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowName, isMe && { color: COLORS.primary }]}>
                    {item.name} {isMe ? '(You)' : ''}
                  </Text>
                  <Text style={styles.rowCollege}>{item.college || 'Student'}</Text>
                </View>
                <View style={styles.rowStats}>
                  <Text style={styles.rowPoints}>{item.points}</Text>
                  <Text style={styles.rowPtsLabel}>pts</Text>
                  <View style={styles.rowWinBadge}>
                    <Ionicons name="trophy" size={11} color={COLORS.accentGold} />
                    <Text style={styles.rowWins}>{item.wins}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="trophy-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No students ranked yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  myRankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.round,
    paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginTop: 12,
  },
  myRankText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  podiumWrap: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    paddingTop: 20, paddingBottom: 8, gap: 12,
  },
  podiumItem: { alignItems: 'center', gap: 4 },
  podiumMedal: { fontSize: 28 },
  podiumAvatar: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2.5,
  },
  podiumInitial: { fontSize: 22, fontWeight: '900' },
  podiumName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, maxWidth: 80, textAlign: 'center' },
  podiumPoints: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  podiumWins: { fontSize: 11, color: COLORS.textMuted },
  listHeader: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, paddingHorizontal: 16, paddingVertical: 12, letterSpacing: 1, textTransform: 'uppercase' },
  rowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 8,
    borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  rowCardMe: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: '#EEF4FF' },
  rankNum: { width: 28, fontSize: 14, fontWeight: '800', color: COLORS.textMuted, textAlign: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceDark, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 18, fontWeight: '800', color: COLORS.textSecondary },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  rowCollege: { fontSize: 12, color: COLORS.textMuted },
  rowStats: { alignItems: 'flex-end', gap: 2 },
  rowPoints: { fontSize: 16, fontWeight: '900', color: COLORS.primary },
  rowPtsLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: -4 },
  rowWinBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rowWins: { fontSize: 11, fontWeight: '700', color: COLORS.accentGold },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});
