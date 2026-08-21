import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: Date | string;
  onConfirm: (date: Date) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onConfirm,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (initialDate) {
      const d = initialDate instanceof Date ? initialDate : new Date(initialDate);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
      } else {
        setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      }
    } else {
      setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  }, [initialDate, visible]);

  // Adjust Date components
  const changeDateByDays = (days: number) => {
    const next = new Date(selectedDate.getTime() + days * 24 * 60 * 60 * 1000);
    setSelectedDate(next);
  };

  const changeMonth = (delta: number) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + delta);
    setSelectedDate(next);
  };

  const changeHour = (delta: number) => {
    const next = new Date(selectedDate);
    next.setHours((next.getHours() + delta + 24) % 24);
    setSelectedDate(next);
  };

  const changeMinute = (delta: number) => {
    const next = new Date(selectedDate);
    next.setMinutes((next.getMinutes() + delta + 60) % 60);
    setSelectedDate(next);
  };

  const setPreset = (daysFromNow: number, hour = 17, minute = 0) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    target.setHours(hour, minute, 0, 0);
    setSelectedDate(target);
  };

  const month = MONTH_NAMES[selectedDate.getMonth()];
  const day = selectedDate.getDate();
  const year = selectedDate.getFullYear();

  let hours = selectedDate.getHours();
  const isPm = hours >= 12;
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
  const ampm = isPm ? 'PM' : 'AM';

  const handleSave = () => {
    onConfirm(selectedDate);
    onClose();
  };

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
            <View style={[styles.modalCard, Colors.shadow.lg]}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Set Deadline</Text>
                  <Text style={styles.subtitle}>Choose date and time</Text>
                </View>
                <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Quick Presets */}
                <Text style={styles.sectionHeader}>Quick Presets</Text>
                <View style={styles.presetRow}>
                  <Pressable
                    style={({ pressed }) => [styles.presetChip, pressed && styles.pressedChip]}
                    onPress={() => setPreset(1, 17, 0)}
                  >
                    <Text style={styles.presetText}>Tomorrow 5 PM</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.presetChip, pressed && styles.pressedChip]}
                    onPress={() => setPreset(3, 17, 0)}
                  >
                    <Text style={styles.presetText}>In 3 Days</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.presetChip, pressed && styles.pressedChip]}
                    onPress={() => setPreset(7, 23, 59)}
                  >
                    <Text style={styles.presetText}>Next Week</Text>
                  </Pressable>
                </View>

                {/* Date Stepper */}
                <Text style={styles.sectionHeader}>Date</Text>
                <View style={styles.selectorCard}>
                  {/* Month */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Month</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeMonth(-1)}
                      >
                        <Ionicons name="chevron-back" size={16} color={Colors.primary} />
                      </Pressable>
                      <Text style={styles.stepperValue}>{month}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeMonth(1)}
                      >
                        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Day */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Day</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeDateByDays(-1)}
                      >
                        <Ionicons name="chevron-back" size={16} color={Colors.primary} />
                      </Pressable>
                      <Text style={styles.stepperValue}>{day}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeDateByDays(1)}
                      >
                        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Year */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Year</Text>
                    <View style={styles.stepperRow}>
                      <Text style={[styles.stepperValue, { width: 50 }]}>{year}</Text>
                    </View>
                  </View>
                </View>

                {/* Time Stepper */}
                <Text style={styles.sectionHeader}>Time</Text>
                <View style={styles.selectorCard}>
                  {/* Hour */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Hour</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeHour(-1)}
                      >
                        <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                      </Pressable>
                      <Text style={styles.stepperValue}>{displayHours}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeHour(1)}
                      >
                        <Ionicons name="chevron-up" size={16} color={Colors.primary} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.colonSeparator}>:</Text>

                  {/* Minute */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Minute</Text>
                    <View style={styles.stepperRow}>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeMinute(-15)}
                      >
                        <Ionicons name="chevron-down" size={16} color={Colors.primary} />
                      </Pressable>
                      <Text style={styles.stepperValue}>{minutes}</Text>
                      <Pressable
                        style={styles.stepperBtn}
                        onPress={() => changeMinute(15)}
                      >
                        <Ionicons name="chevron-up" size={16} color={Colors.primary} />
                      </Pressable>
                    </View>
                  </View>

                  {/* AM/PM Toggle */}
                  <View style={styles.controlColumn}>
                    <Text style={styles.controlLabel}>Period</Text>
                    <Pressable
                      style={styles.ampmBtn}
                      onPress={() => changeHour(12)}
                    >
                      <Text style={styles.ampmText}>{ampm}</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Summary Box */}
                <View style={styles.summaryBox}>
                  <Ionicons name="time-outline" size={18} color={Colors.primary} />
                  <Text style={styles.summaryText}>
                    {`${month} ${day}, ${year} at ${displayHours}:${minutes} ${ampm}`}
                  </Text>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={onClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmBtn}
                  onPress={handleSave}
                >
                  <Text style={styles.confirmText}>Set Deadline</Text>
                </Pressable>
              </View>
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
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  presetChip: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pressedChip: {
    opacity: 0.8,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  selectorCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlColumn: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 36,
    textAlign: 'center',
  },
  colonSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 14,
  },
  ampmBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ampmText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.cardAlt,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Colors.shadow.sm,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
