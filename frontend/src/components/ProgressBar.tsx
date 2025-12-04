interface ProgressBarProps {
  value: number;
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-3 w-full overflow-hidden rounded-full bg-base-300">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-xs font-medium text-base-content/70">{clamped.toFixed(0)}% complete</span>
    </div>
  );
}
