import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskStatus, DueStatus } from '../types/Task';
import { Colors } from '../constants/colors';

interface StatusBadgeProps {
  status: TaskStatus;
  dueStatus?: DueStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, dueStatus }) => {
  if (status === 'Completed') {
    return (
      <View style={[styles.badge, { backgroundColor: Colors.status.completed.bg, borderColor: Colors.status.completed.border }]}>
        <Text style={[styles.text, { color: Colors.status.completed.text }]}>✓ Completed</Text>
      </View>
    );
  }

  // If pending, check due urgency
  if (dueStatus === 'Overdue') {
    return (
      <View style={[styles.badge, { backgroundColor: Colors.status.overdue.bg, borderColor: Colors.status.overdue.border }]}>
        <Text style={[styles.text, { color: Colors.status.overdue.text }]}>⚠️ Overdue</Text>
      </View>
    );
  }

  if (dueStatus === 'Due Today') {
    return (
      <View style={[styles.badge, { backgroundColor: Colors.status.dueToday.bg, borderColor: Colors.status.dueToday.border }]}>
        <Text style={[styles.text, { color: Colors.status.dueToday.text }]}>🔥 Due Today</Text>
      </View>
    );
  }

  if (dueStatus === 'Due Tomorrow') {
    return (
      <View style={[styles.badge, { backgroundColor: Colors.status.dueTomorrow.bg, borderColor: Colors.status.dueTomorrow.border }]}>
        <Text style={[styles.text, { color: Colors.status.dueTomorrow.text }]}>⏰ Due Tomorrow</Text>
      </View>
    );
  }

  if (dueStatus === 'Due Soon') {
    return (
      <View style={[styles.badge, { backgroundColor: Colors.status.dueSoon.bg, borderColor: Colors.status.dueSoon.border }]}>
        <Text style={[styles.text, { color: Colors.status.dueSoon.text }]}>📅 Due Soon</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: Colors.status.pending.bg, borderColor: Colors.status.pending.border }]}>
      <Text style={[styles.text, { color: Colors.status.pending.text }]}>Pending</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
