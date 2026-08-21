import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, ValidationErrors } from '../types/Task';
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

export const AddTaskScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addTask, getSubjectById } = useTasks();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // Default: tomorrow
  );
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  const selectedSubject = getSubjectById(subjectId);

  const handleSave = async () => {
    // Validate inputs
    const formErrors = validateTaskForm({
      title,
      description,
      deadline,
      priority,
      isEditing: false,
    });

    setErrors(formErrors);

    if (hasValidationErrors(formErrors)) {
      Alert.alert(
        'Validation Error',
        'Please correct the highlighted fields before saving your task.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSubmitting(true);
      await addTask({
        title,
        description,
        deadline: deadline.toISOString(),
        priority,
        subjectId,
      });

      Alert.alert('Task Created! ✅', `"${title.trim()}" was successfully scheduled.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to create task:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving your task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColor = Colors.priority[priority];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Add New Task"
        subtitle="Create and schedule a task deadline"
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
          {/* Task Title Input */}
          <CustomInput
            label="Task Title"
            required
            placeholder="e.g. Complete React Native Assignment"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            helperText="Minimum 3 characters"
            autoFocus
          />

          {/* Description Input */}
          <CustomInput
            label="Description"
            required
            placeholder="Describe what needs to be done, requirements, or study notes..."
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={errors.description}
            multiline
            numberOfLines={4}
          />

          {/* Deadline Picker Field */}
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
            {errors.deadline ? (
              <Text style={styles.errorText}>{errors.deadline}</Text>
            ) : (
              <Text style={styles.helperText}>
                Tasky will notify you 1 day before this deadline.
              </Text>
            )}
          </View>

          {/* Priority Picker Field */}
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

          {/* Default Status Info */}
          <View style={styles.statusInfoBox}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.statusInfoText}>
              Initial status will be set to <Text style={{ fontWeight: '700' }}>Pending</Text>.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.actionButtonsContainer}>
            <CustomButton
              title="Save Task"
              icon="checkmark-outline"
              variant="primary"
              size="lg"
              loading={submitting}
              onPress={handleSave}
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

      {/* Subject Modal */}
      <SubjectPickerModal
        visible={subjectModalVisible}
        selectedSubjectId={subjectId}
        onSelect={(id) => setSubjectId(id)}
        onClose={() => setSubjectModalVisible(false)}
      />

      {/* Priority Modal */}
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
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 2,
  },
  statusInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardAlt,
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  actionButtonsContainer: {
    marginTop: 8,
  },
});
