import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  HomeLayout,
  QrCodeUser,
  QuantitySelector,
  Switch,
  useHomeGameSetup,
  useMockPlayerMe,
} from '@/components/home';
import type {
  GamesPerSetOption,
  MatchGenderOption,
  MatchSetsOption,
} from '@/components/home/types';

const MOCK_QR_SUBJECT = 'mock-user-sub';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data, isLoading } = useMockPlayerMe();
  const {
    matchFlowType: type,
    setMatchFlowType: setType,
    gameFormat: gameType,
    setGameFormat: setGameType,
    matchGender,
    setMatchGender,
    gamesPerSet,
    setGamesPerSet,
    matchSets: setsPerMatch,
    setMatchSets: setSetsPerMatch,
  } = useHomeGameSetup();

  if (isLoading || !data) {
    return (
      <HomeLayout>
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color="#65a30d" />
          <Text className="mt-4 text-stone-900">{t('home.loading')}</Text>
        </View>
      </HomeLayout>
    );
  }

  const firstName = data.name.split(' ')[0] ?? data.name;

  const matchTypes = [
    { label: t('home.newMatch'), value: 'new' },
    { label: t('home.joinMatch'), value: 'join' },
  ];

  const matchGenderTypes = [
    { label: t('game.male'), value: 'male' },
    { label: t('game.female'), value: 'female' },
    { label: t('game.mixed'), value: 'mixed' },
  ];

  const gameTypes = [
    { label: t('game.singles'), value: 'singles' },
    { label: t('game.doubles'), value: 'doubles' },
  ];

  return (
    <HomeLayout>
      <View className="min-h-0 flex-1 flex-col justify-between gap-6 px-4 text-stone-900">
        <View className="flex-1 flex-col items-center gap-6 pt-8">
          <Text className="text-center text-3xl font-semibold text-stone-900 drop-shadow">
            {t('home.greeting', { name: firstName })}
          </Text>
          <Text className="max-w-[240px] text-center text-sm leading-6 text-stone-900 opacity-60">
            {t('home.subtitle')}
          </Text>
          <Switch
            className="w-full"
            options={matchTypes}
            value={type}
            onChange={(value) => setType(value as 'new' | 'join')}
          />
        </View>

        {type === 'new' ? (
          <View className="w-full flex-1 flex-col items-center gap-6">
            <Switch
              label={t('game.title')}
              labelPosition="center"
              options={gameTypes}
              size="small"
              value={gameType}
              variant="secondary"
              onChange={(value) => setGameType(value as 'singles' | 'doubles')}
            />
            <Switch
              label={t('game.matchGender')}
              labelPosition="center"
              options={matchGenderTypes}
              size="small"
              value={matchGender}
              variant="secondary"
              onChange={(value) => setMatchGender(value as MatchGenderOption)}
            />
            <View className="w-full flex-row justify-between">
              <QuantitySelector
                label={t('game.gamesPerSet')}
                labelPosition="center"
                max={6}
                min={2}
                size="small"
                value={gamesPerSet}
                variant="secondary"
                onChange={(value) => setGamesPerSet(value as GamesPerSetOption)}
              />
              <QuantitySelector
                label={t('game.setsPerMatch')}
                labelPosition="center"
                max={3}
                min={1}
                size="small"
                value={setsPerMatch}
                variant="secondary"
                onChange={(value) => setSetsPerMatch(value as MatchSetsOption)}
              />
            </View>
          </View>
        ) : null}

        {type === 'join' ? <QrCodeUser subject={MOCK_QR_SUBJECT} /> : null}
      </View>

      {type === 'new' ? (
        <Link asChild href="/scoreboard">
          <Pressable className="w-full flex-row items-center justify-center border-0 bg-lime-600 py-6 active:bg-lime-800">
            <Text className="text-base font-bold uppercase tracking-wide text-white">
              {t('home.startMatch')}
            </Text>
          </Pressable>
        </Link>
      ) : null}
    </HomeLayout>
  );
}
