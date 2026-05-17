import React from "react";
import { ChevronLeft, Truck } from "lucide-react";

export function PedidoHeader({ onBack }) {
  return (
    <header className="bg-teal-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4">
      <button
        onClick={onBack}
        className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm font-bold transition hover:bg-white/30"
      >
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>
      <Truck className="w-10 h-10 text-teal-200 hidden sm:block" />
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-teal-100">Montagem com Espelho de Estoque</p>
      </div>
    </header>
  );
}
