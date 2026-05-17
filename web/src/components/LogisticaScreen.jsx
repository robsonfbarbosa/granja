"use client";
import React, { useState, useMemo } from "react";
import { PedidoHeader } from "./LogisticaScreen/PedidoHeader";
import { TabNavigation } from "./LogisticaScreen/TabNavigation";
import { NovoPedidoTab } from "./LogisticaScreen/NovoPedidoTab";
import { SavedPedidosList } from "./LogisticaScreen/SavedPedidosList";
import { usePedidoLogic } from "@/hooks/usePedidoLogic";
import {
  categoriasFechamento,
  categoriasGranel,
  todasCategorias,
  getVermelhasNecessarias,
} from "@/data/config";

export default function LogisticaScreen({
  setTelaAtual,
  copiarWa,
  textoCopiado,
  pedidosSalvos,
  savePedidoMutation,
  deletePedidoMutation,
  producaoFlash,
  estoqueDisponivelObj,
  mostrarEstoque,
  setMostrarEstoque,
  getWaPedido,
  toggleConcluido,
  updateFlashMutation,
  historicoFechamentos = [],
}) {
  const [abaLogistica, setAbaLogistica] = useState("novo");
  // "disponivel" = calculado (último fech − pedidos abertos)
  // string de número = id do fechamento escolhido manualmente
  const [fonteEstoque, setFonteEstoque] = useState("disponivel");

  // Estoque de referência conforme fonte selecionada
  const estoqueRef = useMemo(() => {
    if (fonteEstoque === "disponivel") return estoqueDisponivelObj;

    // ⚡ Produção Flash como referência
    if (fonteEstoque === "flash") {
      const ref = {};
      todasCategorias.forEach((cat) => {
        ref[cat] = parseInt(producaoFlash[cat]) || 0;
      });
      return ref;
    }

    // Fechamento específico selecionado
    const fech = historicoFechamentos.find(
      (f) => f.id === parseInt(fonteEstoque),
    );
    if (!fech) return estoqueDisponivelObj;
    const ref = {};
    todasCategorias.forEach((cat) => {
      if (categoriasGranel.includes(cat)) {
        ref[cat] =
          (parseInt(fech.granel?.[cat]) || 0) +
          (parseInt(fech.granel_sem_embalar?.[cat]) || 0);
      } else {
        ref[cat] = parseInt(fech.papelao?.[cat]) || 0;
      }
    });
    return ref;
  }, [fonteEstoque, estoqueDisponivelObj, historicoFechamentos, producaoFlash]);

  const {
    pedidoAtual,
    setPedidoAtual,
    flashVermelhasPuxadas,
    puxarVermelhasFlash,
    salvarPedido,
    resetPedido,
  } = usePedidoLogic({
    producaoFlash,
    estoqueDisponivelObj: estoqueRef,
    savePedidoMutation,
    updateFlashMutation,
  });

  // Resumo de faltas usando a fonte selecionada
  const resumoFaltas = useMemo(() => {
    return todasCategorias.reduce((acc, c) => {
      const pedidoCat = parseInt(pedidoAtual.itens?.[c]) || 0;
      const disp = parseInt(estoqueRef[c]) || 0;
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
  }, [pedidoAtual.itens, estoqueRef]);

  const handleTabChange = (tab) => {
    setAbaLogistica(tab);
    if (tab === "novo" && pedidoAtual.id) {
      resetPedido();
    }
  };

  const handleSalvarPedido = () => {
    salvarPedido(() => setAbaLogistica("salvos"));
  };

  const handleCopyAll = () => {
    let t = `*📊 BACKUP DE PEDIDOS*\nGerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
    pedidosSalvos.forEach(
      (p) => (t += getWaPedido(p) + `\n-------------------\n\n`),
    );
    copiarWa(t);
  };

  const handleEditPedido = (pedido) => {
    setPedidoAtual(pedido);
    setAbaLogistica("novo");
  };

  return (
    <div className="space-y-6">
      <PedidoHeader onBack={() => setTelaAtual("menu")} />

      <div className="bg-white p-6 rounded-2xl border shadow-sm border-teal-100">
        <TabNavigation
          activeTab={abaLogistica}
          onTabChange={handleTabChange}
          pedidosCount={pedidosSalvos.length}
        />

        {abaLogistica === "novo" && (
          <NovoPedidoTab
            pedidoAtual={pedidoAtual}
            onPedidoChange={setPedidoAtual}
            mostrarEstoque={mostrarEstoque}
            onEstoqueToggle={setMostrarEstoque}
            producaoFlash={producaoFlash}
            estoqueDisponivelObj={estoqueDisponivelObj}
            estoqueRef={estoqueRef}
            historicoFechamentos={historicoFechamentos}
            fonteEstoque={fonteEstoque}
            onFonteChange={setFonteEstoque}
            onPuxarFlash={puxarVermelhasFlash}
            flashVermelhasPuxadas={flashVermelhasPuxadas}
            resumoFaltas={resumoFaltas}
            onSave={handleSalvarPedido}
            onCopyWhatsApp={() => copiarWa(getWaPedido(pedidoAtual))}
            textoCopiado={textoCopiado}
          />
        )}

        {abaLogistica === "salvos" && (
          <SavedPedidosList
            pedidos={pedidosSalvos}
            onToggleConcluido={toggleConcluido}
            onCopyWhatsApp={(p) => copiarWa(getWaPedido(p))}
            onEdit={handleEditPedido}
            onDelete={(id) => deletePedidoMutation.mutate(id)}
            onCopyAll={handleCopyAll}
            textoCopiado={textoCopiado}
          />
        )}
      </div>
    </div>
  );
}
