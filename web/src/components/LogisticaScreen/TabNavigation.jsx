import React from "react";
import { PlusCircle, List } from "lucide-react";

export function TabNavigation({ activeTab, onTabChange, pedidosCount }) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
      <button
        onClick={() => onTabChange("novo")}
        className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${activeTab === "novo" ? "bg-white shadow-sm text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
      >
        <PlusCircle className="w-4 h-4" /> Novo Pedido
      </button>
      <button
        onClick={() => onTabChange("salvos")}
        className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${activeTab === "salvos" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
      >
        <List className="w-4 h-4" /> Salvos ({pedidosCount})
      </button>
    </div>
  );
}
