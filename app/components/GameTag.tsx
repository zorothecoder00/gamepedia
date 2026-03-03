export default function GameTag({ name, color }: { name: string; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: color ? `${color}22` : "rgba(79, 195, 247, 0.12)",
        color: color ?? "var(--accent-blue)",
        border: `1px solid ${color ? color + "44" : "rgba(79,195,247,0.25)"}`,
        borderRadius: "4px",
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "1px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </span>
  );
}
