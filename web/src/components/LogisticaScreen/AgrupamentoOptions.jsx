import React from "react";

export function AgrupamentoOptions({ pedidoAtual, onChange }) {
  const p = pedidoAtual.itens || {};
  const h12 = parseInt(p["AB12"]) > 0 && parseInt(p["EB12"]) > 0;
  const h20 = parseInt(p["AB20"]) > 0 && parseInt(p["EB20"]) > 0;
  const h30 = parseInt(p["AB30"]) > 0 && parseInt(p["EB30"]) > 0;

  if (!h12 && !h20 && !h30) return null;

  return (
    <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
      <span className="text-xs font-bold text-teal-800 block mb-3">
        Deseja unir as somas no WhatsApp?
      </span>
      <div className="flex gap-4 flex-wrap">
        {h12 && (
          <label className="text-sm font-bold text-teal-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pedidoAtual.agrupar12}
              onChange={(e) => onChange("agrupar12", e.target.checked)}
              className="w-4 h-4"
            />{" "}
            AB12 + EB12
          </label>
        )}
        {h20 && (
          <label className="text-sm font-bold text-teal-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pedidoAtual.agrupar20}
              onChange={(e) => onChange("agrupar20", e.target.checked)}
              className="w-4 h-4"
            />{" "}
            AB20 + EB20
          </label>
        )}
        {h30 && (
          <label className="text-sm font-bold text-teal-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pedidoAtual.agrupar30}
              onChange={(e) => onChange("agrupar30", e.target.checked)}
              className="w-4 h-4"
            />{" "}
            AB30 + EB30
          </label>
        )}
      </div>
    </div>
  );
}
