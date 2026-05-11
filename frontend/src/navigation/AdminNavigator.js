import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../assets/theme';

import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminChallengesScreen from '../screens/Admin/AdminChallengesScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: '#fff' },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'AdminDash') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Challenges') iconName = focused ? 'flash' : 'flash-outline';
          return <Ionicons name={iconName} size={22} color={focused ? COLORS.accentGold : '#8899AA'} />;
        },
      })}
    >
      <Tab.Screen name="AdminDash" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Users" component={AdminUsersScreen} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="Challenges" component={AdminChallengesScreen} options={{ tabBarLabel: 'Challenges' }} />
    </Tab.Navigator>
  );
}
