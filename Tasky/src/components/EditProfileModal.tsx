import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { CustomInput } from './CustomInput';
import { CustomButton } from './CustomButton';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { profile, updateProfile } = useTasks();

  const [name, setName] = useState(profile.name);
  const [section, setSection] = useState(profile.section);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [about, setAbout] = useState(profile.about);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setSection(profile.section);
    setStudentId(profile.studentId);
    setAbout(profile.about);
  }, [profile, visible]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        section: section.trim(),
        studentId: studentId.trim(),
        about: about.trim(),
      });

      Alert.alert('Saved Successfully! 👤', 'Your personal information and greeting have been updated.', [
        { text: 'OK', onPress: onClose },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update personal information.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoid}
            >
              <View style={[styles.modalCard, Colors.shadow.lg]}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <View style={styles.avatarBox}>
                      <Ionicons name="person" size={20} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.title}>Edit Personal Info</Text>
                      <Text style={styles.subtitle}>Name, Section, Student ID & Bio</Text>
                    </View>
                  </View>
                  <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                {/* Form Inputs ScrollView */}
                <ScrollView
                  style={styles.inputsScrollView}
                  contentContainerStyle={styles.inputsContent}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  <CustomInput
                    label="Full Name"
                    required
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Pam or Brian"
                  />

                  <CustomInput
                    label="Section / Course"
                    value={section}
                    onChangeText={setSection}
                    placeholder="e.g. BSIT 3-A"
                  />

                  <CustomInput
                    label="Student ID"
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="e.g. 2024-00123"
                  />

                  <CustomInput
                    label="About Personal & Goals"
                    value={about}
                    onChangeText={setAbout}
                    multiline
                    numberOfLines={3}
                    placeholder="e.g. Mobile Application Development Major..."
                  />
                </ScrollView>

                {/* FIXED / PINNED Actions Row with Large Save Button */}
                <View style={styles.actionsRow}>
                  <CustomButton
                    title="Cancel"
                    variant="secondary"
                    onPress={onClose}
                    style={{ flex: 1 }}
                  />
                  <CustomButton
                    title="Save Changes"
                    icon="checkmark-circle"
                    variant="primary"
                    loading={saving}
                    onPress={handleSave}
                    style={{ flex: 2 }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardAvoid: {
    width: '100%',
    maxWidth: 440,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    width: '100%',
    maxHeight: '88%',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
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
  inputsScrollView: {
    flexShrink: 1,
    maxHeight: 320,
  },
  inputsContent: {
    paddingVertical: 6,
    paddingBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
});
