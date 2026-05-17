import { useState } from "react";
import { createEmptyPedido } from "@/utils/pedidoUtils";
import {
  todasCategorias,
  categoriasFechamento,
  getEstimativaPapelaoIndividual,
  getVermelhasNecessarias,
} from "@/data/config";

export function usePedidoLogic({
  producaoFlash,
  estoqueDisponivelObj,
  savePedidoMutation,
  updateFlashMutation,
}) {
  const [pedidoAtual, setPedidoAtual] = useState(createEmptyPedido());
  const [flashVermelhasPuxadas, setFlashVermelhasPuxadas] = useState([]);

  const puxarVermelhasFlash = () => {
    const novasItens = { ...pedidoAtual.itens };
    const chavesUsadas = [];
    categoriasFechamento.forEach((cat) => {
      const key = `verm_${cat}`;
      const qtdVerm = parseInt(producaoFlash[key]) || 0;
      if (qtdVerm > 0) {
        const papelao = getEstimativaPapelaoIndividual(cat, qtdVerm);
        if (papelao > 0) {
          novasItens[cat] = String((parseInt(novasItens[cat]) || 0) + papelao);
          chavesUsadas.push(key);
        }
      }
    });
    setPedidoAtual((p) => ({ ...p, itens: novasItens }));
    setFlashVermelhasPuxadas(chavesUsadas);
  };

  const calcularResumoFaltas = () => {
    return todasCategorias.reduce((acc, c) => {
      const pedidoCat = parseInt(pedidoAtual.itens[c]) || 0;
      const disp = parseInt(estoqueDisponivelObj[c]) || 0;
      const falta = pedidoCat - disp;
      if (falta > 0) {
        acc.push({
          cat: c,
          falta,
          vermelhas: getVermelhasNecessarias(c, falta),
        });
      }
      return acc;
    }, []);
  };

  const salvarPedido = (onSuccess) => {
    const dh = new Date().toLocaleString("pt-BR");
    const hist = [
      { data: dh, alteracoes: [pedidoAtual.id ? "Atualizado" : "Anotado"] },
      ...(pedidoAtual.historico || []),
    ];
    savePedidoMutation.mutate(
      { ...pedidoAtual, historico: hist },
      {
        onSuccess: () => {
          if (flashVermelhasPuxadas.length > 0 && updateFlashMutation) {
            flashVermelhasPuxadas.forEach((key) => {
              updateFlashMutation.mutate({
                categoria: key,
                quantidade: 0,
                ultima_atualizacao: "",
              });
            });
            setFlashVermelhasPuxadas([]);
          }
          setPedidoAtual(createEmptyPedido());
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  const resetPedido = () => {
    setPedidoAtual(createEmptyPedido());
    setFlashVermelhasPuxadas([]);
  };

  return {
    pedidoAtual,
    setPedidoAtual,
    flashVermelhasPuxadas,
    puxarVermelhasFlash,
    calcularResumoFaltas,
    salvarPedido,
    resetPedido,
  };
}
