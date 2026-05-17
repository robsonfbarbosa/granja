export const calcTotalSecao = (obj) =>
  Object.values(obj || {}).reduce((a, b) => a + (parseInt(b) || 0), 0);

export const formatarData = (d) => {
  if (!d) return "";
  const [y, m, di] = d.split("-");
  return `${di}/${m}/${y}`;
};

export const createEmptyPedido = () => {
  const hojeISO = new Date().toISOString().split("T")[0];
  return {
    id: null,
    comprador: "",
    data_pedido: hojeISO,
    anotacao: "",
    itens: {},
    bandejas_troca: {},
    itens_concluidos: [],
    historico: [],
    agrupar12: false,
    agrupar20: false,
    agrupar30: false,
  };
};
