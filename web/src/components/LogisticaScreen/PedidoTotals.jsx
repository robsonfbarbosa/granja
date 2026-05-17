import React from "react";
import { calcTotalSecao } from "@/utils/pedidoUtils";

export function PedidoTotals({
  itens,
  bandejas_troca,
  resumoFaltas,
  mostrarEstoque,
}) {
  const totalItens = calcTotalSecao(itens);
  const totalBandejas = calcTotalSecao(bandejas_troca);
  const totalFalta = resumoFaltas.reduce((a, r) => a + r.falta, 0);

  return (
    <div className="bg-slate-800 text-white p-6 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-8 shadow-inner">
      <div className="text-center">
        <span className="text-slate-400 block text-xs uppercase font-bold tracking-widest mb-1">
          Total de Caixas
        </span>
        <span className="text-5xl font-black text-teal-400">{totalItens}</span>
      </div>
      {totalBandejas > 0 && (
        <div className="text-center sm:border-l sm:border-slate-600 sm:pl-8">
          <span className="text-slate-400 block text-xs uppercase font-bold tracking-widest mb-1">
            Trocas
          </span>
          <span className="text-3xl font-black text-slate-300">
            +{totalBandejas} <span className="text-sm font-normal">bdjs</span>
          </span>
        </div>
      )}
      {mostrarEstoque && resumoFaltas.length > 0 && (
        <div className="text-center sm:border-l sm:border-slate-600 sm:pl-8">
          <span className="text-red-400 block text-xs uppercase font-bold tracking-widest mb-1">
            Total Falta
          </span>
          <span className="text-3xl font-black text-red-400">
            {totalFalta} cx
          </span>
        </div>
      )}
    </div>
  );
}
