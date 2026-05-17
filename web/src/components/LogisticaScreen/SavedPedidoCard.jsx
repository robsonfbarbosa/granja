import React from "react";
import {
  Package,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Copy,
  Pencil,
  Trash2,
  History,
} from "lucide-react";
import { calcTotalSecao, formatarData } from "@/utils/pedidoUtils";

export function SavedPedidoCard({
  pedido,
  onToggleConcluido,
  onCopyWhatsApp,
  onEdit,
  onDelete,
  textoCopiado,
}) {
  const totalTipos = [
    ...Object.keys(pedido.itens || {}),
    ...Object.keys(pedido.bandejas_troca || {}),
  ].length;
  const concluidos = (pedido.itens_concluidos || []).length;
  const isDone = totalTipos > 0 && concluidos === totalTipos;
  const isSep = concluidos > 0;

  return (
    <div
      className={`p-4 border-2 rounded-xl transition ${isDone ? "border-green-200 bg-green-50/40" : isSep ? "border-blue-300 bg-blue-50/50 shadow-md" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" /> {pedido.comprador}
          </h3>
          <span className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />{" "}
            {formatarData(pedido.data_pedido)}
          </span>
        </div>
        {isDone ? (
          <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold">
            ✅ Concluído
          </span>
        ) : isSep ? (
          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-bold">
            🛠️ Separando
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
            ⏳ Pendente
          </span>
        )}
      </div>

      {pedido.anotacao && (
        <p className="text-sm text-slate-500 mb-3 bg-slate-100/50 p-2 rounded-lg">
          Obs: {pedido.anotacao}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(pedido.itens || {}).map(([c, q]) => {
          if (q > 0) {
            const isC = (pedido.itens_concluidos || []).includes(c);
            return (
              <button
                key={c}
                onClick={() => onToggleConcluido(pedido.id, c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border flex items-center gap-1.5 transition ${isC ? "bg-green-100 border-green-300 text-green-800 line-through opacity-80" : "bg-white border-slate-300 text-slate-700 hover:border-teal-400 hover:bg-teal-50"}`}
              >
                {isC && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>
                  {c}:{" "}
                  <span className={isC ? "text-green-900" : "text-teal-600"}>
                    {q}
                  </span>
                </span>
              </button>
            );
          }
          return null;
        })}
        {Object.entries(pedido.bandejas_troca || {}).map(([c, q]) => {
          if (q > 0) {
            const ic = `troca_${c}`;
            const isC = (pedido.itens_concluidos || []).includes(ic);
            return (
              <button
                key={ic}
                onClick={() => onToggleConcluido(pedido.id, ic)}
                className={`text-[11px] font-bold px-2 py-1.5 rounded-lg shadow-sm border flex items-center gap-1.5 transition ${isC ? "bg-slate-200 border-slate-300 text-slate-600 line-through opacity-80" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400"}`}
              >
                {isC ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                )}
                <span>
                  Troca {c}:{" "}
                  <span className={isC ? "text-slate-600" : "text-slate-800"}>
                    {q} bdjs
                  </span>
                </span>
              </button>
            );
          }
          return null;
        })}
      </div>

      <div className="flex gap-2 mb-4">
        <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-lg">
          Total: {calcTotalSecao(pedido.itens)} cx
        </span>
        {calcTotalSecao(pedido.bandejas_troca) > 0 && (
          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg">
            +{calcTotalSecao(pedido.bandejas_troca)} bdjs troca
          </span>
        )}
      </div>

      {pedido.historico && pedido.historico.length > 0 && (
        <div className="mb-4 bg-white/60 p-3 rounded-lg border border-slate-200/60">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mb-2">
            <History className="w-3 h-3" /> Histórico:
          </span>
          <ul className="space-y-1.5">
            {pedido.historico.map((h, i) => (
              <li
                key={i}
                className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-2"
              >
                <span className="text-slate-400 whitespace-nowrap">
                  [{h.data}]
                </span>
                <span>{h.alteracoes.join(" | ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-slate-100 flex-wrap sm:flex-nowrap">
        <button
          onClick={onCopyWhatsApp}
          className="flex-1 sm:flex-none px-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition"
        >
          {textoCopiado ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}{" "}
          Zap
        </button>
        <button
          onClick={onEdit}
          className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
