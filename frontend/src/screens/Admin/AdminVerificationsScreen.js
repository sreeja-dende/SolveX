import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  SafeAreaView, RefreshControl, ActivityIndicator, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Alert from '../../utils/alert';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'verified', label: 'Verified' },
];

const formatSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>{value}</Text>
    </View>
  );
}

export default function AdminVerificationsScreen() {
  const [tab, setTab] = useState('pending');
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [openingDoc, setOpeningDoc] = useState(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await api.get(`/admin/verifications?status=${tab}`);
      setStartups(res.data.startups);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Could not load verifications', text2: e.response?.data?.message });
    } finally { setLoading(false); setRefreshing(false); }
  }, [tab]);

  useFocusEffect(useCallback(() => { setLoading(true); fetchList(); }, [fetchList]));

  const openDocument = async (doc) => {
    // On web, open the tab right away (inside the click) so the browser doesn't block it as a pop-up.
    const win = Platform.OS === 'web' ? window.open('', '_blank') : null;
    setOpeningDoc(doc._id);
    try {
      const res = await api.get(`/admin/verifications/documents/${doc._id}/link`);
      if (win) win.location.href = res.data.url;
      else await Linking.openURL(res.data.url);
    } catch (e) {
      if (win) win.close();
      Toast.show({ type: 'error', text1: 'Could not open document', text2: e.response?.data?.message });
    } finally { setOpeningDoc(null); }
  };

  const approve = (s) => {
    const name = s.companyName || s.name;
    Alert.alert('Approve verification?', `${name} will get the Verified badge.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setBusyId(s._id);
          try {
            await api.put(`/admin/startups/${s._id}/verify`);
            Toast.show({ type: 'success', text1: `${name} verified ✓` });
            fetchList();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
          } finally { setBusyId(null); }
        },
      },
    ]);
  };

  const confirmReject = async (s) => {
    if (reason.trim().length < 5) {
      return Toast.show({ type: 'error', text1: 'Add a reason', text2: 'Tell the startup what to fix (at least 5 characters)' });
    }
    setBusyId(s._id);
    try {
      await api.put(`/admin/startups/${s._id}/reject`, { reason: reason.trim() });
      Toast.show({ type: 'success', text1: 'Verification rejected', text2: 'The startup will see your reason.' });
      setRejectingId(null); setReason('');
      fetchList();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
    } finally { setBusyId(null); }
  };

  const renderItem = ({ item: s }) => {
    const v = s.verificationData || {};
    const busy = busyId === s._id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(s.companyName || s.name || 'S').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.company}>{s.companyName || 'Unnamed startup'}</Text>
            <Text style={styles.founder}>{s.name} · {s.email}</Text>
            <Text style={styles.submitted}>Submitted {formatDate(v.submittedAt)}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <Detail label="CIN / Reg. No." value={v.registrationNumber} />
          <Detail label="Founded" value={v.yearFounded} />
          <Detail label="Team size" value={v.teamSize} />
          <Detail label="Website" value={v.websiteUrl || s.website} />
          <Detail label="LinkedIn" value={v.linkedinUrl} />
          <Detail label="About" value={v.description || s.companyDescription} />
        </View>

        <Text style={styles.docsTitle}>Documents ({s.documents.length})</Text>
        {s.documents.length === 0 && <Text style={styles.noDocs}>No documents uploaded</Text>}
        {s.documents.map((d) => (
          <TouchableOpacity key={d._id} style={styles.docRow} onPress={() => openDocument(d)} disabled={openingDoc === d._id}>
            <Ionicons name={d.mimeType === 'application/pdf' ? 'document-text' : 'image'} size={20} color={COLORS.accentGold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docLabel}>{d.label}</Text>
              <Text style={styles.docMeta} numberOfLines={1}>{d.fileName} · {formatSize(d.size)}</Text>
            </View>
            {openingDoc === d._id
              ? <ActivityIndicator size="small" color={COLORS.accentGold} />
              : <Text style={styles.openText}>Open</Text>}
          </TouchableOpacity>
        ))}

        {tab === 'rejected' && v.rejectionReason ? (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Rejected because</Text>
            <Text style={styles.reasonText}>{v.rejectionReason}</Text>
            <Text style={styles.reasonHint}>Waiting for the startup to fix and resubmit.</Text>
          </View>
        ) : null}

        {tab === 'verified' && (
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
            <Text style={styles.verifiedText}>Verified {v.reviewedAt ? `on ${formatDate(v.reviewedAt)}` : ''}</Text>
          </View>
        )}

        {tab === 'pending' && (
          rejectingId === s._id ? (
            <View style={styles.rejectBox}>
              <Text style={styles.rejectLabel}>Reason for rejection (the startup will see this)</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="e.g. GST certificate is blurry — please upload a clear copy"
                placeholderTextColor="#5F7388"
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => { setRejectingId(null); setReason(''); }}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => confirmReject(s)} disabled={busy}>
                  {busy ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnText}>Confirm Reject</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.btn, styles.btnRejectOutline]} onPress={() => { setRejectingId(s._id); setReason(''); }} disabled={busy}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.accent} />
                <Text style={[styles.btnText, { color: COLORS.accent }]}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => approve(s)} disabled={busy}>
                {busy ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.btnText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Startup Verification</Text>
        <Text style={styles.headerSub}>Review company documents and approve or reject</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => { setTab(t.key); setRejectingId(null); }}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accentGold} /></View>
      ) : (
        <FlatList
          data={startups}
          keyExtractor={(s) => s._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchList(); }} tintColor={COLORS.accentGold} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="shield-checkmark-outline" size={52} color="#7A8FA6" />
              <Text style={styles.emptyText}>
                {tab === 'pending' ? 'No startups waiting for review' : tab === 'rejected' ? 'No rejected requests' : 'No verified startups yet'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A' },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: 13, color: '#7A8FA6' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: '#1A2A3A' },
  tabActive: { backgroundColor: COLORS.accentGold },
  tabText: { fontSize: 13, fontWeight: '600', color: '#7A8FA6' },
  tabTextActive: { color: '#000', fontWeight: '800' },
  card: { backgroundColor: '#1A2A3A', borderRadius: RADIUS.lg, padding: 16, ...SHADOW.card },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7B2FBE33', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#C79BF2' },
  company: { fontSize: 16, fontWeight: '800', color: '#fff' },
  founder: { fontSize: 12, color: '#9FB0C2', marginTop: 2 },
  submitted: { fontSize: 11, color: '#7A8FA6', marginTop: 2 },
  details: { backgroundColor: '#132232', borderRadius: RADIUS.md, padding: 12, gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', gap: 10 },
  detailLabel: { width: 100, fontSize: 12, color: '#7A8FA6', fontWeight: '600' },
  detailValue: { flex: 1, fontSize: 13, color: '#E6EDF5' },
  docsTitle: { fontSize: 12, fontWeight: '800', color: '#9FB0C2', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  noDocs: { fontSize: 13, color: '#7A8FA6', marginBottom: 8 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#132232', borderRadius: RADIUS.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#24384D' },
  docLabel: { fontSize: 13, fontWeight: '700', color: '#fff' },
  docMeta: { fontSize: 11, color: '#7A8FA6', marginTop: 2 },
  openText: { fontSize: 13, fontWeight: '800', color: COLORS.accentGold },
  reasonBox: { backgroundColor: COLORS.accent + '18', borderRadius: RADIUS.md, padding: 12, marginTop: 4 },
  reasonLabel: { fontSize: 11, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', marginBottom: 4 },
  reasonText: { fontSize: 13, color: '#fff' },
  reasonHint: { fontSize: 11, color: '#9FB0C2', marginTop: 6 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  verifiedText: { fontSize: 13, fontWeight: '700', color: COLORS.success },
  rejectBox: { marginTop: 6, gap: 8 },
  rejectLabel: { fontSize: 12, color: '#9FB0C2', fontWeight: '600' },
  reasonInput: { minHeight: 80, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.accent + '60', backgroundColor: '#132232', color: '#fff', padding: 12, fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.round, paddingVertical: 11 },
  btnApprove: { backgroundColor: COLORS.success },
  btnRejectOutline: { borderWidth: 1.5, borderColor: COLORS.accent + '80' },
  btnReject: { backgroundColor: COLORS.accent },
  btnGhost: { backgroundColor: '#24384D' },
  btnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#7A8FA6' },
});
