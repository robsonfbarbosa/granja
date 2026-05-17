import React from "react";
import { PedidoInputCard } from "./PedidoInputCard";

export function PedidoInputGrid({
  categorias,
  valores,
  onChange,
  colorTheme,
  estoqueDisponivelObj = null,
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {categorias.map((c) => (
        <PedidoInputCard
          key={c}
          categoria={c}
          valor={valores[c]}
          onChange={onChange}
          colorTheme={colorTheme}
          estoqueDisponivel={
            estoqueDisponivelObj ? estoqueDisponivelObj[c] : null
          }
        />
      ))}
    </div>
  );
}
