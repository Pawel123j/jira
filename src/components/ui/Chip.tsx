type ChipColor = "blue" | "violet";

const activeClasses: Record<ChipColor, string> = {
  blue: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

const inactiveClasses =
  "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600";

interface ChipProps {
  label: string;
  active: boolean;
  color?: ChipColor;
  onClick: () => void;
}

/** A small toggleable pill used for picking assignees and tags. */
export function Chip({ label, active, color = "blue", onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
        active ? activeClasses[color] : inactiveClasses
      }`}
    >
      {label}
    </button>
  );
}
