import { useEffect, useMemo, useRef, useState } from "react";

interface ColumnDef {
  key: string;
  label: string;
}

interface MappingOption {
  key: string;
  label: string;
}

interface BulkDataEditorModalProps {
  title?: string;
  columns: ColumnDef[];
  initialRows: Array<Record<string, string>>;
  mappingOptions?: MappingOption[];
  onClose: () => void;
  onConfirm: (rows: Array<Record<string, string>>, mapping: Record<string, string>) => void;
  onGenerate?: (rows: Array<Record<string, string>>, mapping: Record<string, string>) => void;
}

function BulkDataEditorModal({
  title = "Add data",
  columns,
  initialRows,
  mappingOptions = [],
  onClose,
  onConfirm,
  onGenerate,
}: BulkDataEditorModalProps) {
  const [rows, setRows] = useState<Array<Record<string, string>>>(initialRows);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const [openMapKey, setOpenMapKey] = useState<string | null>(null);
  const [mappingByColumn, setMappingByColumn] = useState<Record<string, string>>({});

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

  // Initialize default column widths
  useEffect(() => {
    setColWidths((prev) => {
      const next: Record<string, number> = { ...prev };
      columns.forEach((c) => {
        if (next[c.key] == null) {
          next[c.key] = 160; // default width in px
        }
      });
      return next;
    });
  }, [columns]);

  const onResizeMouseDown = (key: string, e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    resizingRef.current = { key, startX: e.clientX, startWidth: colWidths[key] ?? 160 };
    window.addEventListener("mousemove", onResizeMouseMove as unknown as EventListener);
    window.addEventListener("mouseup", onResizeMouseUp as unknown as EventListener, { once: true } as AddEventListenerOptions);
  };

  const onResizeMouseMove = (e: MouseEvent) => {
    const state = resizingRef.current;
    if (!state) return;
    const delta = e.clientX - state.startX;
    const newWidth = Math.max(80, state.startWidth + delta);
    setColWidths((prev) => ({ ...prev, [state.key]: newWidth }));
  };

  const onResizeMouseUp = () => {
    window.removeEventListener("mousemove", onResizeMouseMove as unknown as EventListener);
    resizingRef.current = null;
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
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="min-w-max text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-3 py-2 text-left text-gray-500 font-medium">#</th>
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    className="px-3 py-2 text-left text-gray-700 font-medium relative select-none"
                    style={{ width: colWidths[c.key] ?? 160, minWidth: colWidths[c.key] ?? 160 }}
                  >
                    {c.label}
                    {mappingOptions.length > 0 && (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => setOpenMapKey((k) => (k === c.key ? null : c.key))}
                          className="text-xs px-2 py-0.5 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          {mappingByColumn[c.key] ? `Mapped: ${mappingOptions.find((m) => m.key === mappingByColumn[c.key])?.label ?? mappingByColumn[c.key]}` : "Map column"}
                        </button>
                        {openMapKey === c.key && (
                          <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg p-1 max-h-60 overflow-auto">
                            {mappingOptions.map((opt) => (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                  setMappingByColumn((prev) => ({ ...prev, [c.key]: opt.key }));
                                  setOpenMapKey(null);
                                }}
                                className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 ${mappingByColumn[c.key] === opt.key ? "bg-blue-50" : ""}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setMappingByColumn((prev) => {
                                  const next = { ...prev };
                                  delete next[c.key];
                                  return next;
                                });
                                setOpenMapKey(null);
                              }}
                              className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 text-gray-500"
                            >
                              Clear mapping
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <span
                      onMouseDown={(e) => onResizeMouseDown(c.key, e)}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400"
                      title="Drag to resize"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{rowIdx + 1}</td>
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className="px-3 py-1"
                      style={{ width: colWidths[c.key] ?? 160, minWidth: colWidths[c.key] ?? 160 }}
                    >
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
            {onGenerate && (
              <button
                onClick={() => onGenerate(rows, mappingByColumn)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                type="button"
              >
                Generate
              </button>
            )}
            <button
              onClick={() => onConfirm(rows, mappingByColumn)}
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


