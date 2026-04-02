import { useAuth } from "../../hooks/useAuth";
import { usePlayerMe } from "../../service/players/queries/use-player-me";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Layout, QuantitySelector, Switch } from "../../components";
import type { GamesPerSetOption, MatchGenderOption, MatchSetsOption } from "./types";
import { useHomeGameSetup } from "./useHomeGameSetup";

export function HomePage() {
  const { token } = useAuth();
  const { data, isLoading } = usePlayerMe();
  const router = useRouter();
  const { t } = useTranslation();
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

  if (!token || isLoading) {
    return <div>{t("home.loading")}</div>;
  }

  if (!data) {
    router.navigate({ to: "/onboarding" });
  }

  const matchTypes = [
    {
      label: t("home.newMatch"),
      value: "new",
    },
    {
      label: t("home.joinMatch"),
      value: "join",
    },
  ];

  const matchGenderTypes = [
    {
      label: t("game.male"),
      value: "male",
    },
    {
      label: t("game.female"),
      value: "female",
    },
    {
      label: t("game.mixed"),
      value: "mixed",
    },
  ];

  const gameTypes = [
    {
      label: t("game.singles"),
      value: "singles",
    },
    {
      label: t("game.doubles"),
      value: "doubles",
    },
  ];

  return (
    <Layout showNavbar={false} className="" noPadding={true}>
      <div className="flex flex-col justify-between items-center flex-1 min-h-0 gap-6 px-4">
        <div className="flex flex-col items-center flex-1 pt-8 gap-6">
          <h1 className="text-3xl font-semibold text-center text-foreground drop-shadow">
            {t("home.greeting", { name: data?.name.split(" ")[0] })}
          </h1>
          <p className="text-sm text-center text-foreground opacity-60 max-w-[240px] leading-6">
            {t("home.subtitle")}
          </p>
          <Switch
            options={matchTypes}
            value={type}
            onChange={(value) => setType(value as "new" | "join")}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-6 items-center flex-1 w-full">
          <Switch
            options={gameTypes}
            value={gameType}
            onChange={(value) => setGameType(value as "singles" | "doubles")}
            size="small"
            label={t("game.title")}
            labelPosition="center"
            variant="secondary"
          />
          <Switch
            options={matchGenderTypes}
            value={matchGender}
            onChange={(value) =>
              setMatchGender(value as MatchGenderOption)
            }
            size="small"
            label={t("game.matchGender")}
            labelPosition="center"
            variant="secondary"
          />
          <div className="flex justify-between w-full">

          <QuantitySelector
            min={2}
            max={6}
            value={gamesPerSet}
            onChange={(value) =>
              setGamesPerSet(value as GamesPerSetOption)
            }
            size="small"
            label={t("game.gamesPerSet")}
            labelPosition="center"
            variant="secondary"
          />
          <QuantitySelector
            min={1}
            max={3}
            value={setsPerMatch}
            onChange={(value) =>
              setSetsPerMatch(value as MatchSetsOption)
            }
            size="small"
            label={t("game.setsPerMatch")}
            labelPosition="center"
            variant="secondary"
          />
                    </div>
        </div>
      </div>
      <Link to="/scoreboard" className="w-full flex justify-center items-center border-0 bg-lime-600 py-6 text-md font-bold uppercase tracking-wide text-white shadow-none ring-0 outline-none transition hover:bg-lime-500 focus-visible:ring-0 active:bg-lime-800">
        {type === "new" ? t("home.startMatch") : t("home.scanQRCode")}
      </Link>
    </Layout>
  );
}
