import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const DOC_TYPES = [
  { key: 'gst', label: 'GST Registration Certificate', icon: 'document-text-outline', required: true },
  { key: 'incorporation', label: 'Company Incorporation Certificate', icon: 'business-outline', required: true },
  { key: 'pan', label: 'Company PAN Card', icon: 'card-outline', required: false },
  { key: 'startup_india', label: 'Startup India Recognition (if any)', icon: 'ribbon-outline', required: false },
];
const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

const formatSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// Read a picked file as a base64 data URL (works on web, Android and iOS).
const readAsDataUrl = async (asset) => {
  const blob = asset.file || (await (await fetch(asset.uri)).blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(blob);
  });
};

export default function StartupVerificationScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    companyName: user?.companyName || '',
    registrationNumber: '',
    yearFounded: '',
    teamSize: '',
    description: user?.companyDescription || '',
    linkedinUrl: '',
    websiteUrl: user?.website || '',
  });
  const [docs, setDocs] = useState({});           // docType -> { fileName, size, uploadedAt }
  const [uploading, setUploading] = useState(null); // docType being uploaded
  const [status, setStatus] = useState('none');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const locked = status === 'pending' || status === 'verified';

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/verification/me');
        const d = res.data;
        setStatus(d.status);
        setRejectionReason(d.rejectionReason || '');
        setSubmittedAt(d.data?.submittedAt || null);
        const map = {};
        (d.documents || []).forEach(doc => { map[doc.docType] = doc; });
        setDocs(map);
        if (d.data) {
          setForm(p => ({
            ...p,
            registrationNumber: d.data.registrationNumber || '',
            yearFounded: d.data.yearFounded || '',
            teamSize: d.data.teamSize || '',
            description: d.data.description || p.description,
            linkedinUrl: d.data.linkedinUrl || '',
            websiteUrl: d.data.websiteUrl || p.websiteUrl,
          }));
        }
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Could not load verification status', text2: e.response?.data?.message || 'Check your connection' });
      } finally { setPageLoading(false); }
    })();
  }, []);

  const pickAndUpload = async (docType) => {
    if (locked || uploading) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ACCEPTED, copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_BYTES) {
        return Toast.show({ type: 'error', text1: 'File too large', text2: 'Please choose a file under 2 MB' });
      }
      setUploading(docType);
      const data = await readAsDataUrl(asset);
      const res = await api.post('/verification/documents', { docType, fileName: asset.name, data }, { timeout: 60000 });
      setDocs(p => ({ ...p, [docType]: res.data.document }));
      Toast.show({ type: 'success', text1: 'Document uploaded', text2: asset.name });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: err.response?.data?.message || err.message || 'Please try again' });
    } finally { setUploading(null); }
  };

  const handleSubmit = async () => {
    if (!form.companyName.trim() || !form.registrationNumber.trim()) {
      return Toast.show({ type: 'error', text1: 'Required fields missing', text2: 'Company name and registration number are required' });
    }
    const missingDocs = DOC_TYPES.filter(d => d.required && !docs[d.key]);
    if (missingDocs.length > 0) {
      return Toast.show({ type: 'error', text1: 'Missing documents', text2: `Please upload: ${missingDocs.map(d => d.label).join(', ')}` });
    }
    setLoading(true);
    try {
      await api.post('/verification/submit', form);
      refreshUser();
      setSubmitted(true);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Submission failed', text2: err.response?.data?.message || 'Please try again' });
    } finally { setLoading(false); }
  };

  if (pageLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7B2FBE" />
      </SafeAreaView>
    );
  }

  if (submitted || status === 'verified') {
    const verified = status === 'verified';
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.successHero}>
          <Ionicons name={verified ? 'shield-checkmark' : 'checkmark-circle'} size={72} color="#4ade80" />
          <Text style={styles.successTitle}>{verified ? 'Your startup is verified' : 'Verification Submitted!'}</Text>
          <Text style={styles.successSub}>
            {verified
              ? 'Students now see the Verified badge on your profile and challenges.'
              : 'The SolveX admin will review your documents. Your profile shows the status, and you will see the result there.'}
          </Text>
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
          <Text style={styles.headerSub}>Submit your company details and documents for admin review.</Text>
        </LinearGradient>

        {/* Status */}
        {status === 'pending' ? (
          <View style={[styles.whyCard, styles.pendingCard]}>
            <Ionicons name="time-outline" size={20} color={COLORS.accentGold} />
            <Text style={styles.whyText}>
              <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>Under review.</Text> Submitted on {formatDate(submittedAt)}. You can't change documents until the admin decides.
            </Text>
          </View>
        ) : status === 'rejected' ? (
          <View style={[styles.whyCard, styles.rejectedCard]}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.accent} />
            <Text style={styles.whyText}>
              <Text style={{ fontWeight: '700', color: COLORS.accent }}>Verification rejected.</Text>{'\n'}Reason: {rejectionReason || 'Not given'}{'\n'}Fix the issue, replace the documents if needed, and resubmit.
            </Text>
          </View>
        ) : (
          <View style={styles.whyCard}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            <Text style={styles.whyText}>
              Verified startups get a <Text style={{ fontWeight: '700', color: COLORS.success }}>verified badge</Text>, so students trust your challenges more and you get higher quality submissions.
            </Text>
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section} pointerEvents={locked ? 'none' : 'auto'}>
          <Text style={styles.sectionTitle}>Company Information</Text>

          <Text style={styles.label}>Company Name *</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="Your registered company name" placeholderTextColor={COLORS.textMuted} value={form.companyName} onChangeText={v => update('companyName', v)} />

          <Text style={styles.label}>Registration / CIN Number *</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="e.g. U72200TG2023PTC123456" placeholderTextColor={COLORS.textMuted} value={form.registrationNumber} onChangeText={v => update('registrationNumber', v)} autoCapitalize="characters" />

          <Text style={styles.label}>Year Founded</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="e.g. 2021" placeholderTextColor={COLORS.textMuted} value={form.yearFounded} onChangeText={v => update('yearFounded', v)} keyboardType="number-pad" maxLength={4} />

          <Text style={styles.label}>Team Size</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="e.g. 5–10" placeholderTextColor={COLORS.textMuted} value={form.teamSize} onChangeText={v => update('teamSize', v)} />

          <Text style={styles.label}>Brief Company Description</Text>
          <TextInput style={[styles.input, styles.textArea]} editable={!locked} placeholder="What does your startup do? What problem are you solving?" placeholderTextColor={COLORS.textMuted} value={form.description} onChangeText={v => update('description', v)} multiline textAlignVertical="top" />

          <Text style={styles.label}>LinkedIn Company Page URL</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="https://linkedin.com/company/..." placeholderTextColor={COLORS.textMuted} value={form.linkedinUrl} onChangeText={v => update('linkedinUrl', v)} keyboardType="url" autoCapitalize="none" />

          <Text style={styles.label}>Company Website</Text>
          <TextInput style={styles.input} editable={!locked} placeholder="https://yourcompany.com" placeholderTextColor={COLORS.textMuted} value={form.websiteUrl} onChangeText={v => update('websiteUrl', v)} keyboardType="url" autoCapitalize="none" />
        </View>

        {/* Document Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.sectionNote}>PDF, JPG, PNG or WEBP, up to 2 MB each. Only the SolveX admin can open these files.</Text>

          {DOC_TYPES.map((doc) => {
            const up = docs[doc.key];
            const busy = uploading === doc.key;
            return (
              <View key={doc.key} style={[styles.docCard, up && styles.docCardUploaded]}>
                <View style={[styles.docIcon, { backgroundColor: up ? COLORS.success + '18' : COLORS.surfaceDark }]}>
                  <Ionicons name={up ? 'checkmark-circle' : doc.icon} size={20} color={up ? COLORS.success : COLORS.textSecondary} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docLabel}>{doc.label}</Text>
                  {up ? (
                    <Text style={styles.docFile} numberOfLines={1}>{up.fileName} · {formatSize(up.size)}</Text>
                  ) : (
                    <Text style={styles.docRequired}>{doc.required ? '● Required' : '○ Optional'}</Text>
                  )}
                </View>
                {!locked && (
                  <TouchableOpacity
                    style={[styles.uploadBtn, up && { backgroundColor: COLORS.success + '18', borderColor: COLORS.success + '40' }]}
                    onPress={() => pickAndUpload(doc.key)}
                    disabled={!!uploading}
                  >
                    {busy ? <ActivityIndicator size="small" color={COLORS.primary} /> : (
                      <Text style={[styles.uploadBtnText, up && { color: COLORS.success }]}>{up ? 'Replace' : 'Upload'}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.privacyText}>
            Your documents are only reviewed by the SolveX admin for verification. They are never shown to students or other startups.
          </Text>
        </View>

        {/* Submit */}
        {!locked && (
          <View style={{ padding: 16, paddingBottom: 32 }}>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading || !!uploading}>
              <LinearGradient colors={['#7B2FBE', COLORS.primary]} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>{status === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        {locked && <View style={{ height: 32 }} />}
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
  docFile: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  pendingCard: { borderColor: COLORS.accentGold + '60' },
  rejectedCard: { borderColor: COLORS.accent + '60', backgroundColor: '#FFF5F6' },
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
