'use strict';
(() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: n % 1 ? 2 : 0 }).format(Number(n) || 0);
  const dShort = (iso) => new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin', ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let data; try { data = await res.json(); } catch { data = { ok: false }; }
    if (!res.ok) throw Object.assign(new Error(data.error || 'Hata'), { status: res.status });
    return data;
  }

  function toast(msg, err) {
    let zone = $('#toast-zone'); if (!zone) { document.body.insertAdjacentHTML('beforeend', '<div id="toast-zone"></div>'); zone = $('#toast-zone'); }
    const el = document.createElement('div');
    el.className = 'toast' + (err ? ' err' : '');
    el.innerHTML = `<span>${err ? '⚠️' : '✅'}</span><span>${esc(msg)}</span>`;
    zone.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
  }

  const STATUS = { processing: 'Hazırlanıyor', shipped: 'Kargoda', delivered: 'Teslim Edildi', cancelled: 'İptal' };
  const shell = (active, content, badge) => `
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="adm-brand"><span>LOVE<span class="dot">.</span><small>ADMİN PANEL</small></span></div>
      <nav class="adm-nav">
        <a href="#/dashboard" class="${active === 'dashboard' ? 'on' : ''}"><span class="ic">📊</span>Panel</a>
        <a href="#/orders" class="${active === 'orders' ? 'on' : ''}"><span class="ic">📦</span>Siparişler${badge.orders ? `<span class="pill">${badge.orders}</span>` : ''}</a>
        <a href="#/products" class="${active === 'products' ? 'on' : ''}"><span class="ic">🛍️</span>Ürünler</a>
        <a href="#/categories" class="${active === 'categories' ? 'on' : ''}"><span class="ic">🗂️</span>Kategoriler</a>
        <a href="#/reviews" class="${active === 'reviews' ? 'on' : ''}"><span class="ic">⭐</span>Yorumlar${badge.reviews ? `<span class="pill">${badge.reviews}</span>` : ''}</a>
        <a href="#/coupons" class="${active === 'coupons' ? 'on' : ''}"><span class="ic">🎟️</span>Kuponlar</a>
        <a href="#/users" class="${active === 'users' ? 'on' : ''}"><span class="ic">👥</span>Kullanıcılar</a>
        <a href="#/messages" class="${active === 'messages' ? 'on' : ''}"><span class="ic">💌</span>Mesajlar</a>
        <a href="#/settings" class="${active === 'settings' ? 'on' : ''}"><span class="ic">⚙️</span>Ayarlar</a>
      </nav>
      <div class="sidebar-foot">
        <a href="/" class="mini" target="_blank">🏬 Mağazayı Gör</a>
        <a href="#" class="mini" id="adm-logout">🚪 Çıkış Yap</a>
      </div>
    </aside>
    <main class="admin-main">
      <div class="admin-topbar"><h1 id="page-title"></h1><div class="topbar-right"><a class="view-store" href="/" target="_blank">↗ Mağaza</a><div class="adm-avatar" id="adm-avatar">?</div></div></div>
      <div class="admin-content" id="adm-content">${content}</div>
    </main>
  </div>`;

  const TITLES = { dashboard: 'Genel Bakış', orders: 'Sipariş Yönetimi', products: 'Ürün Yönetimi', categories: 'Kategori Yönetimi', reviews: 'Yorum Onayları', coupons: 'Kupon & Kampanyalar', users: 'Kullanıcılar', messages: 'Gelen Kutusu', settings: 'Mağaza Ayarları' };

  function mount(page, content) {
    const root = $('#admin-root');
    root.innerHTML = shell(page, content, window.__badges || {});
    $('#page-title').textContent = TITLES[page] || '';
    const av = $('#adm-avatar');
    if (av && window.__me) av.textContent = window.__me.name.trim().charAt(0).toUpperCase();
    const lo = $('#adm-logout');
    if (lo) lo.addEventListener('click', async (e) => { e.preventDefault(); await api('/api/auth/logout', { method: 'POST' }); location.reload(); });
  }

  function loginScreen() {
    $('#admin-root').innerHTML = `
    <div class="admin-login"><div class="al-card">
      <div class="logo">🔐</div>
      <h1>LOVE SHOP ADMIN</h1>
      <p class="sub">Yönetim paneline erişim için giriş yapın</p>
      <form id="adm-login">
        <div class="field"><label>E-posta</label><input id="al-email" type="email" placeholder="admin e-posta" required></div>
        <div class="field"><label>Şifre</label><input id="al-pass" type="password" required></div>
        <button class="btn btn-primary" style="width:100%" type="submit">Giriş Yap</button>
      </form>
      <div class="al-hint">Demo: admin@loveshop.com.tr · loveshop2026<br><a href="/" style="color:#FF8E86">← Mağazaya dön</a></div>
    </div></div>`;
    $('#adm-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const r = await api('/api/auth/login', { method: 'POST', body: { email: $('#al-email').value.trim(), password: $('#al-pass').value } });
        if (r.user.role !== 'admin') throw new Error('Bu hesap admin değil.');
        toast('Hoş geldin, ' + r.user.name);
        route();
      } catch (err) { toast(err.message, true); }
    });
  }

  /* ================= DASHBOARD ================= */
  async function viewDashboard() {
    mount('dashboard', '<div style="text-align:center;padding:40px" class="loading">Yükleniyor…</div>');
    let d;
    try { d = (await api('/api/admin/stats')).stats; } catch (e) { return toast(e.message, true); }
    const maxDay = Math.max(...d.days.map((x) => x.value), 1);
    const cats = Object.entries(d.catDist).sort((a, b) => b[1] - a[1]);
    const maxCat = Math.max(...cats.map((c) => c[1]), 1);
    mount('dashboard', `
    <div class="stat-grid">
      <div class="stat-card"><div class="sc-icon">💰</div><div class="sc-val">${fmt(d.revenue)}</div><div class="sc-lbl">Toplam Ciro</div><span class="sc-trend trend-up">aktif</span></div>
      <div class="stat-card"><div class="sc-icon">📦</div><div class="sc-val">${d.orders}</div><div class="sc-lbl">Toplam Sipariş</div></div>
      <div class="stat-card"><div class="sc-icon">👥</div><div class="sc-val">${d.customers}</div><div class="sc-lbl">Kayıtlı Müşteri</div></div>
      <div class="stat-card"><div class="sc-icon">✉️</div><div class="sc-val">${d.newsletter}</div><div class="sc-lbl">Bülten Abonesi</div></div>
    </div>
    <div class="row-2">
      <div class="panel">
        <div class="panel-head"><h2>Son 7 Gün Gelir</h2><span class="muted" style="font-size:12px">iptal hariç</span></div>
        <div class="panel-body">
          <div class="bar-chart">
            ${d.days.map((x) => `
            <div class="bar-col" title="${x.label}: ${fmt(x.value)}">
              <b>${x.value ? fmt(x.value).replace('₺', '').trim() : ''}</b>
              <div class="bar" style="height:${Math.max(4, (x.value / maxDay) * 78)}%"></div>
              <span>${x.label}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Kategori Dağılımı</h2><span class="muted" style="font-size:12px">satılan adet</span></div>
        <div class="panel-body">
          <div class="kv-list">
            ${cats.length ? cats.map(([name, v]) => `
            <div class="kv-row"><span class="kv-name">${esc(name)}</span><div class="kv-bar"><i style="width:${Math.round((v / maxCat) * 100)}%"></i></div><span class="kv-val">${v} adet</span></div>`).join('')
      : '<div class="empty"><div class="big">📭</div>Henüz satış verisi yok</div>'}
          </div>
        </div>
      </div>
    </div>
    <div class="row-2" style="margin-top:20px">
      <div class="panel">
        <div class="panel-head"><h2>Son Siparişler</h2><a href="#/orders" class="btn btn-ghost btn-sm">Tümü →</a></div>
        <div class="panel-body flush">
          <table class="tbl"><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead><tbody id="dash-orders"></tbody></table>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Stok Uyarısı</h2><span class="muted" style="font-size:12px">≤ 5 adet</span></div>
        <div class="panel-body flush">
          <table class="tbl"><thead><tr><th>Ürün</th><th>Stok</th></tr></thead><tbody>
            ${d.lowStock.length ? d.lowStock.map((p) => `<tr><td>${esc(p.name)}</td><td class="${p.stock === 0 ? 'no-stock' : 'low-stock'}">${p.stock === 0 ? 'TÜKENDİ' : p.stock + ' adet'}</td></tr>`).join('') : '<tr><td colspan="2"><div class="empty">Stoklar sağlıklı 🎉</div></td></tr>'}
          </tbody></table>
        </div>
      </div>
    </div>`);
    try {
      const orders = (await api('/api/admin/orders')).orders.slice(0, 5);
      $('#dash-orders').innerHTML = orders.length ? orders.map((o) => `
        <tr><td class="mono">${esc(o.id)}</td><td>${esc(o.customerName)}<div class="muted" style="font-size:11px">${dShort(o.createdAt)}</div></td><td><b>${fmt(o.total)}</b></td><td><span class="pill s-${o.status}">${STATUS[o.status]}</span></td></tr>`).join('')
        : '<tr><td colspan="4"><div class="empty">Sipariş yok</div></td></tr>';
    } catch (e) { }
  }

  /* ================= ORDERS ================= */
  async function viewOrders() {
    mount('orders', '<div class="toolbar"><div class="search-box"><span class="ic">🔍</span><input id="ord-q" placeholder="Sipariş no / müşteri ara…"></div><select id="ord-status"><option value="">Tüm durumlar</option><option value="processing">Hazırlanıyor</option><option value="shipped">Kargoda</option><option value="delivered">Teslim Edildi</option><option value="cancelled">İptal</option></select></div><div class="panel"><div class="panel-body flush"><table class="tbl"><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Ürün</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr></thead><tbody id="ord-body"></tbody></table></div></div>');
    let all = [];
    try { all = (await api('/api/admin/orders')).orders; } catch (e) { return toast(e.message, true); }
    function draw() {
      const kw = $('#ord-q').value.trim().toLowerCase();
      const st = $('#ord-status').value;
      const list = all.filter((o) => (!st || o.status === st) && (!kw || o.id.toLowerCase().includes(kw) || o.customerName.toLowerCase().includes(kw) || (o.userEmail || '').includes(kw)));
      $('#ord-body').innerHTML = list.length ? list.map((o) => `
      <tr>
        <td class="mono">${esc(o.id)}<div class="muted" style="font-size:11px">${dShort(o.createdAt)}</div></td>
        <td>${esc(o.customerName)}<div class="muted" style="font-size:11px">${esc(o.address ? o.address.city : '')}${o.discreet ? ' · 📦 gizli' : ''}</div></td>
        <td>${o.items.reduce((a, i) => a + i.qty, 0)} kalem</td>
        <td><b>${fmt(o.total)}</b><div class="muted" style="font-size:11px">${esc(o.payment)}</div></td>
        <td><span class="pill s-${o.status}">${STATUS[o.status]}</span></td>
        <td style="white-space:nowrap">
          <button class="btn-icon" data-view="${esc(o.id)}" title="Detay">👁️</button>
          <select data-status="${esc(o.id)}" style="background:var(--card-2);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:12px">
            ${['processing', 'shipped', 'delivered', 'cancelled'].map((s) => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${STATUS[s]}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty">Sonuç bulunamadı</div></td></tr>';
      $$('[data-view]').forEach((b) => b.addEventListener('click', () => openOrderModal(all.find((o) => o.id === b.dataset.view))));
      $$('[data-status]').forEach((sel) => sel.addEventListener('change', async () => {
        try { await api('/api/admin/orders/' + encodeURIComponent(sel.dataset.status), { method: 'POST', body: { status: sel.value } }); toast('Sipariş durumu güncellendi'); viewOrders(); }
        catch (e) { toast(e.message, true); }
      }));
    }
    $('#ord-q').addEventListener('input', draw);
    $('#ord-status').addEventListener('change', draw);
    draw();
  }

  function openOrderModal(o) {
    if (!o) return;
    const m = document.createElement('div');
    m.className = 'modal-back open';
    m.innerHTML = `<div class="modal" style="max-width:640px">
      <div class="modal-head"><h3>Sipariş ${esc(o.id)}</h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <dl class="dl">
          <dt>Müşteri</dt><dd>${esc(o.customerName)} · ${esc(o.userEmail || 'misafir')}</dd>
          <dt>Telefon</dt><dd>${esc(o.phone || '—')}</dd>
          <dt>Adres</dt><dd>${esc(o.address ? o.address.full + ', ' + o.address.city + ' ' + (o.address.zip || '') : '—')}</dd>
          <dt>Ödeme</dt><dd>${esc(o.payment)}</dd>
          <dt>Not</dt><dd>${esc(o.note || '—')}</dd>
          <dt>Gizli Paket</dt><dd>${o.discreet ? '✅ Evet' : 'Hayır'}</dd>
          <dt>Kupon</dt><dd>${o.coupon ? esc(o.coupon) : '—'}</dd>
        </dl>
        <h3 style="margin:20px 0 10px;font-family:var(--font-display);font-size:14px">Ürünler</h3>
        <table class="tbl"><thead><tr><th></th><th>Ürün</th><th>Adet</th><th>Tutar</th></tr></thead><tbody>
          ${o.items.map((i) => `<tr><td><img src="${esc(i.image)}" style="width:40px;height:40px;border-radius:8px;object-fit:cover"></td><td>${esc(i.name)}</td><td>${i.qty}</td><td>${fmt(i.price * i.qty)}</td></tr>`).join('')}
        </tbody></table>
        <dl class="dl" style="margin-top:16px">
          <dt>Ara Toplam</dt><dd>${fmt(o.subtotal)}</dd>
          <dt>Kargo</dt><dd>${o.shipping ? fmt(o.shipping) : 'Ücretsiz'}</dd>
          <dt>İndirim</dt><dd>${o.discount ? '-' + fmt(o.discount) : '—'}</dd>
          <dt><b>Toplam</b></dt><dd><b>${fmt(o.total)}</b></dd>
        </dl>
      </div>
      <div class="modal-foot"><button class="btn btn-primary modal-close">Kapat</button></div>
    </div>`;
    document.body.appendChild(m);
    $$('.modal-close', m).forEach((b) => b.addEventListener('click', () => m.remove()));
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });
  }

  /* ================= PRODUCTS ================= */
  let CATS_CACHE = null;
  async function ensureCats() {
    if (CATS_CACHE) return CATS_CACHE;
    CATS_CACHE = (await api('/api/categories')).categories;
    return CATS_CACHE;
  }

  async function viewProducts() {
    mount('products', `
    <div class="toolbar">
      <div class="search-box"><span class="ic">🔍</span><input id="prod-q" placeholder="Ürün ara…"></div>
      <button class="btn btn-ghost" id="wheel-mgr" style="margin-left:auto">🎡 Çarkı Yönet</button>
      <button class="btn btn-primary" id="prod-add">＋ Yeni Ürün</button>
    </div>
    <div class="panel"><div class="panel-body flush">
      <table class="tbl"><thead><tr><th>Ürün</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Özellikler</th><th>İşlem</th></tr></thead><tbody id="prod-body"></tbody></table>
    </div></div>`);
    let all = [];
    let wheelIds = [];
    try { all = (await api('/api/admin/products')).products; } catch (e) { return toast(e.message, true); }
    try { wheelIds = (await api('/api/admin/wheel')).ids; } catch {}
    function draw() {
      const kw = $('#prod-q').value.trim().toLowerCase();
      const inWheel = new Set(wheelIds);
      const list = all.filter((p) => !kw || p.name.toLowerCase().includes(kw) || p.slug.includes(kw) || (p.categoryName || '').toLowerCase().includes(kw));
      $('#prod-body').innerHTML = list.length ? list.map((p) => `
      <tr>
        <td><div class="cell-prod"><img src="${esc(p.image)}"><div><div class="cp-name">${esc(p.name)}</div><div class="cp-sub">/${esc(p.slug)}</div></div></div></td>
        <td>${esc(p.categoryName || p.category)}</td>
        <td><b>${fmt(p.price)}</b>${p.oldPrice ? `<div class="muted" style="font-size:11px;text-decoration:line-through">${fmt(p.oldPrice)}</div>` : ''}</td>
        <td class="${p.stock === 0 ? 'no-stock' : p.stock <= 5 ? 'low-stock' : ''}">${p.stock}</td>
        <td>${p.featured ? '<span class="pill s-active">Öne çıkan</span>' : ''} ${p.bestSeller ? '<span class="pill s-shipped">Çok satan</span>' : ''} ${p.isNew ? '<span class="pill s-processing">Yeni</span>' : ''}</td>
        <td style="white-space:nowrap">
          <button class="btn-icon ${inWheel.has(p.id) ? 'on-wheel' : ''}" data-wheel="${p.id}" title="Ana sayfa çarkına ekle / çıkar">🎡</button>
          <button class="btn-icon" data-edit="${p.id}" title="Düzenle">✏️</button>
          <button class="btn-icon danger" data-del="${p.id}" title="Sil">🗑️</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty">Ürün bulunamadı</div></td></tr>';
      $$('[data-wheel]', $('#prod-body')).forEach((b) => b.addEventListener('click', async () => {
        try {
          const r = await api('/api/admin/wheel', { method: 'POST', body: { toggle: b.dataset.wheel } });
          wheelIds = r.ids;
          toast(r.ids.includes(b.dataset.wheel) ? 'Ürün çarka eklendi 🎡' : 'Ürün çarktan çıkarıldı');
          draw();
        } catch (e) { toast(e.message, true); }
      }));
      $$('[data-edit]', $('#prod-body')).forEach((b) => b.addEventListener('click', () => openProductModal(all.find((p) => p.id === b.dataset.edit))));
      $$('[data-del]', $('#prod-body')).forEach((b) => b.addEventListener('click', async () => {
        const p = all.find((x) => x.id === b.dataset.del);
        if (!confirm(`"${p.name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
        try { await api('/api/admin/products/' + p.id, { method: 'DELETE' }); toast('Ürün silindi'); viewProducts(); }
        catch (e) { toast(e.message, true); }
      }));
    }
    $('#wheel-mgr').addEventListener('click', () => openWheelModal());
    $('#prod-add').addEventListener('click', () => openProductModal(null));
    $('#prod-q').addEventListener('input', draw);
    draw();
  }

  async function openWheelModal() {
    let sel = [], all = [];
    try {
      const w = await api('/api/admin/wheel');
      sel = [...w.ids];
    } catch (e) { return toast(e.message, true); }
    try { all = (await api('/api/admin/products')).products; } catch (e) { return toast(e.message, true); }
    const m = document.createElement('div');
    m.className = 'modal-back open';
    m.innerHTML = `<div class="modal" style="max-width:660px">
      <div class="modal-head"><h3>🎡 Çarkı Yönet <span class="muted" style="font-size:12px;font-weight:400">— en fazla 8 ürün, sırayla döner</span></h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <div id="wm-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px"></div>
        <div class="field"><label>Ürün Ekle</label><input id="wm-q" placeholder="Ürün adı veya slug ile ara…"><div class="hint">Çarkta olmayan ürünler listelenir; tıklayınca sıranın sonuna eklenir</div></div>
        <div id="wm-results"></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost modal-close">Vazgeç</button>
        <button class="btn btn-primary" id="wm-save">Kaydet</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    $$('.modal-close', m).forEach((b) => b.addEventListener('click', () => m.remove()));
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });

    function drawList() {
      $('#wm-list', m).innerHTML = sel.length ? sel.map((id, i) => {
        const p = all.find((x) => x.id === id);
        if (!p) return '';
        return `<div style="display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--line);border-radius:10px;background:var(--card)">
          <b style="font-family:'Playfair Display',serif;font-style:italic;width:22px;color:var(--rose)">0${i + 1}</b>
          <img src="${esc(p.image)}" style="width:36px;height:36px;object-fit:cover;border-radius:8px">
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div><div class="muted" style="font-size:11px">${fmt(p.price)}</div></div>
          <button class="btn-icon danger" data-wm-del="${id}" title="Çıkar">✕</button>
        </div>`;
      }).join('') : '<div class="empty" style="padding:20px">Çark boş — henüz seçim yapılmamış, seçmezseniz otomatik olarak öne çıkan ürünler döner.</div>';
      $$('[data-wm-del]', m).forEach((b) => b.addEventListener('click', () => { sel = sel.filter((x) => x !== b.dataset.wmDel); drawList(); drawResults(); }));
    }
    function drawResults() {
      const kw = $('#wm-q', m).value.trim().toLowerCase();
      const inSel = new Set(sel);
      const list = all.filter((p) => !inSel.has(p.id) && (!kw || p.name.toLowerCase().includes(kw) || p.slug.includes(kw))).slice(0, 8);
      $('#wm-results', m).innerHTML = list.length ? list.map((p) => `
        <button data-wm-add="${p.id}" style="display:flex;align-items:center;gap:10px;width:100%;padding:7px 10px;border:1px dashed var(--line);border-radius:10px;background:transparent;cursor:pointer;text-align:left;transition:border-color .2s" onmouseover="this.style.borderColor='var(--rose)'" onmouseout="this.style.borderColor='var(--line)'">
          <img src="${esc(p.image)}" style="width:36px;height:36px;object-fit:cover;border-radius:8px">
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div><div class="muted" style="font-size:11px">${esc(p.categoryName)} · ${fmt(p.price)}</div></div>
          <span style="color:var(--rose);font-weight:700">＋</span>
        </button>`).join('') : '<div class="muted" style="font-size:12.5px;text-align:center;padding:10px">Eklenecek ürün yok</div>';
      $$('[data-wm-add]', m).forEach((b) => b.addEventListener('click', () => {
        if (sel.length >= 8) return toast('Çarkta en fazla 8 ürün olabilir', true);
        sel.push(b.dataset.wmAdd); drawList(); drawResults();
      }));
    }
    $('#wm-q', m).addEventListener('input', drawResults);
    drawList(); drawResults();

    $('#wm-save', m).addEventListener('click', async () => {
      try {
        await api('/api/admin/wheel', { method: 'POST', body: { ids: sel } });
        toast('Çark listesi kaydedildi 🎡');
        m.remove(); viewProducts();
      } catch (e) { toast(e.message, true); }
    });
  }

  async function openProductModal(p) {
    const cats = await ensureCats();
    const isEdit = !!p;
    const v = p || { name: '', category: cats[0] ? cats[0].slug : 'ciftler', categoryName: cats[0] ? cats[0].name : '', description: '', longDescription: '', price: '', oldPrice: '', stock: 10, rating: 4.5, featured: false, isNew: true, bestSeller: false, image: '' };
    const m = document.createElement('div');
    m.className = 'modal-back open';
    m.innerHTML = `<div class="modal">
      <div class="modal-head"><h3>${isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <div class="grid-2">
          <div class="field"><label>Ürün Adı *</label><input id="pm-name" value="${esc(v.name)}"></div>
          <div class="field"><label>Kategori</label>
            <select id="pm-cat">${cats.map((c) => `<option value="${c.slug}" ${v.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('') || '<option value="ciftler">Genel</option>'}</select>
          </div>
        </div>
        <div class="grid-3">
          <div class="field"><label>Fiyat (₺) *</label><input id="pm-price" type="number" min="0" step="0.01" value="${esc(v.price)}"></div>
          <div class="field"><label>Eski Fiyat (₺)</label><input id="pm-old" type="number" min="0" step="0.01" value="${esc(v.oldPrice || '')}" placeholder="boş = yok"></div>
          <div class="field"><label>Stok</label><input id="pm-stock" type="number" min="0" value="${esc(v.stock)}"></div>
        </div>
        <div class="field"><label>Kısa Açıklama</label><input id="pm-desc" value="${esc(v.description)}"></div>
        <div class="field"><label>Uzun Açıklama</label><textarea id="pm-long">${esc(v.longDescription)}</textarea></div>
        <div class="field"><label>Görsel</label>
          <input type="file" id="pm-file" accept="image/*" style="display:none">
          <div class="img-drop" id="pm-drop">📤 Görsel seç veya sürükle-bırak (SVG/PNG/JPG, max 2MB)<div class="hint">Boş bırakılırsa varsayılan görsel kullanılır</div></div>
          <div class="img-preview" id="pm-prev">${v.image ? `<img src="${esc(v.image)}">` : ''}</div>
          <input type="hidden" id="pm-image" value="${esc(v.image || '')}">
        </div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <label class="checkbox-row"><input type="checkbox" id="pm-featured" ${v.featured ? 'checked' : ''}> Öne çıkan</label>
          <label class="checkbox-row"><input type="checkbox" id="pm-new" ${v.isNew ? 'checked' : ''}> Yeni rozeti</label>
          <label class="checkbox-row"><input type="checkbox" id="pm-best" ${v.bestSeller ? 'checked' : ''}> Çok satan</label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost modal-close">Vazgeç</button>
        <button class="btn btn-primary" id="pm-save">${isEdit ? 'Kaydet' : 'Ürünü Ekle'}</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    $$('.modal-close', m).forEach((b) => b.addEventListener('click', () => m.remove()));
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });

    const drop = $('#pm-drop', m), fileIn = $('#pm-file', m), prev = $('#pm-prev', m), hidden = $('#pm-image', m);
    drop.addEventListener('click', () => fileIn.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); if (e.dataTransfer.files[0]) readImg(e.dataTransfer.files[0]); });
    fileIn.addEventListener('change', () => { if (fileIn.files[0]) readImg(fileIn.files[0]); });
    function readImg(file) {
      if (file.size > 2 * 1024 * 1024) return toast('Görsel 2MB üzerinde olamaz', true);
      const r = new FileReader();
      r.onload = () => { hidden.value = r.result; prev.innerHTML = `<img src="${r.result}">`; toast('Görsel hazır'); };
      r.readAsDataURL(file);
    }

    $('#pm-save', m).addEventListener('click', async () => {
      const catSlug = $('#pm-cat', m).value;
      const catObj = cats.find((c) => c.slug === catSlug);
      const body = {
        name: $('#pm-name', m).value.trim(),
        category: catSlug, categoryName: catObj ? catObj.name : catSlug,
        price: Number($('#pm-price', m).value),
        oldPrice: $('#pm-old', m).value === '' ? null : Number($('#pm-old', m).value),
        stock: Number($('#pm-stock', m).value),
        description: $('#pm-desc', m).value.trim(),
        longDescription: $('#pm-long', m).value.trim(),
        image: hidden.value,
        featured: $('#pm-featured', m).checked, isNew: $('#pm-new', m).checked, bestSeller: $('#pm-best', m).checked
      };
      if (!body.name) return toast('Ürün adı zorunlu', true);
      if (!body.price || body.price <= 0) return toast('Geçerli bir fiyat girin', true);
      try {
        if (isEdit) await api('/api/admin/products/' + p.id, { method: 'POST', body });
        else await api('/api/admin/products', { method: 'POST', body });
        toast(isEdit ? 'Ürün güncellendi' : 'Ürün eklendi');
        m.remove(); viewProducts();
      } catch (e) { toast(e.message, true); }
    });
  }

  /* ================= REVIEWS ================= */
  async function viewReviews() {
    mount('reviews', '<div class="panel"><div class="panel-body flush"><table class="tbl"><thead><tr><th>Ürün</th><th>Yazan</th><th>Puan</th><th>Yorum</th><th>Durum</th><th>İşlem</th></tr></thead><tbody id="rev-body"></tbody></table></div></div>');
    let list = [];
    try { list = (await api('/api/admin/reviews')).reviews; } catch (e) { return toast(e.message, true); }
    const prods = (await api('/api/admin/products')).products;
    const pname = (id) => { const p = prods.find((x) => x.id === id); return p ? p.name : '—'; };
    $('#rev-body').innerHTML = list.length ? list.map((r) => `
    <tr>
      <td>${esc(pname(r.productId))}</td>
      <td>${esc(r.userName)}<div class="muted" style="font-size:11px">${dShort(r.createdAt)}</div></td>
      <td style="color:#B58A5E">${'★'.repeat(r.rating)}</td>
      <td style="max-width:320px">${esc(r.text)}</td>
      <td>${r.approved ? '<span class="pill s-active">Onaylı</span>' : '<span class="pill s-processing">Bekliyor</span>'}</td>
      <td style="white-space:nowrap">
        ${r.approved ? '' : `<button class="btn btn-primary btn-sm" data-app="${r.id}">Onayla</button>`}
        <button class="btn-icon danger" data-del="${r.id}" title="Sil">🗑️</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="6"><div class="empty"><div class="big">⭐</div>Henüz yorum yok</div></td></tr>';
    $$('[data-app]').forEach((b) => b.addEventListener('click', async () => {
      try { await api('/api/admin/reviews/' + b.dataset.app + '/approve', { method: 'POST' }); toast('Yorum onaylandı ve puan güncellendi'); viewReviews(); }
      catch (e) { toast(e.message, true); }
    }));
    $$('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Bu yorum silinsin mi?')) return;
      try { await api('/api/admin/reviews/' + b.dataset.del, { method: 'DELETE' }); toast('Yorum silindi'); viewReviews(); }
      catch (e) { toast(e.message, true); }
    }));
  }

  /* ================= CATEGORIES ================= */
  async function viewCategories() {
    mount('categories', `
    <div class="toolbar">
      <div style="font-size:13px" class="muted">Kategori fotoğrafları ana sayfadaki bento alanında görünür.</div>
      <button class="btn btn-primary" id="cat-add" style="margin-left:auto">＋ Yeni Kategori</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px" id="cat-grid"></div>`);
    let list = [];
    try { list = (await api('/api/admin/categories')).categories; } catch (e) { return toast(e.message, true); }
    $('#cat-grid').innerHTML = list.length ? list.map((c) => `
    <div class="panel" style="margin-bottom:0;overflow:visible">
      <div style="aspect-ratio:16/10;background:var(--card-2);border-radius:12px 12px 0 0;overflow:hidden;position:relative">
        ${c.image ? `<img src="${esc(c.image)}" style="width:100%;height:100%;object-fit:cover">` : '<div class="empty">Görsel yok</div>'}
      </div>
      <div class="panel-body" style="padding:14px 16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <b>${esc(c.name)}</b>
          <span class="muted" style="font-size:11.5px">${c.count} ürün</span>
        </div>
        <div class="muted" style="font-size:12px;margin-bottom:10px">/${esc(c.slug)}</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" data-edit="${c.id}">✏️ Düzenle</button>
          <button class="btn-icon danger" data-del="${c.id}" title="Sil">🗑️</button>
        </div>
      </div>
    </div>`).join('') : '<div class="panel"><div class="empty"><div class="big">🗂️</div>Kategori yok</div></div>';
    $('#cat-add').addEventListener('click', () => openCategoryModal(null));
    $$('[data-edit]', $('#cat-grid')).forEach((b) => b.addEventListener('click', () => openCategoryModal(list.find((c) => c.id === b.dataset.edit))));
    $$('[data-del]', $('#cat-grid')).forEach((b) => b.addEventListener('click', async () => {
      const c = list.find((x) => x.id === b.dataset.del);
      if (!confirm(`"${c.name}" kategorisi silinsin mi?`)) return;
      try { await api('/api/admin/categories/' + c.id, { method: 'DELETE' }); toast('Kategori silindi'); viewCategories(); }
      catch (e) { toast(e.message, true); }
    }));
  }

  async function openCategoryModal(cat) {
    const isEdit = !!cat;
    const v = cat || { name: '', slug: '', image: '' };
    const m = document.createElement('div');
    m.className = 'modal-back open';
    m.innerHTML = `<div class="modal" style="max-width:520px">
      <div class="modal-head"><h3>${isEdit ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <div class="field"><label>Kategori Adı *</label><input id="ct-name" value="${esc(v.name)}"></div>
        ${isEdit ? '' : '<div class="field"><label>Slug (boş bırakılırsa otomatik)</label><input id="ct-slug" placeholder="orn: ciftler"><div class="hint">Mağaza filtrelerinde ve URL\'de kullanılır</div></div>'}
        <div class="field"><label>Kategori Fotoğrafı</label>
          <input type="file" id="ct-file" accept="image/*" style="display:none">
          <div class="img-drop" id="ct-drop">📤 Fotoğraf seç veya sürükle-bırak (max 2MB)<div class="hint">Bento alanında görünür; boş bırakılırsa ilk ürün fotoğrafı kullanılır</div></div>
          <div class="img-preview" id="ct-prev">${v.image ? `<img src="${esc(v.image)}">` : ''}</div>
          <input type="hidden" id="ct-image" value="${esc(v.image || '')}">
        </div>
        ${isEdit ? '<label class="checkbox-row"><input type="checkbox" id="ct-auto"> Bu kategorinin ilk ürün fotoğrafını kapak yap</label>' : ''}
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost modal-close">Vazgeç</button>
        <button class="btn btn-primary" id="ct-save">${isEdit ? 'Kaydet' : 'Kategoriyi Ekle'}</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    $$('.modal-close', m).forEach((b) => b.addEventListener('click', () => m.remove()));
    m.addEventListener('click', (e) => { if (e.target === m) m.remove(); });

    const drop = $('#ct-drop', m), fileIn = $('#ct-file', m), prev = $('#ct-prev', m), hidden = $('#ct-image', m);
    drop.addEventListener('click', () => fileIn.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('drag'); if (e.dataTransfer.files[0]) readImg(e.dataTransfer.files[0]); });
    fileIn.addEventListener('change', () => { if (fileIn.files[0]) readImg(fileIn.files[0]); });
    function readImg(file) {
      if (file.size > 2 * 1024 * 1024) return toast('Görsel 2MB üzerinde olamaz', true);
      const r = new FileReader();
      r.onload = () => { hidden.value = r.result; prev.innerHTML = `<img src="${r.result}">`; $('ct-auto') && ($('ct-auto').checked = false); };
      r.readAsDataURL(file);
    }

    $('#ct-save', m).addEventListener('click', async () => {
      const name = $('#ct-name', m).value.trim();
      if (!name) return toast('Kategori adı zorunlu', true);
      const autoCb = isEdit ? $('#ct-auto', m) : null;
      const body = { name, image: hidden.value, slug: isEdit ? undefined : ($('#ct-slug', m).value || undefined), useAutoCover: autoCb ? autoCb.checked : undefined };
      try {
        if (isEdit) await api('/api/admin/categories/' + cat.id, { method: 'POST', body });
        else await api('/api/admin/categories', { method: 'POST', body });
        toast(isEdit ? 'Kategori güncellendi' : 'Kategori eklendi');
        m.remove(); viewCategories();
      } catch (e) { toast(e.message, true); }
    });
  }

  /* ================= COUPONS ================= */
  async function viewCoupons() {
    mount('coupons', `
    <div class="panel">
      <div class="panel-head"><h2>Yeni Kupon</h2></div>
      <div class="panel-body">
        <div class="grid-3" style="align-items:end">
          <div class="field"><label>Kupon Kodu</label><input id="cp-code" placeholder="ÖRN: YAZ20" style="text-transform:uppercase"></div>
          <div class="field"><label>Tür</label><select id="cp-type"><option value="percent">Yüzde (%)</option><option value="fixed">Tutar (₺)</option></select></div>
          <div class="field"><label>Değer</label><input id="cp-val" type="number" min="0" placeholder="10"></div>
        </div>
        <div class="grid-3" style="align-items:end">
          <div class="field"><label>Minimum Sepet (₺)</label><input id="cp-min" type="number" min="0" value="0"></div>
          <div style="padding-bottom:15px"><label class="checkbox-row"><input type="checkbox" id="cp-active" checked> Aktif olarak başlat</label></div>
          <div style="padding-bottom:15px" class="muted"><button class="btn btn-primary" id="cp-add">＋ Kupon Ekle</button></div>
        </div>
      </div>
    </div>
    <div class="panel"><div class="panel-body flush"><table class="tbl"><thead><tr><th>Kod</th><th>Tür</th><th>Değer</th><th>Min. Sepet</th><th>Kullanım</th><th>Durum</th><th>İşlem</th></tr></thead><tbody id="cp-body"></tbody></table></div></div>`);
    let list = [];
    async function load() {
      try { list = (await api('/api/admin/coupons')).coupons; } catch (e) { return toast(e.message, true); }
      $('#cp-body').innerHTML = list.length ? list.map((c) => `
      <tr>
        <td class="mono" style="font-size:13px;font-weight:700">${esc(c.code)}</td>
        <td>${c.type === 'percent' ? 'Yüzde' : 'Tutar'}</td>
        <td><b>${c.type === 'percent' ? '%' + c.value : fmt(c.value)}</b></td>
        <td>${c.minTotal ? fmt(c.minTotal) : '—'}</td>
        <td>${c.used}×</td>
        <td>${c.active ? '<span class="pill s-active">Aktif</span>' : '<span class="pill s-passive">Pasif</span>'}</td>
        <td style="white-space:nowrap">
          <button class="btn-icon" data-tog="${c.id}" title="${c.active ? 'Pasifleştir' : 'Aktifleştir'}">${c.active ? '⏸️' : '▶️'}</button>
          <button class="btn-icon danger" data-del="${c.id}" title="Sil">🗑️</button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7"><div class="empty">Kupon yok</div></td></tr>';
      $$('[data-tog]').forEach((b) => b.addEventListener('click', async () => {
        const c = list.find((x) => x.id === b.dataset.tog);
        try { await api('/api/admin/coupons/' + c.id, { method: 'POST', body: { active: !c.active } }); toast(c.active ? 'Kupon pasifleştirildi' : 'Kupon aktifleştirildi'); load(); }
        catch (e) { toast(e.message, true); }
      }));
      $$('[data-del]').forEach((b) => b.addEventListener('click', async () => {
        if (!confirm('Kupon silinsin mi?')) return;
        try { await api('/api/admin/coupons/' + b.dataset.del, { method: 'DELETE' }); toast('Kupon silindi'); load(); }
        catch (e) { toast(e.message, true); }
      }));
    }
    $('#cp-add').addEventListener('click', async () => {
      const body = { code: $('#cp-code').value.trim(), type: $('#cp-type').value, value: Number($('#cp-val').value), minTotal: Number($('#cp-min').value), active: $('#cp-active').checked };
      if (!body.code || body.code.length < 3) return toast('Geçerli bir kupon kodu girin', true);
      if (!body.value || body.value <= 0) return toast('Değer sıfırdan büyük olmalı', true);
      try { await api('/api/admin/coupons', { method: 'POST', body }); toast('Kupon eklendi'); $('#cp-code').value = ''; $('#cp-val').value = ''; load(); }
      catch (e) { toast(e.message, true); }
    });
    load();
  }

  /* ================= USERS ================= */
  async function viewUsers() {
    mount('users', '<div class="panel"><div class="panel-body flush"><table class="tbl"><thead><tr><th>Kullanıcı</th><th>E-posta</th><th>Rol</th><th>Sipariş</th><th>Kayıt</th><th>İşlem</th></tr></thead><tbody id="usr-body"></tbody></table></div></div>');
    let list = [];
    try { list = (await api('/api/admin/users')).users; } catch (e) { return toast(e.message, true); }
    $('#usr-body').innerHTML = list.map((u) => `
    <tr>
      <td><b>${esc(u.name)}</b></td>
      <td>${esc(u.email)}</td>
      <td>${u.role === 'admin' ? '<span class="pill s-shipped">Admin</span>' : '<span class="pill s-passive">Müşteri</span>'}</td>
      <td>${u.orders}</td>
      <td class="muted" style="font-size:12px">${new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
      <td style="white-space:nowrap">
        ${u.role === 'admin' ? '' : `<button class="btn btn-ghost btn-sm" data-role="${u.id}">Admin yap</button>
        <button class="btn-icon danger" data-del="${u.id}" title="Sil">🗑️</button>`}
      </td>
    </tr>`).join('');
    $$('[data-role]').forEach((b) => b.addEventListener('click', async () => {
      try { await api('/api/admin/users/' + b.dataset.role, { method: 'POST', body: { role: 'admin' } }); toast('Rol güncellendi'); viewUsers(); }
      catch (e) { toast(e.message, true); }
    }));
    $$('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Kullanıcı silinsin mi?')) return;
      try { await api('/api/admin/users/' + b.dataset.del, { method: 'DELETE' }); toast('Kullanıcı silindi'); viewUsers(); }
      catch (e) { toast(e.message, true); }
    }));
  }

  /* ================= MESSAGES ================= */
  async function viewMessages() {
    mount('messages', '<div class="panel"><div class="panel-body" id="msg-body"><div class="loading">Yükleniyor…</div></div></div>');
    let list = [];
    try { list = (await api('/api/admin/messages')).messages; } catch (e) { return toast(e.message, true); }
    $('#msg-body').innerHTML = list.length ? list.map((m) => `
    <div style="border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
        <b>${esc(m.name)} · <span style="color:#FF8E86">${esc(m.email)}</span></b>
        <span class="muted" style="font-size:12px">${dShort(m.createdAt)}</span>
      </div>
      <div>${esc(m.message)}</div>
    </div>`).join('') : '<div class="empty"><div class="big">💌</div>Gelen kutusu boş</div>';
  }

  /* ================= SETTINGS ================= */
  async function viewSettings() {
    mount('settings', '<div class="loading" style="text-align:center;padding:40px">Yükleniyor…</div>');
    let s;
    try { s = (await api('/api/admin/settings')).settings; } catch (e) { return toast(e.message, true); }
    mount('settings', `
    <div class="panel" style="max-width:760px">
      <div class="panel-head"><h2>Mağaza Ayarları</h2></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field"><label>Mağaza Adı</label><input id="st-name" value="${esc(s.storeName)}"></div>
          <div class="field"><label>Duyuru Metni (üst bant)</label><input id="st-announce" value="${esc(s.announcement)}"></div>
        </div>
        <div class="grid-3">
          <div class="field"><label>Ücretsiz Kargo Eşiği (₺)</label><input id="st-free" type="number" value="${esc(s.freeShippingThreshold)}"></div>
          <div class="field"><label>Kargo Ücreti (₺)</label><input id="st-ship" type="number" step="0.01" value="${esc(s.shippingFee)}"></div>
          <div class="field"><label>KDV Oranı (%)</label><input id="st-kdv" type="number" value="${esc(s.kdvRate)}"></div>
        </div>
        <div class="grid-3">
          <div class="field"><label>Destek E-posta</label><input id="st-mail" value="${esc(s.supportEmail)}"></div>
          <div class="field"><label>Destek Telefon</label><input id="st-phone" value="${esc(s.supportPhone)}"></div>
          <div class="field"><label>WhatsApp Link</label><input id="st-wa" value="${esc(s.whatsapp || '')}" placeholder="https://wa.me/905xxxxxxxxx"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label>Mağaza Adresi (iletişim & footer)</label><input id="st-addr" value="${esc(s.address || '')}"></div>
          <div class="field"><label>Google Harita Sorgu</label><input id="st-maps" value="${esc(s.mapsQuery || '')}" placeholder="Örn: İşletme adı banka"></div>
        </div>
        <button class="btn btn-primary" id="st-save">Ayarları Kaydet</button>
      </div>
    </div>`);
    $('#st-save').addEventListener('click', async () => {
      try {
        await api('/api/admin/settings', { method: 'POST', body: {
          storeName: $('#st-name').value, announcement: $('#st-announce').value,
          freeShippingThreshold: Number($('#st-free').value), shippingFee: Number($('#st-ship').value), kdvRate: Number($('#st-kdv').value),
          supportEmail: $('#st-mail').value, supportPhone: $('#st-phone').value, whatsapp: $('#st-wa').value,
          address: $('#st-addr').value, mapsQuery: $('#st-maps').value
        } });
        toast('Ayarlar kaydedildi');
      } catch (e) { toast(e.message, true); }
    });
  }

  /* ================= ROUTER ================= */
  const VIEWS = { dashboard: viewDashboard, orders: viewOrders, products: viewProducts, categories: viewCategories, reviews: viewReviews, coupons: viewCoupons, users: viewUsers, messages: viewMessages, settings: viewSettings };
  async function route() {
    let sess;
    try { sess = await api('/api/session'); } catch { sess = { user: null }; }
    if (!sess.user || sess.user.role !== 'admin') return loginScreen();
    window.__me = sess.user;
    try {
      const st = (await api('/api/admin/stats')).stats;
      window.__badges = { orders: 0, reviews: st.pendingReviews };
    } catch { window.__badges = {}; }
    const page = (location.hash || '#/dashboard').split('/')[1] || 'dashboard';
    if (!VIEWS[page]) return (location.hash = '#/dashboard');
    VIEWS[page]();
  }
  addEventListener('hashchange', route);
  route();
})();
