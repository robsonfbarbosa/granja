import React from "react";

export function PedidoFormFields({ pedido, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-1">
          Data do Pedido <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={pedido.data_pedido}
          onChange={(e) => onChange("data_pedido", e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none text-slate-700"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-1">
          Comprador / Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ex: Mercado Central"
          value={pedido.comprador}
          onChange={(e) => onChange("comprador", e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none font-bold text-slate-800"
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="text-xs font-bold text-slate-600 block mb-1">
          Anotações (Opcional)
        </label>
        <textarea
          placeholder="Ex: Doca 2"
          value={pedido.anotacao}
          onChange={(e) => onChange("anotacao", e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none h-12 text-sm resize-none"
        />
      </div>
    </div>
  );
}
