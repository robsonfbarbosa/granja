import React from "react";
import { AlertTriangle } from "lucide-react";

export function ResumoFaltas({ faltas }) {
  if (faltas.length === 0) return null;

  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
      <p className="text-sm font-black text-red-800 flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5" /> Resumo do que precisa separar além
        do estoque
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {faltas.map(({ cat, falta, vermelhas }) => (
          <div
            key={cat}
            className="bg-white border border-red-200 rounded-lg p-3 flex justify-between items-center gap-2"
          >
            <div>
              <span className="text-sm font-black text-slate-800">{cat}</span>
              <span className="block text-xs text-red-600 font-bold">
                Falta: {falta} cx papelão
              </span>
            </div>
            <div className="bg-red-100 px-2 py-1 rounded-lg text-right shrink-0">
              <span className="block text-[9px] text-red-600 font-bold uppercase">
                cx vermelhas
              </span>
              <span className="text-lg font-black text-red-700">
                {vermelhas}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
