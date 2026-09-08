import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  active?: boolean;
  as?: "div" | "button";
  onClick?: () => void;
  className?: string;
  mint?: boolean;
};

export function HudChip({
  children,
  active,
  as = "div",
  onClick,
  className,
  mint,
}: Props) {
  const classNames = cn(
    "inline-flex min-h-11 items-center justify-center border-2 px-3 py-2 font-display text-xs font-bold tracking-widest uppercase",
    mint
      ? "border-mint text-mint shadow-[0_0_14px_color-mix(in_oklab,var(--color-mint)_40%,transparent)]"
      : "border-cyan text-cyan shadow-hud",
    active && (mint ? "bg-mint/15" : "bg-cyan/15"),
    className,
  );

  if (as === "button") {
    return (
      <button type="button" onClick={onClick} className={classNames}>
        {children}
      </button>
    );
  }

  return <div className={classNames}>{children}</div>;
}
