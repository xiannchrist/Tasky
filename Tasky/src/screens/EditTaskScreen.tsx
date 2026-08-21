import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, TaskStatus, ValidationErrors } from '../types/Task';
import { Colors } from '../constants/colors';
import { Header } from '../components/Header';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { PriorityPickerModal } from '../components/PriorityPickerModal';
import { DatePickerModal } from '../components/DatePickerModal';
import { SubjectPickerModal } from '../components/SubjectPickerModal';
import { validateTaskForm, hasValidationErrors } from '../utils/validation';
import { formatDateTime } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditTaskRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

export const EditTaskScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditTaskRouteProp>();
  const { taskId } = route.params;

  const { getTaskById, updateTask, getSubjectById } = useTasks();
  const existingTask = getTaskById(taskId);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  const selectedSubject = getSubjectById(subjectId);

  // Populate form with existing task data
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      const parsedDeadline = new Date(existingTask.deadline);
      setDeadline(isNaN(parsedDeadline.getTime()) ? new Date() : parsedDeadline);
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setSubjectId(existingTask.subjectId);
    }
  }, [existingTask]);

  if (!existingTask) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Edit Task" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Task not found.</Text>
          <CustomButton
            title="Go Back"
            variant="primary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    // Validate
    const formErrors = validateTaskForm({
      title,
      description,
      deadline,
      priority,
      isEditing: true,
    });

    setErrors(formErrors);

    if (hasValidationErrors(formErrors)) {
      Alert.alert(
        'Validation Error',
        'Please correct the highlighted fields before saving.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSubmitting(true);
      await updateTask(taskId, {
        title,
        description,
        deadline: deadline.toISOString(),
        priority,
        status,
        subjectId,
      });

      Alert.alert('Task Updated! ✏️', 'Task updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to update task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColor = Colors.priority[priority];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Edit Task"
        subtitle={`Updating: ${existingTask.title}`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <CustomInput
            label="Task Title"
            required
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
          />

          {/* Description Input */}
          <CustomInput
            label="Description"
            required
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={errors.description}
            multiline
            numberOfLines={4}
          />

          {/* Deadline Field */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Deadline & Reminder</Text>
              <Text style={styles.requiredMark}> *</Text>
            </View>
            <Pressable
              onPress={() => setDateModalVisible(true)}
              style={({ pressed }) => [
                styles.selectorField,
                Boolean(errors.deadline) && styles.selectorFieldError,
                pressed && styles.selectorFieldPressed,
              ]}
            >
              <View style={styles.selectorLeft}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.selectorValue}>
                  {formatDateTime(deadline.toISOString())}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </Pressable>
            {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
          </View>

          {/* Priority Field */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Priority Level</Text>
              <Text style={styles.requiredMark}> *</Text>
            </View>
            <Pressable
              onPress={() => setPriorityModalVisible(true)}
              style={({ pressed }) => [
                styles.selectorField,
                pressed && styles.selectorFieldPressed,
              ]}
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: priorityColor.badge },
                  ]}
                />
                <Text style={styles.selectorValue}>{priority} Priority</Text>
              </View>
              <View style={styles.changeBadge}>
                <Text style={styles.changeBadgeText}>Change</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </Pressable>
          </View>

          {/* Subject / Course Selection Field */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Subject / Course</Text>
            </View>
            <Pressable
              onPress={() => setSubjectModalVisible(true)}
              style={({ pressed }) => [
                styles.selectorField,
                pressed && styles.selectorFieldPressed,
              ]}
            >
              <View style={styles.selectorLeft}>
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: selectedSubject?.color || Colors.textMuted },
                  ]}
                />
                <Text style={styles.selectorValue}>
                  {selectedSubject ? `${selectedSubject.name} (${selectedSubject.code})` : 'General / No Subject'}
                </Text>
              </View>
              <View style={styles.changeBadge}>
                <Text style={styles.changeBadgeText}>Change</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </Pressable>
          </View>

          {/* Status Toggle Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusCardTitle}>Task Completion Status</Text>
              <Text style={styles.statusCardSubtitle}>
                {status === 'Completed' ? 'Task is marked as completed' : 'Task is pending completion'}
              </Text>
            </View>
            <Switch
              value={status === 'Completed'}
              onValueChange={(val) => setStatus(val ? 'Completed' : 'Pending')}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={Colors.card}
            />
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <CustomButton
              title="Save Changes"
              icon="checkmark-done-outline"
              variant="primary"
              size="lg"
              loading={submitting}
              onPress={handleUpdate}
              style={{ marginBottom: 10 }}
            />
            <CustomButton
              title="Cancel"
              variant="secondary"
              size="md"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Subject Picker Modal */}
      <SubjectPickerModal
        visible={subjectModalVisible}
        selectedSubjectId={subjectId}
        onSelect={(id) => setSubjectId(id)}
        onClose={() => setSubjectModalVisible(false)}
      />

      {/* Priority Picker Modal */}
      <PriorityPickerModal
        visible={priorityModalVisible}
        selectedPriority={priority}
        onSelect={(p) => setPriority(p)}
        onClose={() => setPriorityModalVisible(false)}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={dateModalVisible}
        initialDate={deadline}
        onConfirm={(newDate) => {
          setDeadline(newDate);
          if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
        }}
        onClose={() => setDateModalVisible(false)}
      />
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
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 18,
    paddingBottom: 40,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  requiredMark: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  selectorField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorFieldPressed: {
    backgroundColor: Colors.cardHover,
  },
  selectorFieldError: {
    borderColor: Colors.danger,
    backgroundColor: '#FFF8F8',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 2,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 24,
  },
  statusTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 8,
  },
});
