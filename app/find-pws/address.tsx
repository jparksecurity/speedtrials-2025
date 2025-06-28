import React from 'react';
import { StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AddressInput } from '@/components/ui/AddressInput';
import { useGeocode } from '@/hooks/useGeocode';
import { usePwsLookup } from '@/hooks/usePwsLookup';
import { queryClient } from '@/hooks/queryClient';

interface AddressForm {
  address: string;
}

export default function AddressScreen() {
  const router = useRouter();
  const { control, handleSubmit, watch, formState: { errors } } = useForm<AddressForm>();
  const address = watch('address');
  
  const { data: coordinates, isLoading: isGeocoding, error: geocodeError } = useGeocode(address?.length > 5 ? address : undefined);
  const { data: pwsResult, isLoading: isPwsLoading, error: pwsError } = usePwsLookup(coordinates);

  const onSubmit = async (data: AddressForm) => {
    try {
      const coords = await queryClient.fetchQuery({
        queryKey: ['geocode', data.address],
        queryFn: async () => {
          const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(
            data.address
          )}&benchmark=Public_AR_Current&format=json`;
          const res = await fetch(url);
          const geocodeData = await res.json();
          const match = geocodeData.result.addressMatches?.[0]?.coordinates;
          if (!match) throw new Error('Address not found');
          return { lon: match.x, lat: match.y };
        },
      });

      const pws = await queryClient.fetchQuery({
        queryKey: ['pws-lookup', coords],
        queryFn: async () => {
          const { lat, lon } = coords;
          const params = new URLSearchParams({
            where: '1=1',
            geometry: `${lon},${lat}`,
            geometryType: 'esriGeometryPoint',
            inSR: '4326',
            spatialRel: 'esriSpatialRelIntersects',
            outFields: 'PWSID,PWS_Name,Primacy_Agency',
            returnGeometry: 'false',
            f: 'json',
          });
          
          const url = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Water_System_Boundaries/FeatureServer/0/query?${params}`;
          const res = await fetch(url);
          const pwsData = await res.json();
          
          if (!pwsData.features || pwsData.features.length === 0) {
            throw new Error('No PWS boundary found for this location');
          }
          
          const feature = pwsData.features[0];
          return {
            pwsid: feature.attributes.PWSID,
            name: feature.attributes.PWS_Name,
            primacyAgency: feature.attributes.Primacy_Agency,
          };
        },
      });

      const resultParam = encodeURIComponent(JSON.stringify(pws));
      router.replace(`/find-pws/result?pws=${resultParam}` as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to find PWS for this address');
    }
  };

  React.useEffect(() => {
    if (geocodeError) {
      Alert.alert('Geocoding Error', geocodeError.message);
    }
  }, [geocodeError]);

  React.useEffect(() => {
    if (pwsError) {
      Alert.alert('PWS Lookup Error', pwsError.message);
    }
  }, [pwsError]);

  const isLoading = isGeocoding || isPwsLoading;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Enter Your Address</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter your full address to find your public water system
        </ThemedText>
        
        <ThemedView style={styles.form}>
          <AddressInput
            control={control}
            name="address"
            placeholder="123 Main St, City, State ZIP"
            error={errors.address?.message}
          />
          
          <PrimaryButton
            title={isLoading ? "Searching..." : "Find My PWS"}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !address || address.length < 5}
          />
          
          {isLoading && (
            <ActivityIndicator style={styles.loader} size="small" />
          )}
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  loader: {
    marginTop: 16,
  },
});