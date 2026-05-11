import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const CAT_COLORS = {
  process: COLORS.catProcess, technical: COLORS.catTechnical, data: COLORS.catData,
  product: COLORS.catProduct, growth: COLORS.catGrowth, other: COLORS.catOther,
};

export default function ChallengeDetailScreen({ navigation, route }) {
  const { challenge: initial } = route.params;
  const [challenge, setChallenge] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/challenges/${initial._id}`);
      setChallenge(res.data.challenge);
      // Check if user already submitted
      const solRes = await api.get('/solutions/my-solutions');
      const submitted = solRes.data.solutions.some((s) => s.challenge?._id === initial._id || s.challenge === initial._id);
      setAlreadySubmitted(submitted);
    } catch (e) { console.log(e); }
  };

  const catColor = CAT_COLORS[challenge.category] || COLORS.primary;
  const isOpen = challenge.status === 'open';

  const InfoRow = ({ icon, label, value, valueColor }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={catColor} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[catColor, COLORS.primary]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerBadgeRow}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: isOpen ? '#4ade80' : '#f87171' }]} />
              <Text style={styles.statusText}>{challenge.status?.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={13} color={COLORS.accentGold} />
              <Text style={styles.pointsText}>{challenge.points} pts</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>{challenge.title}</Text>
          <Text style={styles.startupLabel}>by {challenge.startupName || challenge.startup?.companyName}</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Info Cards */}
          <View style={styles.infoGrid}>
            <InfoRow icon="grid-outline" label="Category" value={challenge.category} />
            <InfoRow icon="flame-outline" label="Difficulty" value={challenge.difficulty}
              valueColor={{ easy: COLORS.easy, medium: COLORS.medium, hard: COLORS.hard }[challenge.difficulty]} />
            <InfoRow icon="people-outline" label="Submissions" value={`${challenge.totalSubmissions} solutions submitted`} />
            <InfoRow icon="time-outline" label="Deadline" value={new Date(challenge.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoRow icon="gift-outline" label="Reward" value={challenge.reward || 'Certificate + Leaderboard Points'} />
          </View>

          {/* Problem Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problem Description</Text>
            <Text style={styles.sectionContent}>{challenge.description}</Text>
          </View>

          {/* What We Expect */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Expect From You</Text>
            {['Analyze the problem thoroughly', 'Identify root causes', 'Propose a clear solution approach', 'Explain expected outcomes', 'No coding required — ideas and strategy matter'].map((item, i) => (
              <View key={i} style={styles.expectRow}>
                <View style={[styles.expectDot, { backgroundColor: catColor }]} />
                <Text style={styles.expectText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Winner section */}
          {challenge.status === 'winner_selected' && challenge.winner && (
            <View style={[styles.section, styles.winnerSection]}>
              <Text style={styles.sectionTitle}>🏆 Winner</Text>
              <Text style={styles.winnerName}>{challenge.winner?.name || 'A student'}</Text>
              <Text style={styles.winnerCollege}>{challenge.winner?.college}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {isOpen && (
        <View style={styles.ctaWrap}>
          {alreadySubmitted ? (
            <View style={[styles.ctaBtn, { backgroundColor: COLORS.success }]}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.ctaBtnText}>Solution Submitted ✓</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: catColor }]}
              onPress={() => navigation.navigate('SubmitSolution', { challenge })}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Submit My Solution</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerBadgeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  pointsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  pointsText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28, marginBottom: 8 },
  startupLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  body: { padding: 16, gap: 16 },
  infoGrid: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 14,
    ...SHADOW.card,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: COLORS.surfaceDark, justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, textTransform: 'capitalize' },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18, ...SHADOW.card },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  sectionContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  expectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  expectDot: { width: 8, height: 8, borderRadius: 4 },
  expectText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  winnerSection: { borderColor: COLORS.accentGold, borderWidth: 1.5 },
  winnerName: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  winnerCollege: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  ctaWrap: { padding: 16, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: RADIUS.round, paddingVertical: 16, ...SHADOW.card,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
