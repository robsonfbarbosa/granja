import React from "react";
import { FileText, Copy, CheckCircle2 } from "lucide-react";
import { SavedPedidoCard } from "./SavedPedidoCard";

export function SavedPedidosList({
  pedidos,
  onToggleConcluido,
  onCopyWhatsApp,
  onEdit,
  onDelete,
  onCopyAll,
  textoCopiado,
}) {
  if (pedidos.length === 0) {
    return (
      <div className="text-center p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-bold text-slate-500">Nenhum pedido salvo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl mb-4 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <p>
            <strong>Aviso:</strong> Backup não automático. Guarde no WhatsApp!
          </p>
        </div>
        <button
          onClick={onCopyAll}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition shadow-md whitespace-nowrap"
        >
          {textoCopiado ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}{" "}
          Copiar Todos
        </button>
      </div>

      {pedidos.map((p) => (
        <SavedPedidoCard
          key={p.id}
          pedido={p}
          onToggleConcluido={onToggleConcluido}
          onCopyWhatsApp={() => onCopyWhatsApp(p)}
          onEdit={() => onEdit(p)}
          onDelete={() => onDelete(p.id)}
          textoCopiado={textoCopiado}
        />
      ))}
    </div>
  );
}
