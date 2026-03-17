type Props = { label: string } & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/75 tracking-wide uppercase">{label}</label>
      <input
        {...props}
        className="px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/45 border border-white/10 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30 transition-all duration-200"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
      />
    </div>
  );
}
