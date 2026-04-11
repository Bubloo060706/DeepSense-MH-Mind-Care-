import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,Image
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../theme';

const { width, height } = Dimensions.get('window');

// Simulated gradient using layered views (no lib dependency needed here)
const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.8)).current;
  const ring2Scale = useRef(new Animated.Value(0.6)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    // Sequence of animations
    Animated.sequence([
      // 1. Rings pulse in
      Animated.parallel([
        Animated.spring(ring1Scale, { toValue: 1, useNativeDriver: true, tension: 40 }),
        Animated.timing(ring1Opacity, { toValue: 0.15, duration: 600, useNativeDriver: true }),
      ]),
      // 2. Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(ring2Scale, { toValue: 1, useNativeDriver: true, tension: 30 }),
        Animated.timing(ring2Opacity, { toValue: 0.1, duration: 500, useNativeDriver: true }),
      ]),
      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(taglineY, { toValue: 0, useNativeDriver: true, tension: 50 }),
      ]),
      // 4. Progress bar
      Animated.timing(progressWidth, {
        toValue: width * 0.6,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Login'), 300);
    });

    // Continuous ring pulse
    const pulsate = () => {
      Animated.sequence([
        Animated.timing(ring1Scale, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(ring1Scale, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ]).start(pulsate);
    };
    setTimeout(pulsate, 800);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background layers for depth */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Decorative grid lines */}
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.gridLine,
            { top: (height / 7) * (i + 1) },
          ]}
        />
      ))}

      {/* Rings */}
      <Animated.View
        style={[
          styles.ring,
          styles.ring1,
          { transform: [{ scale: ring1Scale }], opacity: ring1Opacity },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          { transform: [{ scale: ring2Scale }], opacity: ring2Opacity },
        ]}
      />

      {/* Core content */}
      <Animated.View
        style={[
          styles.logoWrap,
          { transform: [{ scale: logoScale }], opacity: logoOpacity },
        ]}
      >
        {/* Hex logo shape */}
        <View style={styles.hexOuter}>
          <View style={styles.hexInner}>
            <Image
                source={require('../../assets/icon.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.appName}>MindCare</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagDot} />
          <Text style={styles.tagSubtitle}>Smarter Insights for a Healthier Mind.</Text>
          <View style={styles.tagDot} />
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineWrap,
          { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
        ]}
      >
        <Text style={styles.tagline}></Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* Version */}
      <Text style={styles.version}></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepSpace,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#0D1428',
  },
  bgBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: COLORS.deepSpace,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.cardBorder,
    opacity: 0.3,
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: COLORS.safeGreen,
  },
  ring1: {
    width: 320,
    height: 320,
    top: height / 2 - 160,
    left: width / 2 - 160,
  },
  ring2: {
    width: 220,
    height: 220,
    top: height / 2 - 110,
    left: width / 2 - 110,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  hexOuter: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.cardSurface,
    borderWidth: 2,
    borderColor: COLORS.safeGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    transform: [{ rotate: '45deg' }],
  },
  hexInner: {
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    fontSize: 40,
    color: COLORS.safeGreen,
  },
  appName: {
    fontSize: SIZES.hero,
    fontWeight: FONTS.weightBlack,
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.safeGreen,
  },
  tagSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: FONTS.weightMedium,
  },
  taglineWrap: {
    position: 'absolute',
    bottom: height * 0.18,
    alignItems: 'center',
  },
  tagline: {
    fontSize: SIZES.bodyLg,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  progressTrack: {
    position: 'absolute',
    bottom: height * 0.1,
    width: width * 0.6,
    height: 2,
    backgroundColor: COLORS.cardBorder,
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.safeGreen,
    borderRadius: SIZES.radiusFull,
  },
  version: {
    position: 'absolute',
    bottom: SIZES.xl,
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
});

export default SplashScreen;
