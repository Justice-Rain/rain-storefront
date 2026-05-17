type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  size?: Size;
  className?: string;
};

const sizeClass: Record<Size, string> = {
  sm: "text-[16px]",
  md: "text-[20px]",
  lg: "text-[32px]",
  xl: "text-[56px]",
};

/**
 * Rain wordmark. Renders as styled text so it stays crisp at every size and
 * inherits color from the parent (default is Rain pink).
 */
export function RainMark({ size = "md", className }: Props) {
  return (
    <span
      aria-label="Rain"
      className={`inline-block select-none font-sans font-extrabold lowercase leading-none tracking-[-0.06em] text-[color:var(--rain-pink)] ${
        sizeClass[size]
      } ${className ?? ""}`}
    >
      rain
    </span>
  );
}
