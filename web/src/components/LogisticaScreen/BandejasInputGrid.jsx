import React from "react";

export function BandejasInputGrid({ categorias, valores, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {categorias.map((c) => (
        <div
          key={c}
          className="bg-white p-2 rounded-lg border border-slate-200 flex flex-col"
        >
          <label className="text-[10px] font-bold text-slate-600 mb-1 text-center truncate">
            {c}
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={valores?.[c] || ""}
            onChange={(e) => onChange(c, e.target.value)}
            className="w-full p-1.5 border border-slate-200 rounded text-center font-bold outline-none focus:ring-2 focus:ring-slate-400 text-slate-700 text-sm"
          />
        </div>
      ))}
    </div>
  );
}
