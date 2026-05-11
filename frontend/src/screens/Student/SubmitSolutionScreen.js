import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const SECTIONS = [
  {
    key: 'approach',
    title: 'Your Solution Approach *',
    placeholder: 'Describe your overall strategy and how you would approach solving this problem...',
    required: true,
    icon: 'bulb-outline',
  },
  {
    key: 'rootCause',
    title: 'Root Cause Analysis',
    placeholder: 'What do you think is the root cause of this problem? Why does it exist?',
    required: false,
    icon: 'search-outline',
  },
  {
    key: 'proposedFix',
    title: 'Proposed Fix / Strategy',
    placeholder: 'What specific steps or changes do you propose? How would you implement them?',
    required: false,
    icon: 'construct-outline',
  },
  {
    key: 'implementation',
    title: 'Implementation Plan',
    placeholder: 'How would this be implemented practically? What resources or timeline would be needed?',
    required: false,
    icon: 'list-outline',
  },
  {
    key: 'expectedOutcome',
    title: 'Expected Outcome',
    placeholder: 'What measurable improvements or results do you expect from your solution?',
    required: false,
    icon: 'trending-up-outline',
  },
];

export default function SubmitSolutionScreen({ navigation, route }) {
  const { challenge } = route.params;
  const [form, setForm] = useState({ approach: '', rootCause: '', proposedFix: '', implementation: '', expectedOutcome: '' });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.approach.trim()) {
      return Toast.show({ type: 'error', text1: 'Required', text2: 'Please fill in your Solution Approach' });
    }
    if (form.approach.trim().length < 50) {
      return Toast.show({ type: 'error', text1: 'Too short', text2: 'Approach must be at least 50 characters' });
    }
    setLoading(true);
    try {
      await api.post('/solutions', { challengeId: challenge._id, ...form });
      Toast.show({ type: 'success', text1: 'Solution Submitted! 🎉', text2: 'The startup will review your approach.' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Submission failed', text2: err.response?.data?.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <LinearGradient colors={[COLORS.primary, '#1E4DB7']} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Submit Solution</Text>
            <Text style={styles.headerSub} numberOfLines={2}>{challenge.title}</Text>
          </LinearGradient>

          {/* Tip card */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primaryLight} />
            <Text style={styles.tipText}>
              Focus on your <Text style={{ fontWeight: '700' }}>thinking process</Text>, not code.
              Startups value analytical reasoning and creative problem-solving approaches.
            </Text>
          </View>

          {/* Form sections */}
          <View style={styles.formWrap}>
            {SECTIONS.map((section) => (
              <View key={section.key} style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Ionicons name={section.icon} size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.sectionLabel}>
                    {section.title}
                    {section.required && <Text style={{ color: COLORS.accent }}> *</Text>}
                  </Text>
                </View>
                <TextInput
                  style={[styles.textArea, section.key === 'approach' && styles.textAreaLarge]}
                  placeholder={section.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={form[section.key]}
                  onChangeText={(v) => update(section.key, v)}
                  multiline
                  textAlignVertical="top"
                />
                {section.key === 'approach' && (
                  <Text style={styles.charCount}>{form.approach.length} chars (min 50)</Text>
                )}
              </View>
            ))}
          </View>

          {/* Submit */}
          <View style={styles.submitWrap}>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryLight]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitText}>Submit My Solution</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>
              You can only submit once per challenge. Make it count!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 16, paddingBottom: 28 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  tipCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#EEF4FF', borderRadius: RADIUS.md,
    margin: 16, padding: 14,
    borderLeftWidth: 3, borderLeftColor: COLORS.primaryLight,
  },
  tipText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  formWrap: { paddingHorizontal: 16, gap: 16 },
  formSection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, ...SHADOW.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: COLORS.surfaceDark, justifyContent: 'center', alignItems: 'center',
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  textArea: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 12, fontSize: 14, color: COLORS.textPrimary,
    backgroundColor: COLORS.surfaceDark, minHeight: 100,
  },
  textAreaLarge: { minHeight: 150 },
  charCount: { fontSize: 11, color: COLORS.textMuted, marginTop: 6, textAlign: 'right' },
  submitWrap: { padding: 16, marginTop: 8, marginBottom: 24 },
  submitBtn: { borderRadius: RADIUS.round, overflow: 'hidden', ...SHADOW.strong },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 17,
  },
  submitText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  disclaimer: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
});
