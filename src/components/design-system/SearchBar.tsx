/**
 * Design System — SearchBar component.
 */
import React, { memo, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
  testID?: string;
}

function SearchBarBase({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
  autoFocus = false,
  testID,
}: SearchBarProps): React.JSX.Element {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.borderRadius.round,
          borderColor: theme.colors.border,
          borderWidth: 1,
        },
        style,
      ]}
      accessibilityRole="search"
    >
      <Typography variant="body" color={theme.colors.textTertiary} style={styles.icon}>
        🔍
      </Typography>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={[
          styles.input,
          {
            color: theme.colors.textPrimary,
            fontSize: theme.fontSize.base,
          },
        ]}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel={placeholder}
        accessibilityRole="search"
        testID={testID}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Typography variant="body" color={theme.colors.textTertiary}>✕</Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
});

export const SearchBar = memo(SearchBarBase);
