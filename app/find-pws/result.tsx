import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ResultCard } from '@/components/ui/ResultCard';

interface PwsResult {
  pwsid: string;
  name: string;
  primacyAgency: string;
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let pwsResult: PwsResult | null = null;
  
  try {
    if (params.pws && typeof params.pws === 'string') {
      pwsResult = JSON.parse(decodeURIComponent(params.pws));
    }
  } catch (error) {
    console.error('Error parsing PWS result:', error);
  }

  const handleSearchAgain = () => {
    router.replace('/find-pws' as any);
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  if (!pwsResult) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>No Results Found</ThemedText>
          <ThemedText style={styles.subtitle}>
            Unable to find PWS information. Please try again.
          </ThemedText>
          
          <ThemedView style={styles.buttonContainer}>
            <PrimaryButton
              title="Search Again"
              onPress={handleSearchAgain}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Your Public Water System</ThemedText>
        
        <ResultCard result={pwsResult} />
        
        <ThemedView style={styles.buttonContainer}>
          <PrimaryButton
            title="Search Again"
            onPress={handleSearchAgain}
          />
          
          <ThemedView style={styles.separator} />
          
          <PrimaryButton
            title="Go Home"
            onPress={handleGoHome}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  separator: {
    height: 16,
  },
});