import { Stack } from 'expo-router';

export default function FindPwsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Find PWS',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="address"
        options={{
          title: 'Enter Address',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'PWS Result',
          headerShown: true,
        }}
      />
    </Stack>
  );
}