import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Badge, BadgeVariant } from './Badge';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SafetyLevel } from '@/hooks/useWaterSafety';

interface VerdictCardProps {
  safetyLevel: SafetyLevel;
  utilityName: string;
  onPress?: () => void;
}

const safetyConfig = {
  GREEN: {
    variant: 'safe' as BadgeVariant,
    verdict: 'Safe',
    icon: 'check' as keyof typeof Feather.glyphMap,
  },
  AMBER: {
    variant: 'caution' as BadgeVariant,
    verdict: 'Caution',
    icon: 'alert-triangle' as keyof typeof Feather.glyphMap,
  },
  RED: {
    variant: 'danger' as BadgeVariant,
    verdict: 'Do Not Drink',
    icon: 'x' as keyof typeof Feather.glyphMap,
  },
};

export function VerdictCard({ safetyLevel, utilityName, onPress }: VerdictCardProps) {
  const [showBadge, setShowBadge] = React.useState(false);
  const opacity = useSharedValue(0);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, safetyConfig[safetyLevel].variant);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 }, () => {
      runOnJS(setShowBadge)(true);
    });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const config = safetyConfig[safetyLevel];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView style={[styles.card, { backgroundColor }]}>
          <ThemedView style={styles.header}>
            <Feather name={config.icon} size={24} color={iconColor} />
            <Badge text={config.verdict} variant={config.variant} animate={showBadge} />
          </ThemedView>
          
          <ThemedView style={styles.content}>
            <ThemedText style={[styles.utilityName, { color: textColor }]}>
              {utilityName}
            </ThemedText>
            <ThemedText style={[styles.description, { color: textColor }]}>
              {safetyLevel === 'GREEN' && 'No current health-based violations detected.'}
              {safetyLevel === 'AMBER' && 'Some violations found in recent years.'}
              {safetyLevel === 'RED' && 'Current health-based violations detected.'}
            </ThemedText>
          </ThemedView>

          {onPress && (
            <ThemedView style={styles.footer}>
              <ThemedText style={[styles.tapText, { color: textColor }]}>
                Tap for details
              </ThemedText>
              <Feather name="chevron-right" size={16} color={textColor} />
            </ThemedView>
          )}
        </ThemedView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  content: {
    marginBottom: 16,
  },
  utilityName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tapText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
}); 