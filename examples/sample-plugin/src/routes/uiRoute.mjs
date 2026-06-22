// GET /ui — Custom UI iframe sayfası (statik HTML). Restomenum panelinde iframe olarak açılır.
// Manifest'te page customUiOrigin = bu sunucunun public origin'i + path /ui olmalı (nav/page ile bağlanır).
// App Bridge (inline, minimal): window.parent'a postMessage ile 'getSessionToken' ister → kısa-ömürlü JWT
// alır → backend'inin /api/me'sine Authorization: Bearer ile taşır (orada SDK verifySessionToken doğrular).
// NOT: imza/kripto yok burada — token yalnız taşınır; doğrulama BACKEND'de (sessionRoute → SDK).
import { sendHtml } from '../lib/http.mjs';

export function makeUiRoute() {
  return function uiRoute(_req, res) {
    return sendHtml(res, 200, UI_HTML);
  };
}

const UI_HTML = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Örnek Eklenti — Custom UI</title>
<style>
  body { margin:0; padding:24px; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background:#f4f5f7; color:#18181b; line-height:1.5; }
  .card { max-width:520px; margin:0 auto; background:#fff; border:1px solid #e4e4e7; border-radius:16px; padding:22px 24px;
    box-shadow:0 8px 28px rgba(0,0,0,.06); }
  h1 { margin:0 0 4px; font-size:17px; }
  p.muted { margin:0 0 18px; font-size:13px; color:#71717a; }
  .row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid #f1f1f4; font-size:14px; }
  .row b { color:#52525b; font-weight:600; } .row span { font-family:ui-monospace,Menlo,monospace; }
  #status { margin-top:16px; font-size:13px; color:#71717a; }
  .err { color:#dc2626; } .ok { color:#16a34a; }
</style></head>
<body>
  <div class="card">
    <h1>Örnek Eklenti · Custom UI</h1>
    <p class="muted">App Bridge session token → backend /api/me (SDK verifySessionToken ile doğrulanır).</p>
    <div id="out" style="display:none">
      <div class="row"><b>tenantId</b><span id="tenantId">—</span></div>
      <div class="row"><b>userId (sub)</b><span id="userId">—</span></div>
      <div class="row"><b>role</b><span id="role">—</span></div>
    </div>
    <div id="status">Yükleniyor…</div>
  </div>
<script>
/* ── minimal App Bridge (inline) — panel iframe ile postMessage protokolü ── */
var pending = {}, seq = 0;
window.addEventListener('message', function (e) {
  var m = e.data; if (!m || m.type !== 'restomenum-bridge-response') return;
  var r = pending[m.requestId]; if (r) { delete pending[m.requestId]; r(m.result); }
});
function call(action, params) {
  return new Promise(function (resolve) {
    var id = Date.now() + '-' + (seq++);
    pending[id] = resolve;
    // PROD: '*' yerine panel origin'ini ver (origin-pinned postMessage — iframe güvenliği).
    window.parent.postMessage({ type: 'restomenum-bridge', requestId: id, action: action, params: params || {} }, '*');
    setTimeout(function () { if (pending[id]) { delete pending[id]; resolve({ success: false, message: 'timeout' }); } }, 15000);
  });
}
var statusEl = document.getElementById('status');
(async function () {
  var t = await call('getSessionToken');               // App Bridge → kısa-ömürlü JWT
  var jwt = t && t.data && t.data.token;
  if (!jwt) { statusEl.className = 'err'; statusEl.textContent = 'Oturum alınamadı (panel dışında mı açıldı?)'; return; }
  var r = await fetch('/api/me', { headers: { authorization: 'Bearer ' + jwt } });   // backend doğrular (SDK)
  var j = await r.json();
  if (!r.ok) { statusEl.className = 'err'; statusEl.textContent = 'Doğrulama başarısız: ' + (j.reason || j.error || r.status); return; }
  document.getElementById('tenantId').textContent = j.tenantId;
  document.getElementById('userId').textContent = j.userId;
  document.getElementById('role').textContent = j.role;
  document.getElementById('out').style.display = '';
  statusEl.className = 'ok'; statusEl.textContent = '✓ Session token doğrulandı (backend)';
})();
</script>
</body></html>`;
