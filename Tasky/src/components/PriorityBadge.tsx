import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskPriority } from '../types/Task';
import { Colors } from '../constants/colors';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config = Colors.priority[priority] || Colors.priority.Low;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.badge }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {priority}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
