import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme';

/**
 * MoodCard — compact mood summary card.
 * Props: mood { emoji, label, score, note, ts }, onPress
 */
const MOOD_COLORS = {
  'Great':    COLORS.safeGreen,
  'Good':     '#66D9B0',
  'Okay':     COLORS.mildYellow,
  'Low':      COLORS.moderateOrange,
  'Very Low': COLORS.severeRed,
};

const MoodCard = ({ mood, onPress, compact = false }) => {
  const color = MOOD_COLORS[mood?.label] || COLORS.textMuted;
  const time = mood?.ts
    ? new Date(mood.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (compact) {
    return (
      <TouchableOpacity style={[cStyles.compact, { borderColor: color + '50' }]} onPress={onPress}>
        <MaterialCommunityIcons name={mood?.icon || 'emoticon-neutral-outline'} size={20} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={[cStyles.compactLabel, { color }]}>{mood?.label || 'Unknown'}</Text>
          <Text style={cStyles.compactTime}>{time}</Text>
        </View>
        <View style={cStyles.dots}>
          {[1,2,3,4,5].map(s => (
            <View
              key={s}
              style={[cStyles.dot, s <= (mood?.score || 0) && { backgroundColor: color }]}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[cStyles.card, { borderColor: color + '40' }]} onPress={onPress}>
      <View style={cStyles.top}>
        <View style={[cStyles.iconWrap, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={mood?.icon || 'emoticon-neutral-outline'} size={20} color={color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[cStyles.label, { color }]}>{mood?.label || 'Unknown'}</Text>
          <Text style={cStyles.time}>{time}</Text>
        </View>
        {/* Score dots */}
        <View style={cStyles.dotsVertical}>
          {[5,4,3,2,1].map(s => (
            <View
              key={s}
              style={[
                cStyles.dotV,
                s <= (mood?.score || 0) && { backgroundColor: color },
              ]}
            />
          ))}
        </View>
      </View>

      {mood?.note ? (
        <Text style={cStyles.note} numberOfLines={2}>{mood.note}</Text>
      ) : null}

      {mood?.tags?.length > 0 ? (
        <View style={cStyles.tagRow}>
          {mood.tags.slice(0, 3).map(t => (
            <View key={t} style={cStyles.tag}>
              <Text style={cStyles.tagText}>{t}</Text>
            </View>
          ))}
          {mood.tags.length > 3 && (
            <Text style={cStyles.tagMore}>+{mood.tags.length - 3}</Text>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const cStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusLg,
    borderWidth: 1.5, padding: SIZES.md, gap: SIZES.sm,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: SIZES.body, fontWeight: FONTS.weightBold },
  time: { fontSize: SIZES.caption, color: COLORS.textMuted },
  dotsVertical: { gap: 3 },
  dotV: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.cardBorder },
  note: { fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: COLORS.cardSurface, borderRadius: SIZES.radiusFull,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  tagText: { fontSize: 11, color: COLORS.textMuted },
  tagMore: { fontSize: 11, color: COLORS.textMuted, alignSelf: 'center' },

  // Compact variant
  compact: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.navyCard, borderRadius: SIZES.radiusMd,
    borderWidth: 1, padding: SIZES.sm,
  },
  compactLabel: { fontSize: SIZES.small, fontWeight: FONTS.weightBold },
  compactTime: { fontSize: SIZES.caption, color: COLORS.textMuted },
  dots: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.cardBorder },
});

export default MoodCard;
