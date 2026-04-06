import { Feather } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';

interface QuantitySelectorProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
  size?: 'small' | 'normal';
  labelPosition?: 'left' | 'right' | 'center';
  variant?: 'primary' | 'secondary';
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toSafeInt(value: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return clampInt(Math.trunc(n), min, max);
}

export function QuantitySelector({
  min,
  max,
  value,
  onChange,
  className = '',
  label = '',
  size = 'normal',
  labelPosition = 'left',
  variant = 'primary',
}: QuantitySelectorProps) {
  const safeValue = toSafeInt(value, min, max);
  const iconSize = size === 'small' ? 16 : 20;

  return (
    <View
      className={cn(
        'w-fit flex-col gap-3',
        labelPosition === 'left'
          ? 'items-start'
          : labelPosition === 'right'
            ? 'items-end'
            : 'items-center',
        className,
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
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          disabled={safeValue <= min}
          className={cn(
            'rounded-none p-2',
            safeValue <= min ? 'opacity-50' : '',
            variant === 'primary' ? 'bg-lime-600 active:bg-lime-500' : 'bg-stone-600 active:bg-stone-500',
          )}
          onPress={() => onChange(Math.max(min, safeValue - 1))}
        >
          <Feather name="minus" size={iconSize} color="#ffffff" />
        </Pressable>
        <TextInput
          editable
          keyboardType="number-pad"
          maxLength={2}
          value={String(safeValue)}
          className={cn(
            'w-10 border-0 bg-transparent text-center font-semibold outline-none',
            variant === 'primary' ? 'text-lime-600' : 'text-stone-600',
            size === 'small' ? 'text-lg' : 'text-xl',
          )}
          onChangeText={(raw) => {
            if (raw === '') return;
            const parsed = Number.parseInt(raw, 10);
            if (!Number.isFinite(parsed)) return;
            onChange(clampInt(parsed, min, max));
          }}
        />
        <Pressable
          accessibilityRole="button"
          disabled={safeValue >= max}
          className={cn(
            'rounded-none p-2',
            safeValue >= max ? 'opacity-50' : '',
            variant === 'primary' ? 'bg-lime-600 active:bg-lime-500' : 'bg-stone-600 active:bg-stone-500',
          )}
          onPress={() => onChange(Math.min(max, safeValue + 1))}
        >
          <Feather name="plus" size={iconSize} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}
