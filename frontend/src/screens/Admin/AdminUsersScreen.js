import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const TABS = ['all', 'student', 'startup'];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const url = tab === 'all' ? '/admin/users' : `/admin/users?role=${tab}`;
      const res = await api.get(url);
      setUsers(res.data.users);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [tab]);

  useEffect(() => { setLoading(true); fetchUsers(); }, [tab]);

  const toggleStatus = (userId, name, isActive) => {
    Alert.alert(
      isActive ? 'Suspend User?' : 'Activate User?',
      `${isActive ? 'Suspend' : 'Activate'} account of ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isActive ? 'Suspend' : 'Activate',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await api.put(`/admin/users/${userId}/toggle-status`);
              Toast.show({ type: 'success', text1: `User ${isActive ? 'suspended' : 'activated'}` });
              fetchUsers();
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
            }
          },
        },
      ]
    );
  };

  const verifyStartup = (userId, name) => {
    Alert.alert('Verify Startup?', `Verify ${name} as a legitimate startup?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify',
        onPress: async () => {
          try {
            await api.put(`/admin/startups/${userId}/verify`);
            Toast.show({ type: 'success', text1: `${name} verified!` });
            fetchUsers();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error' });
          }
        },
      },
    ]);
  };

  const ROLE_COLORS = { student: COLORS.primary, startup: '#7B2FBE', admin: COLORS.accent };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <Text style={styles.headerSub}>{users.length} users</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.accentGold} /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor={COLORS.accentGold} />}
          renderItem={({ item }) => {
            const roleColor = ROLE_COLORS[item.role] || COLORS.primary;
            return (
              <View style={[styles.userCard, !item.isActive && styles.userCardInactive]}>
                <View style={styles.userTop}>
                  <View style={[styles.avatar, { backgroundColor: roleColor + '25' }]}>
                    <Text style={[styles.avatarText, { color: roleColor }]}>{item.name?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.userMeta}>
                      <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
                        <Text style={[styles.roleText, { color: roleColor }]}>{item.role}</Text>
                      </View>
                      {item.role === 'startup' && item.isVerified && (
                        <View style={styles.verBadge}>
                          <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                          <Text style={styles.verText}>Verified</Text>
                        </View>
                      )}
                      {!item.isActive && (
                        <View style={styles.suspBadge}>
                          <Text style={styles.suspText}>Suspended</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {item.role === 'student' && (
                  <Text style={styles.userExtra}>{item.college} · {item.wins || 0} wins · {item.points || 0} pts</Text>
                )}
                {item.role === 'startup' && (
                  <Text style={styles.userExtra}>{item.companyName} · {item.industry}</Text>
                )}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, item.isActive ? styles.suspendBtn : styles.activateBtn]}
                    onPress={() => toggleStatus(item._id, item.name, item.isActive)}
                  >
                    <Text style={styles.actionBtnText}>{item.isActive ? 'Suspend' : 'Activate'}</Text>
                  </TouchableOpacity>
                  {item.role === 'startup' && !item.isVerified && (
                    <TouchableOpacity
                      style={styles.verifyBtn}
                      onPress={() => verifyStartup(item._id, item.companyName || item.name)}
                    >
                      <Ionicons name="checkmark-circle" size={14} color="#fff" />
                      <Text style={styles.verifyBtnText}>Verify Startup</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={52} color="#7A8FA6" />
              <Text style={styles.emptyText}>No users found</Text>
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
  userCard: { backgroundColor: '#1A2A3A', borderRadius: RADIUS.lg, padding: 14, ...SHADOW.card },
  userCardInactive: { opacity: 0.6 },
  userTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '900' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 12, color: '#7A8FA6', marginBottom: 6 },
  userMeta: { flexDirection: 'row', gap: 6 },
  roleBadge: { borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3 },
  roleText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  verBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.success + '18', borderRadius: RADIUS.round, paddingHorizontal: 7, paddingVertical: 3 },
  verText: { fontSize: 10, fontWeight: '700', color: COLORS.success },
  suspBadge: { backgroundColor: COLORS.accent + '20', borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 3 },
  suspText: { fontSize: 10, fontWeight: '700', color: COLORS.accent },
  userExtra: { fontSize: 12, color: '#7A8FA6', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { borderRadius: RADIUS.round, paddingHorizontal: 14, paddingVertical: 7 },
  suspendBtn: { backgroundColor: COLORS.accent + '25', borderWidth: 1, borderColor: COLORS.accent + '50' },
  activateBtn: { backgroundColor: COLORS.success + '25', borderWidth: 1, borderColor: COLORS.success + '50' },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.success, borderRadius: RADIUS.round, paddingHorizontal: 12, paddingVertical: 7 },
  verifyBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, color: '#7A8FA6' },
});
