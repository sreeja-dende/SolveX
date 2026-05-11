import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../assets/theme';

const CAT_COLORS = {
  process: COLORS.catProcess,
  technical: COLORS.catTechnical,
  data: COLORS.catData,
  product: COLORS.catProduct,
  growth: COLORS.catGrowth,
  other: COLORS.catOther,
};

const DIFF_COLORS = { easy: COLORS.easy, medium: COLORS.medium, hard: COLORS.hard };

function daysLeft(deadline) {
  const diff = new Date(deadline) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Expired';
  if (days === 0) return 'Last day!';
  return `${days}d left`;
}

export default function ChallengeCard({ challenge, onPress }) {
  const catColor = CAT_COLORS[challenge.category] || COLORS.catOther;
  const diffColor = DIFF_COLORS[challenge.difficulty] || COLORS.medium;
  const timeLeft = daysLeft(challenge.deadline);
  const isUrgent = timeLeft === 'Last day!' || timeLeft === 'Expired';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.catBadge, { backgroundColor: catColor + '18' }]}>
          <Text style={[styles.catText, { color: catColor }]}>{challenge.category?.toUpperCase()}</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + '18' }]}>
          <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
          <Text style={[styles.diffText, { color: diffColor }]}>{challenge.difficulty}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>{challenge.title}</Text>

      {/* Startup */}
      <View style={styles.startupRow}>
        <Ionicons name="business-outline" size={13} color={COLORS.textMuted} />
        <Text style={styles.startupName}>{challenge.startupName || 'Startup'}</Text>
      </View>

      {/* Description preview */}
      <Text style={styles.desc} numberOfLines={2}>{challenge.description}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.footerText}>{challenge.totalSubmissions} solutions</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="star-outline" size={14} color={COLORS.accentGold} />
          <Text style={[styles.footerText, { color: COLORS.accentGold, fontWeight: '700' }]}>{challenge.points} pts</Text>
        </View>
        <View style={[styles.timeBadge, isUrgent && { backgroundColor: COLORS.accent + '18' }]}>
          <Ionicons name="time-outline" size={13} color={isUrgent ? COLORS.accent : COLORS.textSecondary} />
          <Text style={[styles.timeText, isUrgent && { color: COLORS.accent }]}>{timeLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    ...SHADOW.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  catBadge: { borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 4 },
  catText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  diffBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: RADIUS.round, paddingHorizontal: 10, paddingVertical: 4 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 22, marginBottom: 6 },
  startupRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  startupName: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  desc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 14 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: COLORS.textMuted },
  timeBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.round,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  timeText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
});
