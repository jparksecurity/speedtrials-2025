import React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { VerdictCard } from '@/components/ui/VerdictCard';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { DetailBottomSheet } from '@/components/ui/DetailBottomSheet';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGeocode } from '@/hooks/useGeocode';
import { usePwsLookup } from '@/hooks/usePwsLookup';
import { useWaterSafety } from '@/hooks/useWaterSafety';

export default function ResultScreen() {
  const navigation = useNavigation();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  
  const params = useLocalSearchParams<{
    address?: string;
    lat?: string;
    lon?: string;
  }>();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Determine coordinates from params
  const coordinates = React.useMemo(() => {
    if (params.lat && params.lon) {
      return {
        lat: parseFloat(params.lat),
        lon: parseFloat(params.lon),
      };
    }
    return undefined;
  }, [params.lat, params.lon]);

  // Use geocoding if we have an address but no coordinates
  const geocodeQuery = useGeocode(coordinates ? undefined : params.address);
  
  // Use the coordinates from either direct params or geocoding
  const finalCoords = coordinates || geocodeQuery.data;
  
  // Lookup PWS using coordinates
  const pwsQuery = usePwsLookup(finalCoords);
  
  // Get water safety information
  const safetyQuery = useWaterSafety(pwsQuery.data?.pwsid || '');

  // Set navigation title when PWS data is available
  React.useEffect(() => {
    if (pwsQuery.data?.name) {
      navigation.setOptions({
        title: pwsQuery.data.name,
      });
    }
  }, [navigation, pwsQuery.data?.name]);

  const handleCardPress = () => {
    if (pwsQuery.data && safetyQuery.safetyLevel) {
      bottomSheetModalRef.current?.present();
    }
  };

  const isLoading = geocodeQuery.isLoading || pwsQuery.isLoading || safetyQuery.isLoading;
  const error = geocodeQuery.error || pwsQuery.error || safetyQuery.error;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColor} />
            <ThemedText style={[styles.loadingText, { color: textColor }]}>
              Checking water quality...
            </ThemedText>
          </ThemedView>
        )}

        {error && (
          <ErrorCard
            title="Unable to get water information"
            message={error.message}
                         onRetry={() => {
               if (geocodeQuery.refetch) geocodeQuery.refetch();
               if (pwsQuery.refetch) pwsQuery.refetch();
               // safetyQuery doesn't have refetch, it will auto-refetch when pwsQuery succeeds
             }}
          />
        )}

        {pwsQuery.data && safetyQuery.safetyLevel && (
          <ThemedView style={styles.resultContainer}>
            <VerdictCard
              safetyLevel={safetyQuery.safetyLevel}
              utilityName={pwsQuery.data.name}
              onPress={handleCardPress}
            />
            
            <ThemedView style={styles.infoContainer}>
              <ThemedText style={[styles.infoTitle, { color: textColor }]}>
                Water System Information
              </ThemedText>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textColor }]}>
                  System ID:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: textColor }]}>
                  {pwsQuery.data.pwsid}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textColor }]}>
                  Regulatory Agency:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: textColor }]}>
                  {pwsQuery.data.primacyAgency}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </ScrollView>

      {/* Bottom Sheet Modal */}
      {pwsQuery.data && safetyQuery.safetyLevel && (
        <DetailBottomSheet
          ref={bottomSheetModalRef}
          pwsid={pwsQuery.data.pwsid}
          utilityName={pwsQuery.data.name}
          safetyLevel={safetyQuery.safetyLevel}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
}); 