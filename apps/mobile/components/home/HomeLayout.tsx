import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <SafeAreaView
      className="min-h-full flex-1 bg-white"
      edges={['top', 'left', 'right']}
    >
      <View className="mx-auto min-h-full w-full max-w-md flex-1 flex-col">{children}</View>
    </SafeAreaView>
  );
}
