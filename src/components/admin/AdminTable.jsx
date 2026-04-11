export default function AdminTable({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-900 text-zinc-300">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-left font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-t border-zinc-800">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-zinc-200">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
