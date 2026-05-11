import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';
import * as ImagePicker from 'expo-image-picker';

function InfoRow({ icon, label, value, color }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: (color || COLORS.primary) + '15' }]}>
        <Ionicons name={icon} size={15} color={color || COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );
}

function StatBox({ value, label, color, icon }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color={color} style={{ marginBottom: 4 }} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function StartupProfileScreen({ navigation }) {
  const [localImage, setLocalImage] = useState(null);

  const pickProfileImage = async () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      { text: 'Gallery', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Allow photo access.');
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) setLocalImage(r.assets[0].uri);
      }},
      { text: 'Camera', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed', 'Allow camera access.');
        const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!r.canceled) setLocalImage(r.assets[0].uri);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#7B2FBE', '#0A2463']} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatarWrap}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {(user?.companyName || user?.name || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraBtn} onPress={pickProfileImage}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.companyName}>{user?.companyName || user?.name}</Text>
                {user?.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                )}
              </View>
              <Text style={styles.founderName}>👤 {user?.name}</Text>
              <Text style={styles.industry}>
                <Ionicons name="briefcase-outline" size={12} /> {user?.industry || 'Industry not set'}
              </Text>
            </View>
          </View>

          {/* Verification status */}
          {!user?.isVerified ? (
            <TouchableOpacity
              style={styles.verifyBanner}
              onPress={() => navigation.navigate('StartupVerification')}
            >
              <Ionicons name="shield-outline" size={16} color={COLORS.accentGold} />
              <Text style={styles.verifyBannerText}>
                Get Verified — Submit company documents for a Verified badge
              </Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.accentGold} />
            </TouchableOpacity>
          ) : (
            <View style={styles.verifiedBanner}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <Text style={styles.verifiedBannerText}>Verified Startup</Text>
            </View>
          )}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <StatBox value={user?.challengesPosted || 0} label="Challenges" color={COLORS.primary} icon="flash" />
          <View style={styles.statDiv} />
          <StatBox value={user?.totalSubmissions || 0} label="Solutions" color="#7B2FBE" icon="document-text" />
          <View style={styles.statDiv} />
          <StatBox value={user?.winnersSelected || 0} label="Winners" color={COLORS.accentGold} icon="trophy" />
          <View style={styles.statDiv} />
          <StatBox value={user?.isVerified ? '✓' : '✗'} label="Verified" color={user?.isVerified ? COLORS.success : COLORS.textMuted} icon="shield-checkmark" />
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <InfoRow icon="business-outline" label="Company Name" value={user?.companyName} />
          <InfoRow icon="briefcase-outline" label="Industry" value={user?.industry} color="#7B2FBE" />
          <InfoRow icon="people-outline" label="Team Size" value={user?.teamSize} color={COLORS.success} />
          <InfoRow icon="calendar-outline" label="Founded" value={user?.foundedYear} color={COLORS.accentGold} />
          <InfoRow icon="globe-outline" label="Website" value={user?.website} color={COLORS.catTechnical} />
          <InfoRow icon="logo-linkedin" label="LinkedIn" value={user?.linkedinUrl} color="#0077B5" />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Startup</Text>
          <Text style={styles.aboutText}>{user?.companyDescription || 'No description added yet. Update your profile to tell students about your startup.'}</Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <InfoRow icon="mail-outline" label="Email" value={user?.email} color={COLORS.primary} />
          <InfoRow icon="flash-outline" label="Problem Domain" value={user?.problemDomain} color={COLORS.accent} />
        </View>

        {/* What we post */}
        <View style={[styles.section, { backgroundColor: '#F5EEFF', borderColor: '#7B2FBE20', borderWidth: 1 }]}>
          <Text style={styles.sectionTitle}>How SolveX works for us</Text>
          {[
            'Post real unsolved internal problems as challenges',
            'Students submit analytical solution approaches',
            'Review all submissions and select the best solution',
            'Winner gets a certificate and leaderboard recognition',
            'You discover talented problem-solvers early',
          ].map((item, i) => (
            <View key={i} style={styles.howRow}>
              <View style={[styles.howDot, { backgroundColor: '#7B2FBE' }]} />
              <Text style={styles.howText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('StartupVerification')}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#7B2FBE" />
            <Text style={[styles.actionBtnText, { color: '#7B2FBE' }]}>
              {user?.isVerified ? 'Verification Status' : 'Submit Verification Docs'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.accent} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: { fontSize: 28, fontWeight: '900', color: '#fff' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#7B2FBE', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  headerInfo: { flex: 1, paddingTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  companyName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  founderName: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 3 },
  industry: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(244,162,40,0.15)', borderRadius: RADIUS.md,
    padding: 12, borderWidth: 1, borderColor: 'rgba(244,162,40,0.3)',
  },
  verifyBannerText: { flex: 1, fontSize: 12, color: COLORS.accentGold, fontWeight: '600' },
  verifiedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(46,196,182,0.15)', borderRadius: RADIUS.md,
    padding: 10, borderWidth: 1, borderColor: 'rgba(46,196,182,0.3)',
  },
  verifiedBannerText: { fontSize: 13, color: COLORS.success, fontWeight: '700' },
  statsCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, margin: 16, marginTop: -10,
    padding: 16, ...SHADOW.strong, alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  statDiv: { width: 1, height: 40, backgroundColor: COLORS.border },
  section: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    margin: 16, marginTop: 0, padding: 18, ...SHADOW.card,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoIconWrap: { width: 32, height: 32, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 13, color: COLORS.textSecondary },
  aboutText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  howDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  howText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  actionsSection: { padding: 16, paddingTop: 0, gap: 10, marginBottom: 24 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center',
    padding: 15, borderRadius: RADIUS.lg, backgroundColor: '#F5EEFF',
    borderWidth: 1.5, borderColor: '#7B2FBE30',
  },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 15, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent + '12', borderWidth: 1.5, borderColor: COLORS.accent + '30',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.accent },
});
