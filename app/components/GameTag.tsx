export default function GameTag({ name, color }: { name: string; color?: string }) {
  if (color) {
    return (
      <span
        className="inline-block rounded text-[0.7rem] font-semibold px-[7px] py-px whitespace-nowrap"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {name}
      </span>
    );
  }
  return (
    <span className="inline-block rounded text-[0.7rem] font-semibold px-[7px] py-px whitespace-nowrap bg-[rgba(79,195,247,0.12)] text-[var(--accent-blue)] border border-[rgba(79,195,247,0.25)]">
      {name}
    </span>
  );
}
