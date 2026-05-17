import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const pedidos =
      await sql`SELECT * FROM pedidos ORDER BY data_pedido DESC, created_at DESC`;
    return Response.json(pedidos);
  } catch (error) {
    console.error("Error fetching pedidos:", error);
    return Response.json({ error: "Failed to fetch pedidos" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      comprador,
      data_pedido,
      anotacao,
      itens,
      bandejas_troca,
      itens_concluidos,
      historico,
      agrupar12,
      agrupar20,
      agrupar30,
    } = body;

    if (id) {
      // Update
      const [updated] = await sql`
        UPDATE pedidos 
        SET 
          comprador = ${comprador}, 
          data_pedido = ${data_pedido}, 
          anotacao = ${anotacao}, 
          itens = ${JSON.stringify(itens)}, 
          bandejas_troca = ${JSON.stringify(bandejas_troca)}, 
          itens_concluidos = ${JSON.stringify(itens_concluidos)}, 
          historico = ${JSON.stringify(historico)},
          agrupar12 = ${agrupar12},
          agrupar20 = ${agrupar20},
          agrupar30 = ${agrupar30}
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json(updated);
    } else {
      // Create
      const [created] = await sql`
        INSERT INTO pedidos (
          comprador, 
          data_pedido, 
          anotacao, 
          itens, 
          bandejas_troca, 
          itens_concluidos, 
          historico,
          agrupar12,
          agrupar20,
          agrupar30
        ) VALUES (
          ${comprador}, 
          ${data_pedido}, 
          ${anotacao}, 
          ${JSON.stringify(itens || {})}, 
          ${JSON.stringify(bandejas_troca || {})}, 
          ${JSON.stringify(itens_concluidos || [])}, 
          ${JSON.stringify(historico || [])},
          ${agrupar12 || false},
          ${agrupar20 || false},
          ${agrupar30 || false}
        )
        RETURNING *
      `;
      return Response.json(created);
    }
  } catch (error) {
    console.error("Error saving pedido:", error);
    return Response.json({ error: "Failed to save pedido" }, { status: 500 });
  }
}
