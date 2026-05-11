import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const CATEGORIES = ['process', 'technical', 'data', 'product', 'growth', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFF_COLORS = { easy: COLORS.easy, medium: COLORS.medium, hard: COLORS.hard };

export default function PostChallengeScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    tags: '',
    deadline: '',
    reward: 'Certificate + Leaderboard Recognition',
    points: '100',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handlePost = async () => {
    if (!form.title || !form.description || !form.category || !form.deadline) {
      return Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Title, description, category and deadline are required' });
    }
    if (form.description.length < 80) {
      return Toast.show({ type: 'error', text1: 'Too short', text2: 'Description must be at least 80 characters for clarity' });
    }
    const deadlineDate = new Date(form.deadline);
    if (isNaN(deadlineDate) || deadlineDate < new Date()) {
      return Toast.show({ type: 'error', text1: 'Invalid deadline', text2: 'Deadline must be a future date (YYYY-MM-DD)' });
    }

    setLoading(true);
    try {
      await api.post('/challenges', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        deadline: deadlineDate,
        points: parseInt(form.points) || 100,
      });
      Toast.show({ type: 'success', text1: 'Challenge Posted! 🎉', text2: 'Students can now submit solutions.' });
      setForm({ title: '', description: '', category: '', difficulty: 'medium', tags: '', deadline: '', reward: 'Certificate + Leaderboard Recognition', points: '100' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Post failed', text2: err.response?.data?.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#7B2FBE', '#0A2463']} style={styles.header}>
            <Text style={styles.headerTitle}>Post a Challenge</Text>
            <Text style={styles.headerSub}>Share your real unsolved problem with students</Text>
          </LinearGradient>

          <View style={styles.formWrap}>
            {/* Tip */}
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={18} color="#7B2FBE" />
              <Text style={styles.tipText}>
                Post a <Text style={{ fontWeight: '700' }}>real, unsolved</Text> problem your startup faces.
                Do not share confidential data. Students will submit analytical solution approaches.
              </Text>
            </View>

            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Challenge Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Our app gets slow when users increase..."
                placeholderTextColor={COLORS.textMuted}
                value={form.title}
                onChangeText={(v) => update('title', v)}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Problem Description * (min 80 chars)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the problem in detail. What is happening? What have you tried? What do you want students to analyze or solve?"
                placeholderTextColor={COLORS.textMuted}
                value={form.description}
                onChangeText={(v) => update('description', v)}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{form.description.length} chars</Text>
            </View>

            {/* Category */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, form.category === cat && styles.chipActive]}
                    onPress={() => update('category', cat)}
                  >
                    <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Difficulty */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.chipRow}>
                {DIFFICULTIES.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, form.difficulty === d && { backgroundColor: DIFF_COLORS[d], borderColor: DIFF_COLORS[d] }]}
                    onPress={() => update('difficulty', d)}
                  >
                    <Text style={[styles.chipText, form.difficulty === d && { color: '#fff' }]}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. performance, UX, database"
                placeholderTextColor={COLORS.textMuted}
                value={form.tags}
                onChangeText={(v) => update('tags', v)}
              />
            </View>

            {/* Deadline */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Deadline * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2025-04-30"
                placeholderTextColor={COLORS.textMuted}
                value={form.deadline}
                onChangeText={(v) => update('deadline', v)}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Points */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Points to Award</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                placeholderTextColor={COLORS.textMuted}
                value={form.points}
                onChangeText={(v) => update('points', v)}
                keyboardType="number-pad"
              />
            </View>

            {/* Post button */}
            <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
              <LinearGradient
                colors={['#7B2FBE', COLORS.primary]}
                style={styles.postGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color="#fff" />
                    <Text style={styles.postBtnText}>Post Challenge</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, paddingTop: 20, paddingBottom: 32 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  formWrap: { padding: 16, gap: 16 },
  tipCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#F5EEFF', borderRadius: RADIUS.md, padding: 14,
    borderLeftWidth: 3, borderLeftColor: '#7B2FBE',
  },
  tipText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.3 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: COLORS.textPrimary, ...SHADOW.card,
  },
  textArea: { minHeight: 130, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: COLORS.textMuted, textAlign: 'right' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceDark, borderWidth: 1.5, borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: '#fff' },
  postBtn: { borderRadius: RADIUS.round, overflow: 'hidden', marginTop: 8, marginBottom: 32, ...SHADOW.strong },
  postGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17 },
  postBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
