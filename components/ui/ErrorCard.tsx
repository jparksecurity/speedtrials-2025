import React from 'react';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ title = 'Error', message, onRetry }: ErrorCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const dangerColor = useThemeColor({}, 'danger');

  return (
    <ThemedView style={[styles.card, { backgroundColor }]}>
      <Feather name="alert-circle" size={24} color={dangerColor} style={styles.icon} />
      <ThemedView style={styles.content}>
        <ThemedText style={[styles.title, { color: textColor }]}>{title}</ThemedText>
        <ThemedText style={[styles.message, { color: textColor }]}>{message}</ThemedText>
        {onRetry && (
          <ThemedText style={[styles.retryText, { color: dangerColor }]} onPress={onRetry}>
            Tap to retry
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    marginVertical: 8,
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
}); 