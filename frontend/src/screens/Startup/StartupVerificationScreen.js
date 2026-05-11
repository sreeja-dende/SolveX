import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const DOC_TYPES = [
  { key: 'gst', label: 'GST Registration Certificate', icon: 'document-text-outline', required: true },
  { key: 'incorporation', label: 'Company Incorporation Certificate', icon: 'business-outline', required: true },
  { key: 'pan', label: 'Company PAN Card', icon: 'card-outline', required: false },
  { key: 'startup_india', label: 'Startup India Recognition (if any)', icon: 'ribbon-outline', required: false },
];

export default function StartupVerificationScreen({ navigation }) {
  const [form, setForm] = useState({
    companyName: '',
    registrationNumber: '',
    yearFounded: '',
    teamSize: '',
    description: '',
    linkedinUrl: '',
    websiteUrl: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const markDocUploaded = (key) => {
    setUploadedDocs(p => ({ ...p, [key]: true }));
    Toast.show({ type: 'success', text1: 'Document marked', text2: 'In production, this would upload your file.' });
  };

  const handleSubmit = async () => {
    if (!form.companyName || !form.registrationNumber) {
      return Toast.show({ type: 'error', text1: 'Required fields missing', text2: 'Company name and registration number are required' });
    }
    const requiredDocs = DOC_TYPES.filter(d => d.required);
    const missingDocs = requiredDocs.filter(d => !uploadedDocs[d.key]);
    if (missingDocs.length > 0) {
      return Toast.show({ type: 'error', text1: 'Missing documents', text2: `Please upload: ${missingDocs.map(d => d.label).join(', ')}` });
    }
    setLoading(true);
    try {
      await api.post('/auth/request-verification', { ...form, uploadedDocs: Object.keys(uploadedDocs) });
      setSubmitted(true);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Submission failed', text2: err.response?.data?.message || 'Please try again' });
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.successHero}>
          <Ionicons name="checkmark-circle" size={72} color="#4ade80" />
          <Text style={styles.successTitle}>Verification Submitted!</Text>
          <Text style={styles.successSub}>Our admin team will review your documents within 24–48 hours. You'll be notified once verified.</Text>
          <TouchableOpacity style={styles.successBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.successBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Startup Verification</Text>
          <Text style={styles.headerSub}>Submit your company details for admin review. No confidential or sensitive data required.</Text>
        </LinearGradient>

        {/* Why verify */}
        <View style={styles.whyCard}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.whyText}>
            Verified startups get a <Text style={{ fontWeight: '700', color: COLORS.success }}>verified badge</Text> — students trust your challenges more and you get higher quality submissions.
          </Text>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>

          <Text style={styles.label}>Company Name *</Text>
          <TextInput style={styles.input} placeholder="Your registered company name" placeholderTextColor={COLORS.textMuted} value={form.companyName} onChangeText={v => update('companyName', v)} />

          <Text style={styles.label}>Registration / CIN Number *</Text>
          <TextInput style={styles.input} placeholder="e.g. U72200TG2023PTC123456" placeholderTextColor={COLORS.textMuted} value={form.registrationNumber} onChangeText={v => update('registrationNumber', v)} autoCapitalize="characters" />

          <Text style={styles.label}>Year Founded</Text>
          <TextInput style={styles.input} placeholder="e.g. 2021" placeholderTextColor={COLORS.textMuted} value={form.yearFounded} onChangeText={v => update('yearFounded', v)} keyboardType="number-pad" maxLength={4} />

          <Text style={styles.label}>Team Size</Text>
          <TextInput style={styles.input} placeholder="e.g. 5–10" placeholderTextColor={COLORS.textMuted} value={form.teamSize} onChangeText={v => update('teamSize', v)} />

          <Text style={styles.label}>Brief Company Description</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What does your startup do? What problem are you solving?" placeholderTextColor={COLORS.textMuted} value={form.description} onChangeText={v => update('description', v)} multiline textAlignVertical="top" />

          <Text style={styles.label}>LinkedIn Company Page URL</Text>
          <TextInput style={styles.input} placeholder="https://linkedin.com/company/..." placeholderTextColor={COLORS.textMuted} value={form.linkedinUrl} onChangeText={v => update('linkedinUrl', v)} keyboardType="url" autoCapitalize="none" />

          <Text style={styles.label}>Company Website</Text>
          <TextInput style={styles.input} placeholder="https://yourcompany.com" placeholderTextColor={COLORS.textMuted} value={form.websiteUrl} onChangeText={v => update('websiteUrl', v)} keyboardType="url" autoCapitalize="none" />
        </View>

        {/* Document Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Verification</Text>
          <Text style={styles.sectionNote}>Upload official documents to prove your company's legitimacy. No sensitive financial data required.</Text>

          {DOC_TYPES.map((doc) => (
            <View key={doc.key} style={[styles.docCard, uploadedDocs[doc.key] && styles.docCardUploaded]}>
              <View style={[styles.docIcon, { backgroundColor: uploadedDocs[doc.key] ? COLORS.success + '18' : COLORS.surfaceDark }]}>
                <Ionicons name={uploadedDocs[doc.key] ? 'checkmark-circle' : doc.icon} size={20} color={uploadedDocs[doc.key] ? COLORS.success : COLORS.textSecondary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                <Text style={styles.docRequired}>{doc.required ? '● Required' : '○ Optional'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.uploadBtn, uploadedDocs[doc.key] && { backgroundColor: COLORS.success + '18' }]}
                onPress={() => markDocUploaded(doc.key)}
              >
                <Text style={[styles.uploadBtnText, uploadedDocs[doc.key] && { color: COLORS.success }]}>
                  {uploadedDocs[doc.key] ? 'Uploaded ✓' : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.privacyText}>
            Your documents are only reviewed by our admin team for verification purposes. They are never shared publicly or with other startups.
          </Text>
        </View>

        {/* Submit */}
        <View style={{ padding: 16, paddingBottom: 32 }}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit for Verification</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 32 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
  whyCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', margin: 16, marginTop: -16, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, borderWidth: 1.5, borderColor: COLORS.success + '40', ...SHADOW.card },
  whyText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  section: { backgroundColor: COLORS.surface, margin: 16, marginTop: 0, borderRadius: RADIUS.lg, padding: 18, ...SHADOW.card, gap: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  sectionNote: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.surfaceDark },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  docCardUploaded: { borderColor: COLORS.success + '50', backgroundColor: COLORS.success + '08' },
  docIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 3 },
  docRequired: { fontSize: 11, color: COLORS.textMuted },
  uploadBtn: { backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.round, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.primary + '30' },
  uploadBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  privacyNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.md, padding: 12 },
  privacyText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  submitBtn: { borderRadius: RADIUS.round, overflow: 'hidden', ...SHADOW.strong },
  submitGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17 },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  successHero: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  successSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  successBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.round, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  successBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
