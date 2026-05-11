import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../assets/theme';

import StartupHomeScreen from '../screens/Startup/StartupHomeScreen';
import PostChallengeScreen from '../screens/Startup/PostChallengeScreen';
import ViewSubmissionsScreen from '../screens/Startup/ViewSubmissionsScreen';
import SolutionDetailScreen from '../screens/Startup/SolutionDetailScreen';
import StartupProfileScreen from '../screens/Startup/StartupProfileScreen';
import StartupVerificationScreen from '../screens/Startup/StartupVerificationScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function StartupHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="StartupHome" component={StartupHomeScreen} />
      <HomeStack.Screen name="ViewSubmissions" component={ViewSubmissionsScreen} />
      <HomeStack.Screen name="SolutionDetail" component={SolutionDetailScreen} />
    </HomeStack.Navigator>
  );
}

function StartupProfileStack() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="StartupProfileMain" component={StartupProfileScreen} />
      <ProfileStack.Screen name="StartupVerification" component={StartupVerificationScreen} />
    </ProfileStack.Navigator>
  );
}

export default function StartupNavigator() {
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
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'PostChallenge') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'StartupProfile') iconName = focused ? 'business' : 'business-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={StartupHomeStack} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="PostChallenge" component={PostChallengeScreen} options={{ tabBarLabel: 'Post Problem' }} />
      <Tab.Screen name="StartupProfile" component={StartupProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
