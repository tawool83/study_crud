export default function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        active ? "bg-green-700 text-green-100" : "bg-gray-600 text-gray-300"
      }`}
    >
      {active ? "활성" : "비활성"}
    </span>
  );
}
