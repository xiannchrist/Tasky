import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTasks } from '../context/TaskContext';
import { Task, TaskFilter } from '../types/Task';
import { Colors } from '../constants/colors';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_TABS: { key: TaskFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Completed', label: 'Completed' },
  { key: 'High', label: 'High' },
];

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    filteredTasks,
    tasks,
    filter,
    setFilter,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    getSubjectById,
    searchQuery,
    setSearchQuery,
    loading,
    refreshTasks,
    toggleTaskCompletion,
  } = useTasks();

  const activeSubject = getSubjectById(selectedSubjectFilter);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return {
        title: 'No Matching Tasks',
        message: `No tasks found matching "${searchQuery}". Try a different keyword.`,
        actionLabel: 'Clear Search',
        onAction: () => setSearchQuery(''),
      };
    }
    if (filter === 'Pending') {
      return {
        title: 'No Pending Tasks 🎉',
        message: 'Great job! You have cleared all your pending tasks.',
        actionLabel: '+ Add New Task',
        onAction: () => navigation.navigate('AddTask'),
      };
    }
    if (filter === 'Completed') {
      return {
        title: 'No Completed Tasks Yet',
        message: 'Mark tasks as done to see them organized in your completed list.',
        actionLabel: 'View All Tasks',
        onAction: () => setFilter('All'),
      };
    }
    if (filter === 'High') {
      return {
        title: 'No High Priority Tasks',
        message: 'You have no urgent high priority tasks at the moment.',
        actionLabel: '+ Add Task',
        onAction: () => navigation.navigate('AddTask'),
      };
    }
    return {
      title: 'No tasks yet 📋',
      message: 'Create your first task and start managing your deadlines.',
      actionLabel: '+ Add Task',
      onAction: () => navigation.navigate('AddTask'),
    };
  };

  const emptyConfig = getEmptyMessage();

  const renderItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
      onToggleComplete={() => toggleTaskCompletion(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Task List</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTasks.length} of {tasks.length} tasks
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('AddTask')}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons name="add" size={20} color={Colors.textInverse} />
          <Text style={styles.addText}>New Task</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks by title or details..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Balanced Filter Tabs Row */}
      <View style={styles.filterTabsRow}>
        {FILTER_TABS.map((item) => {
          const isActive = filter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active Subject Banner */}
      {activeSubject && (
        <View style={styles.activeSubjectBanner}>
          <View style={styles.activeSubjectLeft}>
            <View style={[styles.activeSubjectDot, { backgroundColor: activeSubject.color }]} />
            <Text style={styles.activeSubjectText}>
              Subject: <Text style={{ fontWeight: '700' }}>{activeSubject.name}</Text>
            </Text>
          </View>
          <Pressable
            onPress={() => setSelectedSubjectFilter(undefined)}
            style={styles.clearSubjectBtn}
          >
            <Ionicons name="close" size={16} color={Colors.textSecondary} />
            <Text style={styles.clearSubjectText}>All Subjects</Text>
          </Pressable>
        </View>
      )}

      {/* Main Task List Rendering */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title={emptyConfig.title}
              message={emptyConfig.message}
              actionLabel={emptyConfig.actionLabel}
              onAction={emptyConfig.onAction}
            />
          ) : null
        }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    ...Colors.shadow.sm,
  },
  addButtonPressed: {
    backgroundColor: Colors.primaryHover,
  },
  addText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 3,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: 8,
    marginRight: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  activeSubjectBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  activeSubjectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeSubjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeSubjectText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  clearSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.card,
    borderRadius: 6,
    gap: 2,
  },
  clearSubjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
});
