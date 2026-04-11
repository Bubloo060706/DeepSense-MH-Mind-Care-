import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, SIZES, FONTS, getRiskLevel } from '../theme';

/**
 * RiskGauge — pure View/Animated gauge, zero SVG dependency.
 * Props: score (0–100), size (default 160)
 */
const RiskGauge = ({ score = 0, size = 160 }) => {
  const animScore = useRef(new Animated.Value(0)).current;
  const risk = getRiskLevel(score);
  const center = size / 2;
  const thickness = size * 0.09;

  useEffect(() => {
    Animated.timing(animScore, {
      toValue: score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  // We simulate arc using a row of segmented bars (20 segments)
  const SEGMENTS = 20;
  const filledSegments = Math.round((score / 100) * SEGMENTS);

  const segColor = (i) => {
    const pct = (i / SEGMENTS) * 100;
    if (pct < 15) return COLORS.safeGreen;
    if (pct < 40) return COLORS.mildYellow;
    if (pct < 65) return COLORS.moderateOrange;
    if (pct < 85) return COLORS.severeRed;
    return COLORS.criticalPurple;
  };

  return (
    <View style={[gauge.wrap, { width: size, height: size * 0.7 }]}>
      {/* Segment arc */}
      <View style={gauge.arcRow}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const filled = i < filledSegments;
          const isActive = i === filledSegments - 1;
          return (
            <View
              key={i}
              style={[
                gauge.seg,
                {
                  backgroundColor: filled ? segColor(i) : COLORS.cardBorder,
                  opacity: filled ? (isActive ? 1 : 0.7 + (i / SEGMENTS) * 0.3) : 0.25,
                  height: thickness + (isActive ? 4 : 0),
                  borderRadius: 3,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Center score */}
      <View style={gauge.center}>
        <Text style={[gauge.score, { color: risk.color }]}>{score}</Text>
        <Text style={gauge.label}>{risk.shortLabel}</Text>
      </View>
    </View>
  );
};

const gauge = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'flex-start' },
  arcRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 3, paddingHorizontal: 4, width: '100%',
  },
  seg: { flex: 1, height: 14, borderRadius: 3 },
  center: { alignItems: 'center', marginTop: 8 },
  score: { fontSize: SIZES.display, fontWeight: FONTS.weightBlack, lineHeight: 38 },
  label: { fontSize: SIZES.caption, color: COLORS.textMuted, fontWeight: FONTS.weightBold, letterSpacing: 1 },
});

export default RiskGauge;
