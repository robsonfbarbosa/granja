"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  Package,
  Truck,
  CheckSquare,
  Zap,
  ChevronLeft,
  Clock,
  RotateCcw,
  Copy,
  CheckCircle2,
  Layers,
  ShoppingCart,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import TopBar from "@/components/TopBar";
import EmbalamentoScreen from "@/components/EmbalamentoScreen";
import LogisticaScreen from "@/components/LogisticaScreen";
import FechamentoScreen from "@/components/FechamentoScreen";
import {
  categoriasEmbalados,
  categoriasAcrilico,
  categoriasGranel,
  todasCategorias,
  categoriasFechamento,
  getEstimativaPapelaoIndividual,
} from "@/data/config";

// Assinatura automática no final de cada mensagem WhatsApp
const ASSINATURA_WA = "\n\n_Solução criada por Robson Barbosa_";

// Hash ↔ tela interna
const HASH_PARA_TELA = {
  embalados: "embalamento",
  pedidos: "logistica",
  estoque: "fechamento",
  flash: "producao_flash",
};
const TELA_PARA_HASH = {
  embalamento: "embalados",
  logistica: "pedidos",
  fechamento: "estoque",
  producao_flash: "flash",
  menu: "",
};

// Utility functions
const calcTotalSecao = (obj) =>
  Object.values(obj || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);
const formatarData = (d) => {
  if (!d) return "";
  const [y, m, di] = d.split("-");
  return `${di}/${m}/${y}`;
};

