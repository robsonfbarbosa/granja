import React from "react";
import { Save, Copy, CheckCircle2 } from "lucide-react";
import { calcTotalSecao } from "@/utils/pedidoUtils";

export function PedidoActions({
  pedido,
  onSave,
  onCopyWhatsApp,
  textoCopiado,
  flashVermelhasPuxadas,
}) {
  const canSave = pedido.comprador && calcTotalSecao(pedido.itens) > 0;
  const canCopy = calcTotalSecao(pedido.itens) > 0;

  return (
    <div className="flex gap-3">
      <button
        onClick={onSave}
        disabled={!canSave}
        className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition text-lg ${canSave ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        <Save className="w-5 h-5" /> Salvar Pedido
        {flashVermelhasPuxadas.length > 0 && (
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-1">
            + Zera Flash
          </span>
        )}
      </button>
      <button
        onClick={onCopyWhatsApp}
        disabled={!canCopy}
        className={`px-6 rounded-xl border flex items-center justify-center shadow-md transition ${canCopy ? "bg-white text-green-600 border-green-200 hover:bg-green-50" : "bg-slate-50 text-slate-300"}`}
      >
        {textoCopiado ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Copy className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
