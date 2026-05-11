import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../assets/theme';

// Simple validators
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const isValidName  = (n) => n && n.trim().length >= 2;

export default function RegisterScreen({ navigation, route }) {
  const role = route.params?.role || 'student';
  const { register } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [studentForm, setStudentForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    college: '', branch: '', year: '', rollNumber: '', skills: '',
  });
  const [startupForm, setStartupForm] = useState({
    founderName: '', email: '', password: '', confirmPassword: '',
    companyName: '', industry: '', website: '', teamSize: '',
    foundedYear: '', companyDescription: '', linkedinUrl: '', problemDomain: '',
  });

  const updateStudent = (k, v) => setStudentForm(p => ({ ...p, [k]: v }));
  const updateStartup = (k, v) => setStartupForm(p => ({ ...p, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission needed', text2: 'Allow photo access to upload a profile picture.' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission needed', text2: 'Allow camera access to take a photo.' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Toast.show({
      type: 'info',
      text1: 'Profile Photo',
      text2: 'Tap Gallery or Camera below',
      position: 'bottom',
    });
  };

  const handleRegister = async () => {
    const pass    = role === 'student' ? studentForm.password    : startupForm.password;
    const confirm = role === 'student' ? studentForm.confirmPassword : startupForm.confirmPassword;
    const email   = role === 'student' ? studentForm.email       : startupForm.email;
    const name    = role === 'student' ? studentForm.name        : startupForm.founderName;

    if (!isValidName(name))
      return Toast.show({ type: 'error', text1: 'Invalid name', text2: 'Name must be at least 2 characters' });
    if (!isValidEmail(email))
      return Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email (e.g. name@example.com)' });
    if (!pass || pass.length < 6)
      return Toast.show({ type: 'error', text1: 'Weak password', text2: 'Password must be at least 6 characters' });
    if (pass !== confirm)
      return Toast.show({ type: 'error', text1: 'Password mismatch', text2: 'Both passwords must match' });

    setLoading(true);
    try {
      let payload = { role, name: name.trim(), email: email.trim().toLowerCase(), password: pass };
      if (role === 'student') {
        const skillsArray = studentForm.skills
          ? studentForm.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        payload = { ...payload, college: studentForm.college, branch: studentForm.branch,
          year: studentForm.year, rollNumber: studentForm.rollNumber, skills: skillsArray };
      } else {
        payload = { ...payload, companyName: startupForm.companyName, industry: startupForm.industry,
          website: startupForm.website, companyDescription: startupForm.companyDescription };
      }
      await register(payload);
      Toast.show({ type: 'success', text1: 'Account created! 🎉' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: err.response?.data?.message || 'Please check your details and try again' });
    } finally { setLoading(false); }
  };

  const roleColor = role === 'student' ? COLORS.primary : '#7B2FBE';

  const Field = ({ icon, placeholder, value, onChange, secure, keyboard, multiline }) => (
    <View style={[styles.inputWrap, multiline && { alignItems: 'flex-start' }]}>
      <Ionicons name={icon} size={16} color={COLORS.textMuted} style={[styles.inputIcon, multiline && { marginTop: 14 }]} />
      <TextInput
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboard || 'default'}
        autoCapitalize={['email-address', 'url'].includes(keyboard) ? 'none' : 'sentences'}
        multiline={multiline}
        autoCorrect={false}
        blurOnSubmit={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[roleColor, roleColor === COLORS.primary ? '#1E4DB7' : '#5A1A9E']} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>Join as a {role === 'student' ? 'Student' : 'Startup'}</Text>
          </LinearGradient>

          <View style={styles.formCard}>
            {/* Profile Picture */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage}>
                {profileImage ? (
                  <View style={styles.avatarImgWrap}>
                    <View style={[styles.avatarPlaceholder, { borderColor: roleColor, borderStyle: 'solid' }]}>
                      <Ionicons name="person" size={38} color={roleColor} />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.avatarPlaceholder, { borderColor: roleColor }]}>
                    <Ionicons name="camera" size={24} color={roleColor} />
                    <Text style={[styles.avatarText, { color: roleColor }]}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoBtn, { borderColor: roleColor }]} onPress={pickImage}>
                  <Ionicons name="images-outline" size={14} color={roleColor} />
                  <Text style={[styles.photoBtnText, { color: roleColor }]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, { borderColor: roleColor }]} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={14} color={roleColor} />
                  <Text style={[styles.photoBtnText, { color: roleColor }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>

            {role === 'student' && (
              <>
                <Text style={styles.sectionHeader}>Personal Info</Text>
                <Field icon="person-outline" placeholder="Full Name *" value={studentForm.name} onChange={v => updateStudent('name', v)} />
                <Field icon="mail-outline" placeholder="Email Address *" value={studentForm.email} onChange={v => updateStudent('email', v)} keyboard="email-address" />
                <Field icon="lock-closed-outline" placeholder="Password (min 6 chars) *" value={studentForm.password} onChange={v => updateStudent('password', v)} secure />
                <Field icon="lock-closed-outline" placeholder="Confirm Password *" value={studentForm.confirmPassword} onChange={v => updateStudent('confirmPassword', v)} secure />
                <Text style={styles.sectionHeader}>Academic Details</Text>
                <Field icon="school-outline" placeholder="College / University" value={studentForm.college} onChange={v => updateStudent('college', v)} />
                <Field icon="book-outline" placeholder="Branch / Department" value={studentForm.branch} onChange={v => updateStudent('branch', v)} />
                <Field icon="calendar-outline" placeholder="Current Year (e.g. 3rd Year)" value={studentForm.year} onChange={v => updateStudent('year', v)} />
                <Field icon="id-card-outline" placeholder="Roll Number" value={studentForm.rollNumber} onChange={v => updateStudent('rollNumber', v)} />
                <Text style={styles.sectionHeader}>Skills & Interests</Text>
                <Field icon="bulb-outline" placeholder="Skills (e.g. Python, UI Design)" value={studentForm.skills} onChange={v => updateStudent('skills', v)} />
                <View style={styles.noticeBox}>
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.noticeText}>Students solve real startup problems and earn certificates & leaderboard recognition.</Text>
                </View>
              </>
            )}

            {role === 'startup' && (
              <>
                <Text style={styles.sectionHeader}>Founder Details</Text>
                <Field icon="person-outline" placeholder="Founder / Representative Name *" value={startupForm.founderName} onChange={v => updateStartup('founderName', v)} />
                <Field icon="mail-outline" placeholder="Official Email Address *" value={startupForm.email} onChange={v => updateStartup('email', v)} keyboard="email-address" />
                <Field icon="lock-closed-outline" placeholder="Password (min 6 chars) *" value={startupForm.password} onChange={v => updateStartup('password', v)} secure />
                <Field icon="lock-closed-outline" placeholder="Confirm Password *" value={startupForm.confirmPassword} onChange={v => updateStartup('confirmPassword', v)} secure />
                <Text style={styles.sectionHeader}>Company Details</Text>
                <Field icon="business-outline" placeholder="Company / Startup Name *" value={startupForm.companyName} onChange={v => updateStartup('companyName', v)} />
                <Field icon="briefcase-outline" placeholder="Industry (e.g. EdTech, FinTech)" value={startupForm.industry} onChange={v => updateStartup('industry', v)} />
                <Field icon="people-outline" placeholder="Team Size (e.g. 1-5)" value={startupForm.teamSize} onChange={v => updateStartup('teamSize', v)} />
                <Field icon="calendar-outline" placeholder="Year Founded" value={startupForm.foundedYear} onChange={v => updateStartup('foundedYear', v)} keyboard="number-pad" />
                <Field icon="globe-outline" placeholder="Website URL" value={startupForm.website} onChange={v => updateStartup('website', v)} keyboard="url" />
                <Text style={styles.sectionHeader}>About Your Startup</Text>
                <Field icon="document-text-outline" placeholder="What does your startup do?" value={startupForm.companyDescription} onChange={v => updateStartup('companyDescription', v)} multiline />
                <View style={[styles.noticeBox, { backgroundColor: '#F5EEFF', borderColor: '#7B2FBE30' }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#7B2FBE" />
                  <Text style={[styles.noticeText, { color: '#5A3A8A' }]}>After registration, get verified by submitting company documents for a Verified badge.</Text>
                </View>
              </>
            )}

            <TouchableOpacity style={[styles.registerBtn, { backgroundColor: roleColor }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Create Account</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
              <Text style={styles.loginLink}>Already have an account? <Text style={{ color: roleColor, fontWeight: '700' }}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 16, paddingBottom: 40, paddingHorizontal: 24 },
  backBtn: { marginBottom: 16, width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  formCard: { backgroundColor: COLORS.surface, borderRadius: 28, margin: 16, marginTop: -20, padding: 24, ...SHADOW.strong },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatarImgWrap: { marginBottom: 10 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceDark, gap: 4, marginBottom: 10 },
  avatarText: { fontSize: 11, fontWeight: '700' },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: RADIUS.round, paddingHorizontal: 14, paddingVertical: 7 },
  photoBtnText: { fontSize: 13, fontWeight: '600' },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 20, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceDark, marginBottom: 12 },
  inputIcon: { paddingLeft: 14 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 14, color: COLORS.textPrimary },
  noticeBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: '#EEF4FF', borderRadius: RADIUS.md, padding: 12, borderWidth: 1, borderColor: COLORS.primary + '25', marginTop: 8 },
  noticeText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  registerBtn: { borderRadius: RADIUS.round, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 16 },
  registerBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  loginLink: { textAlign: 'center', fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
});
