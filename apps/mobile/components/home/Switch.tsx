import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

interface SwitchProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  size?: 'small' | 'normal';
  labelPosition?: 'left' | 'right' | 'center';
  variant?: 'primary' | 'secondary';
}

const PAD = 4;

export function Switch({
  options,
  value,
  onChange,
  className = '',
  label = '',
  size = 'normal',
  labelPosition = 'left',
  variant = 'primary',
}: SwitchProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentCount = Math.max(1, options.length);
  const [trackWidth, setTrackWidth] = useState(0);
  const innerWidth = Math.max(0, trackWidth - PAD * 2);
  const segmentWidth = innerWidth > 0 ? innerWidth / segmentCount : 0;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (segmentWidth <= 0) return;
    Animated.timing(translateX, {
      toValue: activeIndex * segmentWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, segmentWidth, translateX]);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      className={cn(
        'w-full flex-col gap-2',
        labelPosition === 'left'
          ? 'items-start'
          : labelPosition === 'right'
            ? 'items-end'
            : 'items-center',
      )}
    >
      {label ? (
        <Text
          className={cn(
            'font-semibold text-stone-900 opacity-60',
            size === 'small' ? 'text-xs' : 'text-sm',
          )}
        >
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'relative min-w-0 flex-row rounded-none p-1 shadow-inner',
          variant === 'primary' ? 'bg-lime-100' : 'bg-stone-100',
          className,
        )}
        onLayout={onTrackLayout}
      >
        <Animated.View
          pointerEvents="none"
          className={cn(
            'absolute bottom-1 left-1 top-1 z-0 rounded-none',
            variant === 'primary' ? 'bg-lime-600' : 'bg-stone-600',
          )}
          style={{
            width: segmentWidth > 0 ? segmentWidth : 0,
            transform: [{ translateX }],
          }}
        />
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value }}
            className="relative z-10 min-w-0 flex-1 basis-0 items-center justify-center rounded-none px-4 py-3"
            onPress={() => onChange(option.value)}
          >
            <Text
              className={cn(
                'font-medium',
                size === 'small' ? 'text-xs' : 'text-sm',
                value === option.value
                  ? 'text-white'
                  : variant === 'primary'
                    ? 'text-lime-600'
                    : 'text-stone-600',
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
