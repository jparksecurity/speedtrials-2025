import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type BadgeVariant = 'safe' | 'caution' | 'danger';

interface BadgeProps {
  text: string;
  variant: BadgeVariant;
  animate?: boolean;
}

export function Badge({ text, variant, animate = false }: BadgeProps) {
  const backgroundColor = useThemeColor({}, variant);
  const scale = useSharedValue(animate ? 0 : 1);

  React.useEffect(() => {
    if (animate) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [animate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.badge, { backgroundColor }, animatedStyle]}>
      <ThemedText style={styles.badgeText}>{text}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
}); 