'use strict';
(() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const LANG = window.__LS_LANG__ || 'tr';
  const fmt = (n) => new Intl.NumberFormat(LANG === 'en' ? 'en-US' : 'tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  const dateFmt = (s) => new Date(s).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'tr-TR');

  const STR = {
    tr: {
      'nav.login': 'Giriş',
      'added': 'Sepete eklendi',
      'badge.new': 'Yeni', 'badge.hot': 'Çok Satan', 'badge.sale': 'İndirim', 'quickadd': 'Sepete Ekle',
      'nl.bad': 'Geçerli bir e-posta girin', 'nl.ok': 'Aramıza hoş geldin! %10 indirim kodun mailinde.',
      'shop.all': 'Tümü', 'shop.count': '{n} ürün', 'shop.empty': 'Aradığın kriterlere uyan ürün bulunamadı.<br>Filtreleri değiştirmeyi dene.',
      'pd.crumb.home': 'Anasayfa', 'pd.crumb.shop': 'Mağaza', 'pd.reviews': 'değerlendirme',
      'pd.notfound': 'Ürün bulunamadı.', 'pd.notfound.btn': 'Mağazaya Dön',
      'pd.add': '🛍️ Sepete Ekle', 'pd.buy': 'Hemen Al',
      'pd.stock.in': 'Stokta, 24 saat içinde kargoda', 'pd.stock.low': 'Son {n} adet — elini çabuk tut!', 'pd.stock.out': 'Tükendi',
      'pd.trust1': '📦 Gizli paketleme — dışarıdan içerik anlaşılmaz', 'pd.trust2': '🚚 750 TL üzeri ücretsiz kargo',
      'pd.trust3': '🔒 Güvenli ve anonim ödeme', 'pd.trust4': '↩️ Hijyen nedeniyle iade yok, hasarlı üründe yenisi gönderilir',
      'pd.tab.detail': 'Detaylar', 'pd.tab.reviews': 'Yorumlar', 'pd.similar': 'Benzer Ürünler', 'pd.all': 'Tümü →',
      'pd.noreviews': 'Bu ürün için henüz onaylanmış yorum yok. İlk yorumu sen yaz!', 'pd.reviewsfail': 'Yorumlar yüklenemedi.', 'pd.write': '✍️ Yorum Yaz',
      'rv.short': 'Lütfen en az 10 karakterlik bir yorum yaz', 'rv.ok': 'Yorumun alındı, onay sonrası yayınlanacak 💜',
      'cart.empty': 'Sepetin şimdilik boş.<br>Keşfetmeye hazır mısın?', 'cart.empty.btn': 'Mağazayı Keşfet',
      'cart.summary': 'Sipariş Özeti', 'cart.freeship.left': '🚚 Ücretsiz kargoya {x} kaldı!', 'cart.freeship.won': '🎉 Ücretsiz kargo hakkı kazandın!',
      'cart.coupon.ph': 'Kupon kodu', 'cart.apply': 'Uygula', 'cart.coupon.is': 'Kupon: {code}', 'cart.coupon.ok': 'Kupon uygulandı',
      'cart.subtotal': 'Ara toplam', 'cart.shipping': 'Kargo', 'cart.free': 'Ücretsiz', 'cart.discount': 'İndirim', 'cart.total': 'Toplam',
      'cart.checkout': 'Ödemeye Geç →', 'cart.continue': 'Alışverişe Devam Et',
      'cart.remove': 'Kaldır', 'cart.remove.confirm': 'Ürün sepetten kaldırılsın mı?', 'cart.per': '/ adet',
      'ck.step1': 'İletişim Bilgilerin', 'ck.name': 'Ad Soyad *', 'ck.name.ph': 'Adınız Soyadınız', 'ck.phone': 'Telefon *', 'ck.phone.ph': '05xx xxx xx xx',
      'ck.discreet': 'Gizli paketleme istiyorum (dış pakette içerik/mağaza adı yer almaz)',
      'ck.note': 'Sipariş Notu (opsiyonel)', 'ck.note.ph': 'Örn: telefonla ulaşabileceğiniz saat',
      'ck.step2': 'Sipariş & Ödeme Şekli',
      'ck.step2.note': 'Online ödeme altyapımız bulunmuyor. Siparişini <b>WhatsApp üzerinden</b> tamamlıyoruz — en gizli ve pratik yol bu. 💜',
      'ck.pay.wa': '💬 WhatsApp ile Sipariş', 'ck.pay.wa.sub': 'sepet özetin medyana hazırlanır',
      'ck.pay.shop': '🏬 Mağazadan Teslim & Ödeme', 'ck.pay.shop.sub': 'Ilgaz İş Hanı · Tepebaşı',
      'ck.address': 'Adres *', 'ck.address.ph': 'Mahalle, cadde, no, daire...', 'ck.city': 'Şehir *', 'ck.zip': 'Posta Kodu',
      'ck.summary': 'Özet', 'ck.shipping': 'Kargo', 'ck.summary.total': 'Toplam',
      'ck.submit.wa': '💬 Siparişi WhatsApp\u2019a Taşı', 'ck.submit.shop': '🏬 Mağazadan Teslim Sipariş Ver',
      'ck.ship.pickup': 'Yok — mağazadan teslim', 'ck.free': 'Ücretsiz',
      'ck.required': 'Ad soyad ve telefon zorunludur', 'ck.addrreq': 'Kargo için adres ve şehir zorunludur', 'ck.preparing': 'Hazırlanıyor…',
      'ck.note.small': '18+ satış politikamız gereği bilgileriniz şifreli iletilir.<br>Ödeme yalnızca WhatsApp üzerinden veya mağazamızda alınır.',
      'ck.ok.pickup': 'Siparişin alındı! Seni mağazada bekliyoruz 🏬', 'ck.ok.ship': 'Siparişin alındı! WhatsApp\u2019a yönlendiriliyorsun 🎉',
      'thanks.amount': 'Tutar: ',
      'auth.hi': 'Hoş geldin, {name}', 'auth.pass6': 'Şifre en az 6 karakter olmalı', 'auth.passmismatch': 'Şifreler eşleşmiyor',
      'auth.age': '18 yaşından büyük olduğunuzu onaylamalısınız', 'auth.created': 'Hesabın oluşturuldu 💜',
      'acc.orders': '📦 Siparişlerim', 'acc.profile': '👤 Profilim', 'acc.logout': '🚪 Çıkış Yap',
      'acc.hello': 'Merhaba, {name} 💜',
      'st.processing': 'Hazırlanıyor', 'st.shipped': 'Kargoda', 'st.delivered': 'Teslim Edildi', 'st.cancelled': 'İptal',
      'acc.discreet': 'Gizli paketleme', 'acc.noorders': 'Henüz siparişin yok.', 'acc.start': 'Keşfe Başla',
      'pf.acc': 'Hesap Bilgileri', 'pf.name': 'Ad Soyad', 'pf.email': 'E-posta', 'pf.save': 'Kaydet',
      'pf.address': 'Teslimat Adresi', 'pf.addr': 'Adres', 'pf.city': 'Şehir', 'pf.zip': 'Posta Kodu', 'pf.phone': 'Telefon',
      'pf.discreet': 'Bu adres için her zaman gizli paketleme kullan', 'pf.saveaddr': 'Adresi Kaydet',
      'pf.pass': 'Şifre Değiştir', 'pf.new': 'Yeni Şifre', 'pf.new2': 'Yeni Şifre (Tekrar)', 'pf.update': 'Şifreyi Güncelle',
      'pf.ok': 'Profil güncellendi', 'pf.addrok': 'Adres kaydedildi', 'pf.passok': 'Şifre güncellendi',
      'contact.ok': 'Mesajın alındı, 24 saat içinde dönüş yapacağız 💌',
      'cf.hint': 'Sürükle · Dokun', 'cf.prev': 'Önceki ürün', 'cf.next': 'Sonraki ürün'
    },
    en: {
      'nav.login': 'Sign in',
      'added': 'Added to cart',
      'badge.new': 'New', 'badge.hot': 'Best Seller', 'badge.sale': 'Sale', 'quickadd': 'Add to Cart',
      'nl.bad': 'Please enter a valid e-mail', 'nl.ok': 'Welcome to the club! Your 10% discount code is in your inbox.',
      'shop.all': 'All', 'shop.count': '{n} products', 'shop.empty': 'No products match your criteria.<br>Try changing the filters.',
      'pd.crumb.home': 'Home', 'pd.crumb.shop': 'Shop', 'pd.reviews': 'reviews',
      'pd.notfound': 'Product not found.', 'pd.notfound.btn': 'Back to Shop',
      'pd.add': '🛍️ Add to Cart', 'pd.buy': 'Buy Now',
      'pd.stock.in': 'In stock, ships within 24 hours', 'pd.stock.low': 'Only {n} left — hurry!', 'pd.stock.out': 'Out of stock',
      'pd.trust1': '📦 Discreet packaging — contents never visible from outside', 'pd.trust2': '🚚 Free shipping over 750 TL',
      'pd.trust3': '🔒 Secure & anonymous payment', 'pd.trust4': '↩️ No returns for hygiene; damaged items are replaced',
      'pd.tab.detail': 'Details', 'pd.tab.reviews': 'Reviews', 'pd.similar': 'Similar Products', 'pd.all': 'All →',
      'pd.noreviews': 'No approved reviews for this product yet. Be the first to write one!', 'pd.reviewsfail': 'Reviews could not be loaded.', 'pd.write': '✍️ Write a Review',
      'rv.short': 'Please write a review of at least 10 characters', 'rv.ok': 'Your review has been received and will be published after approval 💜',
      'cart.empty': 'Your cart is empty for now.<br>Ready to explore?', 'cart.empty.btn': 'Explore the Shop',
      'cart.summary': 'Order Summary', 'cart.freeship.left': '🚚 {x} away from free shipping!', 'cart.freeship.won': '🎉 You unlocked free shipping!',
      'cart.coupon.ph': 'Coupon code', 'cart.apply': 'Apply', 'cart.coupon.is': 'Coupon: {code}', 'cart.coupon.ok': 'Coupon applied',
      'cart.subtotal': 'Subtotal', 'cart.shipping': 'Shipping', 'cart.free': 'Free', 'cart.discount': 'Discount', 'cart.total': 'Total',
      'cart.checkout': 'Proceed to Checkout →', 'cart.continue': 'Continue Shopping',
      'cart.remove': 'Remove', 'cart.remove.confirm': 'Remove item from cart?', 'cart.per': '/ each',
      'ck.step1': 'Contact Information', 'ck.name': 'Full Name *', 'ck.name.ph': 'Your full name', 'ck.phone': 'Phone *', 'ck.phone.ph': '05xx xxx xx xx',
      'ck.discreet': 'I want discreet packaging (no store/product name on the outside)',
      'ck.note': 'Order Note (optional)', 'ck.note.ph': 'e.g.: a time window we can reach you by phone',
      'ck.step2': 'Order & Payment Method',
      'ck.step2.note': 'We have no online payment infrastructure. Orders are completed <b>via WhatsApp</b> — the most private and practical way. 💜',
      'ck.pay.wa': '💬 Order via WhatsApp', 'ck.pay.wa.sub': 'your cart summary is prepared for you',
      'ck.pay.shop': '🏬 Pick Up & Pay in Store', 'ck.pay.shop.sub': 'Ilgaz İş Hanı · Tepebaşı',
      'ck.address': 'Address *', 'ck.address.ph': 'Neighborhood, street, no, apartment...', 'ck.city': 'City *', 'ck.zip': 'Postal Code',
      'ck.summary': 'Summary', 'ck.shipping': 'Shipping', 'ck.summary.total': 'Total',
      'ck.submit.wa': '💬 Send Order to WhatsApp', 'ck.submit.shop': '🏬 Place Store Pickup Order',
      'ck.ship.pickup': 'None — store pickup', 'ck.free': 'Free',
      'ck.required': 'Full name and phone are required', 'ck.addrreq': 'Address and city are required for shipping', 'ck.preparing': 'Preparing…',
      'ck.note.small': 'Per our 18+ sales policy, your details are transmitted encrypted.<br>Payment is accepted only via WhatsApp or at our store.',
      'ck.ok.pickup': 'Order received! We\u2019ll be waiting for you at the store 🏬', 'ck.ok.ship': 'Order received! Redirecting you to WhatsApp 🎉',
      'thanks.amount': 'Amount: ',
      'auth.hi': 'Welcome, {name}', 'auth.pass6': 'Password must be at least 6 characters', 'auth.passmismatch': 'Passwords do not match',
      'auth.age': 'You must confirm that you are over 18', 'auth.created': 'Your account has been created 💜',
      'acc.orders': '📦 My Orders', 'acc.profile': '👤 My Profile', 'acc.logout': '🚪 Sign Out',
      'acc.hello': 'Hello, {name} 💜',
      'st.processing': 'Processing', 'st.shipped': 'Shipped', 'st.delivered': 'Delivered', 'st.cancelled': 'Cancelled',
      'acc.discreet': 'Discreet packaging', 'acc.noorders': 'You have no orders yet.', 'acc.start': 'Start Exploring',
      'pf.acc': 'Account Information', 'pf.name': 'Full Name', 'pf.email': 'E-mail', 'pf.save': 'Save',
      'pf.address': 'Shipping Address', 'pf.addr': 'Address', 'pf.city': 'City', 'pf.zip': 'Postal Code', 'pf.phone': 'Phone',
      'pf.discreet': 'Always use discreet packaging for this address', 'pf.saveaddr': 'Save Address',
      'pf.pass': 'Change Password', 'pf.new': 'New Password', 'pf.new2': 'New Password (Again)', 'pf.update': 'Update Password',
      'pf.ok': 'Profile updated', 'pf.addrok': 'Address saved', 'pf.passok': 'Password updated',
      'contact.ok': 'Your message is received, we will reply within 24 hours 💌',
      'cf.hint': 'Drag · Touch', 'cf.prev': 'Previous product', 'cf.next': 'Next product'
    }
  };
  function t(key, vars) {
    let s = (STR[LANG] && STR[LANG][key]) || (STR.tr[key] !== undefined ? STR.tr[key] : key);
    if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  }

  window.LS = { fmt, t, lang: LANG, dateFmt };

  /* ---------- i18n: live-update static text nodes from SSR markers ---------- */
  document.documentElement.lang = LANG;

  /* ---------- SVGs for modern navbar icons ---------- */
  const SUN_SVG = `<svg class="icon-svg icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg class="icon-svg icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  const USER_SVG = `<svg class="icon-svg icon-user" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  /* ---------- theme & language toggles ---------- */
  function persistTheme(dark) {
    try { localStorage.setItem('ls_theme', dark ? 'dark' : 'light'); } catch (e) {}
    document.cookie = 'ls_theme=' + (dark ? 'dark' : 'light') + '; Path=/; Max-Age=31536000; SameSite=Lax';
  }
  function syncThemeButtons(dark) {
    $$('#theme-toggle,#mm-theme').forEach((b) => {
      b.innerHTML = dark ? SUN_SVG : MOON_SVG;
      b.title = dark ? (LANG === 'tr' ? 'Aydınlık moda geç' : 'Switch to Light mode') : (LANG === 'tr' ? 'Karanlık moda geç' : 'Switch to Dark mode');
    });
  }
  const darkNow = document.documentElement.classList.contains('dark');
  syncThemeButtons(darkNow);
  $$('#theme-toggle,#mm-theme').forEach((b) => b.addEventListener('click', () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    persistTheme(next);
    syncThemeButtons(next);
  }));
  $$('#lang-toggle,#mm-lang').forEach((b) => b.addEventListener('click', () => {
    const next = LANG === 'tr' ? 'en' : 'tr';
    document.cookie = 'ls_lang=' + next + '; Path=/; Max-Age=31536000; SameSite=Lax';
    try { sessionStorage.setItem('ls_just_switched', '1'); } catch (e) {}
    location.reload();
  }));
  try { sessionStorage.removeItem('ls_just_switched'); } catch (e) {}

  /* ---------- API helper ---------- */
  function getClientSid() {
    try {
      let sid = localStorage.getItem('ls_sid');
      if (!sid) {
        sid = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('ls_sid', sid);
      }
      return sid;
    } catch {
      return '';
    }
  }

  async function api(path, opts = {}) {
    const sid = getClientSid();
    const customHeaders = {
      'Content-Type': 'application/json',
      ...(sid ? { 'x-ls-sid': sid } : {}),
      ...(opts.headers || {})
    };
    const res = await fetch(path, {
      credentials: 'same-origin',
      ...opts,
      headers: customHeaders,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    const serverSid = res.headers.get('x-ls-sid');
    if (serverSid) {
      try { localStorage.setItem('ls_sid', serverSid); } catch {}
    }
    let data;
    try { data = await res.json(); } catch { data = { ok: false }; }
    if (!res.ok) throw Object.assign(new Error(data.error || 'Hata olustu'), { data });
    return data;
  }
  LS.api = api;

  /* ---------- toast ---------- */
  function toast(msg, icon = '💖') {
    const zone = $('#toast-zone') || document.body.insertAdjacentHTML('beforeend', '<div id="toast-zone"></div>') && $('#toast-zone');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    zone.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2600);
  }
  LS.toast = toast;

  /* ---------- age gate ---------- */
  const gate = $('#age-gate');
  if (gate) {
    if (localStorage.getItem('ls_age_ok') === '1') gate.classList.add('hidden');
    $('#age-yes').addEventListener('click', () => {
      localStorage.setItem('ls_age_ok', '1');
      gate.classList.add('hidden');
    });
    $('#age-no').addEventListener('click', () => {
      location.href = 'https://www.google.com';
    });
  }

  /* ---------- cursor glow ---------- */
  const glow = $('#cursor-glow');
  if (glow && matchMedia('(hover: hover)').matches) {
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
      glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- nav ---------- */
  const nav = $('nav.top');
  if (nav) {
    addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
    const burger = $('#burger');
    const mm = $('#mobile-menu');
    if (burger && mm) {
      burger.addEventListener('click', () => {
        const isOpen = mm.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      $$('a', mm).forEach((a) => a.addEventListener('click', () => {
        mm.classList.remove('open');
        document.body.style.overflow = '';
      }));
    }
    fetch('/api/session').then((r) => r.json()).then((s) => {
      const slot = $('#nav-user');
      if (slot) {
        slot.innerHTML = s.user
          ? `<a href="/hesap" class="icon-btn" title="${s.user.name}">${USER_SVG}</a>`
          : `<a href="/giris" class="icon-btn" title="${t('nav.login')}">${USER_SVG}</a>`;
      }
      const adminLink = $('#nav-admin');
      if (adminLink && s.user && s.user.role === 'admin') adminLink.style.display = '';
      LS.session = s;
      document.dispatchEvent(new Event('ls:session'));
    }).catch(() => {});
  }
  document.addEventListener('ls:logout', () => {
    const slot = $('#nav-user');
    if (slot) slot.innerHTML = `<a href="/giris" class="icon-btn" title="${t('nav.login')}">${USER_SVG}</a>`;
  });

  /* ---------- cart badge ---------- */
  function refreshCartBadge() {
    api('/api/cart').then((c) => {
      const badge = $('#cart-badge');
      if (!badge) return;
      const n = (c && c.items) ? c.items.reduce((a, i) => a + i.qty, 0) : 0;
      badge.textContent = n;
      badge.style.display = n ? 'grid' : 'none';
      badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
    }).catch(() => {});
  }
  document.addEventListener('ls:cart', refreshCartBadge);
  if ($('nav.top')) refreshCartBadge();

  async function addToCart(productId, qty = 1, variant = 'standart', btn = null) {
    if (!productId) return;
    try {
      await api('/api/cart/add', { method: 'POST', body: { productId, qty, variant } });
      if (btn) {
        const origText = btn.innerHTML;
        btn.innerHTML = '✓';
        btn.classList.add('added');
        setTimeout(() => {
          btn.innerHTML = origText;
          btn.classList.remove('added');
        }, 1400);
      }
      toast(t('added'), '🛍️');
      document.dispatchEvent(new Event('ls:cart'));
    } catch (e) {
      toast(e.message || 'Ürün sepete eklenemedi', '⚠️');
    }
  }
  LS.addToCart = addToCart;

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('vis'), io.unobserve(e.target))), { threshold: 0.08 });
  function refreshRevealObservers() {
    $$('.rv').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight + 100) && r.bottom > -100) {
        el.classList.add('vis');
      } else {
        io.observe(el);
      }
    });
  }
  LS.observe = refreshRevealObservers;

  /* ---------- 3D Card Parallax & Specular Sheen Physics ---------- */
  function initTiltPhysics() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.prod-card');
      if (!card) return;
      const media = card.querySelector('.prod-media');
      if (!media) return;
      const rect = media.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;

      media.style.setProperty('--sheen-x', `${px.toFixed(1)}%`);
      media.style.setProperty('--sheen-y', `${py.toFixed(1)}%`);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 6;
      const rotX = -((y - cy) / cy) * 6;
      media.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      const card = e.target.closest('.prod-card');
      if (!card || card.contains(e.relatedTarget)) return;
      const media = card.querySelector('.prod-media');
      if (media) media.style.transform = '';
    });
  }

  /* ---------- product card template ---------- */
  function productCard(p) {
    const badges = [];
    if (p.isNew) badges.push(`<span class="badge new">${t('badge.new')}</span>`);
    if (p.bestSeller) badges.push(`<span class="badge hot">${t('badge.hot')}</span>`);
    if (p.oldPrice) badges.push(`<span class="badge sale">${t('badge.sale')}</span>`);
    return `
    <article class="prod-card rv" data-id="${p.id}" data-slug="${p.slug}">
      <a href="/urun/${p.slug}" class="prod-media" data-slug="${p.slug}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="card-sheen"></div>
        <div class="prod-badges">${badges.join('')}</div>
      </a>
      <div class="prod-actions">
        <button type="button" class="action-btn quick-add-btn" data-add="${p.id}" title="${t('quickadd')}" aria-label="${t('quickadd')}">＋</button>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${catName(p.category, p.categoryName)}</div>
        <a href="/urun/${p.slug}" class="prod-name">${p.name}</a>
        <div class="prod-rating">${stars(p.rating || 0)} <span>(${p.reviewCount || 0})</span></div>
        <div class="prod-price-row">
          <span class="price">${fmt(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${fmt(p.oldPrice)}</span>` : ''}
        </div>
      </div>
    </article>`;
  }
  LS.productCard = productCard;

  /* ================= 2026 SPATIAL CARD ZOOM (MORPHING CANVAS) ================= */
  let activeOriginCard = null;

  async function openSpatialCardZoom(productIdOrSlug, originCard) {
    if (!productIdOrSlug) return;
    const overlay = $('#spatial-canvas-overlay');
    const stage = $('#spatial-card-stage');
    if (!overlay || !stage) return;

    activeOriginCard = originCard;
    document.body.style.overflow = 'hidden';

    // Morph origin card if available
    if (originCard) {
      originCard.style.opacity = '0.4';
      originCard.style.transform = 'scale(0.97)';
      originCard.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    }

    stage.innerHTML = `
      <button type="button" class="spatial-stage-close" id="spatial-stage-close" aria-label="Kapat">✕</button>
      <div style="display:flex;align-items:center;justify-content:center;height:460px;width:100%;">
        <div class="spinner"></div>
      </div>
    `;

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');

    try {
      const cleanKey = String(productIdOrSlug || '').replace(/^\/urun\//, '').replace(/\/+$/, '').trim();
      const res = await api('/api/products/' + encodeURIComponent(cleanKey));
      const p = (res && res.product) ? res.product : res;
      if (!p || !p.id) throw new Error('Ürün bulunamadı');

      const inStock = p.stock > 0;
      const stockBadge = inStock
        ? `<span class="stock-pill in-stock">● ${LANG === 'en' ? 'In stock · Ships in 24h' : 'Stokta · 24 Saatte Kargoda'}</span>`
        : `<span class="stock-pill out-stock">● ${LANG === 'en' ? 'Out of stock' : 'Tükendi'}</span>`;

      stage.innerHTML = `
        <button type="button" class="spatial-stage-close" id="spatial-stage-close" aria-label="${LANG === 'en' ? 'Close' : 'Kapat'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="spatial-grid">
          <div class="spatial-visual-hero">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="spatial-badge-cluster">
              ${p.bestSeller ? `<span>${t('badge.hot')}</span>` : ''}
              ${p.isNew ? `<span>${t('badge.new')}</span>` : ''}
              ${p.oldPrice ? `<span>${t('badge.sale')}</span>` : ''}
            </div>
          </div>

          <div class="spatial-content-pane">
            <div>
              <div class="spatial-top-meta">
                <span class="spatial-cat">${catName(p.category, p.categoryName)}</span>
                <div class="spatial-rating-row">
                  <span class="rating-stars">${stars(p.rating || 5)}</span>
                  <span class="count">(${p.reviewCount || 0} ${t('pd.reviews')})</span>
                </div>
              </div>

              <div class="spatial-title-group">
                <h1>${p.name}</h1>
                <div class="spatial-price-cluster">
                  <span class="spatial-price">${fmt(p.price)}</span>
                  ${p.oldPrice ? `<span class="spatial-price-old">${fmt(p.oldPrice)}</span>` : ''}
                  ${stockBadge}
                </div>
              </div>

              <p class="spatial-desc" style="margin-top:12px;">${p.description || ''}</p>
            </div>

            <!-- Minimal Quiet Luxury Spec Bar -->
            <div class="spatial-spec-deck">
              <div class="spatial-spec-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>%100 Medikal Silikon</span>
              </div>
              <div class="spatial-spec-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <span>IPX7 Su Geçirmez</span>
              </div>
              <div class="spatial-spec-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Manyetik USB Şarj</span>
              </div>
              <div class="spatial-spec-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>&lt;40dB Fısıltı Motoru</span>
              </div>
            </div>

            <!-- Discreet Privacy Reassurance -->
            <div class="spatial-privacy-seal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <div>
                <strong>%100 Gizli Paketleme & Anonim Fatura</strong>
                <p>Dış ambalajda ürün bilgisi yer almaz. Kart ekstrenizde yalnızca "LS TR Bilişim" görünür.</p>
              </div>
            </div>

            <!-- Spatial Actions Deck -->
            <div class="spatial-action-bar">
              <div class="spatial-qty-picker">
                <button type="button" class="spatial-qty-btn" id="spatial-qty-dec" aria-label="Azalt">−</button>
                <span class="spatial-qty-val" id="spatial-qty-val">1</span>
                <button type="button" class="spatial-qty-btn" id="spatial-qty-inc" aria-label="Artır">+</button>
              </div>
              <button type="button" class="spatial-add-btn" id="spatial-add-btn" ${!inStock ? 'disabled' : ''}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span>${LANG === 'en' ? 'Add to Cart' : 'Sepete Ekle'}</span>
              </button>
              <a href="/urun/${p.slug}" class="spatial-full-link">
                <span>${LANG === 'en' ? 'Product Details →' : 'Ürün Detayları →'}</span>
              </a>
            </div>
          </div>
        </div>
      `;

      let currentQty = 1;
      const qtyVal = $('#spatial-qty-val');
      const addBtn = $('#spatial-add-btn');

      $('#spatial-qty-dec')?.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          if (qtyVal) qtyVal.textContent = currentQty;
        }
      });

      $('#spatial-qty-inc')?.addEventListener('click', () => {
        if (currentQty < (p.stock || 99)) {
          currentQty++;
          if (qtyVal) qtyVal.textContent = currentQty;
        }
      });

      $('#spatial-stage-close')?.addEventListener('click', closeSpatialCardZoom);

      addBtn?.addEventListener('click', async () => {
        await addToCart(p.id, currentQty, 'standart', addBtn);
      });

    } catch (err) {
      stage.innerHTML = `
        <button type="button" class="spatial-stage-close" id="spatial-stage-close">✕</button>
        <div class="empty-state" style="padding:60px 20px;">
          <p>${err.message || 'Ürün detayları yüklenemedi.'}</p>
        </div>`;
      $('#spatial-stage-close')?.addEventListener('click', closeSpatialCardZoom);
    }
  }

  function closeSpatialCardZoom() {
    const overlay = $('#spatial-canvas-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    const stage = $('#spatial-card-stage');
    if (stage) {
      stage.innerHTML = '';
    }
    document.body.style.overflow = '';
    if (activeOriginCard) {
      activeOriginCard.style.opacity = '1';
      activeOriginCard.style.transform = 'none';
      activeOriginCard = null;
    }
  }

  function initQuickDrawerListeners() {
    $('#spatial-canvas-overlay')?.addEventListener('click', (e) => {
      if (e.target === $('#spatial-canvas-overlay')) closeSpatialCardZoom();
    });

    // Global event delegation for cards and modal actions
    document.addEventListener('click', (e) => {
      // 1. Close modal immediately if clicking "Product Details" or any link inside spatial modal
      const modalLink = e.target.closest('#spatial-card-stage a');
      if (modalLink) {
        closeSpatialCardZoom();
        return;
      }

      // 2. Quick Add Button on cards
      const addBtn = e.target.closest('[data-add]');
      if (addBtn && !addBtn.closest('#spatial-card-stage')) {
        e.preventDefault();
        e.stopPropagation();
        const pid = addBtn.dataset.add;
        addToCart(pid, 1, 'standart', addBtn);
        return;
      }

      // 3. Card click (media or title) — opens Spatial Morphing Stage Canvas
      const cardLink = e.target.closest('.prod-card .prod-media, .prod-card .prod-name');
      if (cardLink && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
        if (!location.pathname.startsWith('/urun/')) {
          e.preventDefault();
          e.stopPropagation();
          const card = cardLink.closest('.prod-card');
          const rawHref = cardLink.getAttribute('href') || '';
          const hrefKey = rawHref.replace(/^\/urun\//, '').replace(/\/+$/, '').trim();
          const pid = card?.dataset?.slug || cardLink.dataset?.slug || card?.dataset?.id || hrefKey;
          if (pid) {
            openSpatialCardZoom(pid, card);
            return;
          }
        }
      }
    });

    // ESC key closes spatial modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSpatialCardZoom();
    });
  }

  /* ================= HOME ================= */
  async function initHome() {
    refreshRevealObservers();
    const featured = $('#featured-grid');
    if (featured) {
      const data = await api('/api/products?featured=1&limit=10').catch(() => ({ products: [] }));
      featured.innerHTML = data.products.map(productCard).join('');
      refreshRevealObservers();
    }
    const wheel = $('#cf-stage');
    if (wheel) initCoverflow(wheel);
    const best = $('#new-grid');
    if (best) {
      const data = await api('/api/products?sort=new&limit=5').catch(() => ({ products: [] }));
      best.innerHTML = data.products.map(productCard).join('');
      refreshRevealObservers();
    }
    const nlForm = $('#nl-form');
    if (nlForm && !nlForm.dataset.bound) {
      nlForm.dataset.bound = '1';
      nlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $('#nl-email').value.trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) return toast(t('nl.bad'), '⚠️');
        try {
          await api('/api/newsletter', { method: 'POST', body: { email } });
          toast(t('nl.ok'), '🎁');
          nlForm.reset();
        } catch (err) { toast(err.message, '⚠️'); }
      });
    }
  }

  const CAT_EN = {
    'anal-urun': 'Anal Products',
    'dildo': 'Dildos',
    'erkek-cinsel-saglik-urunu': 'Men\u2019s Sexual Health',
    'fantezi-fetis-urunu': 'Fantasy & Fetish',
    'kadin-cinsel-saglik-urunu': 'Women\u2019s Sexual Health',
    'sisme-manken': 'Sex Dolls',
    'vajina-masturbator': 'Vaginas & Masturbators',
    'vibrator': 'Vibrators',
    'vibratori': 'Vibrators',
    'ciftler': 'For Couples', 'kozmetik': 'Cosmetics', 'fantasy': 'Fantasy', 'oyunlar': 'Games', 'knot': 'Knot'
  };
  function catName(slug, name) {
    if (LANG === 'en' && CAT_EN[slug]) return CAT_EN[slug];
    return name || CAT_EN[slug] || slug;
  }
  LS.catName = catName;

  /* ================= SHOP ================= */
  async function initShop() {
    const root = $('#shop-root');
    if (!root) return;
    const state = { cat: new URLSearchParams(location.search).get('kat') || 'hepsi', q: '', sort: 'onerilen' };
    const catWrap = $('#cat-chips');

    const cats = await api('/api/categories').catch(() => ({ categories: [] }));
    if (catWrap) {
      catWrap.innerHTML = [`<button class="chip ${state.cat === 'hepsi' ? 'on' : ''}" data-cat="hepsi">${t('shop.all')}</button>`]
        .concat(cats.categories.map((c) => `<button class="chip ${state.cat === c.slug ? 'on' : ''}" data-cat="${c.slug}">${catName(c.slug, c.name)}</button>`)).join('');
      $$('[data-cat]', catWrap).forEach((b) => b.addEventListener('click', () => {
        state.cat = b.dataset.cat;
        $$('[data-cat]', catWrap).forEach((x) => x.classList.toggle('on', x === b));
        load();
      }));
    }
    const search = $('#shop-search');
    if (search) {
      let t;
      search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value.trim(); load(); }, 300); });
    }
    const sortSel = $('#shop-sort');
    if (sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; load(); });

    async function load() {
      root.innerHTML = '<div class="spinner"></div>';
      const p = new URLSearchParams();
      if (state.cat !== 'hepsi') p.set('cat', state.cat);
      if (state.q) p.set('q', state.q);
      p.set('sort', state.sort); p.set('limit', '50');
      const data = await api('/api/products?' + p).catch(() => ({ products: [], total: 0 }));
      const count = $('#results-count');
      if (count) count.textContent = t('shop.count', { n: data.total });
      root.innerHTML = data.products.length
        ? `<div class="prod-grid">${data.products.map(productCard).join('')}</div>`
        : `<div class="empty-state"><div class="big">🔍</div><p>${t('shop.empty')}</p></div>`;
      $$('article', root).forEach((el) => { el.classList.add('vis'); });
    }
    load();
  }

  /* ================= PRODUCT DETAIL ================= */
  async function initProduct() {
    const root = $('#product-root');
    if (!root) return;
    const parts = location.pathname.split('/').filter(Boolean);
    const rawSlug = parts.pop() || '';
    const slug = decodeURIComponent(rawSlug).replace(/\/+$/, '').trim();
    if (!slug || slug === 'urun') {
      root.innerHTML = `<div class="empty-state"><div class="big">💔</div><p>${t('pd.notfound')}</p><a class="btn btn-primary" href="/magaza" style="margin-top:16px">${t('pd.notfound.btn')}</a></div>`;
      return;
    }
    let p;
    try {
      const res = await api('/api/products/' + encodeURIComponent(slug));
      p = res.product || res;
      if (!p || !p.id) throw new Error('notfound');
    } catch {
      root.innerHTML = `<div class="empty-state"><div class="big">💔</div><p>${t('pd.notfound')}</p><a class="btn btn-primary" href="/magaza" style="margin-top:16px">${t('pd.notfound.btn')}</a></div>`;
      return;
    }
    document.title = p.name + ' — LOVE SHOP';
    root.innerHTML = `
    <div class="page-head" style="padding-bottom:0"><div class="crumbs"><a href="/">${t('pd.crumb.home')}</a> / <a href="/magaza">${t('pd.crumb.shop')}</a> / <a href="/magaza?kat=${p.category}">${catName(p.category, p.categoryName)}</a></div></div>
    <div class="pd-layout">
      <div class="pd-gallery"><div class="pd-media"><img src="${p.image}" alt="${p.name}"></div></div>
      <div class="pd-info">
        <div class="prod-cat">${catName(p.category, p.categoryName)}</div>
        <h1>${p.name}</h1>
        <div class="prod-rating">${stars(p.rating)} <span>· ${p.reviewCount} ${t('pd.reviews')}</span></div>
        <div class="pd-price"><span>${fmt(p.price)}</span>${p.oldPrice ? `<span class="price-old">${fmt(p.oldPrice)}</span>` : ''}</div>
        <p class="pd-desc">${p.description}</p>
        <div class="qty-row">
          <div class="qty-picker">
            <button id="q-minus" type="button">−</button>
            <input id="q-val" value="1" readonly>
            <button id="q-plus" type="button">+</button>
          </div>
          <button class="btn btn-primary" id="pd-add">${t('pd.add')}</button>
          <button class="btn btn-ghost" id="pd-buy">${t('pd.buy')}</button>
        </div>
        <div class="stock-line"><span class="dot" ${p.stock < 5 ? 'style="background:var(--warn);box-shadow:0 0 12px var(--warn)"' : ''}></span>
          ${p.stock > 0 ? (p.stock < 5 ? t('pd.stock.low', { n: p.stock }) : t('pd.stock.in')) : t('pd.stock.out')}
        </div>
        <div class="pd-trust">
          <div>${t('pd.trust1')}</div>
          <div>${t('pd.trust2')}</div>
          <div>${t('pd.trust3')}</div>
          <div>${t('pd.trust4')}</div>
        </div>
      </div>
    </div>
    <div class="tab-row">
      <button class="tab-btn on" data-tab="detay">${t('pd.tab.detail')}</button>
      <button class="tab-btn" data-tab="yorum">${t('pd.tab.reviews')}</button>
    </div>
    <div class="tab-panel" id="tab-panel"></div>
    <section class="block"><div class="section-head"><div><h2>${t('pd.similar')}</h2></div><a href="/magaza?kat=${p.category}" class="link-more">${t('pd.all')}</a></div><div class="prod-grid" id="related-grid"></div></section>`;

    let qty = 1;
    const qv = $('#q-val');
    $('#q-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qv.value = qty; });
    $('#q-plus').addEventListener('click', () => { qty = Math.min(p.stock || 1, qty + 1); qv.value = qty; });
    $('#pd-add').addEventListener('click', () => addToCart(p.id, qty));
    $('#pd-buy').addEventListener('click', async () => {
      try { await api('/api/cart/add', { method: 'POST', body: { productId: p.id, qty } }); location.href = '/odeme'; }
      catch (e) { toast(e.message, '⚠️'); }
    });

    const panels = { detay: p.longDescription || p.description };
    function showTab(name) {
      $$('.tab-btn').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
      const panel = $('#tab-panel');
      if (name === 'yorum') {
        panel.innerHTML = '<div class="spinner"></div>';
        api('/api/products/' + p.id + '/reviews').then((d) => {
          panels.yorum = d.reviews.length
            ? d.reviews.map((r) => `<div style="border-bottom:1px solid var(--line);padding:14px 0"><div style="color:var(--gold)">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><div style="color:var(--text);margin:6px 0">${r.text}</div><small>— ${r.userName} · ${dateFmt(r.createdAt)}</small></div>`).join('')
            : t('pd.noreviews');
          panel.textContent = '';
          panel.innerHTML = panels.yorum + `<div style="margin-top:20px"><a class="btn btn-ghost btn-sm" href="/urun/${p.slug}/yorum">${t('pd.write')}</a></div>`;
        }).catch(() => { panel.textContent = t('pd.reviewsfail'); });
      } else {
        panel.textContent = panels.detay;
      }
    }
    $$('.tab-btn').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
    showTab('detay');

    api('/api/products?cat=' + p.category + '&limit=6').then((d) => {
      const rel = d.products.filter((x) => x.id !== p.id).slice(0, 5);
      const g = $('#related-grid');
      g.innerHTML = rel.map(productCard).join('');
      $$('article', g).forEach((el) => el.classList.add('vis'));
    }).catch(() => {});
  }

  /* ================= REVIEW FORM ================= */
  function initReviewForm() {
    const f = $('#review-form');
    if (!f) return;
    const pid = f.dataset.product;
    $('#stars-row').addEventListener('click', (e) => {
      const b = e.target.closest('[data-star]'); if (!b) return;
      $('#stars-row input').value = b.dataset.star;
      $$('[data-star]', $('#stars-row')).forEach((s) => s.style.opacity = +s.dataset.star <= +b.dataset.star ? 1 : .3);
    });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        rating: +($('#stars-row input').value || 5),
        text: $('#rv-text').value.trim()
      };
      if (!body.text || body.text.length < 10) return toast(t('rv.short'), '⚠️');
      try {
        await api('/api/products/' + pid + '/reviews', { method: 'POST', body });
        toast(t('rv.ok'), '✨');
        setTimeout(() => location.href = '/urun/' + f.dataset.slug, 1200);
      } catch (err) { toast(err.message, '⚠️'); }
    });
  }

  /* ================= CART ================= */
  async function initCart() {
    const root = $('#cart-root');
    if (!root) return;
    async function render() {
      root.innerHTML = '<div class="spinner"></div>';
      const c = await api('/api/cart').catch(() => ({ items: [] }));
      if (!c.items.length) {
        root.innerHTML = `<div class="empty-state"><div class="big">🛒</div><p>${t('cart.empty')}</p><a class="btn btn-primary" href="/magaza" style="margin-top:18px">${t('cart.empty.btn')}</a></div>`;
        return;
      }
      const lines = c.items.map((i) => `
        <div class="cart-line">
          <img src="${i.image}" alt="${i.name}">
          <div>
            <div class="cl-cat">${catName(i.category, i.categoryName)}</div>
            <a class="cl-name" href="/urun/${i.slug}">${i.name}</a>
            <div class="cl-price" style="margin-top:6px">${fmt(i.price)} <span class="muted" style="font-weight:400;font-size:12px">${t('cart.per')}</span></div>
          </div>
          <div class="cl-actions">
            <div class="qty-picker">
              <button data-dec="${i.productId}" type="button">−</button>
              <input value="${i.qty}" readonly>
              <button data-inc="${i.productId}" type="button">+</button>
            </div>
            <div class="cl-price">${fmt(i.price * i.qty)}</div>
            <button class="cl-remove" data-del="${i.productId}">${t('cart.remove')}</button>
          </div>
        </div>`).join('');
      const pct = Math.min(100, (c.subtotal / c.freeShippingThreshold) * 100);
      root.innerHTML = `
      <div class="cart-items">${lines}</div>
      <div class="summary">
        <h3>${t('cart.summary')}</h3>
        ${c.subtotal < c.freeShippingThreshold
          ? `<div class="free-ship-note">${t('cart.freeship.left', { x: '<b>' + fmt(c.freeShippingThreshold - c.subtotal) + '</b>' })}<div class="progress-bar"><i style="width:${pct}%"></i></div></div>`
          : `<div class="free-ship-note">${t('cart.freeship.won')}</div>`}
        <div class="coupon-row">
          <input id="coupon-input" class="field-input" placeholder="${t('cart.coupon.ph')}" style="background:var(--card-2);border:1px solid var(--line);border-radius:100px;padding:11px 18px;color:var(--text);outline:none">
          <button class="btn btn-ghost btn-sm" id="coupon-apply">${t('cart.apply')}</button>
        </div>
        ${c.coupon ? `<div class="sum-row" style="color:var(--ok)"><span>${t('cart.coupon.is', { code: c.coupon.code })}</span><span>-${fmt(c.discount)}</span></div>` : ''}
        <div class="sum-row"><span>${t('cart.subtotal')}</span><span>${fmt(c.subtotal)}</span></div>
        <div class="sum-row"><span>${t('cart.shipping')}</span><span>${c.shipping ? fmt(c.shipping) : t('cart.free')}</span></div>
        ${c.discount ? `<div class="sum-row" style="color:var(--ok)"><span>${t('cart.discount')}</span><span>-${fmt(c.discount)}</span></div>` : ''}
        <div class="sum-row total"><span>${t('cart.total')}</span><span>${fmt(c.total)}</span></div>
        <a href="/odeme" class="btn btn-primary btn-block" style="margin-top:18px">${t('cart.checkout')}</a>
        <a href="/magaza" class="btn btn-ghost btn-block" style="margin-top:10px">${t('cart.continue')}</a>
      </div>`;
      $$('[data-inc]').forEach((b) => b.addEventListener('click', async () => { await api('/api/cart/update', { method: 'POST', body: { productId: b.dataset.inc, qty: +b.nextElementSibling.value + 1 } }); render(); document.dispatchEvent(new Event('ls:cart')); }));
      $$('[data-dec]').forEach((b) => b.addEventListener('click', async () => {
        const q = +b.nextElementSibling.value - 1;
        if (q < 1) { if (confirm(t('cart.remove.confirm'))) { await api('/api/cart/remove', { method: 'POST', body: { productId: b.dataset.dec } }); } }
        else await api('/api/cart/update', { method: 'POST', body: { productId: b.dataset.dec, qty: q } });
        render(); document.dispatchEvent(new Event('ls:cart'));
      }));
      $$('[data-del]').forEach((b) => b.addEventListener('click', async () => { await api('/api/cart/remove', { method: 'POST', body: { productId: b.dataset.del } }); render(); document.dispatchEvent(new Event('ls:cart')); }));
      const ca = $('#coupon-apply');
      if (ca) ca.addEventListener('click', async () => {
        const code = $('#coupon-input').value.trim().toUpperCase();
        if (!code) return;
        try { await api('/api/cart/coupon', { method: 'POST', body: { code } }); toast(t('cart.coupon.ok'), '🎟️'); render(); }
        catch (e) { toast(e.message, '⚠️'); }
      });
    }
    render();
  }

  /* ================= CHECKOUT ================= */
  async function initCheckout() {
    const root = $('#checkout-root');
    if (!root) return;
    const [c, s] = await Promise.all([api('/api/cart').catch(() => ({ items: [] })), api('/api/session').catch(() => ({ user: null }))]);
    if (!c.items.length) { location.href = '/sepet'; return; }
    const u = s.user;
    const addr = (u && u.addresses && u.addresses[0]) || null;
    root.innerHTML = `
    <div class="check-layout" style="grid-column:1/-1">
      <div>
        <div class="check-step">
          <h3><span class="step-no">1</span> ${t('ck.step1')}</h3>
          <div class="grid-2">
            <div class="field"><label>${t('ck.name')}</label><input id="ck-name" value="${u ? u.name : ''}" placeholder="${t('ck.name.ph')}"></div>
            <div class="field"><label>${t('ck.phone')}</label><input id="ck-phone" value="${addr ? addr.phone || '' : ''}" placeholder="${t('ck.phone.ph')}"></div>
          </div>
          <div class="checkbox-row"><input type="checkbox" id="ck-discreet" checked><label for="ck-discreet">${t('ck.discreet')}</label></div>
          <div class="field" style="margin-top:14px"><label>${t('ck.note')}</label><input id="ck-note" placeholder="${t('ck.note.ph')}"></div>
        </div>
        <div class="check-step">
          <h3><span class="step-no">2</span> ${t('ck.step2')}</h3>
          <p class="muted" style="font-size:13px;margin-bottom:14px">${t('ck.step2.note')}</p>
          <div class="pay-options">
            <label class="pay-option"><input type="radio" name="pay" value="whatsapp" checked> ${t('ck.pay.wa')} <span class="muted" style="margin-left:auto;font-size:12px">${t('ck.pay.wa.sub')}</span></label>
            <label class="pay-option"><input type="radio" name="pay" value="shop"> ${t('ck.pay.shop')} <span class="muted" style="margin-left:auto;font-size:12px">${t('ck.pay.shop.sub')}</span></label>
          </div>
          <div id="addr-block" style="margin-top:16px">
            <div class="field"><label>${t('ck.address')}</label><textarea id="ck-address" placeholder="${t('ck.address.ph')}">${addr && !addr.full.startsWith('MAĞAZA') ? addr.full : ''}</textarea></div>
            <div class="grid-2">
              <div class="field"><label>${t('ck.city')}</label><input id="ck-city" value="${addr && addr.city ? addr.city : ''}" placeholder="${t('ck.city').replace(' *', '')}"></div>
              <div class="field"><label>${t('ck.zip')}</label><input id="ck-zip" value="${addr && addr.zip ? addr.zip : ''}" placeholder="26000"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="summary">
        <h3>${t('ck.summary')}</h3>
        ${c.items.map((i) => `<div class="sum-row"><span>${i.name} ×${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join('')}
        <div class="sum-row"><span>${t('ck.shipping')}</span><span id="pay-ship">${c.shipping ? fmt(c.shipping) : t('ck.free')}</span></div>
        ${c.discount ? `<div class="sum-row" style="color:var(--ok)"><span>${c.coupon ? c.coupon.code : ''}</span><span>-${fmt(c.discount)}</span></div>` : ''}
        <div class="sum-row total"><span>${t('ck.summary.total')}</span><span id="pay-total">${fmt(c.total)}</span></div>
        <button class="btn btn-primary btn-block" id="ck-submit" style="margin-top:18px">${t('ck.submit.wa')}</button>
        <p style="font-size:11px;color:var(--muted);margin-top:12px;text-align:center">${t('ck.note.small')}</p>
      </div>
    </div>`;

    function refreshPay() {
      const m = document.querySelector('input[name=pay]:checked').value;
      $('#addr-block').style.display = m === 'whatsapp' ? '' : 'none';
      $('#pay-ship').textContent = m === 'shop' ? t('ck.ship.pickup') : (c.shipping ? fmt(c.shipping) : t('ck.free'));
      $('#ck-submit').innerHTML = m === 'shop' ? t('ck.submit.shop') : t('ck.submit.wa');
    }
    $$('input[name=pay]').forEach((r) => r.addEventListener('change', refreshPay));
    refreshPay();

    $('#ck-submit').addEventListener('click', async () => {
      const method = document.querySelector('input[name=pay]:checked').value;
      const body = {
        name: $('#ck-name').value.trim(), phone: $('#ck-phone').value.trim(),
        payment: method, note: $('#ck-note').value.trim(),
        discreet: $('#ck-discreet').checked
      };
      if (method === 'whatsapp') {
        body.address = $('#ck-address').value.trim();
        body.city = $('#ck-city').value.trim();
        body.zip = $('#ck-zip').value.trim();
      }
      if (!body.name || !body.phone) return toast(t('ck.required'), '⚠️');
      if (method === 'whatsapp' && (!body.address || !body.city)) return toast(t('ck.addrreq'), '⚠️');
      const btn = $('#ck-submit'); btn.disabled = true; btn.textContent = t('ck.preparing');
      try {
        const r = await api('/api/checkout', { method: 'POST', body });
        toast(r.pickup ? t('ck.ok.pickup') : t('ck.ok.ship'), '💖');
        setTimeout(() => { location.href = '/tesekkurler/' + r.orderId; }, r.pickup ? 900 : 1200);
      } catch (e) { btn.disabled = false; refreshPay(); toast(e.message, '⚠️'); }
    });
  }

  /* ================= THANKS ================= */
  async function initThanks() {
    const el = $('#thanks-order');
    if (!el) return;
    const id = location.pathname.split('/').pop();
    try {
      const d = await api('/api/orders/' + id);
      el.textContent = d.order.id;
      const t = $('#thanks-total');
      if (t) t.textContent = LS.t('thanks.amount') + fmt(d.order.total);
    } catch { el.textContent = id; }
  }

  /* ================= AUTH ================= */
  function initAuth() {
    const login = $('#login-form');
    if (login) login.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const r = await api('/api/auth/login', { method: 'POST', body: { email: $('#l-email').value.trim(), password: $('#l-pass').value } });
        toast(t('auth.hi', { name: r.user.name }), '👋');
        document.dispatchEvent(new Event('ls:session'));
        setTimeout(() => { location.href = r.user.role === 'admin' ? '/admin' : '/hesap'; }, 600);
      } catch (err) { toast(err.message, '⚠️'); }
    });
    const reg = $('#register-form');
    if (reg) reg.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = $('#r-pass').value, pass2 = $('#r-pass2').value;
      if (pass.length < 6) return toast(t('auth.pass6'), '⚠️');
      if (pass !== pass2) return toast(t('auth.passmismatch'), '⚠️');
      if (!$('#r-age').checked) return toast(t('auth.age'), '⚠️');
      try {
        const r = await api('/api/auth/register', { method: 'POST', body: { name: $('#r-name').value.trim(), email: $('#r-email').value.trim(), password: pass } });
        toast(t('auth.created'), '🎉');
        document.dispatchEvent(new Event('ls:session'));
        setTimeout(() => { location.href = '/hesap'; }, 700);
      } catch (err) { toast(err.message, '⚠️'); }
    });
  }

  /* ================= ACCOUNT ================= */
  async function initAccount() {
    const root = $('#account-root');
    if (!root) return;
    const s = await api('/api/session').catch(() => ({ user: null }));
    if (!s.user) { location.href = '/giris'; return; }
    const orders = await api('/api/orders/mine').catch(() => ({ orders: [] }));
    const statusTr = { processing: t('st.processing'), shipped: t('st.shipped'), delivered: t('st.delivered'), cancelled: t('st.cancelled') };
    root.innerHTML = `
      <div class="acc-menu">
        <a href="/hesap" class="on">${t('acc.orders')}</a>
        <a href="/profil">${t('acc.profile')}</a>
        <a href="#" id="logout-link">${t('acc.logout')}</a>
      </div>
      <div>
        <div class="section-head" style="margin-bottom:22px"><div><h2>${t('acc.hello', { name: s.user.name })}</h2><p>${s.user.email}</p></div></div>
        ${orders.orders.length ? orders.orders.map((o) => `
        <div class="order-card">
          <div class="order-head">
            <div><strong>${o.id}</strong> <span class="muted" style="font-size:12px">· ${dateFmt(o.createdAt)}</span></div>
            <span class="status-pill st-${o.status}">${statusTr[o.status] || o.status}</span>
          </div>
          <div class="order-items">
            ${o.items.map((i) => `<div>${i.qty} × ${i.name} — <b>${fmt(i.price * i.qty)}</b></div>`).join('')}
          </div>
          <div class="order-head" style="margin:14px 0 0;border-top:1px solid var(--line);padding-top:12px">
            <span class="muted" style="font-size:12.5px">${o.payment}${o.discreet ? ' · ' + t('acc.discreet') : ''}</span>
            <strong>${fmt(o.total)}</strong>
          </div>
        </div>`).join('') : `<div class="empty-state"><div class="big">📭</div><p>${t('acc.noorders')}</p><a class="btn btn-primary" href="/magaza" style="margin-top:14px">${t('acc.start')}</a></div>`}
      </div>`;
    const lo = $('#logout-link');
    if (lo) lo.addEventListener('click', async (e) => {
      e.preventDefault();
      await api('/api/auth/logout', { method: 'POST' });
      document.dispatchEvent(new Event('ls:logout'));
      location.href = '/';
    });
  }

  /* ================= PROFILE ================= */
  async function initProfile() {
    const root = $('#profile-root');
    if (!root) return;
    const s = await api('/api/session').catch(() => ({ user: null }));
    if (!s.user) { location.href = '/giris'; return; }
    const a = (s.user.addresses && s.user.addresses[0]) || { label: 'Ev', full: '', city: '', zip: '', phone: '', discreet: true };
    root.innerHTML = `
      <div class="acc-menu">
        <a href="/hesap">${t('acc.orders')}</a>
        <a href="/profil" class="on">${t('acc.profile')}</a>
        <a href="#" id="logout-link">${t('acc.logout')}</a>
      </div>
      <div>
        <div class="check-step">
          <h3>${t('pf.acc')}</h3>
          <div class="grid-2">
            <div class="field"><label>${t('pf.name')}</label><input id="pf-name" value="${s.user.name}"></div>
            <div class="field"><label>${t('pf.email')}</label><input value="${s.user.email}" disabled style="opacity:.6"></div>
          </div>
          <button class="btn btn-primary btn-sm" id="pf-save">${t('pf.save')}</button>
        </div>
        <div class="check-step">
          <h3>${t('pf.address')}</h3>
          <div class="field"><label>${t('pf.addr')}</label><textarea id="ad-full">${a.full}</textarea></div>
          <div class="grid-3">
            <div class="field"><label>${t('pf.city')}</label><input id="ad-city" value="${a.city}"></div>
            <div class="field"><label>${t('pf.zip')}</label><input id="ad-zip" value="${a.zip}"></div>
            <div class="field"><label>${t('pf.phone')}</label><input id="ad-phone" value="${a.phone}"></div>
          </div>
          <div class="checkbox-row"><input type="checkbox" id="ad-discreet" ${a.discreet ? 'checked' : ''}><label for="ad-discreet">${t('pf.discreet')}</label></div>
          <button class="btn btn-primary btn-sm" id="ad-save" style="margin-top:12px">${t('pf.saveaddr')}</button>
        </div>
        <div class="check-step">
          <h3>${t('pf.pass')}</h3>
          <div class="grid-2">
            <div class="field"><label>${t('pf.new')}</label><input type="password" id="pw-new"></div>
            <div class="field"><label>${t('pf.new2')}</label><input type="password" id="pw-new2"></div>
          </div>
          <button class="btn btn-ghost btn-sm" id="pw-save">${t('pf.update')}</button>
        </div>
      </div>`;
    $('#pf-save').addEventListener('click', async () => {
      try { await api('/api/account', { method: 'POST', body: { name: $('#pf-name').value.trim() } }); toast(t('pf.ok'), '✅'); } catch (e) { toast(e.message, '⚠️'); }
    });
    $('#ad-save').addEventListener('click', async () => {
      try {
        await api('/api/account/address', { method: 'POST', body: { label: 'Ev', full: $('#ad-full').value.trim(), city: $('#ad-city').value.trim(), zip: $('#ad-zip').value.trim(), phone: $('#ad-phone').value.trim(), discreet: $('#ad-discreet').checked } });
        toast(t('pf.addrok'), '📍');
      } catch (e) { toast(e.message, '⚠️'); }
    });
    $('#pw-save').addEventListener('click', async () => {
      const p = $('#pw-new').value, p2 = $('#pw-new2').value;
      if (p.length < 6) return toast(t('auth.pass6'), '⚠️');
      if (p !== p2) return toast(t('auth.passmismatch'), '⚠️');
      try { await api('/api/account/password', { method: 'POST', body: { password: p } }); toast(t('pf.passok'), '🔒'); $('#pw-new').value = ''; $('#pw-new2').value = ''; }
      catch (e) { toast(e.message, '⚠️'); }
    });
    const lo = $('#logout-link');
    if (lo) lo.addEventListener('click', async (e) => { e.preventDefault(); await api('/api/auth/logout', { method: 'POST' }); location.href = '/'; });
  }

  /* ================= CONTACT ================= */
  function initContact() {
    const f = $('#contact-form');
    if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/api/contact', { method: 'POST', body: { name: $('#c-name').value.trim(), email: $('#c-email').value.trim(), message: $('#c-msg').value.trim() } });
        toast(t('contact.ok'), '✅');
        f.reset();
      } catch (err) { toast(err.message, '⚠️'); }
    });
  }

  /* ================= DEPTHDECK COVERFLOW — Perspective Fan (2026) ================= */
  async function initCoverflow(stage) {
    let prods = [];
    try { prods = (await api('/api/products?wheel=1&limit=8')).products; } catch {}
    if (!prods.length) return;

    stage.innerHTML = `
      <div class="cf-ambient" id="cf-amb"></div>
      <div class="cf-scene" id="cf-scene">
        ${prods.map((p, i) => `
        <div class="cf-pos" data-i="${i}">
          <a class="cf-card" href="/urun/${p.slug}" aria-label="${p.name}">
            <img src="${p.image}" alt="${p.name}" draggable="false">
            <span class="cf-cap"><b>${p.name}</b><em>${fmt(p.price)}${p.oldPrice ? ' <s style="color:#78716C;font-size:10px;font-weight:500">' + fmt(p.oldPrice) + '</s>' : ''}</em></span>
          </a>
        </div>`).join('')}
      </div>
      <button class="cf-arrow cf-prev" id="cf-prev" aria-label="${t('cf.prev')}">←</button>
      <button class="cf-arrow cf-next" id="cf-next" aria-label="${t('cf.next')}">→</button>
      <div class="cf-bar">
        <span class="cf-counter"><b id="cf-idx">01</b><em>/</em><span id="cf-total">${String(prods.length).padStart(2, '0')}</span></span>
        <span class="cf-progress"><i id="cf-fill"></i></span>
        <span class="cf-hint">${t('cf.hint')}</span>
      </div>`;

    const scene = $('#cf-scene', stage);
    const positions = $$('.cf-pos', scene);
    const cards = $$('.cf-card', stage);
    const amb = $('#cf-amb', stage);
    const fill = $('#cf-fill', stage);
    const idxEl = $('#cf-idx', stage);
    const N = prods.length;
    const STEP = (Math.PI * 2) / N;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const AUTO_PER_MS = reduced ? 0 : 1 / 4200;
    let center = 0;
    let target = 0;
    let auto = !reduced;
    let down = false, moved = 0, lastX = 0;
    let focusIdx = -1;
    let resumeTimer = null;
    const colorCache = {};

    prods.forEach((p) => { const im = new Image(); im.src = p.image; });

    function wrapD(i) {
      let d = i - center;
      d -= Math.round(d / N) * N;
      return d;
    }

    function tint(p) {
      const key = p.image;
      const apply = () => {
        const t = colorCache[key];
        if (t) amb.style.background = `radial-gradient(circle, ${t}, rgba(255,228,225,0) 70%)`;
      };
      if (colorCache[key]) { apply(); return; }
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 20;
          const cx = c.getContext('2d');
          cx.drawImage(im, 0, 0, 20, 20);
          const d = cx.getImageData(0, 0, 20, 20).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < d.length; i += 40) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
          r = Math.round(175 + (r / n - 128) * 0.6);
          g = Math.round(175 + (g / n - 128) * 0.6);
          b = Math.round(175 + (b / n - 128) * 0.6);
          colorCache[key] = `rgba(${r},${g},${b},.5)`;
          if (focusIdx >= 0 && prods[focusIdx] === p) apply();
        } catch {}
      };
      im.src = key;
    }

    const smoothF = new Array(N).fill(0);
    let lastLay = performance.now();
    function layout(t) {
      const nowT = t || performance.now();
      const layDt = Math.min(64, Math.max(0, nowT - lastLay)); lastLay = nowT;
      const fk = 1 - Math.exp(-9 * (layDt / 1000));
      const breath = reduced ? 0 : (Math.sin(nowT / 1000 * 1.25) * 0.5 + 0.5);
      const W = scene.clientWidth;
      const rx = W * 0.36;
      const rz = rx * 1.12;
      let best = -1, bestD = Infinity;
      positions.forEach((pos, i) => {
        let d = i - center;
        d = d - Math.round(d / N) * N;
        const theta = d * STEP;
        const depth = (Math.cos(theta) + 1) / 2;
        const fTarget = Math.max(0, 1 - Math.abs(d) / 0.5);
        smoothF[i] += (fTarget - smoothF[i]) * fk;
        const f = smoothF[i];
        const x = Math.sin(theta) * rx;
        const z = (Math.cos(theta) - 1) * rz;
        const y = -(1 - depth) * 22 - f * 6 * breath;
        const rotY = -Math.sin(theta) * 48;
        const scale = (0.70 + depth * 0.30) * (1 + f * 0.024 * breath);
        const blur = (1 - depth) * 2.2;
        pos.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        pos.style.zIndex = Math.round(depth * 100);
        pos.style.opacity = (0.46 + depth * 0.54).toFixed(2);
        pos.style.filter = blur > 0.35 ? `blur(${blur.toFixed(1)}px)` : 'none';
        pos.style.setProperty('--f', f.toFixed(3));
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
      });
      if (best !== focusIdx) {
        focusIdx = best;
        idxEl.textContent = String((best + 1)).padStart(2, '0');
        tint(prods[best]);
      }
    }

    function barTick() {
      const frac = ((center - Math.floor(center)) + 1) % 1;
      fill.style.width = (Math.min(frac, 1 - frac) * 2 * 100).toFixed(1) + '%';
    }

    function pauseThenResume(sec) {
      auto = false;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { auto = !reduced; }, sec * 1000);
    }

    function go(dir) {
      target = Math.round(center) + dir;
      pauseThenResume(4);
    }

    let last = performance.now();
    (function loop(t) {
      const dt = Math.min(64, Math.max(0, t - last)); last = t;
      if (!down) {
        if (auto) { center += AUTO_PER_MS * dt; target = center; }
        else if (Math.abs(target - center) > 0.0004) {
          const k = 1 - Math.exp(-7 * (dt / 1000));
          center += (target - center) * k;
        }
      }
      layout(t);
      barTick();
      requestAnimationFrame(loop);
    })(last);

    scene.addEventListener('pointerdown', (e) => {
      down = true; moved = 0; lastX = e.clientX;
      scene.classList.add('drag');
    });
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      center -= dx / Math.max(140, scene.clientWidth * 0.30);
      target = center;
    };
    const up = () => {
      if (!down) return;
      down = false;
      scene.classList.remove('drag');
      target = Math.round(center);
      pauseThenResume(3);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    scene.addEventListener('click', (e) => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);

    cards.forEach((card, i) => card.addEventListener('click', (e) => {
      if (moved > 8) return;
      const d = wrapD(i);
      if (Math.abs(d) < 0.5) return;
      e.preventDefault();
      target = center + d;
      pauseThenResume(4.5);
    }));

    $('#cf-next', stage).addEventListener('click', () => go(1));
    $('#cf-prev', stage).addEventListener('click', () => go(-1));
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    layout(performance.now());
  }

  /* ================= SOFT SPA NAVIGATION (Zero Flicker / Instant Smooth Transition) ================= */
  let isNavigating = false;
  async function navigateTo(url, pushState = true) {
    if (isNavigating) return;
    const targetUrl = new URL(url, location.origin);
    if (targetUrl.origin !== location.origin) {
      location.href = url;
      return;
    }
    if (targetUrl.pathname.startsWith('/admin') || targetUrl.pathname.startsWith('/api/')) {
      location.href = url;
      return;
    }

    // Always immediately close any open spatial card modal
    closeSpatialCardZoom();

    const mainEl = $('#app-main');
    if (!mainEl) {
      location.href = url;
      return;
    }

    isNavigating = true;
    mainEl.classList.add('is-transitioning');

    try {
      const resp = await fetch(url, { headers: { 'X-Requested-With': 'SPA' } });
      if (!resp.ok) throw new Error('Page fetch failed');
      const htmlText = await resp.text();
      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const newMain = doc.querySelector('#app-main');

      if (!newMain) {
        location.href = url;
        return;
      }

      if (pushState) {
        history.pushState({}, '', url);
      }

      // Update document title & metadata
      if (doc.title) document.title = doc.title;

      // Update active nav link states
      $$('nav.top .nav-links a').forEach((a) => {
        const navPath = a.getAttribute('data-nav') || a.getAttribute('href');
        if (navPath) {
          const isActive = navPath === '/' ? targetUrl.pathname === '/' : targetUrl.pathname.startsWith(navPath);
          a.classList.toggle('active', isActive);
        }
      });

      // Update cart count or badges if changed in incoming page
      const incomingCartBadge = doc.querySelector('#cart-badge');
      const currentCartBadge = $('#cart-badge');
      if (incomingCartBadge && currentCartBadge) {
        currentCartBadge.textContent = incomingCartBadge.textContent;
        currentCartBadge.classList.toggle('has', incomingCartBadge.classList.contains('has'));
      }

      // Smooth swap
      mainEl.innerHTML = newMain.innerHTML;
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Trigger scroll reveal for newly injected content
      refreshRevealObservers();

      // Re-run page initializers for the active route
      const pageHandlers = [initHome, initShop, initProduct, initReviewForm, initCart, initCheckout, initThanks, initAuth, initAccount, initProfile, initContact];
      pageHandlers.forEach((f) => {
        try { f(); } catch (err) { console.error(err); }
      });

      // Close mobile menu if open
      $('#mobile-menu')?.classList.remove('open');

    } catch (err) {
      console.warn('Soft nav fallback:', err);
      location.href = url;
    } finally {
      setTimeout(() => {
        mainEl.classList.remove('is-transitioning');
        refreshRevealObservers();
        isNavigating = false;
      }, 40);
    }
  }

  function initSpaLinks() {
    document.addEventListener('click', (e) => {
      // Find closest anchor tag
      const link = e.target.closest('a');
      if (!link) return;

      // Ignore special clicks (new tab, modifiers, download, external, mailto, tel)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me')) return;

      const dest = new URL(link.href, location.origin);
      if (dest.origin !== location.origin) return;
      if (dest.pathname.startsWith('/admin') || dest.pathname.startsWith('/api/')) return;

      // If user is clicking category chip inside shop page and already in /magaza, let shop filter handle it
      if (location.pathname === '/magaza' && dest.pathname === '/magaza' && dest.searchParams.has('kat')) {
        const cat = dest.searchParams.get('kat');
        const chip = $(`#cat-chips [data-cat="${cat}"]`);
        if (chip) {
          e.preventDefault();
          chip.click();
          history.pushState({}, '', link.href);
          return;
        }
      }

      e.preventDefault();
      navigateTo(link.href);
    });

    window.addEventListener('popstate', () => {
      navigateTo(location.href, false);
    });
  }

  /* boot */
  const globalInit = [initTiltPhysics, initQuickDrawerListeners, initSpaLinks, refreshRevealObservers];
  const pageInit = [initHome, initShop, initProduct, initReviewForm, initCart, initCheckout, initThanks, initAuth, initAccount, initProfile, initContact];

  function runBoot() {
    globalInit.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    pageInit.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBoot);
  } else {
    runBoot();
  }
})();
