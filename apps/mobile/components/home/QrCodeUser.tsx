import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QrCodeUserProps {
  subject: string;
}

export function QrCodeUser({ subject }: QrCodeUserProps) {
  const { t } = useTranslation();

  return (
    <View className="w-full flex-1 flex-col items-center gap-6">
      <QRCode color="#272524" size={250} value={subject} />
      <Text className="max-w-[240px] text-center text-sm leading-6 text-stone-900 opacity-60">
        {t('home.qrcodeUsage')}
      </Text>
    </View>
  );
}
