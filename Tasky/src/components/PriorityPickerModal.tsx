import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskPriority } from '../types/Task';
import { Colors } from '../constants/colors';

interface PriorityPickerModalProps {
  visible: boolean;
  selectedPriority: TaskPriority;
  onSelect: (priority: TaskPriority) => void;
  onClose: () => void;
}

interface PriorityOption {
  value: TaskPriority;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: 'High',
    label: 'High Priority',
    description: 'Urgent task requiring immediate attention or soonest deadline.',
    color: Colors.priority.High.text,
    bg: Colors.priority.High.bg,
    border: Colors.priority.High.border,
  },
  {
    value: 'Medium',
    label: 'Medium Priority',
    description: 'Important task with normal deadline urgency.',
    color: Colors.priority.Medium.text,
    bg: Colors.priority.Medium.bg,
    border: Colors.priority.Medium.border,
  },
  {
    value: 'Low',
    label: 'Low Priority',
    description: 'Routine task or flexible deadline.',
    color: Colors.priority.Low.text,
    bg: Colors.priority.Low.bg,
    border: Colors.priority.Low.border,
  },
];

export const PriorityPickerModal: React.FC<PriorityPickerModalProps> = ({
  visible,
  selectedPriority,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, Colors.shadow.lg]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Select Priority</Text>
                  <Text style={styles.subtitle}>
                    Choose importance level for this task
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {PRIORITY_OPTIONS.map((option) => {
                  const isSelected = selectedPriority === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        onSelect(option.value);
                        onClose();
                      }}
                      style={({ pressed }) => [
                        styles.optionCard,
                        { borderColor: isSelected ? Colors.primary : Colors.border },
                        isSelected && { backgroundColor: Colors.primaryLight },
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.dotIndicator,
                          { backgroundColor: option.color },
                        ]}
                      />
                      <View style={styles.optionTextContainer}>
                        <View style={styles.optionLabelRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && { color: Colors.primary, fontWeight: '700' },
                            ]}
                          >
                            {option.label}
                          </Text>
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color={Colors.primary}
                            />
                          )}
                        </View>
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Close Button */}
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.dismissButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.dismissText}>Cancel</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    marginBottom: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
    backgroundColor: Colors.card,
  },
  optionPressed: {
    opacity: 0.9,
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  dismissButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.cardAlt,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
