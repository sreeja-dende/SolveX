import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const SECTIONS = [
  { key: 'approach',       title: 'Solution Approach',       icon: 'bulb-outline' },
  { key: 'rootCause',      title: 'Root Cause Analysis',     icon: 'search-outline' },
  { key: 'proposedFix',    title: 'Proposed Fix / Strategy', icon: 'construct-outline' },
  { key: 'implementation', title: 'Implementation Plan',     icon: 'list-outline' },
  { key: 'expectedOutcome',title: 'Expected Outcome',        icon: 'trending-up-outline' },
];

export default function SolutionDetailScreen({ navigation, route }) {
  const { solution: initialSolution, challenge } = route.params;
  const [solution, setSolution] = useState(initialSolution);
  const [feedback, setFeedback] = useState(initialSolution.startupFeedback || '');
  const [rating, setRating]     = useState(initialSolution.startupRating || 0);
  const [saving, setSaving]     = useState(false);
  const [selecting, setSelecting] = useState(false);

  const handleSaveFeedback = async () => {
    if (!feedback.trim())
      return Toast.show({ type: 'error', text1: 'Enter feedback first' });
    setSaving(true);
    try {
      await api.put(`/solutions/${solution._id}/feedback`, { feedback, rating });
      Toast.show({ type: 'success', text1: 'Feedback saved!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
    } finally { setSaving(false); }
  };

  const handleSelectWinner = () => {
    if (solution.isWinner) return;
    if (challenge.status === 'winner_selected')
      return Toast.show({ type: 'error', text1: 'Winner already selected for this challenge' });

    Alert.alert(
      '🏆 Select as Winner?',
      `Award the win to ${solution.student?.name}?\n\nThey will receive:\n• Verified Certificate\n• ${challenge.points || 100} Leaderboard Points\n• Winner Badge on profile`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Select Winner',
          onPress: async () => {
            setSelecting(true);
            try {
              await api.put(`/challenges/${challenge._id}/select-winner`, {
                solutionId: solution._id,
              });
              setSolution(prev => ({ ...prev, isWinner: true, status: 'winner' }));
              Toast.show({
                type: 'success',
                text1: '🏆 Winner Selected!',
                text2: `${solution.student?.name} has been awarded the certificate and ${challenge.points || 100} points.`,
              });
            } catch (e) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: e.response?.data?.message || 'Could not select winner',
              });
            } finally { setSelecting(false); }
          },
        },
      ]
    );
  };

  const alreadyWon = solution.isWinner || solution.status === 'winner';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Solution by</Text>
          <Text style={styles.studentName}>{solution.student?.name}</Text>
          <Text style={styles.studentCollege}>
            {solution.student?.college}
            {solution.student?.branch ? ` · ${solution.student.branch}` : ''}
          </Text>

          {alreadyWon && (
            <View style={styles.winnerBadge}>
              <Ionicons name="trophy" size={16} color={COLORS.accentGold} />
              <Text style={styles.winnerBadgeText}>WINNER — Certificate Awarded</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.body}>

          {/* ── SELECT WINNER BUTTON ─────────────────── */}
          {!alreadyWon && challenge.status !== 'open' && (
            <TouchableOpacity
              style={styles.winnerBtn}
              onPress={handleSelectWinner}
              disabled={selecting}
              activeOpacity={0.85}
            >
              {selecting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="trophy" size={22} color="#fff" />
                  <View style={styles.winnerBtnText}>
                    <Text style={styles.winnerBtnTitle}>Select as Winner</Text>
                    <Text style={styles.winnerBtnSub}>
                      Awards certificate + {challenge.points || 100} pts to {solution.student?.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Already winner banner */}
          {alreadyWon && (
            <View style={styles.wonBanner}>
              <Ionicons name="ribbon" size={22} color={COLORS.accentGold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.wonBannerTitle}>Winner Announced!</Text>
                <Text style={styles.wonBannerSub}>
                  Certificate and {challenge.points || 100} points awarded to {solution.student?.name}
                </Text>
              </View>
            </View>
          )}

          {/* Challenge still open warning */}
          {challenge.status === 'open' && (
            <View style={styles.openWarning}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.openWarningText}>
                Close the challenge first before selecting a winner. Go back and tap "Close Challenge".
              </Text>
            </View>
          )}

          {/* Solution Sections */}
          {SECTIONS.map((sec) => {
            const content = solution[sec.key];
            if (!content) return null;
            return (
              <View key={sec.key} style={styles.sectionCard}>
                <View style={styles.secHeader}>
                  <View style={styles.secIcon}>
                    <Ionicons name={sec.icon} size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.secTitle}>{sec.title}</Text>
                </View>
                <Text style={styles.secContent}>{content}</Text>
              </View>
            );
          })}

          {/* Feedback Section */}
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Your Feedback</Text>
            <Text style={styles.feedbackSub}>Provide private feedback to this student</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= rating ? COLORS.accentGold : COLORS.border}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback for this student's solution approach..."
              placeholderTextColor={COLORS.textMuted}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.feedbackBtn} onPress={handleSaveFeedback} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.feedbackBtnText}>Save Feedback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  studentName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  studentCollege: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  winnerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: COLORS.accentGold + '25', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6, marginTop: 10,
  },
  winnerBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.accentGold, letterSpacing: 1 },
  body: { padding: 16, gap: 14 },

  // Winner button
  winnerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.accentGold, borderRadius: RADIUS.lg,
    padding: 18, ...SHADOW.strong,
  },
  winnerBtnText: { flex: 1 },
  winnerBtnTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  winnerBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  // Won banner
  wonBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.accentGold + '18', borderRadius: RADIUS.lg,
    padding: 16, borderWidth: 1.5, borderColor: COLORS.accentGold + '40',
  },
  wonBannerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.accentGold, marginBottom: 2 },
  wonBannerSub: { fontSize: 12, color: COLORS.textSecondary },

  // Open warning
  openWarning: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.md,
    padding: 14, borderWidth: 1, borderColor: COLORS.primary + '25',
  },
  openWarningText: { flex: 1, fontSize: 13, color: COLORS.primary, lineHeight: 19 },

  sectionCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18, ...SHADOW.card },
  secHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  secIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: COLORS.surfaceDark, justifyContent: 'center', alignItems: 'center' },
  secTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  secContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  feedbackCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 18,
    ...SHADOW.card, borderWidth: 1.5, borderColor: '#7B2FBE30',
  },
  feedbackTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  feedbackSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  feedbackInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 12, fontSize: 14, color: COLORS.textPrimary,
    backgroundColor: COLORS.surfaceDark, minHeight: 100,
  },
  feedbackBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7B2FBE', borderRadius: RADIUS.round, paddingVertical: 14, marginTop: 14,
  },
  feedbackBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
