import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

const { width } = Dimensions.get('window');

const BENEFITS_STUDENT = [
  { icon: 'school-outline', title: 'Real Startup Exposure', desc: 'Work on actual unsolved problems from real companies — not textbook exercises.' },
  { icon: 'ribbon-outline', title: 'Verified Certificates', desc: 'Win challenges and earn certificates with unique codes to add to your resume.' },
  { icon: 'trending-up-outline', title: 'Reduce Layoff Risk', desc: 'Build practical problem-solving skills that employers value, before you even graduate.' },
  { icon: 'trophy-outline', title: 'Leaderboard Fame', desc: 'Rank among top solvers nationwide and get recognized for your thinking ability.' },
  { icon: 'briefcase-outline', title: 'Resume Proof', desc: 'Show "Winner of [Startup Name] Challenge" — real credibility, not just marks.' },
];

const BENEFITS_STARTUP = [
  { icon: 'bulb-outline', title: 'Fresh Perspectives', desc: 'Get diverse solution approaches from hundreds of sharp student minds.' },
  { icon: 'people-outline', title: 'Talent Discovery', desc: 'Identify top problem-solvers early — before they enter the job market.' },
  { icon: 'flash-outline', title: 'No Hiring Needed', desc: 'Get ideas for your real problems without committing to hiring or payments.' },
  { icon: 'shield-checkmark-outline', title: 'Safe & Structured', desc: 'Post only high-level problems — no confidential data required.' },
];

const HOW_IT_WORKS = [
  { step: '01', role: 'Startup', action: 'Posts a real unsolved internal problem as a challenge', color: '#7B2FBE' },
  { step: '02', role: 'Students', action: 'Browse challenges and submit detailed solution approaches', color: COLORS.primary },
  { step: '03', role: 'Startup', action: 'Reviews all submissions and selects the best solution', color: '#7B2FBE' },
  { step: '04', role: 'Winner', action: 'Gets certificate, leaderboard points & profile recognition', color: COLORS.accentGold },
];

