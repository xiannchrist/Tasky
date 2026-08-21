import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { Header } from '../components/Header';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CustomButton } from '../components/CustomButton';
import { formatDateTime, getDueStatus } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;

export const TaskDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TaskDetailsRouteProp>();
  const { taskId } = route.params;

  const { getTaskById, toggleTaskCompletion, deleteTask } = useTasks();
  const task = getTaskById(taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Task Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Task Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This task may have been deleted or does not exist.
          </Text>
          <CustomButton
            title="Go Back"
            variant="primary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'Completed';
  const dueStatus = getDueStatus(task.deadline, isCompleted);

  // Handle Mark Completed / Pending toggle
  const handleToggleStatus = async () => {
    await toggleTaskCompletion(task.id);
    Alert.alert(
      isCompleted ? 'Task Marked Pending' : 'Task Completed! 🎉',
      isCompleted
        ? 'Task has been moved back to your pending list.'
        : 'Congratulations on completing this task!',
      [{ text: 'OK' }]
    );
  };

  // Handle Delete with Alert confirmation (Section 7 requirement)
  const handleDelete = () => {
    Alert.alert(
      'Delete Task?',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Task Details"
        subtitle={`ID: #${task.id.slice(-6)}`}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'create-outline',
          label: 'Edit',
          onPress: () => navigation.navigate('EditTask', { taskId: task.id }),
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={[styles.mainCard, Colors.shadow.sm]}>
          {/* Status & Priority Row */}
          <View style={styles.badgesRow}>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} dueStatus={dueStatus} />
          </View>

          {/* Task Title */}
          <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
            {task.title}
          </Text>

          {/* Description Section */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>
            {task.description || 'No description provided.'}
          </Text>
        </View>

        {/* Details Metadata Card */}
        <View style={[styles.metaCard, Colors.shadow.sm]}>
          {/* Subject / Course */}
          {task.subjectName && (
            <>
              <View style={styles.metaRow}>
                <View style={[styles.metaIconBox, { backgroundColor: (task.subjectColor || Colors.primary) + '15' }]}>
                  <Ionicons name="book-outline" size={18} color={task.subjectColor || Colors.primary} />
                </View>
                <View style={styles.metaTextContainer}>
                  <Text style={styles.metaLabel}>Subject / Course</Text>
                  <Text style={[styles.metaValue, { color: task.subjectColor || Colors.primary, fontWeight: '700' }]}>
                    {task.subjectName}
                  </Text>
                </View>
              </View>
              <View style={styles.innerDivider} />
            </>
          )}

          {/* Deadline */}
          <View style={styles.metaRow}>
            <View style={styles.metaIconBox}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Deadline</Text>
              <Text style={styles.metaValue}>{formatDateTime(task.deadline)}</Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          {/* Created Date */}
          <View style={styles.metaRow}>
            <View style={styles.metaIconBox}>
              <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
            </View>
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Created On</Text>
              <Text style={styles.metaValue}>{formatDateTime(task.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.innerDivider} />

          {/* Reminder Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaIconBox}>
              <Ionicons
                name={task.notificationId ? 'notifications-outline' : 'notifications-off-outline'}
                size={18}
                color={task.notificationId ? Colors.primary : Colors.textMuted}
              />
            </View>
            <View style={styles.metaTextContainer}>
              <Text style={styles.metaLabel}>Deadline Reminder</Text>
              <Text style={styles.metaValue}>
                {isCompleted
                  ? 'Disabled (Task Completed)'
                  : task.notificationId
                  ? 'Scheduled (1 day before deadline)'
                  : 'No active notification'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {/* Mark Complete Toggle */}
          <CustomButton
            title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
            icon={isCompleted ? 'refresh-outline' : 'checkmark-circle-outline'}
            variant={isCompleted ? 'secondary' : 'success'}
            size="lg"
            onPress={handleToggleStatus}
            style={{ marginBottom: 10 }}
          />

          {/* Edit Task */}
          <CustomButton
            title="Edit Task Details"
            icon="create-outline"
            variant="outline"
            size="md"
            onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
            style={{ marginBottom: 10 }}
          />

          {/* Delete Task */}
          <CustomButton
            title="Delete Task"
            icon="trash-outline"
            variant="danger"
            size="md"
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  metaCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  metaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaTextContainer: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  innerDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  actionsCard: {
    marginTop: 4,
  },
});
