"use client";
import React, { useState } from "react";
import {
  CheckSquare,
  ChevronLeft,
  PlusCircle,
  History,
  Zap,
  ShoppingCart,
  Package,
  Layers,
  Inbox,
  Clock,
  Save,
  Copy,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";
import Accordion from "./Accordion";
import { categoriasFechamento, categoriasGranel } from "@/data/config";

const calcTotalSecao = (obj) =>
  Object.values(obj || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);

export default function FechamentoScreen({
  setTelaAtual,
  copiarWa,
  textoCopiado,
  historicoFechamentos,
  saveFechamentoMutation,
  deleteFechamentoMutation,
  producaoFlash,
  getWaFech,
  getEstimativaPapelaoIndividual,
}) {
  const [abaFechamento, setAbaFechamento] = useState("novo");
  const fechamentoVazio = {
    id: null,
    data_hora: "",
    obs: "",
    carrinhos: {},
    papelao: {},
    granel: {},
    granel_sem_embalar: {},
    vermelhas: {},
    is_parcial: false,
    agrupar12: false,
    agrupar20: false,
    agrupar30: false,
  };
  const [fechamentoAtual, setFechamentoAtual] = useState(fechamentoVazio);

  const renderFechInputs = (cats, valObj, onChangeFn, col) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
      {cats.map((c) => (
        <div
          key={c}
          className={`bg-white p-2 rounded-lg border border-${col}-200 flex flex-col`}
        >
          <label
            className={`text-xs font-bold text-${col}-700 mb-1 text-center truncate`}
          >
            {c}
          </label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={valObj[c] || ""}
            onChange={(e) => onChangeFn(c, e.target.value)}
            className={`w-full p-2 border border-slate-200 rounded text-center font-bold outline-none focus:ring-2 focus:ring-${col}-400`}
          />
        </div>
      ))}
    </div>
  );

  const salvarFechamento = () => {
    const isFechValido =
      calcTotalSecao(fechamentoAtual.carrinhos) > 0 ||
      calcTotalSecao(fechamentoAtual.papelao) > 0 ||
      calcTotalSecao(fechamentoAtual.granel) > 0 ||
      calcTotalSecao(fechamentoAtual.granel_sem_embalar) > 0 ||
      calcTotalSecao(fechamentoAtual.vermelhas) > 0;
    if (!isFechValido) return;
    saveFechamentoMutation.mutate(
      {
        ...fechamentoAtual,
        data_hora: new Date().toLocaleString("pt-BR"),
      },
      {
        onSuccess: () => {
          setFechamentoAtual(fechamentoVazio);
          setAbaFechamento("historico");
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in">
      <header className="bg-violet-600 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <button
          onClick={() => setTelaAtual("menu")}
          className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm font-bold transition hover:bg-white/30"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <CheckSquare className="w-10 h-10 text-violet-200 hidden sm:block" />
        <div>
          <h1 className="text-2xl font-bold">Estoque de Ovos</h1>
          <p className="text-sm text-violet-100">
            Fechamento e Controle do Dia
          </p>
        </div>
      </header>
      <div className="bg-white p-6 rounded-2xl border shadow-sm border-violet-100">
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setAbaFechamento("novo");
              if (fechamentoAtual.id) setFechamentoAtual(fechamentoVazio);
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${abaFechamento === "novo" ? "bg-white shadow-sm text-violet-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <PlusCircle className="w-4 h-4" /> Relatório
          </button>
          <button
            onClick={() => setAbaFechamento("historico")}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${abaFechamento === "historico" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <History className="w-4 h-4" /> Salvos (
            {historicoFechamentos.length})
          </button>
        </div>
        {abaFechamento === "novo" && (
          <div className="animate-in space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-bold text-sm cursor-pointer transition ${fechamentoAtual.is_parcial ? "bg-blue-50 border-blue-400 text-blue-800 shadow-md" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
              >
                <input
                  type="checkbox"
                  checked={fechamentoAtual.is_parcial}
                  onChange={(e) =>
                    setFechamentoAtual({
                      ...fechamentoAtual,
                      is_parcial: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-blue-600"
                />
                ⏳ Fechamento Parcial (Almoço)
              </label>
              <button
                onClick={() =>
                  setFechamentoAtual((p) => {
                    // Pull vermelhas: verm_AB12 → vermelhas.AB12
                    const novasVermelhas = categoriasFechamento.reduce(
                      (o, k) => {
                        const val = producaoFlash[`verm_${k}`];
                        if (val > 0) o[k] = val;
                        return o;
                      },
                      {},
                    );
                    // Pull carrinhos: carr_AB12 → carrinhos.AB12
                    const novosCarrinhos = categoriasFechamento.reduce(
                      (o, k) => {
                        const val = producaoFlash[`carr_${k}`];
                        if (val > 0) o[k] = val;
                        return o;
                      },
                      {},
                    );
                    return {
                      ...p,
                      papelao: { ...(p.papelao || {}), ...producaoFlash },
                      granel: {
                        ...(p.granel || {}),
                        ...Object.keys(producaoFlash)
                          .filter((k) => categoriasGranel.includes(k))
                          .reduce((o, k) => {
                            o[k] = producaoFlash[k];
                            return o;
                          }, {}),
                      },
                      vermelhas: { ...(p.vermelhas || {}), ...novasVermelhas },
                      carrinhos: { ...(p.carrinhos || {}), ...novosCarrinhos },
                    };
                  })
                }
                className="flex-1 bg-violet-50 text-violet-700 border-2 border-violet-200 p-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-violet-100 transition shadow-sm"
              >
                <Zap className="w-5 h-5 text-amber-500" /> Puxar Produção Flash
              </button>
            </div>
            <Accordion
              title="Carrinhos (Cx S/ Embalar)"
              icon={ShoppingCart}
              colorTheme="emerald"
              count={
                categoriasFechamento.filter(
                  (c) => fechamentoAtual.carrinhos[c] > 0,
                ).length
              }
              actionButton={
                <button
                  onClick={() =>
                    setFechamentoAtual((p) => ({
                      ...p,
                      carrinhos: {
                        ...(p.carrinhos || {}),
                        ...categoriasFechamento.reduce((o, k) => {
                          const val = producaoFlash[`carr_${k}`];
                          if (val > 0) o[k] = val;
                          return o;
                        }, {}),
                      },
                    }))
                  }
                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-300 hover:bg-emerald-200 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Flash
                </button>
              }
            >
              {renderFechInputs(
                categoriasFechamento,
                fechamentoAtual.carrinhos,
                (c, v) =>
                  setFechamentoAtual((p) => ({
                    ...p,
                    carrinhos: { ...p.carrinhos, [c]: v },
                  })),
                "emerald",
              )}
            </Accordion>
            <Accordion
              title="Papelão Prontas"
              icon={Package}
              colorTheme="amber"
              count={
                categoriasFechamento.filter(
                  (c) => fechamentoAtual.papelao[c] > 0,
                ).length
              }
            >
              {renderFechInputs(
                categoriasFechamento,
                fechamentoAtual.papelao,
                (c, v) =>
                  setFechamentoAtual((p) => ({
                    ...p,
                    papelao: { ...p.papelao, [c]: v },
                  })),
                "amber",
              )}
            </Accordion>
            <Accordion
              title="Granel Prontas"
              icon={Layers}
              colorTheme="orange"
              count={
                categoriasGranel.filter((c) => fechamentoAtual.granel[c] > 0)
                  .length
              }
            >
              {renderFechInputs(
                categoriasGranel,
                fechamentoAtual.granel,
                (c, v) =>
                  setFechamentoAtual((p) => ({
                    ...p,
                    granel: { ...p.granel, [c]: v },
                  })),
                "orange",
              )}
            </Accordion>
            <Accordion
              title="Granel S/ Embalar"
              icon={Inbox}
              colorTheme="blue"
              count={
                categoriasGranel.filter(
                  (c) => fechamentoAtual.granel_sem_embalar[c] > 0,
                ).length
              }
            >
              {renderFechInputs(
                categoriasGranel,
                fechamentoAtual.granel_sem_embalar,
                (c, v) =>
                  setFechamentoAtual((p) => ({
                    ...p,
                    granel_sem_embalar: { ...p.granel_sem_embalar, [c]: v },
                  })),
                "blue",
              )}
            </Accordion>
            <Accordion
              title="Vermelhas (Estoque)"
              icon={Inbox}
              colorTheme="red"
              count={
                categoriasFechamento.filter(
                  (c) => fechamentoAtual.vermelhas[c] > 0,
                ).length
              }
              actionButton={
                <button
                  onClick={() =>
                    setFechamentoAtual((p) => ({
                      ...p,
                      vermelhas: {
                        ...(p.vermelhas || {}),
                        ...categoriasFechamento.reduce((o, k) => {
                          const val = producaoFlash[`verm_${k}`];
                          if (val > 0) o[k] = val;
                          return o;
                        }, {}),
                      },
                    }))
                  }
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-300 hover:bg-red-200 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Flash
                </button>
              }
            >
              {renderFechInputs(
                categoriasFechamento,
                fechamentoAtual.vermelhas,
                (c, v) =>
                  setFechamentoAtual((p) => ({
                    ...p,
                    vermelhas: { ...p.vermelhas, [c]: v },
                  })),
                "red",
              )}
            </Accordion>
            <textarea
              placeholder="Observações do dia... (Ex: Faltou luz 2h)"
              value={fechamentoAtual.obs}
              onChange={(e) =>
                setFechamentoAtual({ ...fechamentoAtual, obs: e.target.value })
              }
              className="w-full p-4 border border-slate-300 rounded-xl text-sm mt-2 mb-2 h-20 resize-none focus:ring-2 focus:ring-violet-400 outline-none"
            />
            {(() => {
              const p = fechamentoAtual.papelao || {};
              const h12 = parseInt(p["AB12"]) > 0 && parseInt(p["EB12"]) > 0;
              const h20 = parseInt(p["AB20"]) > 0 && parseInt(p["EB20"]) > 0;
              const h30 = parseInt(p["AB30"]) > 0 && parseInt(p["EB30"]) > 0;
              if (!h12 && !h20 && !h30) return null;
              return (
                <div className="bg-violet-50 p-4 rounded-xl border border-violet-200 mb-4 mt-2">
                  <span className="text-xs font-bold text-violet-800 block mb-3">
                    Deseja unir as somas do Papelão no WhatsApp?
                  </span>
                  <div className="flex gap-4 flex-wrap">
                    {h12 && (
                      <label className="text-sm font-bold text-violet-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fechamentoAtual.agrupar12}
                          onChange={(e) =>
                            setFechamentoAtual({
                              ...fechamentoAtual,
                              agrupar12: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-violet-600"
                        />{" "}
                        AB12 + EB12
                      </label>
                    )}
                    {h20 && (
                      <label className="text-sm font-bold text-violet-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fechamentoAtual.agrupar20}
                          onChange={(e) =>
                            setFechamentoAtual({
                              ...fechamentoAtual,
                              agrupar20: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-violet-600"
                        />{" "}
                        AB20 + EB20
                      </label>
                    )}
                    {h30 && (
                      <label className="text-sm font-bold text-violet-700 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fechamentoAtual.agrupar30}
                          onChange={(e) =>
                            setFechamentoAtual({
                              ...fechamentoAtual,
                              agrupar30: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-violet-600"
                        />{" "}
                        AB30 + EB30
                      </label>
                    )}
                  </div>
                </div>
              );
            })()}
            <div className="bg-slate-800 p-5 rounded-xl text-white shadow-inner mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Carrinhos
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {calcTotalSecao(fechamentoAtual.carrinhos)} cx
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Papelão
                  </span>
                  <span className="text-xl font-bold text-amber-400">
                    {calcTotalSecao(fechamentoAtual.papelao)} cx
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Granel
                  </span>
                  <span className="text-xl font-bold text-orange-400">
                    {calcTotalSecao(fechamentoAtual.granel)} cx
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    S/ Embalar
                  </span>
                  <span className="text-xl font-bold text-blue-400">
                    {calcTotalSecao(fechamentoAtual.granel_sem_embalar)} cx
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Vermelhas
                  </span>
                  <span className="text-xl font-bold text-red-400">
                    {calcTotalSecao(fechamentoAtual.vermelhas)} cx
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={salvarFechamento}
              disabled={
                calcTotalSecao(fechamentoAtual.carrinhos) === 0 &&
                calcTotalSecao(fechamentoAtual.papelao) === 0 &&
                calcTotalSecao(fechamentoAtual.granel) === 0 &&
                calcTotalSecao(fechamentoAtual.granel_sem_embalar) === 0 &&
                calcTotalSecao(fechamentoAtual.vermelhas) === 0
              }
              className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-md transition text-white mt-6 ${calcTotalSecao(fechamentoAtual.carrinhos) > 0 || calcTotalSecao(fechamentoAtual.papelao) > 0 || calcTotalSecao(fechamentoAtual.granel) > 0 || calcTotalSecao(fechamentoAtual.granel_sem_embalar) > 0 || calcTotalSecao(fechamentoAtual.vermelhas) > 0 ? (fechamentoAtual.is_parcial ? "bg-blue-500 hover:bg-blue-600" : "bg-violet-600 hover:bg-violet-700") : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              <Save className="w-5 h-5" />{" "}
              {fechamentoAtual.is_parcial
                ? "Salvar Fechamento Parcial"
                : "Salvar Fechamento Final"}
            </button>
          </div>
        )}
        {abaFechamento === "historico" && (
          <div className="space-y-4 animate-in">
            {historicoFechamentos.length === 0 ? (
              <div className="text-center p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-500">
                  Nenhum fechamento salvo.
                </p>
              </div>
            ) : (
              historicoFechamentos.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 border-2 rounded-xl transition ${f.is_parcial ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white hover:border-violet-300"}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className={`font-bold flex items-center gap-2 text-lg ${f.is_parcial ? "text-blue-800" : "text-slate-800"}`}
                      >
                        {f.is_parcial ? (
                          <Clock className="w-5 h-5 text-blue-500" />
                        ) : (
                          <CheckSquare className="w-5 h-5 text-violet-600" />
                        )}{" "}
                        {f.is_parcial
                          ? "Fechamento Parcial"
                          : "Fechamento do Dia"}
                      </h3>
                      <span className="text-xs text-slate-500 font-bold">
                        {f.data_hora}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {calcTotalSecao(f.carrinhos) > 0 && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded">
                        Carrinhos: {calcTotalSecao(f.carrinhos)}
                      </span>
                    )}
                    {calcTotalSecao(f.papelao) > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">
                        Papelão: {calcTotalSecao(f.papelao)}
                      </span>
                    )}
                    {calcTotalSecao(f.granel) > 0 && (
                      <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded">
                        Granel: {calcTotalSecao(f.granel)}
                      </span>
                    )}
                    {calcTotalSecao(f.granel_sem_embalar) > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">
                        S/ Emb: {calcTotalSecao(f.granel_sem_embalar)}
                      </span>
                    )}
                    {calcTotalSecao(f.vermelhas) > 0 && (
                      <div className="bg-red-100 text-red-800 text-[10px] px-2 py-1.5 rounded flex flex-col">
                        <span className="font-bold border-b border-red-200 pb-0.5 mb-0.5">
                          Vermelhas: {calcTotalSecao(f.vermelhas)}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {Object.entries(f.vermelhas).map(([c, q]) =>
                            q > 0 ? (
                              <span key={c} className="italic opacity-90">
                                • {c}: {q} cx (~
                                {getEstimativaPapelaoIndividual(c, q)} pap)
                              </span>
                            ) : null,
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {f.obs && (
                    <p className="text-xs text-slate-500 italic mb-4 bg-slate-100 p-2 rounded">
                      Obs: {f.obs}
                    </p>
                  )}
                  <div className="flex gap-2 pt-4 border-t border-slate-100 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => copiarWa(getWaFech(f))}
                      className="flex-1 sm:flex-none px-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition"
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
                        setFechamentoAtual(f);
                        setAbaFechamento("novo");
                      }}
                      className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteFechamentoMutation.mutate(f.id);
                      }}
                      className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition"
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
