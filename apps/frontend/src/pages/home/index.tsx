import { useCallback, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerMe } from "../../service/players/queries/use-player-me";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Layout, QuantitySelector, Switch } from "../../components";
import type {
  GamesPerSetOption,
  MatchGenderOption,
  MatchSetsOption,
} from "./types";
import { useHomeGameSetup } from "./useHomeGameSetup";
import QrCodeUser from "./qrcode";
import { isWebNfcSupported } from "../../utils/isWebNfcSupported";
import { NfcWriteTagModal, type NfcWritePhase } from "./NfcWriteTagModal";

export function HomePage() {
  const { token } = useAuth();
  // Helper to extract subject (sub claim) from a JWT
  function extractSubject(token: string | undefined): string | undefined {
    if (!token) return undefined;
    try {
      const [, payloadBase64] = token.split(".");
      if (!payloadBase64) return undefined;
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
      );
      const payload = JSON.parse(payloadJson);
      return payload?.sub;
    } catch {
      return undefined;
    }
  }
  const subject = extractSubject(token);
  const { data, isLoading } = usePlayerMe();
  const router = useRouter();
  const { t } = useTranslation();
  const [nfcModalOpen, setNfcModalOpen] = useState(false);
  const [nfcPhase, setNfcPhase] = useState<NfcWritePhase>("writing");
  const [nfcErrorMessage, setNfcErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const runNfcWrite = useCallback(() => {
    if (!subject) return;
    setNfcPhase("writing");
    setNfcErrorMessage(undefined);
    const ndef = new NDEFReader();
    void ndef
      .write({
        records: [
          {
            recordType: "text",
            data: subject,
            encoding: "utf-8",
            lang: "en",
          },
        ],
      })
      .then(() => {
        setNfcPhase("success");
      })
      .catch((err: unknown) => {
        setNfcPhase("error");
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError") {
            setNfcErrorMessage(t("home.nfc.errorNotAllowed"));
          } else if (err.name === "NotSupportedError") {
            setNfcErrorMessage(t("home.nfc.errorNotSupported"));
          } else if (err.name === "AbortError") {
            setNfcErrorMessage(t("home.nfc.errorAborted"));
          } else {
            setNfcErrorMessage(t("home.nfc.errorGeneric"));
          }
        } else {
          setNfcErrorMessage(t("home.nfc.errorGeneric"));
        }
      });
  }, [subject, t]);

  const handleOpenNfcWrite = () => {
    if (!subject) return;
    setNfcModalOpen(true);
    runNfcWrite();
  };

  const handleCloseNfcModal = () => {
    setNfcModalOpen(false);
  };

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
      <div className="flex flex-col justify-between items-center flex-1 min-h-0 gap-6 px-4 text-stone-900">
        <div className="flex flex-col items-center flex-1 pt-8 gap-6">
          <h1 className="text-3xl font-semibold text-center drop-shadow">
            {t("home.greeting", { name: data?.name.split(" ")[0] })}
          </h1>
          <p className="text-sm text-center text-stone-900 opacity-60 max-w-[240px] leading-6">
            {t("home.subtitle")}
          </p>
          <Switch
            options={matchTypes}
            value={type}
            onChange={(value) => setType(value as "new" | "join")}
            className="w-full"
          />
        </div>

        {type === "new" && (
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
              onChange={(value) => setMatchGender(value as MatchGenderOption)}
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
                onChange={(value) => setGamesPerSet(value as GamesPerSetOption)}
                size="small"
                label={t("game.gamesPerSet")}
                labelPosition="center"
                variant="secondary"
              />
              <QuantitySelector
                min={1}
                max={3}
                value={setsPerMatch}
                onChange={(value) => setSetsPerMatch(value as MatchSetsOption)}
                size="small"
                label={t("game.setsPerMatch")}
                labelPosition="center"
                variant="secondary"
              />
            </div>
          </div>
        )}

        {type === "join" && (
          <div className="flex flex-col gap-4 items-center flex-1 w-full">
            <QrCodeUser subject={subject!} />
          </div>
        )}
      </div>
      {type === "new" && (
        <Link
          to="/scoreboard"
          className="w-full flex justify-center items-center border-0 bg-lime-600 py-6 text-md font-bold uppercase tracking-wide text-white shadow-none ring-0 outline-none transition hover:bg-lime-500 focus-visible:ring-0 active:bg-lime-800"
        >
          {t("home.startMatch")}
        </Link>
      )}
      {isWebNfcSupported() && type === "join" && (
        <button
          type="button"
          onClick={handleOpenNfcWrite}
          className="cursor-pointer w-full flex justify-center items-center border-0 bg-lime-600 py-6 text-md font-bold uppercase tracking-wide text-white shadow-none ring-0 outline-none transition hover:bg-lime-500 focus-visible:ring-0 active:bg-lime-800"
        >
          {t("home.nfcWriteButton")}
        </button>
      )}
      <NfcWriteTagModal
        open={nfcModalOpen}
        phase={nfcPhase}
        errorMessage={nfcErrorMessage}
        onClose={handleCloseNfcModal}
        onRetry={runNfcWrite}
      />
    </Layout>
  );
}
