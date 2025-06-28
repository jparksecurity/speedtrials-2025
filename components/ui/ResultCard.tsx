import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWaterSafety, SafetyLevel } from '@/hooks/useWaterSafety';

interface PwsResult {
  pwsid: string;
  name: string;
  primacyAgency: string;
}

interface ResultCardProps {
  result: PwsResult;
}

const getSafetyColors = (level: SafetyLevel | undefined, isDark: boolean) => {
  if (!level) return { backgroundColor: isDark ? '#444' : '#E5E5E7', textColor: isDark ? '#FFF' : '#000' };
  
  switch (level) {
    case 'GREEN':
      return { backgroundColor: '#10B981', textColor: 'white' };
    case 'AMBER':
      return { backgroundColor: '#F59E0B', textColor: 'white' };
    case 'RED':
      return { backgroundColor: '#EF4444', textColor: 'white' };
    default:
      return { backgroundColor: isDark ? '#444' : '#E5E5E7', textColor: isDark ? '#FFF' : '#000' };
  }
};

const getSafetyText = (level: SafetyLevel | undefined) => {
  switch (level) {
    case 'GREEN': return 'Safe';
    case 'AMBER': return 'Caution';
    case 'RED': return 'Unsafe';
    default: return 'No Data';
  }
};

export function ResultCard({ result }: ResultCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { safetyLevel, isLoading } = useWaterSafety(result.pwsid);
  
  const safetyColors = getSafetyColors(safetyLevel, isDark);
  const safetyText = getSafetyText(safetyLevel);

  return (
    <ThemedView style={[
      styles.card,
      { 
        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
        borderColor: isDark ? '#444' : '#E5E5E7',
      }
    ]}>
      <ThemedText style={styles.title}>Public Water System Found</ThemedText>
      
      <View style={styles.row}>
        <ThemedText style={styles.label}>PWS ID:</ThemedText>
        <ThemedText style={styles.value}>{result.pwsid}</ThemedText>
      </View>
      
      <View style={styles.row}>
        <ThemedText style={styles.label}>Name:</ThemedText>
        <ThemedText style={styles.value}>{result.name}</ThemedText>
      </View>
      
      <View style={styles.row}>
        <ThemedText style={styles.label}>Primacy Agency:</ThemedText>
        <View style={[
          styles.chip,
          { backgroundColor: isDark ? '#007AFF' : '#007AFF' }
        ]}>
          <ThemedText style={styles.chipText}>{result.primacyAgency}</ThemedText>
        </View>
      </View>
      
      <View style={styles.row}>
        <ThemedText style={styles.label}>Safety Status:</ThemedText>
        <View style={[
          styles.chip,
          { backgroundColor: safetyColors.backgroundColor }
        ]}>
          <ThemedText style={[styles.chipText, { color: safetyColors.textColor }]}>
            {isLoading ? 'Loading...' : safetyText}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 2,
    alignItems: 'flex-end',
  },
  chipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});