"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  Layers,
  Inbox,
  Target,
  Printer,
  History,
  Package,
  Calculator,
  Plus,
  RotateCcw,
  Save,
  Copy,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { getConfig } from "@/data/config";

export default function EmbalamentoScreen({
  setTelaAtual,
  copiarWa,
  textoCopiado,
}) {
  const [tipoBandeja, setTipoBandeja] = useState("20_30");
  const [modoCalculo, setModoCalculo] = useState("estoque");
  const [qtdCar, setQtdCar] = useState("");
  const [qtdPla, setQtdPla] = useState("");
  const [qtdSol, setQtdSol] = useState("");
  const [pedPap, setPedPap] = useState("");
  const [cxEtiq, setCxEtiq] = useState("");
  const [histEmb, setHistEmb] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ag_hist_emb") || "[]");
    }
    return [];
  });
  const [mostrarCalcEstoque, setMostrarCalcEstoque] = useState(false);
  const [mostrarCalcPedido, setMostrarCalcPedido] = useState(false);
  const [valSoma, setValSoma] = useState("");
  const [valorSomaPedido, setValorSomaPedido] = useState("");

  const config = getConfig(tipoBandeja);

  const calcEstoque = () => {
    const tot =
      (parseInt(qtdPla) || 0) * config.mult +
      (parseInt(qtdSol) || 0) +
      (tipoBandeja !== "medio" && tipoBandeja !== "eb6"
        ? (parseInt(qtdCar) || 0) * config.bdjCarro
        : 0);
    let pap = 0,
      sob = 0;
    if (tipoBandeja === "eb6") {
      pap = Math.floor((tot * 5) / 48);
      sob = Math.round((tot * 5) % 48);
    } else {
      pap = Math.floor(tot / config.divPap);
      sob = Math.round(tot % config.divPap);
    }
    return { pap, sob };
  };
  const { pap: rPap, sob: rSob } = calcEstoque();

  const calcPedidoInfo = () => {
    const q = parseInt(pedPap) || 0;
    if (tipoBandeja === "eb6") {
      const b = Math.ceil((q * 48) / 5);
      return { cx: Math.floor(b / 4), sol: b % 4, sobraEb6: b * 5 - q * 48 };
    }
    const bp = Math.round(q * config.divPap);
    return {
      cx: Math.floor(bp / config.mult),
      sol: Math.round(bp % config.mult),
      sobraEb6: 0,
    };
  };
  const { cx: buscarCx, sol: buscarSoltas, sobraEb6 } = calcPedidoInfo();

  const calcEtiq = (regra, cx) => {
    const c = parseInt(cx) || 0;
    if (c <= 0) return 0;
    if (regra === "12") return c * 4;
    if (regra === "eb6") return c * 6;
    if (regra === "medio") return Math.ceil((c * 13) / 5);
    return c * 2; // 20_30
  };

  const saveHistory = (item) => {
    const newHist = [item, ...histEmb];
    setHistEmb(newHist);
    localStorage.setItem("ag_hist_emb", JSON.stringify(newHist));
  };

  return (
    <div className="space-y-6 animate-in">
      <header className="bg-amber-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <button
          onClick={() => setTelaAtual("menu")}
          className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm font-bold transition hover:bg-white/30"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <Layers className="text-amber-200 w-8 h-8 hidden sm:block" />
        <div>
          <h1 className="text-2xl font-bold">Embalados</h1>
          <p className="text-xs text-amber-100">Estoque, Etiquetas, Pedidos</p>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6 pb-6 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">
            Regra de Embalamento
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "20_30",
                t: "Bandejas 20/30",
                d: "Plástico: 8 | Papelão: 10",
                c: "slate",
              },
              {
                id: "12",
                t: "Bandejas de 12",
                d: "Verm: 16 | Papelão: 20",
                c: "red",
              },
              {
                id: "medio",
                t: "Ovos Médios",
                d: "Verm: 8 | Papelão: 13",
                c: "orange",
              },
              {
                id: "eb6",
                t: "Bandejas EB6",
                d: "Verm: 4 (de 30) | Papelão: 48",
                c: "cyan",
              },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setTipoBandeja(b.id)}
                className={`p-3 rounded-xl border text-left flex flex-col transition ${tipoBandeja === b.id ? `bg-${b.c}-600 border-${b.c}-600 text-white shadow-md` : `bg-white border-slate-200 hover:bg-slate-50`}`}
              >
                <span
                  className={`font-bold text-sm ${tipoBandeja === b.id ? "text-white" : "text-slate-700"}`}
                >
                  {b.t}
                </span>
                <span
                  className={`text-[10px] mt-1 ${tipoBandeja === b.id ? "text-white/80" : "text-slate-500"}`}
                >
                  {b.d}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {[
            { id: "estoque", t: "Estoque", i: <Inbox className="w-4 h-4" /> },
            { id: "pedido", t: "Pedido", i: <Target className="w-4 h-4" /> },
            {
              id: "etiquetas",
              t: "Etiquetas",
              i: <Printer className="w-4 h-4" />,
            },
            {
              id: "historico",
              t: "Histórico",
              i: <History className="w-4 h-4" />,
            },
          ].map((tb) => (
            <button
              key={tb.id}
              onClick={() => setModoCalculo(tb.id)}
              className={`flex-1 py-3 px-4 min-w-max text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${modoCalculo === tb.id ? "bg-white shadow-sm text-amber-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tb.i} {tb.t}
            </button>
          ))}
        </div>

        {modoCalculo === "estoque" && (
          <div className="animate-in space-y-6">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Inbox className="text-amber-500 w-5 h-5" /> O que tem no estoque?
            </h2>
            <div
              className={`grid grid-cols-1 ${config.bdjCarro > 0 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}
            >
              {config.bdjCarro > 0 && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <label className="text-xs font-bold text-emerald-800 block mb-2">
                    Carrinhos (Cheios){" "}
                    <span className="block font-normal text-[10px] mt-0.5 text-emerald-600">
                      1 carro = {config.bdjCarro} bdjs
                    </span>
                  </label>
                  <input
                    type="number"
                    value={qtdCar}
                    onChange={(e) => setQtdCar(e.target.value)}
                    className="w-full p-3 bg-white rounded-lg border border-emerald-300 text-center font-bold text-xl outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="0"
                  />
                </div>
              )}
              <div
                className={`bg-${config.cor}-50 p-4 rounded-xl border border-${config.cor}-200`}
              >
                <div className="flex justify-between items-start mb-2">
                  <label
                    className={`text-xs font-bold text-${config.cor}-800 block`}
                  >
                    {config.nomeCx}{" "}
                    <span
                      className={`block font-normal text-[10px] mt-0.5 text-${config.cor}-600`}
                    >
                      1 cx = {config.multPla} bdjs
                    </span>
                  </label>
                  <button
                    onClick={() => setMostrarCalcEstoque(!mostrarCalcEstoque)}
                    className={`p-1.5 rounded-lg transition border ${mostrarCalcEstoque ? `bg-${config.cor}-200 border-${config.cor}-300 text-${config.cor}-800` : `bg-white text-${config.cor}-500 border-${config.cor}-200`}`}
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
                {mostrarCalcEstoque ? (
                  <div className="bg-white p-3 rounded-xl shadow-inner border space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setQtdPla(String((parseInt(qtdPla) || 0) + 1))
                        }
                        className={`bg-${config.cor}-100 text-${config.cor}-700 flex-1 py-2 rounded-lg font-bold text-sm`}
                      >
                        +1
                      </button>
                      <button
                        onClick={() =>
                          setQtdPla(String((parseInt(qtdPla) || 0) + 5))
                        }
                        className={`bg-${config.cor}-100 text-${config.cor}-700 flex-1 py-2 rounded-lg font-bold text-sm`}
                      >
                        +5
                      </button>
                      <button
                        onClick={() =>
                          setQtdPla(String((parseInt(qtdPla) || 0) + 10))
                        }
                        className={`bg-${config.cor}-100 text-${config.cor}-700 flex-1 py-2 rounded-lg font-bold text-sm`}
                      >
                        +10
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={valSoma}
                        onChange={(e) => setValSoma(e.target.value)}
                        placeholder="Outra..."
                        className="w-full p-2 rounded-lg border text-center text-sm outline-none bg-slate-50"
                      />
                      <button
                        onClick={() => {
                          if (parseInt(valSoma) > 0) {
                            setQtdPla(
                              String(
                                (parseInt(qtdPla) || 0) + parseInt(valSoma),
                              ),
                            );
                            setValSoma("");
                          }
                        }}
                        className={`bg-${config.cor}-500 text-white px-4 rounded-lg font-bold shadow-sm`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t text-sm mt-2">
                      <span className="font-bold text-slate-600">
                        Total:{" "}
                        <span className={`text-${config.cor}-600 text-lg`}>
                          {qtdPla || 0}
                        </span>
                      </span>
                      <button
                        onClick={() => setQtdPla("")}
                        className="text-red-500 font-bold flex items-center gap-1 text-[10px] uppercase"
                      >
                        <RotateCcw className="w-3 h-3" /> Zerar
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    placeholder="Ex: 5"
                    value={qtdPla}
                    onChange={(e) => setQtdPla(e.target.value)}
                    className={`w-full p-3 bg-white rounded-lg border border-${config.cor}-300 text-center font-bold text-xl outline-none focus:ring-2 focus:ring-${config.cor}-400`}
                  />
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {tipoBandeja === "eb6"
                    ? "Bandejas de 30 Soltas"
                    : "Bandejas Soltas"}{" "}
                  <span className="block font-normal text-[10px] mt-0.5 text-slate-500">
                    Extras no estoque
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 3"
                  value={qtdSol}
                  onChange={(e) => setQtdSol(e.target.value)}
                  className="w-full p-3 bg-white rounded-lg border border-slate-300 text-center font-bold text-xl outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mt-8">
              <Package className="text-green-600 w-5 h-5" /> Como fica no
              Papelão?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-100 border border-amber-300 p-6 rounded-xl text-center flex flex-col justify-center">
                <span className="text-amber-900 font-bold mb-1">
                  Caixas de Papelão (Prontas)
                </span>
                <div className="text-6xl font-black text-amber-600 mb-2">
                  {rPap}
                </div>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-3 py-1 rounded-full self-center">
                  1 cx = {config.divPap}{" "}
                  {tipoBandeja === "eb6" ? "bandejas EB6" : "bdjs"}
                </span>
              </div>
              <div
                className={`border p-6 rounded-xl text-center flex flex-col justify-center ${rSob > 0 ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200"}`}
              >
                <span
                  className={`${rSob > 0 ? "text-slate-800" : "text-slate-500"} font-bold mb-1`}
                >
                  Bandejas que Sobram
                </span>
                <div
                  className={`text-6xl font-black mb-2 ${rSob > 0 ? "text-slate-700" : "text-slate-300"}`}
                >
                  {rSob}
                </div>
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full self-center ${rSob > 0 ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-500"}`}
                >
                  {rSob > 0
                    ? `Faltam ${config.divPap - rSob} para +1 papelão`
                    : "Nenhuma solta"}
                </span>
              </div>
            </div>
            {(parseInt(qtdCar) || parseInt(qtdPla) || parseInt(qtdSol)) > 0 && (
              <button
                onClick={() => {
                  saveHistory({
                    id: Date.now(),
                    dataHora: new Date().toLocaleString("pt-BR"),
                    t: "Estoque",
                    regra: config.label,
                    nCx: config.nomeCx,
                    entC: qtdCar,
                    entP: qtdPla,
                    entS: qtdSol,
                    rPap: rPap,
                    rSob: rSob,
                  });
                  setQtdCar("");
                  setQtdPla("");
                  setQtdSol("");
                  setModoCalculo("historico");
                }}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition mt-6"
              >
                <Save className="w-5 h-5" /> Salvar Resultado
              </button>
            )}
          </div>
        )}

        {modoCalculo === "etiquetas" && (
          <div className="animate-in space-y-4">
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
              <label className="block text-indigo-900 font-bold mb-4 text-lg">
                Quantidade de Caixas de Papelão{" "}
                <span className="text-xs font-normal text-indigo-600 block mt-1">
                  Regra ativa: {config.label}
                </span>
              </label>
              <input
                type="number"
                placeholder="Ex: 10"
                value={cxEtiq}
                onChange={(e) => setCxEtiq(e.target.value)}
                className="w-full p-4 border-2 border-indigo-300 rounded-xl text-center text-4xl font-black text-indigo-900 outline-none focus:border-indigo-500 mb-6 bg-white"
              />
              <div className="flex flex-col sm:flex-row justify-between items-center border-t border-indigo-200 pt-6 gap-4">
                <div className="text-center sm:text-left">
                  <span className="block text-indigo-700 font-bold text-sm uppercase tracking-wide">
                    Folhas A4 a Imprimir
                  </span>
                  <span className="text-5xl font-black text-indigo-600">
                    {calcEtiq(tipoBandeja, cxEtiq)}
                  </span>
                  <span className="block text-[10px] text-indigo-500 mt-1">
                    {tipoBandeja === "12"
                      ? "(4 fls/cx)"
                      : tipoBandeja === "eb6"
                        ? "(6 fls/cx)"
                        : tipoBandeja === "medio"
                          ? "(Aprox. 2.6 fls/cx)"
                          : "(2 fls/cx)"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    copiarWa(
                      `*Pedido de Etiquetas*\nOlá! Por favor, imprimir *${calcEtiq(tipoBandeja, cxEtiq)} folhas A4* de etiquetas (referente a ${cxEtiq} caixas de papelão produzidas na regra de ${config.label}).`,
                    )
                  }
                  disabled={!cxEtiq || parseInt(cxEtiq) <= 0}
                  className={`w-full sm:w-auto px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition ${cxEtiq && parseInt(cxEtiq) > 0 ? (textoCopiado ? "bg-green-500 text-white" : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100") : "bg-slate-200 text-slate-400"}`}
                >
                  {textoCopiado ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Printer className="w-5 h-5" />
                  )}{" "}
                  Copiar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {modoCalculo === "pedido" && (
          <div className="animate-in space-y-6">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Target className="text-indigo-500 w-5 h-5" /> O que vai produzir?
            </h2>
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-200 w-full sm:w-2/3 mx-auto">
              <div className="flex justify-between items-start mb-2">
                <label className="text-sm font-bold text-indigo-900 block">
                  Caixas de Papelão (Pedido){" "}
                  <span className="block font-normal text-[10px] mt-0.5 text-indigo-600">
                    1 cx = {config.divPap}{" "}
                    {tipoBandeja === "eb6" ? "bdjs EB6" : "bdjs"}
                  </span>
                </label>
                <button
                  onClick={() => setMostrarCalcPedido(!mostrarCalcPedido)}
                  className={`p-1.5 rounded-lg border transition ${mostrarCalcPedido ? `bg-indigo-200 border-indigo-300 text-indigo-800` : `bg-white text-indigo-500 border-indigo-200`}`}
                >
                  <Calculator className="w-4 h-4" />
                </button>
              </div>
              {mostrarCalcPedido ? (
                <div className="bg-white p-3 rounded-xl border shadow-inner space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setPedPap(String((parseInt(pedPap) || 0) + 1))
                      }
                      className="bg-indigo-100 text-indigo-700 flex-1 py-2 rounded-lg font-bold text-sm"
                    >
                      +1
                    </button>
                    <button
                      onClick={() =>
                        setPedPap(String((parseInt(pedPap) || 0) + 5))
                      }
                      className="bg-indigo-100 text-indigo-700 flex-1 py-2 rounded-lg font-bold text-sm"
                    >
                      +5
                    </button>
                    <button
                      onClick={() =>
                        setPedPap(String((parseInt(pedPap) || 0) + 10))
                      }
                      className="bg-indigo-100 text-indigo-700 flex-1 py-2 rounded-lg font-bold text-sm"
                    >
                      +10
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Outra..."
                      value={valorSomaPedido}
                      onChange={(e) => setValorSomaPedido(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm text-center outline-none bg-slate-50"
                    />
                    <button
                      onClick={() => {
                        if (parseInt(valorSomaPedido) > 0) {
                          setPedPap(
                            String(
                              (parseInt(pedPap) || 0) +
                                parseInt(valorSomaPedido),
                            ),
                          );
                          setValorSomaPedido("");
                        }
                      }}
                      className="bg-indigo-500 text-white px-4 rounded-lg font-bold shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t text-sm">
                    <span className="font-bold text-slate-600">
                      Total:{" "}
                      <span className="text-indigo-600 text-lg">
                        {pedPap || 0}
                      </span>
                    </span>
                    <button
                      onClick={() => setPedPap("")}
                      className="text-red-500 flex items-center gap-1 text-[10px] font-bold uppercase"
                    >
                      <RotateCcw className="w-3 h-3" /> Zerar
                    </button>
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Ex: 5"
                  value={pedPap}
                  onChange={(e) => setPedPap(e.target.value)}
                  className="w-full p-3 border border-indigo-300 rounded-lg text-center font-bold text-2xl bg-white text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2 mt-8">
              <ArrowRightLeft className="text-indigo-500 w-5 h-5" /> O que
              retirar do estoque?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-${config.cor}-100 border-${config.cor}-300 border p-6 rounded-xl text-center flex flex-col justify-center`}
              >
                <span className={`text-${config.cor}-900 font-bold mb-1`}>
                  Pegar {config.nomeCx}
                </span>
                <div
                  className={`text-6xl font-black text-${config.cor}-700 mb-2`}
                >
                  {buscarCx}
                </div>
                <span
                  className={`text-[10px] font-bold bg-${config.cor}-200 text-${config.cor}-800 px-3 py-1 rounded-full self-center`}
                >
                  (Contém {buscarCx * config.multPla} bdjs)
                </span>
              </div>
              <div className="bg-slate-100 border-slate-300 border p-6 rounded-xl text-center flex flex-col justify-center">
                <span className="text-slate-800 font-bold mb-1">
                  +{" "}
                  {tipoBandeja === "eb6"
                    ? "Bandejas de 30 Soltas"
                    : "Bandejas Soltas"}
                </span>
                <div className="text-6xl font-black text-slate-700 mb-2">
                  {buscarSoltas}
                </div>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full self-center">
                  (Para completar)
                </span>
              </div>
              {sobraEb6 > 0 && (
                <div className="md:col-span-2 bg-cyan-100 border border-cyan-200 text-cyan-800 p-4 rounded-xl text-sm font-bold flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Vão sobrar {sobraEb6}{" "}
                  bandejas EB6 avulsas fora do papelão!
                </div>
              )}
            </div>
            {parseInt(pedPap) > 0 && (
              <button
                onClick={() => {
                  saveHistory({
                    id: Date.now(),
                    dataHora: new Date().toLocaleString("pt-BR"),
                    t: "Pedido",
                    regra: config.label,
                    nCx: config.nomeCx,
                    ped: pedPap,
                    bCx: buscarCx,
                    bSol: buscarSoltas,
                  });
                  setPedPap("");
                  setModoCalculo("historico");
                }}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition mt-6"
              >
                <Save className="w-5 h-5" /> Salvar Planejamento
              </button>
            )}
          </div>
        )}

        {modoCalculo === "historico" && (
          <div className="space-y-4 animate-in">
            {histEmb.length === 0 ? (
              <div className="text-center p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-500">
                  Nenhum registo salvo no momento.
                </p>
              </div>
            ) : (
              histEmb.map((h) => (
                <div
                  key={h.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-amber-300 transition"
                >
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      {h.t === "Estoque" ? (
                        <Inbox className="text-amber-500 w-5 h-5" />
                      ) : (
                        <Target className="text-indigo-500 w-5 h-5" />
                      )}
                      <h3 className="font-bold text-slate-800">
                        {h.t === "Estoque"
                          ? "Apuração de Estoque"
                          : "Planejamento de Pedido"}
                      </h3>
                      <span className="text-xs text-slate-400">
                        ({h.dataHora})
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold mr-2 border border-slate-200">
                        {h.regra}
                      </span>
                      {h.t === "Estoque" ? (
                        <span>
                          Tinha {h.entC > 0 ? `<b>${h.entC}</b> car + ` : ""}
                          <b>{h.entP}</b> {h.nCx} + <b>{h.entS}</b> soltas
                        </span>
                      ) : (
                        <span>
                          Pedido de <b>{h.ped}</b> cx papelão
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-sm">
                      {h.t === "Estoque" ? (
                        <span className="text-green-700 font-bold">
                          Rendeu {h.rPap} cx papelão (Sobrou {h.rSob} bdjs)
                        </span>
                      ) : (
                        <span className="text-indigo-700 font-bold">
                          Buscar {h.bCx} {h.nCx} + {h.bSol} soltas
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => {
                        let txt = "";
                        if (h.t === "Estoque")
                          txt = `*📊 Apuração de Estoque* (${h.dataHora})\nRegra: ${h.regra}\nTinha: ${h.entC > 0 ? h.entC + " car + " : ""}${h.entP} ${h.nCx} + ${h.entS} soltas\n*Rendeu:* ${h.rPap} cx de papelão\n*Sobrou:* ${h.rSob} bdjs`;
                        else
                          txt = `*🎯 Planejamento de Pedido* (${h.dataHora})\nRegra: ${h.regra}\nPedido: ${h.ped} cx de papelão\n*Buscar:* ${h.bCx} ${h.nCx} + ${h.bSol} soltas`;
                        copiarWa(txt);
                      }}
                      className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-1 transition"
                    >
                      {textoCopiado ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}{" "}
                      Zap
                    </button>
                    <button
                      onClick={() => {
                        const nHist = histEmb.filter((x) => x.id !== h.id);
                        setHistEmb(nHist);
                        localStorage.setItem(
                          "ag_hist_emb",
                          JSON.stringify(nHist),
                        );
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
