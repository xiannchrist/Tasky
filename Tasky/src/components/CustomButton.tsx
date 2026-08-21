import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}) => {
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return Colors.cardAlt;
    switch (variant) {
      case 'primary':
        return pressed ? Colors.primaryHover : Colors.primary;
      case 'secondary':
        return pressed ? Colors.border : Colors.cardAlt;
      case 'outline':
        return pressed ? Colors.primaryLight : 'transparent';
      case 'danger':
        return pressed ? '#B91C1C' : Colors.danger;
      case 'success':
        return pressed ? '#15803D' : Colors.success;
      default:
        return Colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'success':
        return Colors.textInverse;
      case 'secondary':
        return Colors.textPrimary;
      case 'outline':
        return Colors.primary;
      default:
        return Colors.textInverse;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.border;
    if (variant === 'outline') return Colors.primary;
    return 'transparent';
  };

  const getPaddingVertical = () => {
    switch (size) {
      case 'sm':
        return 8;
      case 'lg':
        return 14;
      case 'md':
      default:
        return 12;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: getPaddingVertical(),
        },
        variant === 'primary' && !disabled && Colors.shadow.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : 18}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
