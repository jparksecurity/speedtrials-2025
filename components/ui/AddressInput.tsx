import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { Controller, Control } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AddressInputProps {
  control: Control<any>;
  name: string;
  placeholder?: string;
  error?: string;
}

export function AddressInput({ 
  control, 
  name, 
  placeholder = "Enter your address",
  error 
}: AddressInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={{ required: 'Address is required', minLength: { value: 5, message: 'Address must be at least 5 characters' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              { 
                borderColor: error ? '#FF3B30' : isDark ? '#444' : '#E5E5E7',
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                color: isDark ? '#FFFFFF' : '#000000',
              }
            ]}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#999' : '#666'}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="words"
            autoCorrect={false}
            multiline
            numberOfLines={2}
          />
        )}
      />
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
});