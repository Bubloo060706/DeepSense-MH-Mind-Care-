import React from 'react';
import { Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getIconName, TEXT_ICONS } from '../utils/icons';

/**
 * Icon component that renders Material Design icons
 * Falls back to text-based icons if needed
 *
 * @param {string} name - Icon name or emoji to display
 * @param {number} size - Icon size in pixels
 * @param {string} color - Icon color
 * @param {boolean} useFallback - Use text-based icons instead of Material Design
 */
export const Icon = ({
  name,
  size = 24,
  color = '#000',
  useFallback = false,
  style,
  testID,
}) => {
  if (!name) return null;

  const iconName = getIconName(name);

  if (useFallback) {
    // Use text-based fallback icons
    const textIcon = TEXT_ICONS[iconName] || '•';
    return (
      <Text
        style={[
          styles.textIcon,
          {
            fontSize: size,
            color,
          },
          style,
        ]}
        testID={testID}
      >
        {textIcon}
      </Text>
    );
  }

  // Use Material Community Icons
  return (
    <MaterialCommunityIcons
      name={iconName}
      size={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  textIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 24,
  },
});

export default Icon;
