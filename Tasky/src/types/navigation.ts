import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Bottom Tab Navigator Parameter List
 */
export type TabParamList = {
  HomeTab: undefined;
  TasksTab: undefined;
  SettingsTab: undefined;
};

/**
 * Auth Stack Navigator Parameter List
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Root Stack Navigator Parameter List
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  AddTask: undefined;
  TaskDetails: { taskId: string };
  EditTask: { taskId: string };
};

// Screen props helpers for Stack screens
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Screen props helpers for Tab screens
export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

// Navigation prop helpers
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<TabParamList>;
