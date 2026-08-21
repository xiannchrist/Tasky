import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks } from '../context/TaskContext';
import { Colors } from '../constants/colors';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { NotificationsModal } from '../components/NotificationsModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { AddSubjectModal } from '../components/AddSubjectModal';
import { getTimeBasedGreeting, getTodayFormattedHeader } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    tasks,
    subjects,
    profile,
    statistics,
    loading,
    refreshTasks,
    toggleTaskCompletion,
    setFilter,
    setSelectedSubjectFilter,
    settings,
  } = useTasks();

  const [refreshing, setRefreshing] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [addSubjectModalVisible, setAddSubjectModalVisible] = useState(false);

  const { greeting } = getTimeBasedGreeting();
  const dateHeader = getTodayFormattedHeader();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  // Sort upcoming pending tasks by deadline
  const upcomingTasks = tasks
    .filter(t => t.status === 'Pending')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  // Dynamic advice message from Tasky based on current tasks
  const getTaskyDialogue = () => {
    if (tasks.length === 0) {
      return "You don't have any tasks yet! Tap '+ New Task' to schedule your first deadline.";
    }
    if (statistics.dueSoon > 0) {
      const firstDue = upcomingTasks[0]?.title || 'your upcoming work';
      const subj = upcomingTasks[0]?.subjectName ? ` for ${upcomingTasks[0].subjectName}` : '';
      return `You have ${statistics.dueSoon} ${statistics.dueSoon === 1 ? 'task' : 'tasks'} due soon. Keep "${firstDue}"${subj} on track!`;
    }
    if (statistics.pending === 0 && statistics.completed > 0) {
      return `Awesome job ${profile.name || 'Student'}! All ${statistics.completed} tasks are completed. You're fully caught up for today! 🎉`;
    }
    const percentPending = Math.round((statistics.pending / tasks.length) * 100);
    return `Pending tasks make up ${percentPending}% of your workload. Stay organized and conquer them step by step!`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Tasky workspace...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Top App Header Bar */}
        <View style={styles.topBar}>
          {/* Logo image replacing checkmark */}
          <View style={styles.appBrand}>
            <Image
              source={require('../../assets/images/logo.jpg')}
              style={styles.appLogoImg}
              resizeMode="cover"
            />
            <Text style={styles.appName}>Tasky</Text>
          </View>

          {/* Action Circle Buttons */}
          <View style={styles.topActionsRow}>
            {/* Notification Bell with Modal */}
            <Pressable
              onPress={() => setNotifModalVisible(true)}
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.circleBtnPressed,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={settings.notificationsEnabled ? Colors.primary : Colors.textMuted}
              />
              {statistics.dueSoon > 0 && <View style={styles.activeDot} />}
            </Pressable>

            {/* Profile Edit Button */}
            <Pressable
              onPress={() => setProfileModalVisible(true)}
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.circleBtnPressed,
              ]}
            >
              <Ionicons name="person-outline" size={19} color={Colors.primary} />
            </Pressable>

            {/* Settings Gear Button */}
            <Pressable
              onPress={() => {
                (navigation as any).navigate('MainTabs', { screen: 'SettingsTab' });
              }}
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.circleBtnPressed,
              ]}
            >
              <Ionicons name="settings-outline" size={19} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Date & Greeting Header */}
        <View style={styles.greetingSection}>
          <Text style={styles.dateSubtitle}>{dateHeader}</Text>
          <Text style={styles.greetingTitle}>
            {greeting},{' '}
            <Text style={styles.greetingName}>
              {profile.name || 'Student'}!
            </Text>
          </Text>
          {profile.section ? (
            <Text style={styles.sectionBadgeText}>{profile.section}</Text>
          ) : null}
        </View>

        {/* Mascot Card with Big Balanced Tasky Mascot & Speech Bubble */}
        <View style={[styles.mascotCard, Colors.shadow.sm]}>
          <View style={styles.mascotBigContainer}>
            <Image
              source={require('../../assets/images/TaskyFinal.png')}
              style={styles.mascotBigImage}
              resizeMode="contain"
            />
          </View>

          {/* Speech Bubble */}
          <View style={styles.speechBubble}>
            <View style={styles.speechTail} />
            <Text style={styles.speechSpeaker}>Tasky</Text>
            <Text style={styles.speechContent}>{getTaskyDialogue()}</Text>
          </View>
        </View>

        {/* Overview Header with "+ New Task" Button */}
        <View style={styles.overviewHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>Swipe cards horizontally</Text>
          </View>

          {/* New Task Button placed alongside Overview */}
          <Pressable
            onPress={() => navigation.navigate('AddTask')}
            style={({ pressed }) => [
              styles.primaryNewTaskBtn,
              pressed && styles.primaryNewTaskBtnPressed,
            ]}
          >
            <Ionicons name="add" size={18} color={Colors.textInverse} />
            <Text style={styles.primaryNewTaskText}> New Task</Text>
          </Pressable>
        </View>

        {/* Compact Swipeable Overview Stat Cards (Side Swipe Carousel) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swipeableOverviewScroll}
          decelerationRate="fast"
          snapToInterval={148}
        >
          <View style={styles.statCardWrapper}>
            <StatCard
              title="Total Tasks"
              count={statistics.total}
              icon="layers-outline"
              color={Colors.primary}
              bgColor={Colors.primaryLight}
              onPress={() => {
                setFilter('All');
                setSelectedSubjectFilter(undefined);
                (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
              }}
            />
          </View>

          <View style={styles.statCardWrapper}>
            <StatCard
              title="Due Soon"
              count={statistics.dueSoon}
              icon="alert-circle-outline"
              color={Colors.danger}
              bgColor={Colors.dangerLight}
              onPress={() => {
                setFilter('Pending');
                (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
              }}
            />
          </View>

          <View style={styles.statCardWrapper}>
            <StatCard
              title="Pending"
              count={statistics.pending}
              icon="hourglass-outline"
              color={Colors.priority.Medium.badge}
              bgColor={Colors.priority.Medium.bg}
              onPress={() => {
                setFilter('Pending');
                (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
              }}
            />
          </View>

          <View style={styles.statCardWrapper}>
            <StatCard
              title="Completed"
              count={statistics.completed}
              icon="checkmark-circle-outline"
              color={Colors.success}
              bgColor="#DCFCE7"
              onPress={() => {
                setFilter('Completed');
                (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
              }}
            />
          </View>
        </ScrollView>

        {/* Course Subjects Section */}
        <View style={styles.subjectsHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Course Subjects</Text>
            <Text style={styles.sectionSubtitle}>Select subject to filter tasks</Text>
          </View>
          <Pressable
            onPress={() => setAddSubjectModalVisible(true)}
            style={styles.addSubjectHeaderBtn}
          >
            <Ionicons name="add-circle" size={16} color={Colors.primary} />
            <Text style={styles.addSubjectHeaderText}>Add Subject</Text>
          </Pressable>
        </View>

        {/* Subject Cards with Full Color Backgrounds & High Contrast Readable Text */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectsScroll}
        >
          {subjects.map((subj) => {
            const subjectTaskCount = tasks.filter(t => t.subjectId === subj.id && t.status === 'Pending').length;
            return (
              <Pressable
                key={subj.id}
                onPress={() => {
                  setSelectedSubjectFilter(subj.id);
                  (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
                }}
                style={({ pressed }) => [
                  styles.subjectCardFullColor,
                  { backgroundColor: subj.color },
                  Colors.shadow.md,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={styles.subjectCardTop}>
                  <View style={styles.subjectCodeBadgeWhite}>
                    <Text style={styles.subjectCodeTextWhite}>{subj.code}</Text>
                  </View>
                  <Ionicons name="book" size={18} color="#FFFFFF" />
                </View>

                <View style={styles.subjectCardBottom}>
                  <Text style={styles.subjectCardNameWhite} numberOfLines={2}>
                    {subj.name}
                  </Text>
                  <View style={styles.subjectTaskCountRow}>
                    <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.subjectCardTaskCountWhite}>
                      {subjectTaskCount} {subjectTaskCount === 1 ? 'task' : 'tasks'} pending
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {/* "+ Add Subject" Card */}
          <Pressable
            onPress={() => setAddSubjectModalVisible(true)}
            style={({ pressed }) => [
              styles.addSubjectCard,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.addSubjectIconCircle}>
              <Ionicons name="add" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.addSubjectCardTitle}>+ Add Subject</Text>
            <Text style={styles.addSubjectCardSub}>Create new course</Text>
          </Pressable>
        </ScrollView>

        {/* Upcoming Deadlines Section */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Pressable
              onPress={() => {
                setSelectedSubjectFilter(undefined);
                (navigation as any).navigate('MainTabs', { screen: 'TasksTab' });
              }}
            >
              <Text style={styles.viewAllText}>View All ({tasks.length})</Text>
            </Pressable>
          </View>

          {upcomingTasks.length === 0 ? (
            <View style={styles.emptyUpcomingCard}>
              <Ionicons name="sparkles-outline" size={28} color={Colors.primary} />
              <Text style={styles.emptyUpcomingTitle}>All Caught Up!</Text>
              <Text style={styles.emptyUpcomingSubtitle}>
                You have no pending deadlines right now. Enjoy your day!
              </Text>
              <Pressable
                onPress={() => navigation.navigate('AddTask')}
                style={styles.emptyAddBtn}
              >
                <Text style={styles.emptyAddBtnText}>+ Create Task</Text>
              </Pressable>
            </View>
          ) : (
            upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                onToggleComplete={() => toggleTaskCompletion(task.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Add Subject Modal */}
      <AddSubjectModal
        visible={addSubjectModalVisible}
        onClose={() => setAddSubjectModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  appBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLogoImg: {
    width: 36,
    height: 36,
    borderRadius: 9,
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.iconBtnBg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBtnPressed: {
    backgroundColor: Colors.iconBtnPressed,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    position: 'absolute',
    top: 7,
    right: 7,
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
  },
  dateSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  greetingTitle: {
    fontSize: 23,
    fontWeight: '500',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  greetingName: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  mascotCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotBigContainer: {
    width: 120,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  mascotBigImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.8 }, { translateX: 2 }],
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginLeft: -4,
    marginRight: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  speechTail: {
    position: 'absolute',
    left: -7,
    top: 32,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderTopColor: 'transparent',
    borderBottomWidth: 7,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#BFDBFE',
  },
  speechSpeaker: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 3,
  },
  speechContent: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  overviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  primaryNewTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    ...Colors.shadow.sm,
  },
  primaryNewTaskBtnPressed: {
    backgroundColor: Colors.primaryHover,
  },
  primaryNewTaskText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverse,
    marginLeft: 4,
  },
  swipeableOverviewScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  statCardWrapper: {
    width: 140,
  },
  subjectsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  addSubjectHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSubjectHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  subjectsScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
  },
  subjectCardFullColor: {
    borderRadius: 16,
    padding: 14,
    width: 155,
    minHeight: 125,
    justifyContent: 'space-between',
  },
  subjectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectCodeBadgeWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectCodeTextWhite: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subjectCardBottom: {
    marginTop: 8,
  },
  subjectCardNameWhite: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  subjectTaskCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 3,
  },
  subjectCardTaskCountWhite: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '600',
  },
  addSubjectCard: {
    backgroundColor: Colors.cardAlt,
    borderRadius: 16,
    padding: 12,
    width: 135,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 125,
  },
  addSubjectIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addSubjectCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  addSubjectCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upcomingSection: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyUpcomingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  emptyUpcomingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptyUpcomingSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
