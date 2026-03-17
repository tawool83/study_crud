type Props = { label: string } & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-2)" }}>
        {label}
      </label>
      <input
        {...props}
        className="px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-30 transition-all duration-200"
        style={{
          background: "var(--bg-input)",
          color: "var(--text-1)",
          boxShadow: "var(--shadow-sm)",
          ...props.style,
        }}
      />
    </div>
  );
}
