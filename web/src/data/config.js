export const categoriasEmbalados = [
  "AB20",
  "AB30",
  "EB20",
  "EB30",
  "EV12",
  "EV20",
  "EV30",
  "MB20",
  "AB12",
  "EB12",
];
export const categoriasAcrilico = [
  "AB10",
  "EB10",
  "EB6",
  "JB10",
  "JB12",
  "JV10",
  "JV12",
];
export const categoriasGranel = [
  "Grande",
  "Extra",
  "Casca Fina",
  "Jumbo",
  "Jumbão",
  "Jumbo Vermelho",
  "Grande Vermelho",
  "Extra Vermelho",
];
export const todasCategorias = [
  ...categoriasEmbalados,
  ...categoriasAcrilico,
  ...categoriasGranel,
];

// Fechamento exclui AB10 e EB10
export const categoriasFechamento = [
  "AB12",
  "AB20",
  "AB30",
  "EB6",
  "EB12",
  "EB20",
  "EB30",
  "EV12",
  "EV20",
  "EV30",
  "JB10",
  "JB12",
  "JV10",
  "JV12",
  "MB20",
];

export const getConfig = (tipoBandeja) => {
  if (tipoBandeja === "12") {
    return {
      mult: 16,
      divPap: 20,
      nomeCx: "Caixas Vermelhas",
      cor: "red",
      bdjCarro: 240,
      label: "12",
      multPla: 16,
    };
  }
  if (tipoBandeja === "medio") {
    return {
      mult: 8,
      divPap: 13,
      nomeCx: "Caixas Vermelhas",
      cor: "orange",
      bdjCarro: 0,
      label: "Médios",
      multPla: 8,
    };
  }
  if (tipoBandeja === "eb6") {
    return {
      mult: 4,
      divPap: 48,
      nomeCx: "Caixas Vermelhas",
      cor: "cyan",
      bdjCarro: 0,
      label: "EB6",
      multPla: 4,
    };
  }
  // 20_30
  return {
    mult: 8,
    divPap: 10,
    nomeCx: "Caixas de Plástico",
    cor: "blue",
    bdjCarro: 120,
    label: "20/30",
    multPla: 8,
  };
};

// Converte caixas vermelhas → estimativa de caixas de papelão
export const getEstimativaPapelaoIndividual = (cat, qtd) => {
  const caixas = parseInt(qtd) || 0;
  if (caixas <= 0) return 0;
  if (cat.includes("12")) return Math.floor((caixas * 16) / 20);
  if (cat.startsWith("M") || cat.includes("Medio"))
    return Math.floor((caixas * 8) / 13);
  if (cat === "EB6") return Math.floor((caixas * 20) / 48);
  return Math.floor((caixas * 8) / 10);
};

// Inverso: dado X caixas de papelão faltando, quantas caixas vermelhas são necessárias?
export const getVermelhasNecessarias = (cat, papelaoFaltando) => {
  const p = parseInt(papelaoFaltando) || 0;
  if (p <= 0) return 0;
  if (cat.includes("12")) return Math.ceil((p * 20) / 16);
  if (cat.startsWith("M") || cat.includes("Medio"))
    return Math.ceil((p * 13) / 8);
  if (cat === "EB6") return Math.ceil((p * 48) / 20);
  return Math.ceil((p * 10) / 8);
};
