import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../assets/theme';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 900,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 5,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('RoleSelect');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[COLORS.primary, '#1E4DB7', '#0A2463']} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoS}>S</Text>
          <Text style={styles.logoX}>X</Text>
        </View>
        <Text style={styles.appName}>SolveX</Text>
        <Text style={styles.tagline}>Where Real Problems Meet Smart Minds</Text>
      </Animated.View>
      <Animated.View style={[styles.dots, { opacity: fadeAnim }]}>
        <View style={styles.dot} />
        <View style={[styles.dot, { opacity: 0.5 }]} />
        <View style={[styles.dot, { opacity: 0.2 }]} />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center' },
  logoBox: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24, paddingHorizontal: 28, paddingVertical: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoS: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: -2 },
  logoX: { fontSize: 52, fontWeight: '900', color: COLORS.accentGold, letterSpacing: -2 },
  appName: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2, marginBottom: 10 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 32 },
  dots: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
});
