import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export type NfcWritePhase = "writing" | "success" | "error";

interface Props {
  open: boolean;
  phase: NfcWritePhase;
  errorMessage?: string;
  onClose: () => void;
  onRetry: () => void;
}

export function NfcWriteTagModal({
  open,
  phase,
  errorMessage,
  onClose,
  onRetry,
}: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 cursor-default"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-md bg-white border border-stone-300 rounded-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nfc-write-title"
        aria-busy={phase === "writing"}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-none text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
          aria-label={t("home.nfcWriteModalClose")}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="px-6 pt-6 pb-5 flex flex-col gap-4 pr-12">
          <div className="flex flex-col gap-1">
            <h2
              id="nfc-write-title"
              className="text-lg font-semibold text-stone-900"
            >
              {t("home.nfcWriteModalTitle")}
            </h2>
            {phase === "writing" && (
              <p className="text-sm text-stone-500">
                {t("home.nfcWriteModalInstruction")}
              </p>
            )}
            {phase === "writing" && (
              <p className="text-sm font-medium text-lime-700">
                {t("home.nfcWriteModalWriting")}
              </p>
            )}
            {phase === "success" && (
              <p className="text-sm text-stone-600">
                {t("home.nfcWriteModalSuccess")}
              </p>
            )}
            {phase === "error" && (
              <p className="text-sm text-red-600">
                {errorMessage ?? t("home.nfcWriteModalErrorGeneric")}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            {phase === "error" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-none border border-stone-300 text-stone-500 hover:bg-stone-100 text-sm font-medium transition-colors cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex-1 py-2.5 rounded-none bg-lime-600 text-white text-sm font-semibold transition-colors hover:bg-lime-500 cursor-pointer"
                >
                  {t("home.nfcWriteModalRetry")}
                </button>
              </>
            ) : phase === "success" ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-none bg-lime-600 text-white text-sm font-semibold transition-colors hover:bg-lime-500 cursor-pointer"
              >
                {t("home.nfcWriteModalClose")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
