import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';
import * as ImagePicker from 'expo-image-picker';

export default function StudentProfileScreen({ navigation }) {
  const [localImage, setLocalImage] = useState(null);

  const pickProfileImage = async () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Gallery', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Allow photo access to change profile picture.');
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) setLocalImage(r.assets[0].uri);
      }},
      { text: 'Camera', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Allow camera access to take a photo.');
        const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) setLocalImage(r.assets[0].uri);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const { user, logout } = useAuth();
  const certs = user?.certificates || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[COLORS.primary, '#1E4DB7']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarWrap}>
              {localImage || user?.profileImage ? (
                <Image source={{ uri: localImage || user.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraBtn} onPress={pickProfileImage}>
                <Ionicons name="camera" size={13} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userCollege}>{user?.college}</Text>
              <View style={styles.branchRow}>
                <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.userBranch}>{user?.branch} · {user?.year}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={18} color={COLORS.primary} />
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{user?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={18} color={COLORS.accentGold} />
            <Text style={[styles.statValue, { color: COLORS.accentGold }]}>{user?.wins || 0}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statBox}>
            <Ionicons name="ribbon" size={18} color={COLORS.success} />
            <Text style={[styles.statValue, { color: COLORS.success }]}>{certs.length}</Text>
            <Text style={styles.statLabel}>Certs</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statBox}>
            <Ionicons name="flash" size={18} color="#7B2FBE" />
            <Text style={[styles.statValue, { color: '#7B2FBE' }]}>{user?.solutionsSubmitted || 0}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Info</Text>
          <InfoRow icon="school-outline" label="College" value={user?.college} />
          <InfoRow icon="book-outline" label="Branch" value={user?.branch} />
          <InfoRow icon="calendar-outline" label="Year" value={user?.year} />
          <InfoRow icon="id-card-outline" label="Roll Number" value={user?.rollNumber} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        </View>

        {/* Skills */}
        {user?.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {(typeof user.skills === 'string' ? user.skills.split(',') : user.skills).map((skill, i) => (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certificates */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Certificates ({certs.length})</Text>
            {certs.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Certificates')}>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>
          {certs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="ribbon-outline" size={36} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No certificates yet</Text>
              <Text style={styles.emptySub}>Win a challenge to earn your first certificate!</Text>
            </View>
          ) : (
            certs.slice(0, 2).map((cert, i) => (
              <View key={i} style={styles.certItem}>
                <View style={styles.certIcon}>
                  <Ionicons name="trophy" size={16} color={COLORS.accentGold} />
                </View>
                <View style={styles.certInfo}>
                  <Text style={styles.certTitle} numberOfLines={1}>{cert.challengeTitle}</Text>
                  <Text style={styles.certStartup}>{cert.startupName} · {new Date(cert.awardedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
            ))
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={COLORS.primary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  headerContent: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  headerInfo: { flex: 1, paddingTop: 4 },
  userName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 3 },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 3 },
  userCollege: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 3 },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userBranch: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, margin: 16, marginTop: -14,
    padding: 16, ...SHADOW.strong, alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  statDiv: { width: 1, height: 40, backgroundColor: COLORS.border },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, margin: 16, marginTop: 0, padding: 18, ...SHADOW.card },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  viewAll: { fontSize: 13, color: COLORS.primaryLight, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 13, color: COLORS.textSecondary },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.round, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
  skillText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  certItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  certIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.accentGold + '18', justifyContent: 'center', alignItems: 'center' },
  certInfo: { flex: 1 },
  certTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  certStartup: { fontSize: 11, color: COLORS.textMuted },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    margin: 16, marginTop: 0, marginBottom: 32, padding: 16, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent + '12', borderWidth: 1.5, borderColor: COLORS.accent + '30',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
});