export default function AboutScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* Hero Section */}
        <LinearGradient colors={[COLORS.primary, '#1E4DB7', '#7B2FBE']} style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroLogo}>
            <Text style={styles.heroLogoS}>Solve</Text>
            <Text style={styles.heroLogoX}>X</Text>
          </View>
          <Text style={styles.heroTagline}>Where Real Problems{'\n'}Meet Smart Minds</Text>
          <Text style={styles.heroSub}>
            A platform connecting students with real startup challenges — building practical skills, reducing layoffs, and discovering talent.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>100+</Text>
              <Text style={styles.heroStatLabel}>Challenges</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>500+</Text>
              <Text style={styles.heroStatLabel}>Students</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>50+</Text>
              <Text style={styles.heroStatLabel}>Startups</Text>
            </View>
          </View>
        </LinearGradient>

        {/* What is SolveX */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>ABOUT</Text>
          </View>
          <Text style={styles.sectionTitle}>What is SolveX?</Text>
          <Text style={styles.sectionBody}>
            SolveX is a <Text style={styles.highlight}>problem–challenge–recognition platform</Text>. It is NOT a job portal, freelancing site, or internship board.
          </Text>
          <Text style={styles.sectionBody}>
            Startups post their <Text style={styles.highlight}>real, unsolved internal problems</Text> — things they are actually struggling with right now. Students analyze these problems and submit thoughtful solution approaches. The best solution wins recognition.
          </Text>
          <View style={styles.quoteBox}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primaryLight} />
            <Text style={styles.quoteText}>
              "Unsolved problems reveal real skills." — Students are problem solvers, not workers.
            </Text>
          </View>
        </View>

        {/* Who is it for */}
        <View style={[styles.section, { backgroundColor: COLORS.surfaceDark }]}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>WHO IS IT FOR</Text>
          </View>
          <Text style={styles.sectionTitle}>Two sides, one platform</Text>
          <View style={styles.forCards}>
            <View style={[styles.forCard, { borderTopColor: COLORS.primary }]}>
              <Ionicons name="school" size={28} color={COLORS.primary} />
              <Text style={styles.forCardTitle}>Students</Text>
              <Text style={styles.forCardDesc}>Engineering & tech students who want real-world experience before entering industry</Text>
            </View>
            <View style={[styles.forCard, { borderTopColor: '#7B2FBE' }]}>
              <Ionicons name="rocket" size={28} color="#7B2FBE" />
              <Text style={styles.forCardTitle}>Startups</Text>
              <Text style={styles.forCardDesc}>Early-stage companies facing real operational, technical or product challenges</Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>HOW IT WORKS</Text>
          </View>
          <Text style={styles.sectionTitle}>Simple 4-step process</Text>
          {HOW_IT_WORKS.map((item, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: item.color }]}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepRole, { color: item.color }]}>{item.role}</Text>
                <Text style={styles.stepAction}>{item.action}</Text>
              </View>
              {i < HOW_IT_WORKS.length - 1 && <View style={styles.stepLine} />}
            </View>
          ))}
        </View>

        {/* Benefits for Students */}
        <View style={[styles.section, { backgroundColor: '#EEF4FF' }]}>
          <View style={[styles.sectionBadge, { backgroundColor: COLORS.primary + '18' }]}>
            <Text style={[styles.sectionBadgeText, { color: COLORS.primary }]}>FOR STUDENTS</Text>
          </View>
          <Text style={styles.sectionTitle}>Why students love SolveX</Text>
          {BENEFITS_STUDENT.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name={b.icon} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Benefits for Startups */}
        <View style={[styles.section, { backgroundColor: '#F5EEFF' }]}>
          <View style={[styles.sectionBadge, { backgroundColor: '#7B2FBE18' }]}>
            <Text style={[styles.sectionBadgeText, { color: '#7B2FBE' }]}>FOR STARTUPS</Text>
          </View>
          <Text style={styles.sectionTitle}>Why startups choose SolveX</Text>
          {BENEFITS_STARTUP.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: '#7B2FBE15' }]}>
                <Ionicons name={b.icon} size={20} color="#7B2FBE" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* What kind of problems */}
        <View style={styles.section}>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>PROBLEM TYPES</Text>
          </View>
          <Text style={styles.sectionTitle}>What problems are posted?</Text>
          <Text style={styles.sectionBody}>Startups post <Text style={styles.highlight}>analytical and strategic challenges</Text> — not coding tasks. Students respond with written solution approaches.</Text>
          {[
            { cat: 'Process', ex: '"Our support team is slow — how can we improve response time?"', color: COLORS.catProcess },
            { cat: 'Technical Design', ex: '"Design a scalable login system for 10k users."', color: COLORS.catTechnical },
            { cat: 'Data & Insights', ex: '"What metrics should we track to measure startup success?"', color: COLORS.catData },
            { cat: 'Product', ex: '"Users drop off after registration — suggest improvements."', color: COLORS.catProduct },
          ].map((p, i) => (
            <View key={i} style={[styles.problemCard, { borderLeftColor: p.color }]}>
              <Text style={[styles.problemCat, { color: p.color }]}>{p.cat}</Text>
              <Text style={styles.problemEx}>{p.ex}</Text>
            </View>
          ))}
        </View>

        {/* Uniqueness */}
        <LinearGradient colors={[COLORS.primary, '#7B2FBE']} style={styles.uniqueSection}>
          <Text style={styles.uniqueTitle}>What makes us unique?</Text>
          {[
            'Other platforms → Problems created by the platform',
            'SolveX → Problems come from real startups right now',
            'No freelancing. No job posting. No bidding.',
            'Pure problem-solving. Pure recognition.',
          ].map((line, i) => (
            <View key={i} style={styles.uniqueRow}>
              <Ionicons name={i < 2 ? 'arrow-forward-circle' : 'checkmark-circle'} size={18} color={i < 2 ? 'rgba(255,255,255,0.6)' : COLORS.accentGold} />
              <Text style={[styles.uniqueText, i < 1 && { opacity: 0.6 }]}>{line}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSub}>Join as a student or startup today</Text>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('RoleSelect')}
          >
            <Text style={styles.ctaBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { padding: 24, paddingTop: 16, paddingBottom: 36 },
  backBtn: { width: 36, height: 36, justifyContent: 'center', marginBottom: 16 },
  heroLogo: { flexDirection: 'row', marginBottom: 14 },
  heroLogoS: { fontSize: 36, fontWeight: '900', color: '#fff' },
  heroLogoX: { fontSize: 36, fontWeight: '900', color: COLORS.accentGold },
  heroTagline: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 34, marginBottom: 12 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 21, marginBottom: 24 },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.lg, padding: 16 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { padding: 24, backgroundColor: COLORS.surface },
  sectionBadge: { backgroundColor: COLORS.primary + '12', borderRadius: RADIUS.round, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  sectionBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1.5 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12, lineHeight: 26 },
  sectionBody: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 12 },
  highlight: { color: COLORS.primary, fontWeight: '700' },
  quoteBox: { flexDirection: 'row', gap: 10, backgroundColor: '#EEF4FF', borderRadius: RADIUS.md, padding: 14, borderLeftWidth: 3, borderLeftColor: COLORS.primaryLight, marginTop: 4 },
  quoteText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  forCards: { flexDirection: 'row', gap: 12, marginTop: 4 },
  forCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 16, borderTopWidth: 3, ...SHADOW.card, gap: 8 },
  forCardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  forCardDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  stepRow: { flexDirection: 'row', gap: 14, marginBottom: 20, position: 'relative' },
  stepNum: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  stepContent: { flex: 1, paddingTop: 4 },
  stepRole: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  stepAction: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  stepLine: { position: 'absolute', left: 19, top: 44, width: 2, height: 20, backgroundColor: COLORS.border },
  benefitRow: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  benefitIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 3 },
  benefitDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  problemCard: { backgroundColor: COLORS.surfaceDark, borderRadius: RADIUS.md, padding: 14, borderLeftWidth: 3, marginBottom: 10 },
  problemCat: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  problemEx: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, fontStyle: 'italic' },
  uniqueSection: { padding: 24, gap: 14 },
  uniqueTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  uniqueRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  uniqueText: { fontSize: 14, color: '#fff', flex: 1, lineHeight: 20 },
  ctaSection: { padding: 32, alignItems: 'center', backgroundColor: COLORS.surface },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  ctaSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: RADIUS.round, paddingVertical: 16, paddingHorizontal: 32, ...SHADOW.strong },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
