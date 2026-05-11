import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../../utils/api';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

export default function AdminChallengesScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [solutions, setSolutions] = useState({});
  const [loadingSols, setLoadingSols] = useState(false);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/admin/challenges');
      setChallenges(res.data.challenges);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchSolutions = async (challengeId) => {
    if (solutions[challengeId]) return;
    setLoadingSols(true);
    try {
      const res = await api.get('/solutions/challenge/' + challengeId);
      setSolutions(prev => ({
        ...prev,
        [challengeId]: res.data.solutions,
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingSols(false);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    fetchSolutions(id);
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Challenge?',
      'Delete "' + title + '"? This will also delete all submissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/admin/challenges/' + id);
              Toast.show({ type: 'success', text1: 'Challenge deleted' });
              fetchChallenges();
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message });
            }
          },
        },
      ]
    );
  };

  const handleAdminSelectWinner = (challengeId, solutionId, studentName) => {
    Alert.alert(
      'Declare Winner?',
      'Select ' + studentName + ' as winner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Declare Winner',
          onPress: async () => {
            try {
              await api.put('/challenges/' + challengeId + '/select-winner', { solutionId });
              Toast.show({ type: 'success', text1: studentName + ' declared winner!' });
              fetchChallenges();
              setSolutions(prev => ({ ...prev, [challengeId]: undefined }));
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Error' });
            }
          },
        },
      ]
    );
  };

  const handleCloseChallenge = async (id) => {
    try {
      await api.put('/challenges/' + id + '/close');
      Toast.show({ type: 'success', text1: 'Challenge closed' });
      fetchChallenges();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error' });
    }
  };

  const STATUS_COLORS = {
    open: COLORS.success,
    closed: COLORS.medium,
    winner_selected: COLORS.accentGold,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Challenges</Text>
        <Text style={styles.headerSub}>{challenges.length} total · Tap to manage</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accentGold} />
        </View>
      ) : (
        <FlatList
          data={challenges}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchChallenges(); }}
            />
          }
          renderItem={({ item }) => {
            const statusColor = STATUS_COLORS[item.status] || COLORS.primary;
            const isExpanded = expandedId === item._id;
            const chalSolutions = solutions[item._id] || [];

            return (
              <View style={styles.card}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.actionRow}>
                  {item.status === 'closed' && !item.winner && (
                    <TouchableOpacity onPress={() => toggleExpand(item._id)}>
                      <Text>Review</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'open' && (
                    <TouchableOpacity onPress={() => handleCloseChallenge(item._id)}>
                      <Text>Close</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item._id, item.title)}>
                    <Text>Delete</Text>
                  </TouchableOpacity>
                </View>
                {isExpanded && (
                  <View>
                    {loadingSols ? (
                      <ActivityIndicator />
                    ) : chalSolutions.map((sol) => (
                      <TouchableOpacity
                        key={sol._id}
                        onPress={() => handleAdminSelectWinner(item._id, sol._id, sol.student?.name)}
                      >
                        <Text>{sol.student?.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSub: { fontSize: 12 },
  card: { padding: 12, marginBottom: 10, backgroundColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
