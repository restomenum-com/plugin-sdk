// GET /plugin-api/tables/layout — Mağaza masa yerleşimi (floor plan): bölümler + her bölümdeki aktif masalar. Scope: orders:read.
// SDK: client.tables.layout() -> FloorPlanSection[] (bölümler → masalar).
// Yanıt (gerçek): [ { id(bölüm), title(bölüm adı), tables[]{ id, title } } ].
// tables[].id = tables/get?id= ve tables/open'daki tableId ile BİREBİR aynı (URL-encoded olabilir); ham id'yi ver, tekrar encode etme.
export async function getTableLayout(client) {
  const sections = await client.tables.layout();
  // Yalnız aktif masalar döner (pasifler hariç); saatlik ücret/grid boyutu sızdırılmaz. Sıra geldiği gibi (kat planı).
  return sections;
}
