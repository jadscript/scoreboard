import { cn } from "../utils/className";

interface SwitchProps {
  options: {
    label: string;
    value: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  size?: "small" | "normal";
  labelPosition?: "left" | "right" | "center";
  variant?: "primary" | "secondary";
}

const Switch = ({
  options,
  value,
  onChange,
  className = "",
  label = "",
  size = "normal",
  labelPosition = "left",
  variant = "primary",
}: SwitchProps) => {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentCount = Math.max(1, options.length);

  return (
    <div className={cn("flex flex-col gap-2 w-full", labelPosition === "left" ? "items-start" : labelPosition === "right" ? "items-end" : "items-center")}>
      {label && (
        <span className={cn("font-semibold text-stone-900 opacity-60", size === "small" ? "text-xs" : "text-sm")}>{label}</span>
      )}
      <div
        className={cn(
          "relative flex min-w-0 rounded-none p-1 shadow-inner",
          variant === "primary" ? "bg-lime-100" : "bg-stone-100",
          className,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1 bottom-1 left-1 z-0 rounded-none transition-transform duration-300 ease-out motion-reduce:transition-none",
            variant === "primary" ? "bg-lime-600" : "bg-stone-600",
          )}
          style={{
            width: `calc((100% - 0.5rem) / ${segmentCount})`,
            transform: `translateX(calc(${activeIndex} * 100%))`,
          }}
        />
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex min-w-0 flex-1 basis-0 items-center justify-center rounded-none px-4 py-3 font-medium transition-colors duration-300 cursor-pointer",
              size === "small" ? "text-xs" : "text-sm",
              value === option.value
                ? "text-white"
                : variant === "primary"
                  ? "text-lime-600"
                  : "text-stone-600",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Switch;
