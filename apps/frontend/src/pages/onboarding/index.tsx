import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button, Layout } from "../../components";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Gender } from "@scoreboard/core/domain/player.entity";
import type { CreatePlayerInput } from "../../api/player";
import { useRouter } from "@tanstack/react-router";
import { useCreatePlayer } from "../../service/players/mutations/use-create-player";
import { usePlayerMe } from "../../service/players/queries/use-player-me";

export function OnboardingPage() {
  const { t } = useTranslation();

  const { data, isLoading } = usePlayerMe()
  const { mutate: createPlayer } = useCreatePlayer();
  const router = useRouter();

  const totalSteps = 2;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreatePlayerInput>({
    name: "",
    gender: "",
  });

  if (isLoading) {
    return <div>{t('onboarding.loading')}</div>
  }

  if (!isLoading && data) {
    router.navigate({ to: '/' });
  }

  const validateStep = () => {
    if (step === 1) {
      const name = form.name.trim();
      const isValid = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)+$/.test(name) && name.split(" ").every((n) => n.length >= 3);
      return isValid;
    }
    if (step === 2) {
      return form.gender !== "";
    }
    return false;
  };

  const handleNext = () => {
    if (step === totalSteps) {
      createPlayer(form, {
        onSuccess: () => {
          router.navigate({ to: '/' });
        },
      });
    } else if (validateStep()) {
      setStep(step + 1);
    }
  };

  return (
    <Layout showNavbar={false}>
      <div className="flex flex-col justify-between items-center flex-1 min-h-0 gap-6">
        <h1 className="text-sm font-medium text-center text-lime-600">
          {t("onboarding.title")}
        </h1>
        <div className="w-full flex-1 min-h-0 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              width: `${totalSteps * 100}%`,
              transform: `translateX(-${((step - 1) / totalSteps) * 100}%)`,
            }}
          >
            <section
              className="flex h-full min-h-0 shrink-0 flex-col justify-between gap-6 px-0"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-center text-foreground">
                  {t("onboarding.step1.heading")}
                </h2>
                <p className="text-sm text-center text-foreground opacity-70 leading-6">
                  {t("onboarding.step1.description")}
                </p>
              </div>
              <input
                type="text"
                className="w-full border-b-2 border-lime-600/50 px-3 py-3 text-2xl text-center text-lime-600 font-semibold outline-none focus:border-lime-600 transition-colors placeholder:text-lime-600/50"
                placeholder={t("onboarding.step1.placeholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </section>

            <section
              className="flex h-full min-h-0 shrink-0 flex-col justify-between gap-6 px-0"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-center text-foreground">
                  {t("onboarding.step2.heading")}
                </h2>
                <p className="text-sm text-center text-foreground opacity-70 leading-6">
                  {t("onboarding.step2.description")}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col gap-4 justify-center w-full">
                  {[
                    { value: "male", label: t("onboarding.gender.male") },
                    { value: "female", label: t("onboarding.gender.female") },
                    { value: "unknown", label: t("onboarding.gender.unknown") },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, gender: option.value as Gender })
                      }
                      className={`cursor-pointer hover:bg-lime-50 flex-1 text-center px-5 py-4 rounded-none border-2 transition-colors font-semibold text-foreground text-lg
                        ${
                          form.gender === option.value
                            ? "border-lime-600 bg-lime-100"
                            : "border-lime-600/40 bg-transparent"
                        }
                        focus:outline-none`}
                      aria-pressed={form.gender === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full items-center shrink-0 pt-4">
          <div className="flex items-center justify-center w-full gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-none ${step === index + 1 ? "bg-lime-600" : "bg-stone-200"} transition-colors`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between w-full gap-10">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeftIcon className="w-6 h-6 -ml-6" />{" "}
              {t("onboarding.back")}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!validateStep()}
            >
              {step === totalSteps
                ? t("onboarding.finish")
                : t("onboarding.next")}{" "}
              <ChevronRightIcon className="w-6 h-6 -mr-6" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
