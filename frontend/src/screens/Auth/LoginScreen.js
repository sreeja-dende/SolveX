import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function LoginScreen({ navigation, route }) {
  const role = route.params?.role || 'student';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim())
      return Toast.show({ type: 'error', text1: 'Email required', text2: 'Please enter your email address' });
    if (!isValidEmail(email))
      return Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email (e.g. name@example.com)' });
    if (!password.trim())
      return Toast.show({ type: 'error', text1: 'Password required', text2: 'Please enter your password' });

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: err.response?.data?.message || 'Invalid email or password' });
    } finally { setLoading(false); }
  };

  const roleLabel = role === 'student' ? 'Student' : role === 'startup' ? 'Startup' : 'Admin';
  const roleColor = role === 'student' ? COLORS.primary : role === 'startup' ? '#7B2FBE' : COLORS.accent;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[roleColor, COLORS.primaryLight]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Solve</Text>
            <Text style={[styles.logoText, { color: COLORS.accentGold }]}>X</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back, {roleLabel}!</Text>
          <Text style={styles.subText}>Sign in to continue your journey</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Your password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ paddingRight: 14 }}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: roleColor }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
            <Text style={styles.link}>Don't have an account? <Text style={{ color: roleColor, fontWeight: '700' }}>Register here</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 10 }}>
            <Text style={styles.link}>Forgot password? <Text style={{ color: roleColor, fontWeight: '700' }}>Reset it</Text></Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('About')} style={{ marginTop: 10 }}>
            <Text style={[styles.link, { color: COLORS.textMuted }]}>Learn about SolveX</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 16, paddingBottom: 48, paddingHorizontal: 24 },
  backBtn: { marginBottom: 20, width: 36, height: 36, justifyContent: 'center' },
  logoRow: { flexDirection: 'row', marginBottom: 12 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subText: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 28, margin: 16, marginTop: -24, padding: 24, ...SHADOW.strong },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 16 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceDark },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: COLORS.textPrimary },
  loginBtn: { borderRadius: RADIUS.round, paddingVertical: 16, alignItems: 'center', marginTop: 28, marginBottom: 16, ...SHADOW.card },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  link: { textAlign: 'center', fontSize: 14, color: COLORS.textSecondary },
});
