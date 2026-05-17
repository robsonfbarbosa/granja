import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await sql`DELETE FROM pedidos WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting pedido:", error);
    return Response.json({ error: "Failed to delete pedido" }, { status: 500 });
  }
}
