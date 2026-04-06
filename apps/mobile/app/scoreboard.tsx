import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function ScoreboardScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-center text-lg text-stone-800">{t('scoreboard.comingSoon')}</Text>
    </View>
  );
}
