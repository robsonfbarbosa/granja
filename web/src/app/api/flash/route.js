import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM flash_producao`;
    const flashData = {};
    const flashTime = {};
    rows.forEach((row) => {
      flashData[row.categoria] = row.quantidade;
      flashTime[row.categoria] = row.ultima_atualizacao;
    });
    return Response.json({ flashData, flashTime });
  } catch (error) {
    console.error("Error fetching flash data:", error);
    return Response.json(
      { error: "Failed to fetch flash data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { categoria, quantidade, ultima_atualizacao, reset } = body;

    if (reset) {
      await sql`DELETE FROM flash_producao`;
      return Response.json({ success: true });
    }

    const [upserted] = await sql`
      INSERT INTO flash_producao (categoria, quantidade, ultima_atualizacao)
      VALUES (${categoria}, ${quantidade}, ${ultima_atualizacao})
      ON CONFLICT (categoria) DO UPDATE 
      SET quantidade = ${quantidade}, ultima_atualizacao = ${ultima_atualizacao}
      RETURNING *
    `;
    return Response.json(upserted);
  } catch (error) {
    console.error("Error updating flash data:", error);
    return Response.json(
      { error: "Failed to update flash data" },
      { status: 500 },
    );
  }
}
