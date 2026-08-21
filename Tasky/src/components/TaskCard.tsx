import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/Task';
import { Colors } from '../constants/colors';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, getDueStatus } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleComplete,
}) => {
  const isCompleted = task.status === 'Completed';
  const dueStatus = getDueStatus(task.deadline, isCompleted);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isCompleted && styles.cardCompleted,
        Colors.shadow.sm,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.headerRow}>
        {/* Toggle completion checkbox */}
        <Pressable
          onPress={onToggleComplete}
          hitSlop={8}
          style={styles.checkboxContainer}
        >
          <View
            style={[
              styles.checkbox,
              isCompleted && styles.checkboxChecked,
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={14} color={Colors.textInverse} />
            )}
          </View>
        </Pressable>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.subjectName && (
            <View style={[styles.subjectPill, { backgroundColor: (task.subjectColor || Colors.primary) + '15' }]}>
              <View style={[styles.subjectDot, { backgroundColor: task.subjectColor || Colors.primary }]} />
              <Text style={[styles.subjectPillText, { color: task.subjectColor || Colors.primary }]}>
                {task.subjectName}
              </Text>
            </View>
          )}
        </View>

        {/* Priority Badge */}
        <PriorityBadge priority={task.priority} size="sm" />
      </View>

      {/* Description */}
      {task.description ? (
        <Text
          style={[
            styles.description,
            isCompleted && styles.descriptionCompleted,
          ]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
      ) : null}

      {/* Footer Info: Deadline & Status */}
      <View style={styles.footerRow}>
        <View style={styles.deadlineContainer}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={isCompleted ? Colors.textMuted : Colors.textSecondary}
          />
          <Text
            style={[
              styles.deadlineText,
              isCompleted && styles.deadlineCompleted,
            ]}
          >
            {formatDateTime(task.deadline)}
          </Text>
        </View>

        <StatusBadge status={task.status} dueStatus={dueStatus} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompleted: {
    backgroundColor: '#FAFBFD',
    borderColor: Colors.borderLight,
    opacity: 0.88,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: Colors.cardHover,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  subjectPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
    marginLeft: 32,
  },
  descriptionCompleted: {
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginLeft: 32,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  deadlineText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  deadlineCompleted: {
    color: Colors.textMuted,
  },
});
