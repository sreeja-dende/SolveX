import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

export default function ViewSubmissionsScreen({ navigation, route }) {
  const { challenge: initial } = route.params;
  const [challenge, setChallenge] = useState(initial);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [solRes, chalRes] = await Promise.all([
        api.get(`/solutions/challenge/${initial._id}`),
        api.get(`/challenges/${initial._id}`),
      ]);
      setSolutions(solRes.data.solutions);
      setChallenge(chalRes.data.challenge);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCloseChallenge = () => {
    Alert.alert('Close Challenge?', 'No more submissions will be accepted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/challenges/${challenge._id}/close`);
            Toast.show({ type: 'success', text1: 'Challenge closed' });
            fetchData();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
          }
        },
      },
    ]);
  };

  const handleSelectWinner = (solutionId, studentName) => {
    Alert.alert(
      'Select Winner?',
      `Award the win to ${studentName}? They will receive a certificate and leaderboard points.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select as Winner 🏆',
          onPress: async () => {
            try {
              await api.put(`/challenges/${challenge._id}/select-winner`, { solutionId });
              Toast.show({ type: 'success', text1: 'Winner selected! 🏆', text2: `${studentName} has been awarded.` });
              fetchData();
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{challenge.title}</Text>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.headerStatText}>{solutions.length} submissions</Text>
          </View>
          <View style={styles.headerStat}>
            <Ionicons name="radio-button-on" size={14} color={challenge.status === 'open' ? '#4ade80' : '#f87171'} />
            <Text style={styles.headerStatText}>{challenge.status?.replace('_', ' ')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Action bar */}
      {challenge.status === 'open' && (
        <TouchableOpacity style={styles.closeBtn} onPress={handleCloseChallenge}>
          <Ionicons name="stop-circle-outline" size={16} color={COLORS.accent} />
          <Text style={styles.closeBtnText}>Close Challenge (Stop Submissions)</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#7B2FBE" /></View>
      ) : (
        <FlatList
          data={solutions}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#7B2FBE" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.solutionCard, item.isWinner && styles.winnerCard]}
              onPress={() => navigation.navigate('SolutionDetail', { solution: item, challenge })}
              activeOpacity={0.88}
            >
              {item.isWinner && (
                <View style={styles.winnerBanner}>
                  <Ionicons name="trophy" size={14} color={COLORS.accentGold} />
                  <Text style={styles.winnerBannerText}>WINNER</Text>
                </View>
              )}
              <View style={styles.studentRow}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitial}>{item.student?.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.student?.name}</Text>
                  <Text style={styles.studentCollege}>{item.student?.college} · {item.student?.year}</Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Text style={styles.approachPreview} numberOfLines={3}>{item.approach}</Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.readMoreBtn} onPress={() => navigation.navigate('SolutionDetail', { solution: item, challenge })}>
                  <Text style={styles.readMoreText}>Read Full Solution</Text>
                  <Ionicons name="chevron-forward" size={14} color="#7B2FBE" />
                </TouchableOpacity>
                {challenge.status === 'closed' && !challenge.winner && !item.isWinner && (
                  <TouchableOpacity
                    style={styles.winnerBtn}
                    onPress={() => handleSelectWinner(item._id, item.student?.name)}
                  >
                    <Ionicons name="trophy" size={14} color="#fff" />
                    <Text style={styles.winnerBtnText}>Select Winner</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No submissions yet</Text>
              <Text style={styles.emptySub}>Students haven't submitted solutions yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 24 },
  backBtn: { marginBottom: 12, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 10, lineHeight: 24 },
  headerStats: { flexDirection: 'row', gap: 16 },
  headerStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerStatText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'capitalize' },
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, margin: 16, marginBottom: 0,
    padding: 12, backgroundColor: COLORS.accent + '12', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  closeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  solutionCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, ...SHADOW.card, borderWidth: 1, borderColor: COLORS.border,
  },
  winnerCard: { borderColor: COLORS.accentGold, borderWidth: 2 },
  winnerBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accentGold + '18', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 10,
  },
  winnerBannerText: { fontSize: 11, fontWeight: '800', color: COLORS.accentGold, letterSpacing: 1 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  studentAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center',
  },
  studentInitial: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  studentCollege: { fontSize: 11, color: COLORS.textMuted },
  dateText: { fontSize: 11, color: COLORS.textMuted },
  approachPreview: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  readMoreText: { fontSize: 13, fontWeight: '700', color: '#7B2FBE' },
  winnerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accentGold, borderRadius: RADIUS.round,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  winnerBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },
});
