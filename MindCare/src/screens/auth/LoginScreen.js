import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, TouchableWithoutFeedback, Keyboard, Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../theme';
import { useAppState } from '../../context/AppStateContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { setUser } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeField, setActiveField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, tension: 40, friction: 8, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      shake();
      return;
    }
    setIsLoading(true);

    // Spin loader
    Animated.loop(
      Animated.timing(loadingRotate, { toValue: 1, duration: 900, useNativeDriver: true })
    ).start();

    // Simulate auth delay
    setTimeout(() => {
      setIsLoading(false);
      setUser({ name: email.split('@')[0] || 'User', email });
      navigation.replace('Onboarding');
    }, 1800);
  };

  const spin = loadingRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const demoLogin = (role) => {
    const demos = {
      patient: { email: 'alex@mindpulse.io', name: 'Alex' },
      clinician: { email: 'dr.sharma@hospital.in', name: 'Dr. Sharma' },
    };
    setUser(demos[role]);
    navigation.replace('Onboarding');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Background accent */}
        <View style={styles.bgAccent} />
        <View style={styles.bgGrid}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={[styles.gridCol, { left: (width / 9) * (i + 1) }]} />
          ))}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
            >
              <View style={styles.logoMini}>
                
                <View style={styles.logoBox}>
                  <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                />
                </View>
              </View>
              <Text style={styles.appTitle}>MindCare</Text>
              <Text style={styles.headerSub}>Mental wellness, intelligently monitored</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View
              style={[
                styles.card,
                { transform: [{ translateY: cardSlide }, { translateX: shakeAnim }], opacity: fadeIn },
              ]}
            >
              <Text style={styles.cardTitle}>Sign In</Text>
              <Text style={styles.cardSubtitle}>Access your wellness dashboard</Text>

              {/* Email field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={[styles.inputWrap, activeField === 'email' && styles.inputActive]}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    selectionColor={COLORS.safeGreen}
                  />
                </View>
              </View>

              {/* Password field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={[styles.inputWrap, activeField === 'pass' && styles.inputActive]}>
                  <Text style={styles.inputIcon}>◉</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setActiveField('pass')}
                    onBlur={() => setActiveField(null)}
                    secureTextEntry={!showPass}
                    selectionColor={COLORS.safeGreen}
                  />
                  <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                    <Text style={styles.eyeIcon}>{showPass ? '◐' : '◑'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.severeRed} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Forgot */}
              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginBtn, isLoading && styles.loginBtnLoading]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <Animated.Text style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                      ◌
                    </Animated.Text>
                    <Text style={styles.loginBtnText}>Authenticating...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginBtnText}>Sign In  →</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>QUICK DEMO</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Demo Buttons */}
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => demoLogin('patient')}
                >
                  <MaterialCommunityIcons name="account-circle-outline" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.demoBtnText}>Patient</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoBtn, styles.demoBtnAlt]}
                  onPress={() => demoLogin('clinician')}
                >
                  <MaterialCommunityIcons name="hospital-box-outline" size={24} color={COLORS.textPrimary} />
                  <Text style={styles.demoBtnText}>Clinician</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeIn }]}>
              <Text style={styles.footerText}>
                🔒 All data is encrypted and stored locally
              </Text>
              <Text style={styles.footerSub}>Simulation Mode — No real data transmitted</Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepSpace },
  bgAccent: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.safeGreen,
    opacity: 0.04,
  },
  bgGrid: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridCol: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.cardBorder,
    opacity: 0.4,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
    paddingHorizontal: SIZES.screenPadding,
  },
  header: { alignItems: 'center', marginBottom: SIZES.xl, marginTop: SIZES.lg },
  logoMini: { marginBottom: SIZES.md },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.cardSurface,
    borderWidth: 2,
    borderColor: COLORS.safeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  logoChar: { fontSize: 28, color: COLORS.safeGreen, transform: [{ rotate: '-45deg' }] },
  appTitle: {
    fontSize: SIZES.display,
    fontWeight: FONTS.weightBlack,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.navyCard,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  cardTitle: {
    fontSize: SIZES.heading,
    fontWeight: FONTS.weightBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: SIZES.xl },
  fieldGroup: { marginBottom: SIZES.md },
  fieldLabel: {
    fontSize: 10,
    fontWeight: FONTS.weightBold,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SIZES.md,
    height: 52,
  },
  inputActive: { borderColor: COLORS.safeGreen },
  inputIcon: { fontSize: 16, color: COLORS.textMuted, marginRight: SIZES.sm },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weightMedium,
  },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 18, color: COLORS.textMuted },
  errorBox: {
    backgroundColor: COLORS.severeRedDim,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.sm,
    marginBottom: SIZES.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.severeRed,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  errorText: { color: COLORS.severeRed, fontSize: SIZES.small, fontWeight: FONTS.weightMedium, flex: 1 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: SIZES.lg },
  forgotText: { color: COLORS.safeGreen, fontSize: SIZES.small, fontWeight: FONTS.weightMedium },
  loginBtn: {
    backgroundColor: COLORS.safeGreen,
    borderRadius: SIZES.radiusMd,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
  },
  loginBtnLoading: { opacity: 0.7 },
  loginBtnText: {
    fontSize: SIZES.bodyLg,
    fontWeight: FONTS.weightBold,
    color: COLORS.deepSpace,
    letterSpacing: 0.5,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spinner: { fontSize: 22, color: COLORS.deepSpace },
  divider: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 2, fontWeight: FONTS.weightBold },
  demoRow: { flexDirection: 'row', gap: SIZES.md },
  demoBtn: {
    flex: 1,
    backgroundColor: COLORS.cardSurface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    gap: 6,
  },
  demoBtnAlt: { borderColor: COLORS.safeGreen + '40' },
  demoBtnText: { fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: FONTS.weightSemiBold },
  footer: { alignItems: 'center', gap: 6 },
  footerText: { fontSize: SIZES.small, color: COLORS.textMuted },
  footerSub: { fontSize: SIZES.caption, color: COLORS.textMuted, opacity: 0.6 },
});

export default LoginScreen;
