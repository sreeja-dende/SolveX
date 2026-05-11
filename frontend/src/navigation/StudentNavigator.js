import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../assets/theme';

import StudentHomeScreen from '../screens/Student/StudentHomeScreen';
import ChallengeDetailScreen from '../screens/Student/ChallengeDetailScreen';
import SubmitSolutionScreen from '../screens/Student/SubmitSolutionScreen';
import MySolutionsScreen from '../screens/Student/MySolutionsScreen';
import LeaderboardScreen from '../screens/Student/LeaderboardScreen';
import StudentProfileScreen from '../screens/Student/StudentProfileScreen';
import CertificatesScreen from '../screens/Student/CertificatesScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SolutionsStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="StudentHome" component={StudentHomeScreen} />
      <HomeStack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <HomeStack.Screen name="SubmitSolution" component={SubmitSolutionScreen} />
    </HomeStack.Navigator>
  );
}

function SolutionsStackNavigator() {
  return (
    <SolutionsStack.Navigator screenOptions={{ headerShown: false }}>
      <SolutionsStack.Screen name="MySolutions" component={MySolutionsScreen} />
      <SolutionsStack.Screen name="Certificates" component={CertificatesScreen} />
    </SolutionsStack.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Challenges') iconName = focused ? 'flash' : 'flash-outline';
          else if (route.name === 'MyWork') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Leaderboard') iconName = focused ? 'trophy' : 'trophy-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Challenges" component={HomeStackNavigator} options={{ tabBarLabel: 'Challenges' }} />
      <Tab.Screen name="MyWork" component={SolutionsStackNavigator} options={{ tabBarLabel: 'My Work' }} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} />
    </Tab.Navigator>
  );
}
