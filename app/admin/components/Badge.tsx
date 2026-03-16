export default function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold tracking-wide transition-all duration-200 ${
        active
          ? "text-emerald-300 border border-emerald-500/30"
          : "text-white/40 border border-white/10"
      }`}
      style={
        active
          ? { background: "rgba(16,185,129,0.12)" }
          : { background: "rgba(255,255,255,0.05)" }
      }
    >
      {active ? "활성" : "비활성"}
    </span>
  );
}
