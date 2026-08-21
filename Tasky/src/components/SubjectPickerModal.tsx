import React, { useState } from 'react';
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
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { AddSubjectModal } from './AddSubjectModal';

interface SubjectPickerModalProps {
  visible: boolean;
  selectedSubjectId?: string;
  onSelect: (subjectId?: string) => void;
  onClose: () => void;
}

export const SubjectPickerModal: React.FC<SubjectPickerModalProps> = ({
  visible,
  selectedSubjectId,
  onSelect,
  onClose,
}) => {
  const { subjects } = useTasks();
  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);

  return (
    <>
      <Modal
        visible={visible && !addSubjectModalVisible}
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
                    <Text style={styles.title}>Select Subject</Text>
                    <Text style={styles.subtitle}>Assign task to a course subject</Text>
                  </View>
                  <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                {/* Add New Subject Action Bar */}
                <Pressable
                  onPress={() => setAddSubjectModalVisible(true)}
                  style={({ pressed }) => [
                    styles.addSubjectRow,
                    pressed && styles.addSubjectRowPressed,
                  ]}
                >
                  <View style={styles.addIconCircle}>
                    <Ionicons name="add" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.addSubjectText}>+ Create New Subject</Text>
                </Pressable>

                {/* Subjects List */}
                <ScrollView
                  style={styles.listScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {/* None / General Option */}
                  <Pressable
                    onPress={() => {
                      onSelect(undefined);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.subjectOption,
                      !selectedSubjectId && styles.subjectOptionSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <View style={styles.subjectLeft}>
                      <View style={[styles.colorDot, { backgroundColor: Colors.textMuted }]} />
                      <View>
                        <Text style={styles.subjectName}>General / No Subject</Text>
                        <Text style={styles.subjectCode}>Personal or non-course task</Text>
                      </View>
                    </View>
                    {!selectedSubjectId && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                    )}
                  </Pressable>

                  {subjects.map((subj) => {
                    const isSelected = selectedSubjectId === subj.id;
                    return (
                      <Pressable
                        key={subj.id}
                        onPress={() => {
                          onSelect(subj.id);
                          onClose();
                        }}
                        style={({ pressed }) => [
                          styles.subjectOption,
                          isSelected && styles.subjectOptionSelected,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <View style={styles.subjectLeft}>
                          <View style={[styles.colorDot, { backgroundColor: subj.color }]} />
                          <View>
                            <Text style={styles.subjectName}>{subj.name}</Text>
                            <Text style={styles.subjectCode}>{subj.code}</Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Dismiss Button */}
                <Pressable onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Embedded Add Subject Modal */}
      <AddSubjectModal
        visible={addSubjectModalVisible}
        onClose={() => setAddSubjectModalVisible(false)}
        onSuccess={(newId) => {
          setAddSubjectModalVisible(false);
          onSelect(newId);
          onClose();
        }}
      />
    </>
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
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  addSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  addSubjectRowPressed: {
    backgroundColor: '#DBEAFE',
  },
  addIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addSubjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  listScroll: {
    maxHeight: 280,
    marginBottom: 12,
  },
  subjectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  subjectOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  subjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subjectCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.cardAlt,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
