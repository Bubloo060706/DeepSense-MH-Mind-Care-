import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme';

/**
 * AlertBanner — displays alerts with alert level
 * Props: alert { id, level, icon, title, message, action }, onAction
 */
const AlertBanner = ({ alert, onAction, dismissible = true, onDismiss }) => {
  const slideIn = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!alert) return null;

  const levelStyles = {
    CRITICAL: { bg: COLORS.criticalPurpleDim, border: COLORS.criticalPurple },
    SEVERE: { bg: COLORS.severeRedDim, border: COLORS.severeRed },
    WARNING: { bg: COLORS.moderateOrangeDim, border: COLORS.moderateOrange },
    INFO: { bg: COLORS.safeGreenDim, border: COLORS.safeGreen },
  };

  const style = levelStyles[alert.level] || levelStyles.INFO;

  return (
    <Animated.View
      style={[
        cStyles.container,
        {
          transform: [{ translateY: slideIn }],
          opacity,
          borderColor: style.border,
          backgroundColor: style.bg,
        },
      ]}
    >
      <View style={cStyles.content}>
        <MaterialCommunityIcons name={alert.icon || 'alert-circle-outline'} size={20} color={style.border} />
        <View style={{ flex: 1 }}>
          <Text style={cStyles.title}>{alert.title}</Text>
          <Text style={cStyles.message}>{alert.message}</Text>
        </View>
      </View>

      <View style={cStyles.actions}>
        {alert.action && (
          <TouchableOpacity
            style={[cStyles.actionBtn, { borderColor: style.border }]}
            onPress={() => onAction && onAction(alert)}
          >
            <Text style={[cStyles.actionText, { color: style.border }]}>
              {alert.action}
            </Text>
          </TouchableOpacity>
        )}
        {dismissible && (
          <TouchableOpacity
            style={cStyles.dismissBtn}
            onPress={() => onDismiss && onDismiss(alert.id)}
          >
            <Text style={cStyles.dismissIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const cStyles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.padding.sm,
    marginVertical: SIZES.padding.xs,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    gap: SIZES.padding.sm,
  },
  content: {
    flexDirection: 'row',
    gap: SIZES.padding.sm,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.padding.xs,
    justifyContent: 'flex-end',
    marginLeft: 28,
  },
  actionBtn: {
    paddingHorizontal: SIZES.padding.sm,
    paddingVertical: 6,
    borderRadius: SIZES.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dismissBtn: {
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  dismissIcon: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});

export default AlertBanner;
