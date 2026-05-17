import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const fechamentos =
      await sql`SELECT * FROM fechamentos ORDER BY created_at DESC`;
    return Response.json(fechamentos);
  } catch (error) {
    console.error("Error fetching fechamentos:", error);
    return Response.json(
      { error: "Failed to fetch fechamentos" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      data_hora,
      obs,
      carrinhos,
      papelao,
      granel,
      granel_sem_embalar,
      vermelhas,
      is_parcial,
      agrupar12,
      agrupar20,
      agrupar30,
    } = body;

    if (id) {
      const [updated] = await sql`
        UPDATE fechamentos 
        SET 
          data_hora = ${data_hora}, 
          obs = ${obs}, 
          carrinhos = ${JSON.stringify(carrinhos)}, 
          papelao = ${JSON.stringify(papelao)}, 
          granel = ${JSON.stringify(granel)}, 
          granel_sem_embalar = ${JSON.stringify(granel_sem_embalar)}, 
          vermelhas = ${JSON.stringify(vermelhas)}, 
          is_parcial = ${is_parcial},
          agrupar12 = ${agrupar12},
          agrupar20 = ${agrupar20},
          agrupar30 = ${agrupar30}
        WHERE id = ${id}
        RETURNING *
      `;
      return Response.json(updated);
    } else {
      const [created] = await sql`
        INSERT INTO fechamentos (
          data_hora, 
          obs, 
          carrinhos, 
          papelao, 
          granel, 
          granel_sem_embalar, 
          vermelhas, 
          is_parcial,
          agrupar12,
          agrupar20,
          agrupar30
        ) VALUES (
          ${data_hora}, 
          ${obs}, 
          ${JSON.stringify(carrinhos || {})}, 
          ${JSON.stringify(papelao || {})}, 
          ${JSON.stringify(granel || {})}, 
          ${JSON.stringify(granel_sem_embalar || {})}, 
          ${JSON.stringify(vermelhas || {})}, 
          ${is_parcial || false},
          ${agrupar12 || false},
          ${agrupar20 || false},
          ${agrupar30 || false}
        )
        RETURNING *
      `;
      return Response.json(created);
    }
  } catch (error) {
    console.error("Error saving fechamento:", error);
    return Response.json(
      { error: "Failed to save fechamento" },
      { status: 500 },
    );
  }
}
