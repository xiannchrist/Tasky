import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useTasks } from '../context/TaskContext';

interface LmsSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LmsSyncModal: React.FC<LmsSyncModalProps> = ({ visible, onClose }) => {
  const { lmsStatus, isSyncingLms, connectLms, syncLmsNow, disconnectLms } = useTasks();

  const [lmsUrl, setLmsUrl] = useState(lmsStatus.lmsUrl || 'https://lms.school.edu');
  const [lmsUsername, setLmsUsername] = useState(lmsStatus.lmsUsername || '');
  const [lmsPassword, setLmsPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleConnect = async () => {
    if (!lmsUrl.trim()) {
      setErrorMessage('Please enter your School LMS URL.');
      return;
    }
    if (!lmsUsername.trim()) {
      setErrorMessage('Please enter your LMS student username/ID.');
      return;
    }
    if (!lmsPassword) {
      setErrorMessage('Please enter your LMS portal password.');
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      await connectLms({
        lms_url: lmsUrl.trim(),
        lms_username: lmsUsername.trim(),
        lms_password: lmsPassword,
      });
      setSuccessMessage('Successfully connected to School LMS! Tasks are being synchronized.');
      setLmsPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to LMS.');
    }
  };

  const handleSyncNow = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      const res = await syncLmsNow();
      setSuccessMessage(res.message || `LMS sync completed. ${res.new_tasks} new/updated task(s).`);
    } catch (err: any) {
      setErrorMessage(err.message || 'LMS synchronization failed.');
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect LMS',
      'Are you sure you want to disconnect your school LMS account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectLms();
              setSuccessMessage('LMS disconnected.');
            } catch (err: any) {
              setErrorMessage(err.message || 'Failed to disconnect LMS.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Ionicons name="school" size={22} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>School LMS Sync</Text>
                <Text style={styles.subtitle}>Automate assignment & quiz imports</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Status Card */}
            <View
              style={[
                styles.statusCard,
                lmsStatus.connected ? styles.statusCardConnected : styles.statusCardDisconnected,
              ]}
            >
              <View style={styles.statusRow}>
                <View style={styles.statusDotRow}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: lmsStatus.connected
                          ? Colors.success
                          : lmsStatus.status === 'expired'
                          ? Colors.danger
                          : Colors.textMuted,
                      },
                    ]}
                  />
                  <Text style={styles.statusLabel}>
                    Status:{' '}
                    {lmsStatus.connected
                      ? 'Connected'
                      : lmsStatus.status === 'expired'
                      ? 'Session Expired'
                      : 'Disconnected'}
                  </Text>
                </View>
                {lmsStatus.connected && (
                  <TouchableOpacity
                    style={[styles.syncNowBtn, isSyncingLms && styles.btnDisabled]}
                    onPress={handleSyncNow}
                    disabled={isSyncingLms}
                  >
                    {isSyncingLms ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="sync-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.syncNowText}>Sync Now</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {lmsStatus.connected && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Portal: <Text style={styles.metaValue}>{lmsStatus.lmsUrl || 'LMS'}</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Account: <Text style={styles.metaValue}>{lmsStatus.lmsUsername || 'Student'}</Text>
                  </Text>
                  {lmsStatus.lastSync && (
                    <Text style={styles.metaText}>
                      Last Sync: <Text style={styles.metaValue}>{new Date(lmsStatus.lastSync).toLocaleString()}</Text>
                    </Text>
                  )}
                  {lmsStatus.expiresAt && (
                    <Text style={styles.metaText}>
                      Session Expires: <Text style={styles.metaValue}>{new Date(lmsStatus.expiresAt).toLocaleTimeString()}</Text>
                    </Text>
                  )}
                </View>
              )}
              {lmsStatus.status === 'expired' && (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: Colors.danger }]}>
                    Your LMS sync session has timed out. Please enter your password below to reconnect.
                  </Text>
                </View>
              )}
            </View>

            {/* Error / Success Feedback */}
            {errorMessage !== '' && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            {successMessage !== '' && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Connection Form */}
            {!lmsStatus.connected ? (
              <View style={styles.form}>
                <Text style={styles.formSectionTitle}>Connect Your School Portal</Text>
                <Text style={styles.formDesc}>
                  Enter your school portal credentials to automatically download upcoming tasks, deadlines, and quizzes.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>LMS Portal URL</Text>
                  <TextInput
                    style={styles.input}
                    value={lmsUrl}
                    onChangeText={setLmsUrl}
                    placeholder="https://lms.school.edu"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>LMS Username / Student ID</Text>
                  <TextInput
                    style={styles.input}
                    value={lmsUsername}
                    onChangeText={setLmsUsername}
                    placeholder="e.g. 2026-10492"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>LMS Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      value={lmsPassword}
                      onChangeText={setLmsPassword}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.connectBtn, isSyncingLms && styles.btnDisabled]}
                  onPress={handleConnect}
                  disabled={isSyncingLms}
                >
                  {isSyncingLms ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="link-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.connectBtnText}>Connect & Initial Sync</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.connectedActions}>
                <TouchableOpacity
                  style={styles.disconnectBtn}
                  onPress={handleDisconnect}
                  disabled={isSyncingLms}
                >
                  <Ionicons name="unlink-outline" size={18} color={Colors.danger} style={{ marginRight: 6 }} />
                  <Text style={styles.disconnectBtnText}>Disconnect LMS Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    ...Colors.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
  },
  statusCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusCardConnected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusCardDisconnected: {
    backgroundColor: Colors.cardAlt,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metaValue: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  successText: {
    color: '#16A34A',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  form: {
    marginTop: 4,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.appBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.appBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  connectBtn: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    ...Colors.shadow.sm,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  connectedActions: {
    marginTop: 16,
  },
  disconnectBtn: {
    flexDirection: 'row',
    height: 46,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectBtnText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LmsSyncModal;
