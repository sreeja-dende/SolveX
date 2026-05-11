import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) return Toast.show({ type: 'error', text1: 'Enter your email address' });
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      Toast.show({ type: 'success', text1: 'OTP Sent!', text2: 'Check your email for the reset code.' });
      setStep(2);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Email not found in our system' });
    } finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) return Toast.show({ type: 'error', text1: 'Enter the OTP from your email' });
    if (!newPassword || newPassword.length < 6) return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    if (newPassword !== confirmPassword) return Toast.show({ type: 'error', text1: 'Passwords do not match' });
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp, newPassword });
      Toast.show({ type: 'success', text1: 'Password Reset! 🎉', text2: 'You can now login with your new password.' });
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Reset failed', text2: err.response?.data?.message || 'Invalid or expired OTP' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.primary, '#1E4DB7']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <Text style={styles.headerSub}>
          {step === 1 ? 'Enter your registered email to receive a reset code' : 'Enter the OTP sent to your email'}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.stepDotText}>1</Text>
          </View>
          <View style={[styles.stepConnector, step === 2 && { backgroundColor: COLORS.primary }]} />
          <View style={[styles.stepDot, step === 2 && { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.stepDotText, step !== 2 && { color: COLORS.textMuted }]}>2</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Enter Email</Text>
          <Text style={styles.stepLabel}>Reset Password</Text>
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={{ paddingLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSendOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="send-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Send Reset Code</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.emailConfirm}>
              <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
              <Text style={styles.emailConfirmText}>OTP sent to {email}</Text>
              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.changeEmail}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Enter OTP</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={18} color={COLORS.textMuted} style={{ paddingLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={{ paddingLeft: 14 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min 6 characters"
                placeholderTextColor={COLORS.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ paddingRight: 14 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={{ paddingLeft: 14 }} />
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
              />
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={handleResetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Reset Password</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSendOTP} style={styles.resendBtn}>
              <Text style={styles.resendText}>Didn't receive OTP? <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Resend</Text></Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
  card: { backgroundColor: COLORS.surface, borderRadius: 28, margin: 16, marginTop: -20, padding: 24, ...SHADOW.strong },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  stepDotText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  stepConnector: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 6 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stepLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceDark },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: COLORS.textPrimary },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, borderRadius: RADIUS.round, paddingVertical: 15, marginTop: 24 },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  emailConfirm: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF4FF', borderRadius: RADIUS.md, padding: 10, marginBottom: 4 },
  emailConfirmText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  changeEmail: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 13, color: COLORS.textSecondary },
});
