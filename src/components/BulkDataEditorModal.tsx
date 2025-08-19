import { useMemo, useState } from "react";

interface ColumnDef {
  key: string;
  label: string;
}

interface BulkDataEditorModalProps {
  title?: string;
  columns: ColumnDef[];
  initialRows: Array<Record<string, string>>;
  onClose: () => void;
  onConfirm: (rows: Array<Record<string, string>>) => void;
}

function BulkDataEditorModal({
  title = "Add data",
  columns,
  initialRows,
  onClose,
  onConfirm,
}: BulkDataEditorModalProps) {
  const [rows, setRows] = useState<Array<Record<string, string>>>(initialRows);

  const emptyRow = useMemo(() => {
    const base: Record<string, string> = {};
    columns.forEach((c) => (base[c.key] = ""));
    return base;
  }, [columns]);

  const updateCell = (rowIdx: number, key: string, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [key]: value };
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[1100px] max-w-[98vw] h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="px-3 py-1.5 text-sm bg-gray-100 rounded-md" type="button">
              Add text
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 rounded-md" type="button">
              Add image
            </button>
          </div>
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-3 py-2 text-left text-gray-500 font-medium">#</th>
                {columns.map((c) => (
                  <th key={String(c.key)} className="px-3 py-2 text-left text-gray-700 font-medium">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{rowIdx + 1}</td>
                  {columns.map((c) => (
                    <td key={String(c.key)} className="px-3 py-1">
                      <input
                        value={String(row[c.key] ?? "")}
                        onChange={(e) => updateCell(rowIdx, c.key, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setRows([])}
            className="text-sm text-gray-700 hover:text-gray-900"
            type="button"
          >
            Clear table
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRows((prev) => [...prev, emptyRow])}
              className="px-3 py-1.5 text-sm bg-gray-100 rounded-md"
              type="button"
            >
              + Row
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100" type="button">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(rows)}
              className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkDataEditorModal;


