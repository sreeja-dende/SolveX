import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

export default function CertificatesScreen({ navigation }) {
  const { user } = useAuth();
  const certificates = user?.certificates || [];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Certificates</Text>
        <Text style={styles.headerSub}>{certificates.length} certificates earned</Text>
      </LinearGradient>

      <FlatList
        data={certificates}
        keyExtractor={(item, i) => item.certificateCode || String(i)}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.certCard}>
            {/* Gold ribbon top */}
            <LinearGradient
              colors={[COLORS.accentGold, '#E67E22']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.certTop}
            >
              <Ionicons name="ribbon" size={20} color="#fff" />
              <Text style={styles.certTopText}>CERTIFICATE OF ACHIEVEMENT</Text>
            </LinearGradient>

            <View style={styles.certBody}>
              <Text style={styles.certNumber}>#{index + 1}</Text>
              <Text style={styles.certChallenge}>{item.challengeTitle}</Text>
              <View style={styles.certBadge}>
                <Ionicons name="trophy" size={14} color={COLORS.accentGold} />
                <Text style={styles.certBadgeText}>Challenge Winner</Text>
              </View>
              <View style={styles.certDetailRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.certDetailText}>{item.startupName}</Text>
              </View>
              <View style={styles.certDetailRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.certDetailText}>
                  {new Date(item.awardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Certificate Code</Text>
                <Text style={styles.codeValue}>{item.certificateCode}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="ribbon-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Certificates Yet</Text>
            <Text style={styles.emptySub}>Win a challenge to earn your first certificate!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  certCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    overflow: 'hidden', ...SHADOW.strong,
    borderWidth: 1.5, borderColor: COLORS.accentGold + '40',
  },
  certTop: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  certTopText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  certBody: { padding: 20 },
  certNumber: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1 },
  certChallenge: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 24, marginBottom: 12 },
  certBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accentGold + '18', borderRadius: RADIUS.round,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 14,
  },
  certBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.accentGold },
  certDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  certDetailText: { fontSize: 13, color: COLORS.textSecondary },
  codeBox: {
    marginTop: 14, backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  codeLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  codeValue: { fontSize: 13, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
