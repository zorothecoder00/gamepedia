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
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}55`,
        borderRadius: "4px",
        fontWeight: 700,
        fontSize: small ? "0.65rem" : "0.75rem",
        padding: small ? "1px 6px" : "2px 8px",
        letterSpacing: "0.5px",
      }}
    >
      {small ? tier : tierLabels[tier]}
    </span>
  );
}
