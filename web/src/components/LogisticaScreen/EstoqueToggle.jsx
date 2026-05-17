import React from "react";
import { Layers, Database, Zap } from "lucide-react";
import { categoriasEmbalados, categoriasGranel } from "@/data/config";

export function EstoqueToggle({
  mostrarEstoque,
  onChange,
  historicoFechamentos = [],
  fonteEstoque = "disponivel",
  onFonteChange,
  producaoFlash = {},
}) {
  const totalFlash = [...categoriasEmbalados, ...categoriasGranel].reduce(
    (sum, cat) => sum + (parseInt(producaoFlash[cat]) || 0),
    0,
  );

  return (
    <div className="border border-teal-200 rounded-xl overflow-hidden">
      {/* Toggle principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-teal-50">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-bold text-teal-800">
            Espelho de Estoque
          </span>
          <span className="text-[10px] text-teal-600 hidden sm:inline">
            — badge acima do input mostra o estoque disponível; fica vermelho se
            o pedido ultrapassar
          </span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={mostrarEstoque}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 accent-teal-600"
          />
          <span className="text-xs font-bold text-teal-700">
            {mostrarEstoque ? "Ativo" : "Ativar"}
          </span>
        </label>
      </div>

      {/* Seleção de fonte — só aparece quando espelho está ativo */}
      {mostrarEstoque && (
        <div className="px-4 pb-4 pt-3 bg-white border-t border-teal-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Database className="w-3 h-3" /> Fonte do estoque de referência
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Disponível calculado */}
            <button
              onClick={() => onFonteChange && onFonteChange("disponivel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                fonteEstoque === "disponivel"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-teal-700 border-teal-300 hover:bg-teal-50"
              }`}
            >
              📊 Disponível (último fech. − pedidos)
            </button>

            {/* ⚡ Flash como referência */}
            <button
              onClick={() => onFonteChange && onFonteChange("flash")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                fonteEstoque === "flash"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              }`}
            >
              <Zap className="w-3 h-3" /> Flash
              {totalFlash > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    fonteEstoque === "flash"
                      ? "bg-white/30 text-white"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {totalFlash}
                </span>
              )}
            </button>

            {/* Fechamentos salvos */}
            {historicoFechamentos.slice(0, 5).map((fech) => {
              const label = fech.data_hora
                ? fech.data_hora.slice(0, 16)
                : `#${fech.id}`;
              const isSelected = fonteEstoque === String(fech.id);
              return (
                <button
                  key={fech.id}
                  onClick={() =>
                    onFonteChange && onFonteChange(String(fech.id))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    isSelected
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-violet-700 border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {fech.is_parcial ? "⏳" : "📋"} {label}
                </button>
              );
            })}
          </div>

          {fonteEstoque === "flash" && (
            <p className="text-[10px] text-blue-600 font-bold mt-2">
              ⚡ Usando produção Flash como referência — valores aparecem no
              badge acima de cada campo, sem preencher o pedido.
            </p>
          )}
          {fonteEstoque !== "disponivel" && fonteEstoque !== "flash" && (
            <p className="text-[10px] text-violet-600 font-bold mt-2">
              ℹ️ Usando dados brutos do fechamento selecionado — sem descontar
              pedidos em aberto.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
