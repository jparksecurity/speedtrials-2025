import React, { useState } from 'react';
import { StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { usePwsLookup } from '@/hooks/usePwsLookup';

export default function FindPwsScreen() {
  const router = useRouter();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | undefined>(undefined);
  
  const { data: pwsResult, isLoading: isPwsLoading, error: pwsError } = usePwsLookup(coordinates);

  const handleUseLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to find your public water system.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };
      setCoordinates(coords);
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleEnterAddress = () => {
    router.push('/find-pws/address' as any);
  };

  React.useEffect(() => {
    if (pwsResult) {
      const resultParam = encodeURIComponent(JSON.stringify(pwsResult));
      router.replace(`/find-pws/result?pws=${resultParam}` as any);
    }
  }, [pwsResult, router]);

  React.useEffect(() => {
    if (pwsError) {
      Alert.alert('Error', pwsError.message);
      setCoordinates(undefined);
    }
  }, [pwsError]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Find Your Public Water System</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose how you&apos;d like to find information about your public water system
        </ThemedText>
        
        <ThemedView style={styles.buttonContainer}>
          <PrimaryButton
            title={isGettingLocation || isPwsLoading ? "Getting Location..." : "Use My Location"}
            onPress={handleUseLocation}
            disabled={isGettingLocation || isPwsLoading}
          />
          
          {(isGettingLocation || isPwsLoading) && (
            <ActivityIndicator style={styles.loader} size="small" />
          )}
          
          <ThemedView style={styles.separator} />
          
          <PrimaryButton
            title="Enter Address"
            onPress={handleEnterAddress}
            disabled={isGettingLocation || isPwsLoading}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  separator: {
    height: 16,
  },
  loader: {
    marginTop: 8,
  },
});