import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";

const QrCodeUser = ({ subject }: { subject: string }) => {
    const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-6 items-center flex-1 w-full">
      <QRCodeCanvas value={subject} size={250} fgColor="#272524" />
      <p className="text-center text-sm text-foreground opacity-60 max-w-[240px] leading-6">{t("home.qrcodeUsage")}</p>
    </div>
  );
};

export default QrCodeUser;
