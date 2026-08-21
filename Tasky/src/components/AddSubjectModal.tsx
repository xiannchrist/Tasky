import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { CustomInput } from './CustomInput';
import { CustomButton } from './CustomButton';

interface AddSubjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (subjectId: string) => void;
}

const COLOR_PALETTE = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#059669', // Emerald
  '#D97706', // Amber
  '#EA580C', // Orange
  '#E11D48', // Rose
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { addSubject } = useTasks();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject name.');
      return;
    }

    try {
      setSaving(true);
      const newSubject = await addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase() || name.substring(0, 4).toUpperCase(),
        color: selectedColor,
      });

      setName('');
      setCode('');
      Alert.alert('Subject Created! 📚', `"${newSubject.name}" has been added to your subjects.`, [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            if (onSuccess) onSuccess(newSubject.id);
          },
        },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create subject.');
    } finally {
      setSaving(false);
    }
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
                <View style={styles.headerLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name="book" size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.title}>Add New Subject</Text>
                    <Text style={styles.subtitle}>Organize tasks by academic course</Text>
                  </View>
                </View>
                <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>

              <CustomInput
                label="Subject / Course Name"
                required
                placeholder="e.g. Mobile Application Development"
                value={name}
                onChangeText={setName}
              />

              <CustomInput
                label="Course Code (Optional)"
                placeholder="e.g. IT301"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />

              {/* Color Picker */}
              <View style={styles.colorSection}>
                <Text style={styles.colorLabel}>Theme Color</Text>
                <View style={styles.colorRow}>
                  {COLOR_PALETTE.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <Pressable
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: color },
                          isSelected && styles.colorCircleSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <CustomButton
                  title="Cancel"
                  variant="secondary"
                  onPress={onClose}
                  style={{ flex: 1 }}
                />
                <CustomButton
                  title="Save Subject"
                  variant="primary"
                  loading={saving}
                  onPress={handleSave}
                  style={{ flex: 2 }}
                />
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSection: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
