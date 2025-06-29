import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import * as Location from 'expo-location';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AddressInput } from '@/components/ui/AddressInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FormData {
  address: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isLocationLoading, setIsLocationLoading] = React.useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      address: '',
    },
  });

  const handleAddressSubmit = (data: FormData) => {
         if (data.address.trim()) {
       router.push({
         pathname: '/result' as any,
         params: { address: data.address.trim() },
       });
     }
  };

  const handleUseLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to find your water utility.',
          [{ text: 'OK' }]
        );
        return;
      }

             const location = await Location.getCurrentPositionAsync({});
       router.push({
         pathname: '/result' as any,
         params: { 
           lat: location.coords.latitude.toString(),
           lon: location.coords.longitude.toString(),
         },
       });
    } catch {
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please enter your address manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLocationLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Check Water
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor }]}>
            Enter your address to check your tap water safety
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.form}>
          <AddressInput
            control={control}
            name="address"
            placeholder="Enter your address"
            error={errors.address?.message}
          />
          
          <ThemedView style={styles.buttonContainer}>
            <PrimaryButton
              title="Search"
              onPress={handleSubmit(handleAddressSubmit)}
            />
          </ThemedView>

          <ThemedView style={styles.divider}>
            <ThemedView style={[styles.dividerLine, { backgroundColor: textColor }]} />
            <ThemedText style={[styles.dividerText, { color: textColor }]}>or</ThemedText>
            <ThemedView style={[styles.dividerLine, { backgroundColor: textColor }]} />
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <PrimaryButton
              title={isLocationLoading ? "Getting Location..." : "Use My Location"}
              onPress={handleUseLocation}
              disabled={isLocationLoading}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    display: 'none',
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 16,
    opacity: 0.6,
  },
});
