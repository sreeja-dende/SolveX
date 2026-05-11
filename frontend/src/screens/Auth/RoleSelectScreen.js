import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const { width } = Dimensions.get('window');

const roles = [
  {
    key: 'student',
    title: 'I am a Student',
    subtitle: 'Solve real startup problems\n& build your reputation',
    icon: 'school',
    color: COLORS.primary,
    accent: COLORS.primaryLight,
  },
  {
    key: 'startup',
    title: 'I am a Startup',
    subtitle: 'Post real challenges &\ndiscover problem solvers',
    icon: 'rocket',
    color: '#7B2FBE',
    accent: '#9B59B6',
  },
];

export default function RoleSelectScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#162D6B']} style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to SolveX</Text>
        <Text style={styles.headerSub}>Choose how you want to use the platform</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>I am joining as...</Text>

        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={[styles.card, selected === role.key && { borderColor: role.color, borderWidth: 2.5 }]}
            onPress={() => setSelected(role.key)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, { backgroundColor: role.color }]}>
              <Ionicons name={role.icon} size={28} color="#fff" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardSub}>{role.subtitle}</Text>
            </View>
            {selected === role.key && (
              <Ionicons name="checkmark-circle" size={26} color={role.color} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={() => selected && navigation.navigate('Login', { role: selected })}
          disabled={!selected}
        >
          <LinearGradient
            colors={selected ? [COLORS.primary, COLORS.primaryLight] : ['#ccc', '#bbb']}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => selected && navigation.navigate('Register', { role: selected })}>
          <Text style={styles.registerLink}>
            New here? <Text style={{ color: COLORS.primaryLight, fontWeight: '700' }}>Create Account</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('About')} style={styles.aboutBtn}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.aboutBtnText}>Learn about SolveX</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 24, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  body: { flex: 1, padding: 24, paddingTop: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 20, letterSpacing: 0.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  iconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  continueBtn: { marginTop: 12, borderRadius: RADIUS.round, overflow: 'hidden' },
  continueBtnDisabled: { opacity: 0.5 },
  gradientBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 8 },
  continueBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  registerLink: { textAlign: 'center', marginTop: 20, fontSize: 14, color: COLORS.textSecondary },
  aboutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
  aboutBtnText: { fontSize: 13, color: COLORS.textMuted },
});
