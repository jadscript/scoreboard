import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  BrowserCodeReader,
  BrowserMultiFormatReader,
} from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { ApiHttpError } from "../../../api/http";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayerByUserId } from "../../../service/players/queries/use-player-by-user-id";
import { cn } from "../../../utils/className";
import { isWebNfcSupported } from "../../../utils/isWebNfcSupported";

export type ScoreboardScanPlayer = {
  id: string;
  name: string;
  userId: string;
};

type ScanMode = "qr" | "nfc";

interface Props {
  scannedUserId: string | undefined;
  onResolveUserId: (userId: string) => void;
  onClearScannedUserId: () => void;
  onClose: () => void;
  onPlayerAdded: (player: ScoreboardScanPlayer) => void;
  onStartNfcScan: () => void;
  onStopNfcScan: () => void;
  isPlayerAlreadyInMatch: (player: { id: string; userId: string }) => boolean;
  duplicateMessage: string | null;
  onDuplicatePlayerFromScan: () => void;
}

export function ScoreboardAddPlayerScanModal({
  scannedUserId,
  onResolveUserId,
  onClearScannedUserId,
  onClose,
  onPlayerAdded,
  onStartNfcScan,
  onStopNfcScan,
  isPlayerAlreadyInMatch,
  duplicateMessage,
  onDuplicatePlayerFromScan,
}: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const nfcSupported = isWebNfcSupported();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<{ stop: () => void } | null>(null);
  const qrResolvedRef = useRef(false);
  const successDispatchedRef = useRef(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [qrScanStarted, setQrScanStarted] = useState(false);
  const [mode, setMode] = useState<ScanMode>("nfc");

  const {
    data: playerData,
    isFetching,
    isError,
    error,
  } = usePlayerByUserId(scannedUserId, Boolean(scannedUserId));

  const stopScanner = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    const v = videoRef.current;
    if (v) {
      BrowserCodeReader.cleanVideoSource(v);
      const src = v.srcObject;
      if (src instanceof MediaStream) {
        src.getTracks().forEach((track) => {
          track.stop();
        });
      }
      v.srcObject = null;
    }
    BrowserCodeReader.releaseAllStreams();
  }, []);

  const handleClose = useCallback(() => {
    stopScanner();
    onStopNfcScan();
    onClose();
  }, [stopScanner, onStopNfcScan, onClose]);

  const selectQrMode = useCallback(() => {
    setMode("qr");
    onStopNfcScan();
    stopScanner();
    setQrScanStarted(false);
    setScannerError(null);
  }, [onStopNfcScan, stopScanner]);

  const selectNfcMode = useCallback(() => {
    setMode("nfc");
    stopScanner();
    setQrScanStarted(false);
    setScannerError(null);
    onStartNfcScan();
  }, [onStartNfcScan, stopScanner]);

  const startScanner = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setScannerError(null);
    qrResolvedRef.current = false;
    stopScanner();

    const hints = new Map<DecodeHintType, BarcodeFormat[]>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    const reader = new BrowserMultiFormatReader(hints);

    void reader
      .decodeFromVideoDevice(undefined, video, (result, _err, controls) => {
        if (qrResolvedRef.current) return;
        if (!result) return;
        const text = result.getText().trim();
        if (!text) return;
        qrResolvedRef.current = true;
        controls.stop();
        scannerControlsRef.current = null;
        onResolveUserId(text);
      })
      .then((controls) => {
        scannerControlsRef.current = controls;
      })
      .catch(() => {
        setScannerError(t("scoreboard.addPlayerScan.cameraError"));
      });
  }, [onResolveUserId, stopScanner, t]);

  useEffect(() => {
    return () => {
      stopScanner();
      onStopNfcScan();
    };
  }, [stopScanner, onStopNfcScan]);

  useEffect(() => {
    if (!scannedUserId) {
      successDispatchedRef.current = false;
      return;
    }
    if (!playerData || successDispatchedRef.current) return;
    if (
      isPlayerAlreadyInMatch({
        id: playerData.id,
        userId: playerData.userId,
      })
    ) {
      onDuplicatePlayerFromScan();
      void queryClient.removeQueries({
        queryKey: ["players", "byUserId", scannedUserId],
      });
      onClearScannedUserId();
      if (mode === "qr" && qrScanStarted) {
        queueMicrotask(() => {
          qrResolvedRef.current = false;
          startScanner();
        });
      }
      return;
    }
    successDispatchedRef.current = true;
    stopScanner();
    onPlayerAdded({
      id: playerData.id,
      name: playerData.name,
      userId: playerData.userId,
    });
  }, [
    scannedUserId,
    playerData,
    isPlayerAlreadyInMatch,
    mode,
    onClearScannedUserId,
    onDuplicatePlayerFromScan,
    onPlayerAdded,
    queryClient,
    qrScanStarted,
    startScanner,
    stopScanner,
  ]);

  const notFound =
    isError && error instanceof ApiHttpError && error.status === 404;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 cursor-default"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md bg-white border border-stone-300 rounded-none shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scoreboard-scan-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-none text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer z-10"
          aria-label={t("scoreboard.addPlayerScan.close")}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
          <h2
            id="scoreboard-scan-title"
            className="text-lg font-semibold text-stone-900"
          >
            {t("scoreboard.addPlayerScan.title")}
          </h2>

          {nfcSupported ? (
            <div
              className="flex w-full border border-stone-300 rounded-none overflow-hidden"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "qr"}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                  mode === "qr"
                    ? "bg-lime-600 text-white"
                    : "bg-white text-stone-700 hover:bg-stone-50",
                )}
                onClick={selectQrMode}
              >
                {t("scoreboard.addPlayerScan.tabQr")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "nfc"}
                className={cn(
                  "flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer border-l border-stone-300",
                  mode === "nfc"
                    ? "bg-lime-600 text-white"
                    : "bg-white text-stone-700 hover:bg-stone-50",
                )}
                onClick={selectNfcMode}
              >
                {t("scoreboard.addPlayerScan.tabNfc")}
              </button>
            </div>
          ) : null}

          {mode === "qr" ? (
            <>
              <p className="text-sm text-stone-500">
                {t("scoreboard.addPlayerScan.cameraHint")}
              </p>

              {!qrScanStarted ? (
                <button
                  type="button"
                  onClick={() => {
                    flushSync(() => {
                      setQrScanStarted(true);
                    });
                    startScanner();
                  }}
                  className="w-full py-2.5 rounded-none bg-lime-600 text-white text-sm font-semibold hover:bg-lime-500 cursor-pointer"
                >
                  {t("scoreboard.addPlayerScan.startQrScan")}
                </button>
              ) : (
                <div className="relative w-full aspect-video bg-stone-200 overflow-hidden rounded-none">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay
                  />
                </div>
              )}

              {scannerError ? (
                <p className="text-sm text-red-600">{scannerError}</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-stone-500">
                {t("scoreboard.addPlayerScan.nfcModeHint")}
              </p>
              <p className="text-sm font-medium text-lime-800">
                {t("scoreboard.addPlayerScan.nfcListening")}
              </p>
            </>
          )}

          {scannedUserId && isFetching ? (
            <p className="text-sm text-stone-600">
              {t("scoreboard.addPlayerScan.loadingPlayer")}
            </p>
          ) : null}

          {duplicateMessage ? (
            <p className="text-sm text-red-600" role="alert">
              {duplicateMessage}
            </p>
          ) : null}

          {isError && notFound ? (
            <p className="text-sm text-red-600">
              {t("scoreboard.addPlayerScan.playerNotFound")}
            </p>
          ) : null}

          {isError && !notFound ? (
            <p className="text-sm text-red-600">
              {t("scoreboard.addPlayerScan.fetchError")}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-none border border-stone-300 text-stone-500 hover:bg-stone-100 text-sm font-medium cursor-pointer"
              >
                {t("common.cancel")}
              </button>
              {mode === "qr" && scannerError && qrScanStarted ? (
                <button
                  type="button"
                  onClick={() => startScanner()}
                  className="flex-1 py-2.5 rounded-none bg-stone-800 text-white text-sm font-semibold hover:bg-stone-700 cursor-pointer"
                >
                  {t("scoreboard.addPlayerScan.retryCamera")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
