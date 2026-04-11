export default function ErrorState({ error = "Ошибка" }) {
  return <div className="p-6 text-sm text-red-400">{error}</div>;
}
