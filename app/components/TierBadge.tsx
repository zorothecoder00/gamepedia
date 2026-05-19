type Tier = "S" | "A" | "B" | "C";

const tierColors: Record<Tier, string> = {
  S: "var(--tier-s)",
  A: "var(--tier-a)",
  B: "var(--tier-b)",
  C: "var(--tier-c)",
};

const tierLabels: Record<Tier, string> = {
  S: "Tier S",
  A: "Tier A",
  B: "Tier B",
  C: "Tier C",
};

export default function TierBadge({ tier, small }: { tier: Tier; small?: boolean }) {
  const color = tierColors[tier];
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-bold tracking-wide ${small ? "text-[0.65rem] px-1.5 py-px" : "text-[0.75rem] px-2 py-0.5"}`}
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      {small ? tier : tierLabels[tier]}
    </span>
  );
}
