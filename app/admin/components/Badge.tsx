export default function Badge({ active }: { active: boolean }) {
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-semibold tracking-wide"
      style={
        active
          ? { background: "var(--green-active-bg)", color: "#34d399" }
          : { background: "var(--inactive-bg)", color: "var(--text-3)" }
      }
    >
      {active ? "활성" : "비활성"}
    </span>
  );
}
