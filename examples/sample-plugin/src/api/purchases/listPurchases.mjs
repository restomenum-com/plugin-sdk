// GET /plugin-api/purchases/list?limit= — Kendi satın almaların (en yeni önce). Scope: purchases:read.
// SDK: client.purchases.list({ limit? }) -> Purchase[]
// Yanıt (gerçek): Purchase dizisi — yalnız çağıran install'ın (serverId+pluginId) kayıtları;
//   başka eklenti/tenant görünmez. limit max 100 (uç uygular). Öğe şekli = purchases/get ile aynı.
export async function listPurchases(client, limit = 20) {
  const purchases = await client.purchases.list({ limit });
  // Örnek: yalnız erişim verilmiş (granted) olanları süz.
  const granted = purchases.filter((p) => p.status === 'granted' || p.grantedAt != null);
  return { purchases, grantedCount: granted.length };
}