export default function GranjaFelixApp() {
  const [telaAtual, setTelaAtualRaw] = useState("menu");
  const [textoCopiado, setTextoCopiado] = useState(false);
  const queryClient = useQueryClient();

  // ── Hash routing: lê o hash ao montar e ao usar botão voltar do browser ──
  useEffect(() => {
    const lerHash = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      setTelaAtualRaw(HASH_PARA_TELA[hash] || "menu");
    };
    lerHash();
    window.addEventListener("popstate", lerHash);
    return () => window.removeEventListener("popstate", lerHash);
  }, []);

  // Navega sem recarregar a página e atualiza a URL para compartilhamento
  const setTelaAtual = useCallback((tela) => {
    const hash = TELA_PARA_HASH[tela] ?? "";
    window.history.pushState(null, "", hash ? `/#${hash}` : "/");
    setTelaAtualRaw(tela);
  }, []);

  // Queries
  const { data: pedidosSalvos = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const res = await fetch("/api/pedidos");
      if (!res.ok) throw new Error("Failed to fetch pedidos");
      return res.json();
    },
  });

  const { data: historicoFechamentos = [] } = useQuery({
    queryKey: ["fechamentos"],
    queryFn: async () => {
      const res = await fetch("/api/fechamentos");
      if (!res.ok) throw new Error("Failed to fetch fechamentos");
      return res.json();
    },
  });

  const { data: flashDataRes = { flashData: {}, flashTime: {} } } = useQuery({
    queryKey: ["flash"],
    queryFn: async () => {
      const res = await fetch("/api/flash");
      if (!res.ok) throw new Error("Failed to fetch flash");
      return res.json();
    },
  });

  const producaoFlash = flashDataRes.flashData || {};
  const producaoFlashTime = flashDataRes.flashTime || {};

  // Mutations
  const savePedidoMutation = useMutation({
    mutationFn: async (pedido) => {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      if (!res.ok) throw new Error("Failed to save pedido");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      toast.success("Pedido salvo com sucesso!");
    },
  });

  const deletePedidoMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/pedidos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pedido");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
  });

  const saveFechamentoMutation = useMutation({
    mutationFn: async (fechamento) => {
      const res = await fetch("/api/fechamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fechamento),
      });
      if (!res.ok) throw new Error("Failed to save fechamento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fechamentos"] });
      toast.success("Fechamento salvo com sucesso!");
    },
  });

  const deleteFechamentoMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/fechamentos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete fechamento");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["fechamentos"] }),
  });

  const updateFlashMutation = useMutation({
    mutationFn: async ({
      categoria,
      quantidade,
      ultima_atualizacao,
      reset,
    }) => {
      const res = await fetch("/api/flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria,
          quantidade,
          ultima_atualizacao,
          reset,
        }),
      });
      if (!res.ok) throw new Error("Failed to update flash");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flash"] }),
  });

  // Local UI State
  const [mostrarEstoque, setMostrarEstoque] = useState(true);
  const [confirmZerar, setConfirmZerar] = useState(false);

  // Logic for Inventory Mirror
  const estoqueDisponivelObj = useMemo(() => {
    const disp = {};
    const ultFech =
      historicoFechamentos.length > 0 ? historicoFechamentos[0] : null;
    todasCategorias.forEach((cat) => {
      let base = 0;
      if (ultFech) {
        if (categoriasGranel.includes(cat)) {
          base =
            (parseInt(ultFech.granel?.[cat]) || 0) +
            (parseInt(ultFech.granel_sem_embalar?.[cat]) || 0);
        } else {
          base = parseInt(ultFech.papelao?.[cat]) || 0;
        }
      }

      let reservado = 0;
      pedidosSalvos.forEach((p) => {
        if (!(p.itens_concluidos || []).includes(cat)) {
          reservado += parseInt(p.itens?.[cat]) || 0;
        }
      });
      disp[cat] = Math.max(0, base - reservado);
    });
    return disp;
  }, [historicoFechamentos, pedidosSalvos]);

  // WhatsApp helpers
  const copiarWa = (texto) => {
    navigator.clipboard.writeText(texto + ASSINATURA_WA).then(() => {
      setTextoCopiado(true);
      setTimeout(() => setTextoCopiado(false), 2000);
      toast.success("Copiado para o WhatsApp!");
    });
  };

  const getWaPedido = (p) => {
    const totalTipos = [
      ...Object.keys(p.itens || {}),
      ...Object.keys(p.bandejas_troca || {}),
    ].length;
    const concluidos = (p.itens_concluidos || []).length;
    let status = "⏳ Pendente";
    if (totalTipos > 0 && concluidos === totalTipos) status = "✅ Concluído";
    else if (concluidos > 0) status = "🛠️ Separando";

    let t = `*📦 PEDIDO: ${p.comprador}*\n*📅 Data:* ${formatarData(p.data_pedido)}\n*Status:* ${status}\n\n`;
    if (p.anotacao) t += `📝 *Obs:* ${p.anotacao}\n\n`;
    const fg = (tit, cats) => {
      let s = "";
      cats.forEach((c) => {
        if (p.itens[c] > 0)
          s += `${(p.itens_concluidos || []).includes(c) ? "✅" : "⏳"} ${c}: ${p.itens[c]} cx\n`;
      });
      return s ? `*${tit}*\n${s}\n` : "";
    };
    t +=
      fg("🥚 EMBALADOS", categoriasEmbalados) +
      fg("🧊 ACRÍLICO", categoriasAcrilico) +
      fg("🥚 GRANEL", categoriasGranel);

    const s12 =
      (parseInt(p.itens["AB12"]) || 0) + (parseInt(p.itens["EB12"]) || 0);
    const s20 =
      (parseInt(p.itens["AB20"]) || 0) + (parseInt(p.itens["EB20"]) || 0);
    const s30 =
      (parseInt(p.itens["AB30"]) || 0) + (parseInt(p.itens["EB30"]) || 0);
    if (
      (p.agrupar12 && s12 > 0) ||
      (p.agrupar20 && s20 > 0) ||
      (p.agrupar30 && s30 > 0)
    ) {
      t += `*🔄 SOMAS (AB+EB):*\n`;
      if (p.agrupar12 && s12 > 0) t += `- Total 12: ${s12} cx\n`;
      if (p.agrupar20 && s20 > 0) t += `- Total 20: ${s20} cx\n`;
      if (p.agrupar30 && s30 > 0) t += `- Total 30: ${s30} cx\n`;
      t += `\n`;
    }
    let tr = "";
    todasCategorias.forEach((c) => {
      if (p.bandejas_troca?.[c] > 0)
        tr += `${(p.itens_concluidos || []).includes(`troca_${c}`) ? "✅" : "⏳"} ${c}: ${p.bandejas_troca[c]} bdjs\n`;
    });
    if (tr) t += `*♻️ TROCAS*\n${tr}\n`;
    return t + `*📊 TOTAL GERAL:* ${calcTotalSecao(p.itens)} caixas\n`;
  };

  const getWaFech = (f) => {
    let t = f.is_parcial
      ? `*⏳ FECHAMENTO PARCIAL* (${f.data_hora})\n\n`
      : `*📋 FECHAMENTO DO DIA* (${f.data_hora})\n\n`;
    const fg = (tit, d) => {
      let s = "";
      let tot = 0;
      Object.entries(d || {}).forEach(([c, q]) => {
        if (q > 0) {
          s += `- ${c}: ${q}\n`;
          tot += parseInt(q);
        }
      });
      return tot > 0 ? `*${tit}* (Total: ${tot})\n${s}\n` : "";
    };
    t +=
      fg("🛒 CARRINHOS (CAIXAS AINDA NÃO EMBALADAS)", f.carrinhos) +
      fg("📦 PAPELÃO PRONTAS", f.papelao);

    const s12 =
      (parseInt(f.papelao?.["AB12"]) || 0) +
      (parseInt(f.papelao?.["EB12"]) || 0);
    const s20 =
      (parseInt(f.papelao?.["AB20"]) || 0) +
      (parseInt(f.papelao?.["EB20"]) || 0);
    const s30 =
      (parseInt(f.papelao?.["AB30"]) || 0) +
      (parseInt(f.papelao?.["EB30"]) || 0);
    if (
      (f.agrupar12 && s12 > 0) ||
      (f.agrupar20 && s20 > 0) ||
      (f.agrupar30 && s30 > 0)
    ) {
      t += `*🔄 SOMAS PAPELÃO (AB+EB):*\n`;
      if (f.agrupar12 && s12 > 0) t += `- Total 12: ${s12} cx\n`;
      if (f.agrupar20 && s20 > 0) t += `- Total 20: ${s20} cx\n`;
      if (f.agrupar30 && s30 > 0) t += `- Total 30: ${s30} cx\n`;
      t += `\n`;
    }

    t +=
      fg("🥚 GRANEL PRONTA", f.granel) +
      fg("🧺 GRANEL S/ EMBALAR", f.granel_sem_embalar);
    let v = "";
    let vt = 0;
    Object.entries(f.vermelhas || {}).forEach(([c, q]) => {
      if (q > 0) {
        v += `- ${c}: ${q} cx _(~${getEstimativaPapelaoIndividual(c, q)} pap)_\n`;
        vt += parseInt(q);
      }
    });
    if (vt > 0) t += `*🟥 VERMELHAS* (Total: ${vt})\n${v}\n`;
    if (f.obs) t += `📝 *Obs:* ${f.obs}\n`;
    return t;
  };

  // Handlers
  const addFlash = (cat, val) => {
    const curr = parseInt(producaoFlash[cat]) || 0;
    const nx = Math.max(0, curr + val);
    if (curr !== nx) {
      updateFlashMutation.mutate({
        categoria: cat,
        quantidade: nx,
        ultima_atualizacao: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  };

  const setFlash = (cat, val) => {
    const nx = Math.max(0, parseInt(val) || 0);
    updateFlashMutation.mutate({
      categoria: cat,
      quantidade: nx,
      ultima_atualizacao: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const zerarFlash = () => {
    updateFlashMutation.mutate({ reset: true });
    setConfirmZerar(false);
  };

  const toggleConcluido = (id, tipo) => {
    const p = pedidosSalvos.find((p) => p.id === id);
    if (!p) return;
    const conc = p.itens_concluidos || [];
    const isConc = conc.includes(tipo);
    const nConc = isConc ? conc.filter((i) => i !== tipo) : [...conc, tipo];
    savePedidoMutation.mutate({
      ...p,
      itens_concluidos: nConc,
      historico: [
        {
          data: new Date().toLocaleString("pt-BR"),
          alteracoes: [`Lote ${tipo} -> ${isConc ? "pendente" : "concluído"}`],
        },
        ...(p.historico || []),
      ],
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {telaAtual === "menu" && (
          <div className="space-y-6 animate-in">
            <TopBar />
            <header className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center">
              <LayoutGrid className="w-12 h-12 text-amber-400 mb-4" />
              <h1 className="text-3xl font-bold">Granja Felix v1.0</h1>
              <p className="text-amber-400 text-sm mt-1">por Robson Barbosa</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setTelaAtual("embalamento")}
                className="bg-white p-6 rounded-2xl border hover:border-amber-400 shadow-sm flex flex-col items-center transition group relative"
              >
                <div className="bg-amber-100 p-4 rounded-full mb-3 group-hover:scale-110 transition">
                  <Package className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="font-bold text-slate-700 text-lg">Embalados</h2>
                <span className="text-xs text-slate-500 mt-1">
                  Estoque, Etiquetas e Cálculos
                </span>
                <span className="text-[10px] text-slate-300 mt-2 font-mono">
                  #embalados
                </span>
              </button>
              <button
                onClick={() => setTelaAtual("logistica")}
                className="bg-white p-6 rounded-2xl border hover:border-teal-400 shadow-sm flex flex-col items-center transition group relative"
              >
                <div className="bg-teal-100 p-4 rounded-full mb-3 group-hover:scale-110 transition">
                  <Truck className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="font-bold text-slate-700 text-lg">Pedidos</h2>
                <span className="text-xs text-slate-500 mt-1">
                  Montagem com Espelho de Estoque
                </span>
                <span className="text-[10px] text-slate-300 mt-2 font-mono">
                  #pedidos
                </span>
              </button>
              <button
                onClick={() => setTelaAtual("fechamento")}
                className="bg-white p-6 rounded-2xl border hover:border-violet-400 shadow-sm flex flex-col items-center transition group relative"
              >
                <div className="bg-violet-100 p-4 rounded-full mb-3 group-hover:scale-110 transition">
                  <CheckSquare className="w-8 h-8 text-violet-600" />
                </div>
                <h2 className="font-bold text-slate-700 text-lg">
                  Estoque de Ovos
                </h2>
                <span className="text-xs text-slate-500 mt-1">
                  Controle de Estoque e Fechamento
                </span>
                <span className="text-[10px] text-slate-300 mt-2 font-mono">
                  #estoque
                </span>
              </button>
              <button
                onClick={() => setTelaAtual("producao_flash")}
                className="bg-white p-6 rounded-2xl border hover:border-blue-400 shadow-sm flex flex-col items-center transition group relative"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:scale-110 transition">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="font-bold text-slate-700 text-lg">
                  Produção Flash
                </h2>
                <span className="text-xs text-slate-500 mt-1">
                  Contador Rápido ao Vivo
                </span>
                <span className="text-[10px] text-slate-300 mt-2 font-mono">
                  #flash
                </span>
              </button>
            </div>
          </div>
        )}

        {telaAtual === "producao_flash" && (
          <div className="space-y-6 animate-in pb-20">
            {/* compute main total (embalados + acrilico + granel only) */}
            {(() => {
              const totalPrincipalFlash = [
                ...categoriasEmbalados,
                ...categoriasAcrilico,
                ...categoriasGranel,
              ].reduce(
                (sum, cat) => sum + (parseInt(producaoFlash[cat]) || 0),
                0,
              );
              const totalVermelhasFlash = categoriasFechamento.reduce(
                (sum, cat) =>
                  sum + (parseInt(producaoFlash[`verm_${cat}`]) || 0),
                0,
              );
              const totalCarrinhosFlash = categoriasFechamento.reduce(
                (sum, cat) =>
                  sum + (parseInt(producaoFlash[`carr_${cat}`]) || 0),
                0,
              );
              return (
                <>
                  <header className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setTelaAtual("menu")}
                        className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm font-bold transition hover:bg-white/30"
                      >
                        <ChevronLeft className="w-4 h-4" /> Voltar
                      </button>
                      <div className="flex items-center gap-2">
                        <Zap className="text-yellow-300 w-8 h-8" />{" "}
                        <h1 className="text-xl font-bold hidden sm:block">
                          Flash
                        </h1>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      {totalVermelhasFlash > 0 && (
                        <div className="bg-red-500/80 px-3 py-2 rounded-xl text-center">
                          <span className="block text-[9px] uppercase font-bold text-red-100">
                            Verm.
                          </span>
                          <span className="text-lg font-black">
                            {totalVermelhasFlash}
                          </span>
                        </div>
                      )}
                      {totalCarrinhosFlash > 0 && (
                        <div className="bg-emerald-500/80 px-3 py-2 rounded-xl text-center">
                          <span className="block text-[9px] uppercase font-bold text-emerald-100">
                            Carr.
                          </span>
                          <span className="text-lg font-black">
                            {totalCarrinhosFlash}
                          </span>
                        </div>
                      )}
                      <div className="text-right bg-black/20 px-4 py-2 rounded-xl">
                        <span className="block text-[10px] uppercase font-bold text-blue-200">
                          Produção
                        </span>
                        <span className="text-2xl font-black">
                          {totalPrincipalFlash}
                        </span>
                      </div>
                    </div>
                  </header>

                  {[
                    {
                      t: "Ovos Embalados",
                      c: categoriasEmbalados,
                      col: "amber",
                      icon: Package,
                      prefix: "",
                    },
                    {
                      t: "Acrílico",
                      c: categoriasAcrilico,
                      col: "cyan",
                      icon: LayoutGrid,
                      prefix: "",
                    },
                    {
                      t: "Ovos Granel",
                      c: categoriasGranel,
                      col: "orange",
                      icon: Layers,
                      prefix: "",
                    },
                    {
                      t: "🟥 Caixas Vermelhas",
                      c: categoriasFechamento,
                      col: "red",
                      icon: Package,
                      prefix: "verm_",
                      isVermelha: true,
                      desc: "Cada cx vermelha converte em papelão conforme a regra. Puxável para Pedidos já convertido.",
                    },
                    {
                      t: "🛒 Carrinhos (A Embalar)",
                      c: categoriasFechamento,
                      col: "emerald",
                      icon: ShoppingCart,
                      prefix: "carr_",
                      desc: "Caixas aguardando embalagem → Puxável para Estoque de Ovos",
                    },
                  ].map((g) => (
                    <div
                      key={g.t}
                      className={`bg-${g.col}-50 p-4 rounded-2xl border border-${g.col}-200 shadow-sm`}
                    >
                      <div className="mb-4">
                        <h3
                          className={`text-${g.col}-800 font-bold text-lg flex items-center gap-2`}
                        >
                          <g.icon className="w-5 h-5" /> {g.t}
                        </h3>
                        {g.desc && (
                          <p
                            className={`text-[10px] text-${g.col}-600 mt-0.5 font-medium`}
                          >
                            {g.desc}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {g.c.map((cat) => {
                          const flashKey = `${g.prefix}${cat}`;
                          const qty = parseInt(producaoFlash[flashKey]) || 0;
                          const papelaoEst = g.isVermelha
                            ? getEstimativaPapelaoIndividual(cat, qty)
                            : 0;
                          return (
                            <div
                              key={flashKey}
                              className={`bg-white border border-${g.col}-200 p-3 rounded-xl flex flex-col items-center hover:shadow-md transition`}
                            >
                              <span
                                className={`font-bold text-${g.col}-800 text-xs mb-1`}
                              >
                                {cat}
                              </span>
                              <span
                                className={`text-3xl font-black text-${g.col}-600`}
                              >
                                {qty}
                              </span>
                              {/* Papelão estimate — vermelhas only */}
                              {g.isVermelha && (
                                <div
                                  className={`w-full mt-1 mb-1 rounded-lg py-1 px-2 text-center ${qty > 0 ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-100"}`}
                                >
                                  <span className="text-[9px] text-slate-500 block leading-tight">
                                    rende
                                  </span>
                                  <span
                                    className={`text-sm font-black ${qty > 0 ? "text-amber-700" : "text-slate-300"}`}
                                  >
                                    {papelaoEst} pap
                                  </span>
                                </div>
                              )}
                              <div className="h-5 flex justify-center mb-2 mt-0.5">
                                {producaoFlashTime[flashKey] && qty > 0 && (
                                  <span
                                    className={`text-[10px] bg-${g.col}-100 text-${g.col}-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold`}
                                  >
                                    <Clock className="w-3 h-3" />{" "}
                                    {producaoFlashTime[flashKey]}
                                  </span>
                                )}
                              </div>
                              {/* +/- buttons */}
                              <div className="flex gap-1 w-full justify-between">
                                <button
                                  onClick={() => addFlash(flashKey, -1)}
                                  className="bg-red-50 text-red-600 px-2 py-1.5 rounded-lg text-xs font-bold border border-red-100"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => addFlash(flashKey, 1)}
                                  className={`bg-${g.col}-100 text-${g.col}-700 flex-1 py-1.5 rounded-lg text-xs font-bold`}
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => addFlash(flashKey, 5)}
                                  className={`bg-${g.col}-200 text-${g.col}-800 flex-1 py-1.5 rounded-lg text-xs font-bold`}
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => addFlash(flashKey, 30)}
                                  className={`bg-${g.col}-300 text-${g.col}-900 flex-1 py-1.5 rounded-lg text-xs font-bold`}
                                >
                                  +30
                                </button>
                              </div>
                              {/* Direct input */}
                              <input
                                type="number"
                                min="0"
                                placeholder="Digitar..."
                                onBlur={(e) => {
                                  if (e.target.value !== "") {
                                    setFlash(flashKey, e.target.value);
                                    e.target.value = "";
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    e.target.value !== ""
                                  ) {
                                    setFlash(flashKey, e.target.value);
                                    e.target.value = "";
                                    e.target.blur();
                                  }
                                }}
                                className={`w-full mt-2 p-1.5 border-2 border-dashed border-${g.col}-200 rounded-lg text-center text-xs font-bold outline-none focus:border-${g.col}-400 bg-${g.col}-50 text-${g.col}-800 placeholder-${g.col}-300`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="max-w-4xl mx-auto flex justify-between gap-4">
                      {!confirmZerar ? (
                        <button
                          onClick={() => setConfirmZerar(true)}
                          className="flex gap-2 items-center px-4 py-3 bg-slate-100 font-bold rounded-xl text-slate-600"
                        >
                          <RotateCcw className="w-5 h-5" />{" "}
                          <span className="hidden sm:inline">Zerar Flash</span>
                        </button>
                      ) : (
                        <div className="flex gap-2 animate-in slide-in-from-left-4">
                          <button
                            onClick={zerarFlash}
                            className="bg-red-600 text-white font-bold px-4 py-3 rounded-xl shadow-md"
                          >
                            Sim, Zerar
                          </button>
                          <button
                            onClick={() => setConfirmZerar(false)}
                            className="bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl"
                          >
                            X
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          let txt = `*⚡ PRODUÇÃO FLASH*\nGerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
                          let tot = 0;
                          [
                            {
                              t: "📦 EMBALADOS",
                              c: categoriasEmbalados,
                              prefix: "",
                            },
                            {
                              t: "🧊 ACRÍLICO",
                              c: categoriasAcrilico,
                              prefix: "",
                            },
                            { t: "🥚 GRANEL", c: categoriasGranel, prefix: "" },
                          ].forEach((g) => {
                            let s = "";
                            g.c.forEach((c) => {
                              const key = `${g.prefix}${c}`;
                              if (producaoFlash[key] > 0) {
                                s += `- ${c}: ${producaoFlash[key]} cx\n`;
                                tot += producaoFlash[key];
                              }
                            });
                            if (s) txt += `*${g.t}*\n${s}\n`;
                          });
                          txt += `*📊 TOTAL PRODUÇÃO:* ${tot} cx\n\n`;
                          // Vermelhas
                          let sv = "";
                          let totV = 0;
                          let totPapVerm = 0;
                          categoriasFechamento.forEach((c) => {
                            const key = `verm_${c}`;
                            if (producaoFlash[key] > 0) {
                              const pap = getEstimativaPapelaoIndividual(
                                c,
                                producaoFlash[key],
                              );
                              sv += `- ${c}: ${producaoFlash[key]} cx verm → ~${pap} papelão\n`;
                              totV += producaoFlash[key];
                              totPapVerm += pap;
                            }
                          });
                          if (sv)
                            txt += `*🟥 CAIXAS VERMELHAS* (${totV} cx → ~${totPapVerm} papelão)\n${sv}\n`;
                          // Carrinhos
                          let sc = "";
                          let totC = 0;
                          categoriasFechamento.forEach((c) => {
                            const key = `carr_${c}`;
                            if (producaoFlash[key] > 0) {
                              sc += `- ${c}: ${producaoFlash[key]} cx\n`;
                              totC += producaoFlash[key];
                            }
                          });
                          if (sc)
                            txt += `*🛒 CARRINHOS (A EMBALAR)* (Total: ${totC})\n${sc}\n`;
                          copiarWa(txt);
                        }}
                        disabled={
                          [
                            ...categoriasEmbalados,
                            ...categoriasAcrilico,
                            ...categoriasGranel,
                          ].every((c) => !producaoFlash[c]) &&
                          categoriasFechamento.every(
                            (c) =>
                              !producaoFlash[`verm_${c}`] &&
                              !producaoFlash[`carr_${c}`],
                          )
                        }
                        className={`flex-1 flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl shadow-md ${
                          totalPrincipalFlash > 0 ||
                          totalVermelhasFlash > 0 ||
                          totalCarrinhosFlash > 0
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-slate-300 text-slate-500"
                        }`}
                      >
                        {textoCopiado ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}{" "}
                        {textoCopiado ? "Copiado!" : "Copiar Resumo"}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {telaAtual === "embalamento" && (
          <EmbalamentoScreen
            setTelaAtual={setTelaAtual}
            copiarWa={copiarWa}
            textoCopiado={textoCopiado}
          />
        )}

        {telaAtual === "logistica" && (
          <LogisticaScreen
            setTelaAtual={setTelaAtual}
            copiarWa={copiarWa}
            textoCopiado={textoCopiado}
            pedidosSalvos={pedidosSalvos}
            savePedidoMutation={savePedidoMutation}
            deletePedidoMutation={deletePedidoMutation}
            producaoFlash={producaoFlash}
            estoqueDisponivelObj={estoqueDisponivelObj}
            mostrarEstoque={mostrarEstoque}
            setMostrarEstoque={setMostrarEstoque}
            getWaPedido={getWaPedido}
            toggleConcluido={toggleConcluido}
            updateFlashMutation={updateFlashMutation}
            historicoFechamentos={historicoFechamentos}
          />
        )}

        {telaAtual === "fechamento" && (
          <FechamentoScreen
            setTelaAtual={setTelaAtual}
            copiarWa={copiarWa}
            textoCopiado={textoCopiado}
            historicoFechamentos={historicoFechamentos}
            saveFechamentoMutation={saveFechamentoMutation}
            deleteFechamentoMutation={deleteFechamentoMutation}
            producaoFlash={producaoFlash}
            getWaFech={getWaFech}
            getEstimativaPapelaoIndividual={getEstimativaPapelaoIndividual}
          />
        )}
      </div>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
