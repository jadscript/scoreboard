import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "../utils/className";

interface QuantitySelectorProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
  size?: "small" | "normal";
  labelPosition?: "left" | "right" | "center";
  variant?: "primary" | "secondary";
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toSafeInt(value: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return clampInt(Math.trunc(n), min, max);
}

const QuantitySelector = ({
  min,
  max,
  value,
  onChange,
  className = "",
  label = "",
  size = "normal",
  labelPosition = "left",
  variant = "primary",
}: QuantitySelectorProps) => {
  const safeValue = toSafeInt(value, min, max);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-fit",
        labelPosition === "left"
          ? "items-start"
          : labelPosition === "right"
            ? "items-end"
            : "items-center",
        className,
      )}
    >
      {label && (
        <span
          className={cn(
            "font-semibold text-foreground opacity-60",
            size === "small" ? "text-xs" : "text-sm",
          )}
        >
          {label}
        </span>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, safeValue - 1))}
          disabled={safeValue <= min}
          className={cn(
            "cursor-pointer p-2 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white",
            variant === "primary"
              ? "bg-lime-600 hover:bg-lime-500"
              : "bg-stone-600 hover:bg-stone-500",
          )}
        >
          <MinusIcon className={cn("", size === "small" ? "h-4 w-4" : "h-5 w-5")} />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={safeValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return;
            const parsed = Number.parseInt(raw, 10);
            if (!Number.isFinite(parsed)) return;
            onChange(clampInt(parsed, min, max));
          }}
          className={cn(
            "w-10 text-center border-0 bg-transparent outline-none font-semibold md:-mr-3.5",
            variant === "primary" ? "text-lime-600" : "text-stone-600",
            size === "small" ? "text-lg" : "text-xl",
          )}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, safeValue + 1))}
          disabled={safeValue >= max}
          className={cn(
            "cursor-pointer p-2 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white",
            variant === "primary"
              ? "bg-lime-600 hover:bg-lime-500"
              : "bg-stone-600 hover:bg-stone-500",
          )}
        >
          <PlusIcon className={cn("", size === "small" ? "h-4 w-4" : "h-5 w-5")} />
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
