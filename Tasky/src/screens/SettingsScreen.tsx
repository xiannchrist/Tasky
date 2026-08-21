import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';
import { EditProfileModal } from '../components/EditProfileModal';
import { LmsSyncModal } from '../components/LmsSyncModal';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    profile,
    updateSettings,
    resetToSampleTasks,
    clearAllTasks,
    lmsStatus,
    syncLmsNow,
    isSyncingLms,
  } = useTasks();

  const { user, logout } = useAuth();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [lmsModalVisible, setLmsModalVisible] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    await updateSettings({ notificationsEnabled: value });
    if (value) {
      Alert.alert(
        'Notifications Enabled 🔔',
        'Tasky will schedule reminders 1 day before your upcoming task deadlines.'
      );
    } else {
      Alert.alert(
        'Notifications Disabled 🔕',
        'Deadline reminders have been paused.'
      );
    }
  };

  const handleManualLmsSync = async () => {
    if (!lmsStatus.connected) {
      setLmsModalVisible(true);
      return;
    }
    try {
      const res = await syncLmsNow();
      Alert.alert(
        'LMS Sync Complete',
        res.message || `Synchronized successfully. ${res.new_tasks} new/updated task(s).`
      );
    } catch (err: any) {
      Alert.alert('Sync Failed', err.message || 'Unable to sync with school LMS.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const handleResetSampleData = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Reset task list to default academic sample tasks?') : true;
      if (confirmed) resetToSampleTasks();
      return;
    }
    Alert.alert(
      'Reset Sample Tasks?',
      'This will reset your task list back to default academic demonstration tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'default',
          onPress: async () => {
            await resetToSampleTasks();
            Alert.alert('Sample Data Restored', 'Default academic tasks are now loaded.');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Delete all stored tasks from device?') : true;
      if (confirmed) clearAllTasks();
      return;
    }
    Alert.alert(
      'Clear All Tasks?',
      'Are you sure you want to delete all tasks? This action cannot be reversed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllTasks();
            Alert.alert('All Tasks Cleared', 'Your task list is now empty.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Preferences, LMS sync, and account</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Profile Card with Pop-out Mascot (Transparent, No Blue Box) */}
        <Pressable
          onPress={() => setProfileModalVisible(true)}
          style={({ pressed }) => [
            styles.profileCard,
            Colors.shadow.sm,
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.profileAvatarBox}>
            <Image
              source={require('../../assets/images/TaskyFinal.png')}
              style={styles.profileAvatarImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileTextContainer}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName}>{user?.name || profile.name || 'Student'}</Text>
              <View style={styles.editPill}>
                <Ionicons name="pencil" size={12} color={Colors.primary} />
                <Text style={styles.editPillText}>Edit</Text>
              </View>
            </View>
            <Text style={styles.profileStatus}>
              {user?.email || profile.email || 'student@school.edu'}
            </Text>
            <Text style={styles.profileMeta}>
              {profile.section ? `${profile.section} • ` : ''}ID: {profile.studentId || 'N/A'}
            </Text>
            {profile.about ? (
              <Text style={styles.profileAbout} numberOfLines={2}>
                "{profile.about}"
              </Text>
            ) : null}
          </View>
        </Pressable>

        {/* School LMS Synchronization Section */}
        <Text style={styles.sectionHeading}>School LMS Synchronization</Text>
        <View style={[styles.settingsCard, Colors.shadow.sm]}>
          <Pressable
            onPress={() => setLmsModalVisible(true)}
            style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="school-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <View style={styles.lmsTitleRow}>
                <Text style={styles.settingTitle}>LMS Connection</Text>
                <View
                  style={[
                    styles.badge,
                    lmsStatus.connected ? styles.badgeSuccess : styles.badgeMuted,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      lmsStatus.connected ? styles.badgeTextSuccess : styles.badgeTextMuted,
                    ]}
                  >
                    {lmsStatus.connected ? 'Connected' : 'Disconnected'}
                  </Text>
                </View>
              </View>
              <Text style={styles.settingSubtitle}>
                {lmsStatus.connected
                  ? `${lmsStatus.lmsUsername || 'Linked'} • Tap to manage or sync`
                  : 'Connect your student portal to auto-import tasks'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>

          {lmsStatus.connected && (
            <>
              <View style={styles.divider} />
              <Pressable
                onPress={handleManualLmsSync}
                disabled={isSyncingLms}
                style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                  {isSyncingLms ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <Ionicons name="sync-outline" size={20} color="#16A34A" />
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Trigger Immediate LMS Sync</Text>
                  <Text style={styles.settingSubtitle}>
                    {lmsStatus.lastSync
                      ? `Last synced: ${new Date(lmsStatus.lastSync).toLocaleTimeString()}`
                      : 'Fetch newest assignments & quizzes'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </Pressable>
            </>
          )}
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeading}>Notification Preferences</Text>
        <View style={[styles.settingsCard, Colors.shadow.sm]}>
          <View style={styles.settingRow}>
            <View style={styles.iconBox}>
              <Ionicons
                name={settings.notificationsEnabled ? 'notifications' : 'notifications-off'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Deadline Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Receive reminder 1 day before deadlines
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.card}
            />
          </View>
        </View>

        {/* Account & Session Section (Always Accessible) */}
        <Text style={styles.sectionHeading}>Account</Text>
        <View style={[styles.settingsCard, Colors.shadow.sm]}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
          >
            <View style={[styles.iconBox, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: Colors.danger }]}>
                Log Out
              </Text>
              <Text style={styles.settingSubtitle}>
                {user?.email ? `Signed in as ${user.email}` : 'Sign out of current student account'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Demo / Data Management Section */}
        <Text style={styles.sectionHeading}>Demonstration & Data</Text>
        <View style={[styles.settingsCard, Colors.shadow.sm]}>
          {/* Reset Sample Tasks */}
          <Pressable
            onPress={handleResetSampleData}
            style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
          >
            <View style={styles.iconBox}>
              <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Reset Sample Data</Text>
              <Text style={styles.settingSubtitle}>
                Reload default student course tasks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Clear All Tasks */}
          <Pressable
            onPress={handleClearAllData}
            style={({ pressed }) => [styles.actionRow, pressed && styles.rowPressed]}
          >
            <View style={[styles.iconBox, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: Colors.danger }]}>
                Clear All Tasks
              </Text>
              <Text style={styles.settingSubtitle}>
                Delete all stored tasks from device
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* About App Section */}
        <Text style={styles.sectionHeading}>About Application</Text>
        <View style={[styles.settingsCard, Colors.shadow.sm]}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>Tasky</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Backend</Text>
            <Text style={styles.aboutValue}>FastAPI & PostgreSQL</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>LMS Sync Engine</Text>
            <Text style={styles.aboutValue}>Scheduled Background Worker</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Notifications</Text>
            <Text style={styles.aboutValue}>Expo / FCM Push Service</Text>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Tasky — Academic Task Management & LMS Synchronization Platform
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* LMS Sync Modal */}
      <LmsSyncModal
        visible={lmsModalVisible}
        onClose={() => setLmsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'visible',
  },
  profileAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.85 }],
  },
  profileTextContainer: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileStatus: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  profileMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  profileAbout: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowPressed: {
    backgroundColor: Colors.cardHover,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  lmsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeMuted: {
    backgroundColor: Colors.cardAlt,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: '#16A34A',
  },
  badgeTextMuted: {
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 62,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  footerNote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
});

export default SettingsScreen;
