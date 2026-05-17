import React from "react";
import { Package, PlusCircle, Layers, RotateCcw, Zap } from "lucide-react";
import Accordion from "@/components/Accordion";
import { PedidoFormFields } from "./PedidoFormFields";
import { EstoqueToggle } from "./EstoqueToggle";
import { FlashBanner } from "./FlashBanner";
import { PedidoInputGrid } from "./PedidoInputGrid";
import { BandejasInputGrid } from "./BandejasInputGrid";
import { AgrupamentoOptions } from "./AgrupamentoOptions";
import { ResumoFaltas } from "./ResumoFaltas";
import { PedidoTotals } from "./PedidoTotals";
import { PedidoActions } from "./PedidoActions";
import {
  categoriasEmbalados,
  categoriasAcrilico,
  categoriasGranel,
  todasCategorias,
  categoriasFechamento,
} from "@/data/config";

export function NovoPedidoTab({
  pedidoAtual,
  onPedidoChange,
  mostrarEstoque,
  onEstoqueToggle,
  producaoFlash,
  estoqueDisponivelObj,
  estoqueRef,
  historicoFechamentos,
  fonteEstoque,
  onFonteChange,
  onPuxarFlash,
  flashVermelhasPuxadas,
  resumoFaltas,
  onSave,
  onCopyWhatsApp,
  textoCopiado,
}) {
  const handleFieldChange = (field, value) => {
    onPedidoChange({ ...pedidoAtual, [field]: value });
  };

  const handleItemChange = (categoria, value) => {
    onPedidoChange({
      ...pedidoAtual,
      itens: { ...pedidoAtual.itens, [categoria]: value },
    });
  };

  const handleBandejaChange = (categoria, value) => {
    onPedidoChange({
      ...pedidoAtual,
      bandejas_troca: { ...pedidoAtual.bandejas_troca, [categoria]: value },
    });
  };

  // Ativa Flash como fonte do espelho — NÃO preenche o pedido
  const handleAtivarFlash = () => {
    if (onFonteChange) onFonteChange("flash");
    if (!mostrarEstoque) onEstoqueToggle(true);
  };

  // Use estoqueRef (fonte selecionada) se disponível, senão fallback para estoqueDisponivelObj
  const estoqueAtivo = estoqueRef || estoqueDisponivelObj;

  return (
    <div className="space-y-4">
      <PedidoFormFields pedido={pedidoAtual} onChange={handleFieldChange} />

      <EstoqueToggle
        mostrarEstoque={mostrarEstoque}
        onChange={onEstoqueToggle}
        historicoFechamentos={historicoFechamentos}
        fonteEstoque={fonteEstoque}
        onFonteChange={onFonteChange}
        producaoFlash={producaoFlash}
      />

      <FlashBanner
        categorias={categoriasFechamento}
        producaoFlash={producaoFlash}
        onPuxar={onPuxarFlash}
        flashVermelhasPuxadas={flashVermelhasPuxadas}
      />

      <Accordion
        title="Ovos Embalados"
        icon={Package}
        colorTheme="amber"
        count={
          categoriasEmbalados.filter((c) => pedidoAtual.itens[c] > 0).length
        }
        actionButton={
          <button
            onClick={handleAtivarFlash}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-300 hover:bg-blue-200 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Ver Flash
          </button>
        }
      >
        <PedidoInputGrid
          categorias={categoriasEmbalados}
          valores={pedidoAtual.itens}
          onChange={handleItemChange}
          colorTheme="amber"
          estoqueDisponivelObj={mostrarEstoque ? estoqueAtivo : null}
        />
      </Accordion>

      <Accordion
        title="Acrílico"
        icon={PlusCircle}
        colorTheme="cyan"
        count={
          categoriasAcrilico.filter((c) => pedidoAtual.itens[c] > 0).length
        }
      >
        <PedidoInputGrid
          categorias={categoriasAcrilico}
          valores={pedidoAtual.itens}
          onChange={handleItemChange}
          colorTheme="cyan"
          estoqueDisponivelObj={null}
        />
      </Accordion>

      <Accordion
        title="Ovos a Granel"
        icon={Layers}
        colorTheme="orange"
        count={categoriasGranel.filter((c) => pedidoAtual.itens[c] > 0).length}
        actionButton={
          <button
            onClick={handleAtivarFlash}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-300 hover:bg-blue-200 flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Ver Flash
          </button>
        }
      >
        <PedidoInputGrid
          categorias={categoriasGranel}
          valores={pedidoAtual.itens}
          onChange={handleItemChange}
          colorTheme="orange"
          estoqueDisponivelObj={mostrarEstoque ? estoqueAtivo : null}
        />
      </Accordion>

      <Accordion
        title="Bandejas para Troca"
        icon={RotateCcw}
        colorTheme="slate"
        count={
          todasCategorias.filter((c) => pedidoAtual.bandejas_troca?.[c] > 0)
            .length
        }
      >
        <BandejasInputGrid
          categorias={todasCategorias}
          valores={pedidoAtual.bandejas_troca}
          onChange={handleBandejaChange}
        />
      </Accordion>

      <AgrupamentoOptions
        pedidoAtual={pedidoAtual}
        onChange={handleFieldChange}
      />

      {mostrarEstoque && <ResumoFaltas faltas={resumoFaltas} />}

      <PedidoTotals
        itens={pedidoAtual.itens}
        bandejas_troca={pedidoAtual.bandejas_troca}
        resumoFaltas={resumoFaltas}
        mostrarEstoque={mostrarEstoque}
      />

      <PedidoActions
        pedido={pedidoAtual}
        onSave={onSave}
        onCopyWhatsApp={onCopyWhatsApp}
        textoCopiado={textoCopiado}
        flashVermelhasPuxadas={flashVermelhasPuxadas}
      />
    </div>
  );
}
