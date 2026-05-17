import React from "react";
import { AlertTriangle } from "lucide-react";
import { getVermelhasNecessarias } from "@/data/config";

export function PedidoInputCard({
  categoria,
  valor,
  onChange,
  colorTheme,
  estoqueDisponivel = null,
}) {
  const pedidoCat = parseInt(valor) || 0;
  const disp =
    estoqueDisponivel !== null ? parseInt(estoqueDisponivel) || 0 : null;
  const saldo = disp !== null ? disp - pedidoCat : null;
  const negativo = saldo !== null && saldo < 0;
  const zerado = saldo !== null && saldo === 0 && pedidoCat > 0;
  const sobra = saldo !== null && saldo > 0;
  const vermNecessarias = negativo
    ? getVermelhasNecessarias(categoria, Math.abs(saldo))
    : 0;

  return (
    <div
      className={`bg-white rounded-xl border flex flex-col transition-all ${
        negativo
          ? "border-red-400 shadow-md shadow-red-100"
          : zerado
            ? "border-amber-400"
            : `border-${colorTheme}-200`
      }`}
    >
      {/* Topo: nome + saldo */}
      <div
        className={`flex justify-between items-center px-2 pt-2 pb-1 rounded-t-xl ${
          negativo
            ? "bg-red-50"
            : zerado
              ? "bg-amber-50"
              : sobra
                ? "bg-green-50"
                : `bg-${colorTheme}-50`
        }`}
      >
        <label
          className={`text-[10px] font-black truncate ${
            negativo ? "text-red-800" : `text-${colorTheme}-800`
          }`}
        >
          {categoria}
        </label>

        {/* Badge: mostra ESTOQUE BRUTO — não muda enquanto o usuário digita */}
        {disp !== null && (
          <div
            className={`flex flex-col items-end leading-none ${
              negativo
                ? "text-red-600"
                : zerado
                  ? "text-amber-600"
                  : "text-green-700"
            }`}
          >
            <span className="text-[8px] font-bold opacity-60 uppercase">
              estoque
            </span>
            <span className="text-sm font-black">{disp}</span>
          </div>
        )}
      </div>

      {/* Campo de digitação */}
      <div className="px-2 py-2">
        <input
          type="number"
          min="0"
          placeholder="0"
          value={valor || ""}
          onChange={(e) => onChange(categoria, e.target.value)}
          className={`w-full p-2 border rounded-lg text-center font-black text-lg outline-none focus:ring-2 transition ${
            negativo
              ? "border-red-300 text-red-700 bg-red-50 focus:ring-red-300"
              : zerado
                ? "border-amber-300 text-amber-700 bg-amber-50 focus:ring-amber-300"
                : `border-${colorTheme}-200 text-slate-700 focus:ring-${colorTheme}-300`
          }`}
        />
      </div>

      {/* Alerta de falta com cálculo de vermelhas */}
      {negativo && (
        <div className="mx-2 mb-2 bg-red-600 rounded-lg px-2 py-1.5 text-white">
          <div className="flex items-center gap-1 mb-0.5">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-wide">
              Falta {Math.abs(saldo)} cx papelão
            </span>
          </div>
          <span className="text-[9px] font-bold text-red-100">
            ≈ {vermNecessarias} cx vermelhas a embalar
          </span>
        </div>
      )}

      {zerado && (
        <div className="mx-2 mb-2 bg-amber-500 rounded-lg px-2 py-1 text-white text-center">
          <span className="text-[9px] font-black">Estoque zerado!</span>
        </div>
      )}
    </div>
  );
}
