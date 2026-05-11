import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../assets/theme';

import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import StartupNavigator from './StartupNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (user.role === 'student') return <StudentNavigator />;
  if (user.role === 'startup') return <StartupNavigator />;
  if (user.role === 'admin') return <AdminNavigator />;

  return <AuthNavigator />;
}
