import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  required = false,
  helperText,
  containerStyle,
  style,
  multiline,
  numberOfLines,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredMark}> *</Text>}
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          multiline && {
            minHeight: numberOfLines ? numberOfLines * 22 : 90,
            textAlignVertical: 'top',
            paddingTop: 10,
          },
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...rest}
      />

      {/* Error / Helper */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  requiredMark: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputFocused: {
    borderColor: Colors.borderFocus,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 2,
  },
});
