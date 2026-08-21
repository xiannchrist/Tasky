import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.floatingContainer}>
      <View style={[styles.pillBar, Colors.shadow.lg]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'HomeTab') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'TasksTab') {
            iconName = isFocused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = isFocused ? 'settings' : 'settings-outline';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {typeof label === 'string' ? label : route.name.replace('Tab', '')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  pillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    maxWidth: 420,
    height: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 24,
    marginHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: '#EFF6FF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
