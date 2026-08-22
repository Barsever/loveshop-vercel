'use strict';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { load, save, uid, nextId, hashPassword } = require('./lib/db.js');
const seed = require('./lib/seed.js');

const PORT = 3000;
const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const SESSIONS_FILE = path.join(DATA, 'sessions.json');

// Ensure db and seed data exist with studio art-directed assets
try { seed(false); } catch (e) {}
let db = load();
if (!db.contact) db.contact = [];

let sessions: Record<string, any> = {};
try { sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8')); } catch { sessions = {}; }
function persistSessions() {
  try {
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (e) {}
}

const hash = hashPassword;
const now = () => Date.now();

/* ---------------- utils ---------------- */
function json(res: http.ServerResponse, code: number, obj: any) {
  const body = JSON.stringify(obj);
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks: Buffer[] = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 4 * 1024 * 1024) { reject(new Error('BODY_TOO_LARGE')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('BAD_JSON')); }
    });
    req.on('error', reject);
  });
}

function getSid(req: http.IncomingMessage) {
  const h = req.headers['x-ls-sid'];
  if (h && typeof h === 'string' && h.trim()) return h.trim();
  const c = req.headers.cookie || '';
  const m = c.match(/ls_sid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
function setSidCookie(res: http.ServerResponse, sid: string) {
  res.setHeader('Set-Cookie', `ls_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
  res.setHeader('x-ls-sid', sid);
}
function clearSidCookie(res: http.ServerResponse) {
  res.setHeader('Set-Cookie', 'ls_sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}
function getSession(req: http.IncomingMessage, res?: http.ServerResponse) {
  let sid = getSid(req);
  if (!sid || !sessions[sid]) {
    sid = sid || crypto.randomBytes(24).toString('hex');
    sessions[sid] = { createdAt: now(), userId: null, cart: [], coupon: null, lastGuestEmail: null };
    persistSessions();
  }
  if (res) setSidCookie(res, sid);
  return sessions[sid];
}
function getUser(sess: any) {
  if (!sess || !sess.userId) return null;
  return db.users.find((u: any) => u.id === sess.userId) || null;
}
function requireAdmin(req: http.IncomingMessage, res: http.ServerResponse) {
  const sess = getSession(req, res);
  const u = getUser(sess);
  if (!u || u.role !== 'admin') return null;
  return u;
}
function sendError(res: http.ServerResponse, code: number, msg: string) { json(res, code, { ok: false, error: msg }); }
const esc = (s: any) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const stars = (r: number) => '★'.repeat(Math.round(r || 0)) + '☆'.repeat(5 - Math.round(r || 0));

const catAuthLimiter = new Map<string, { count: number; reset: number }>();
function rateLimited(req: http.IncomingMessage, key: string, max: number, windowMs: number) {
  const ip = req.socket.remoteAddress || 'x';
  const k = ip + ':' + key;
  const t = now();
  const item = catAuthLimiter.get(k) || { count: 0, reset: t + windowMs };
  if (t > item.reset) { item.count = 0; item.reset = t + windowMs; }
  item.count++;
  catAuthLimiter.set(k, item);
  return item.count > max;
}

/* ---------------- i18n ---------------- */
function getCookieValue(req: http.IncomingMessage, name: string) {
  const c = req.headers.cookie || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

const STR: Record<string, Record<string, string>> = {
  tr: {
    'age.title': '18 Yaşından Büyük müsünüz?',
    'age.legal': 'Türk Ceza Kanunu\'nun 226. maddesi uyarınca 18 yaşından küçüklerin bu siteyi gezmeleri ve alışveriş yapmaları yasaktır. Web sitemiz T.C.K\'nın 226. maddesi D bendinde yer alan müstehcen ürünlerin satışına mahsus alışveriş yeri kapsamındadır.',
    'age.yes': '18+ Olduğumu Onaylıyorum',
    'age.no': 'Çıkış Yap',
    'age.small': 'Gizliliğin bizim için önemli — yaş bilgisi yalnızca bu tarayıcıda saklanır.',
    'nav.home': 'Anasayfa', 'nav.shop': 'Mağaza', 'nav.about': 'Hakkımızda', 'nav.contact': 'İletişim', 'nav.account': 'Hesabım',
    'nav.admin': 'Admin Panel', 'nav.cart': 'Sepet', 'nav.menu': 'Menü', 'nav.login': 'Giriş',
    'foot.desc': ' — bedenini tanı, keyfini keşfet. 2026 tasarım anlayışıyla, saygı ve gizlilik esaslı online mağaza.',
    'foot.h.shop': 'Mağaza', 'foot.all': 'Tüm Ürünler',
    'foot.about': 'Hakkımızda', 'foot.discreet': 'Gizli Paketleme', 'foot.returns': 'İade Politikası',
    'foot.contact': 'İletişim',
    'foot.rights': ' — 18+ içerik. Tüm hakları saklıdır.',
    'foot.pay.wa': 'WhatsApp Sipariş', 'foot.pay.shop': 'Mağazada Ödeme', 'foot.pay.discreet': 'Gizli Paketleme',
    'hero.eyebrow': '✦ 18+ · Gizli Paketleme · Anonim Ödeme',
    'hero.h1': 'Tutkunuz için<br><em class="em-rose">zarif &amp; gizli</em> bir dünya.',
    'hero.p': 'Vücut dostu, ödüllü tasarımlara sahip ürünler; kapına kadar gizlilikle, yargısız ve hızlı. 2026\'nın en iyi web deneyimiyle alışverişin en şahane hali.',
    'hero.cta.shop': 'Mağazayı Keşfet →', 'hero.cta.why': 'Neden Biz?',
    'hero.stat1': 'Özenle seçili ürün', 'hero.stat2': '%100', 'hero.stat2.label': 'Gizli paketleme', 'hero.stat3': '4.8', 'hero.stat3.label': 'Ortalama puan',
    'mq.1': 'GİZLİ PAKETLEME', 'mq.2': 'KAPIDA ÖDEME', 'mq.3': 'VÜCUT DOSTU', 'mq.4': 'AYNI GÜN KARGO', 'mq.5': '18+ YETKİN YAŞAM', 'mq.6': 'ANONİM ALIŞVERİŞ',
    'sec.cats.eb': 'Kategoriler', 'sec.cats.h2': 'Kendi <em class="em-rose">ritmini</em> bul',
    'sec.cats.p': 'Merak ettiğin her şey, saygılı bir dille ve özenle seçilmiş {n}-i aşkın ürünle.',
    'sec.cats.link': 'Katalog', 'cats.products': 'ÜRÜN', 'bento.explore': 'Keşfet →',
    'bcta.kicker': 'Kataloğun tamamı', 'bcta.h3': 'Tüm Kategoriler', 'bcta.count': '{cats} KATEGORİ · {prods} ÜRÜN',
    'sec.feat.eb': 'Öne Çıkanlar', 'sec.feat.h2': 'Bu ayın <em class="em-rose">favorileri</em>', 'sec.feat.link': 'Hepsini Gör →',
    'banner.eb': '✦ Love Shop Sözü',
    'banner.h2': 'Her kargo, açılmamış bir <em class="em-rose">sır</em> gibi gelir. İçeriği yalnızca sen bilirsin.',
    'banner.p': 'Dış pakette logo yok, ürün adı yok, mağaza adı yok. Ekstrenizde "LS TR Bilişim" yazar. Kargo görevlisi bile içeriği bilmez.',
    'banner.btn': 'Gizlilik Manifestosu',
    'sec.new.eb': 'Yeni Gelenler', 'sec.new.h2': 'Taze <em class="em-rose">taze</em>', 'sec.new.link': 'Yenilikler →',
    'f1.t': '%100 Gizli Paketleme', 'f1.p': 'Düz kutu, logosuz, içerik bilgisi dışarıdan anlaşılmaz.',
    'f2.t': 'Anonim Ödeme', 'f2.p': 'SSL şifreli altyapı; kart ekstrenizde mağaza adı yer almaz.',
    'f3.t': 'Vücut Dostu', 'f3.p': 'Tüm ürünler CE belgeli, hipoalerjenik premium malzeme.',
    'f4.t': 'Yargısız Destek', 'f4.p': 'Uzman ekip 7/24, sorularınız isim/isim olmadan yanıtlanır.',
    'sec.rev.eb': 'Misafirlerimiz', 'sec.rev.h2': 'Kapı kapalı, <em class="em-rose">memnuniyet</em> açık', 'sec.rev.empty': 'İlk yorum sizden gelsin.',
    'nl.eb': 'Kulüp Love', 'nl.h2': 'İlk siparişe %10 <em class="em-rose">indirim</em>',
    'nl.p': 'Bültene katıl; yeniliklerden, gizli indirimlerden ilk sen haberdar ol. Spam yok, söz.',
    'nl.ph': 'e-posta adresin', 'nl.btn': 'Katıl ✦',
    'badge.new': 'Yeni', 'badge.hot': 'Çok Satan', 'badge.sale': 'İndirim', 'quickadd': 'Sepete Ekle', 'quickview': 'Hızlı Bakış',
    'curator.trigger': '✦ Sana Özel Deneyim Bulucu',
    'curator.title': 'Kişisel Deneyim & Hediye Küratörü',
    'curator.sub': 'Sadece 2 soruda arzularına ve ritmine en uygun özel seçkiyi keşfet.',
    'curator.bundle': 'Paket Olarak Sepete Ekle (%15 İndirimli)',
    'shop.crumb.home': 'Anasayfa', 'shop.title': 'Mağaza',
    'shop.desc': '{n} özenle seçilmiş ürün — hepsi vücut dostu, hepsi sessiz kargoda.',
    'shop.search': '🔍 Ürün ara…', 'shop.cat': 'Kategori', 'shop.all': 'Tümü',
    'shop.sort.def': 'Sırala: Önerilen', 'shop.sort.new': 'En Yeniler', 'shop.sort.asc': 'Fiyat: Düşükten Yükseğe',
    'shop.sort.desc': 'Fiyat: Yüksekten Düşüğe', 'shop.sort.rate': 'En Yüksek Puan',
    'rv.title': 'Yorum Yaz ✍️', 'rv.rating': 'Puanın', 'rv.comment': 'Yorumun (en az 10 karakter)', 'rv.ph': 'Deneyimini paylaş…',
    'rv.submit': 'Gönder', 'rv.note': 'Yorumlar onay sonrası yayınlanır ·', 'rv.back': 'Ürüne dön',
    'cart.title': 'Sepetim', 'cart.crumb': 'Sepet',
    'checkout.title': 'Ödeme', 'checkout.crumb': 'Ödeme',
    'login.title': 'Tekrar hoş geldin 👋', 'login.sub': 'Hesabına giriş yap, siparişlerini takip et.',
    'login.email': 'E-posta', 'login.pass': 'Şifre', 'login.btn': 'Giriş Yap', 'login.alt': 'Hesabın yok mu?', 'login.altLink': 'Kayıt ol',
    'reg.title': 'Aramıza katıl 💜', 'reg.sub': 'Üye ol, sipariş takibi ve özel indirimlerden faydalan.',
    'reg.name': 'Ad Soyad', 'reg.email': 'E-posta', 'reg.pass': 'Şifre', 'reg.pass2': 'Şifre (Tekrar)',
    'reg.age': '18 yaşından büyük olduğumu onaylıyorum. Gizlilik politikasını okudum.',
    'reg.btn': 'Hesap Oluştur', 'reg.alt': 'Zaten üye misin?', 'reg.altLink': 'Giriş yap',
    'account.title': 'Hesabım', 'profile.title': 'Profilim',
    'about.eb': '✦ Hikayemiz',
    'about.h1': 'Utancı geride bıraktık. <em class="em-rose">Keyfi</em> öne aldık.',
    'about.p1': 'Love Shop, "ayıp" kelimesinin alışveriş deneyimini kirletmesine izin vermeyen bir ekip tarafından kuruldu. Bizim için bedenini tanımak, keyfini keşfetmek ve kendini sevmek bir lüks değil; temel bir hak.',
    'about.p2': '2026\'nın ödüllü web tasarım dilini — koyu, duyusal, akışkan — Türkiye\'deki ilk "gururla gezilebilir" yetişkin mağazasıyla buluşturduk.',
    'about.priv.h': 'Gizlilik Manifestosu 🔒',
    'about.priv.p': 'Gizlilik bizim için pazarlama sloganı değil, mimari bir karar:',
    'about.priv.list': '• <b>Paket:</b> Düz kraft kutu. Üzerinde logo yok, ürün adı yok, iade adresi bile jenerik.<br>• <b>Ekstre:</b> Kart hareketinde yalnızca "LS TR Bilişim" yazar.<br>• <b>Veri:</b> Sipariş geçmişin yalnızca sen ve bizim gördüğümüz şifreli bir altyapıda durur. Asla üçüncü taraflarla paylaşılmaz.<br>• <b>Gezinti:</b> Çerezlerimiz yalnızca sepetin hatırlaması için var; reklam izleme yok.',
    'about.ret.h': 'İade & Garanti',
    'about.ret.p': 'Hijyen nedeniyle kullanılmış ürünlerde iade kabul edilmiyor — bu yasa ve sağlığın gereği. Ancak:',
    'about.ret.list': '• Ürün hasarlı ya da yanlış geldiyse koşulsuz yenisi gönderilir.<br>• Tüm elektronik ürünler 2 yıl garantili.<br>• Açılmamış kozmetiklerde 14 gün içinde iade mümkün.',
    'about.val.h': 'Değerlerimiz',
    'about.v1.t': 'Saygı', 'about.v1.p': 'Yargılayan tek bir satır bile yok. Her zevk, her beden, her merak buraya ait.',
    'about.v2.t': 'Güvenlik', 'about.v2.p': 'CE belgesiz, fitalatlı, malzemesi belirsiz hiçbir ürün raflarımıza giremez.',
    'about.v3.t': 'Kapsayıcılık', 'about.v3.p': 'Ürün dilimiz ve görsellerimiz tüm cinsiyetlere ve tüm ilişkilere açık.',
    'about.cta.h': 'Sorun mu var? Yargısız dinliyoruz.', 'about.cta.btn': 'İletişime Geç',
    'contact.eb': '✦ Bize Yaz', 'contact.h1': 'Merhaba demenin yargısız yolu',
    'contact.p': 'Sorularınız anonim kalabilir; adınızı yazmak zorunda değilsiniz. WhatsApp\'tan 7/24, mağazamızdan birebir destek.',
    'contact.wa.t': 'WhatsApp Sipariş', 'contact.wa.s': 'Gizlilik esaslı, yargısız iletişim',
    'contact.store.t': 'Mağazamız', 'contact.phone.t': 'Telefon', 'contact.phone.s': '09:00–22:00 arası',
    'contact.map.h': '📍 Nasıl gelirsin?',
    'contact.map.p': 'Doktorlar Caddesi\'nde, <b>Akbank şubesinin hemen yanı</b>, Ilgaz İş Hanı. Google Haritalar\'da <b>"Love Sex Shop Eskişehir"</b> diye arayın — vitrinsiz, tabela baskısı olmayan bir iş hanı dairesidir, gönül rahatlığıyla gelin.',
    'contact.map.btn': 'Google Haritalar\'da Aç →', 'contact.wa.btn': 'WhatsApp\'tan Sor',
    'contact.form.h': 'Form ile yaz', 'contact.form.name': 'İsim (opsiyonel)', 'contact.form.name.ph': 'İsterseniz boş bırakın',
    'contact.form.email': 'E-posta', 'contact.form.email.ph': 'yanıt için',
    'contact.form.msg': 'Mesajın', 'contact.form.msg.ph': 'Merak ettiğin her şey…', 'contact.form.btn': 'Gönder 💜',
    '404.h': '404 — Bu sayfayı biz de arıyoruz', '404.p': 'Ama kaybolmuş bir şeyler bulabilirsin:', '404.home': 'Anasayfa', '404.shop': 'Mağaza',
    'thanks.total': 'Tutar:', 'thanks.continue': 'Alışverişe Devam',
    'thanks.h.pickup': 'Siparişin hazır!', 'thanks.h.ship': 'Neredeyse bitti!',
    'thanks.p.pickup': 'Ürünlerini <b>Ilgaz İş Hanı Kat:1 Daire:2</b> adresindeki mağazamızda ayırdık. Gelmeden önce WhatsApp\'tan yazarsanız stok teyidi yapabiliriz.',
    'thanks.p.ship': 'Ödeme/kargo onayı için siparişini <b>WhatsApp üzerinden</b> bize iletmen gerekiyor. Aşağıdaki buton sipariş özetinizle hazır bir mesaj açar — sadece "Gönder"e basmak yeterli.',
    'thanks.wa.pickup': 'WhatsApp\'tan Stok Teyidi Al', 'thanks.wa.ship': 'Siparişi WhatsApp\'a Gönder',
    'thanks.account': 'Sipariş detayları <a href="/hesap" style="color:var(--rose);font-weight:600">Hesabım</a>\'da saklı.'
  },
  en: {
    'age.title': 'Are You Over 18?',
    'age.legal': 'Per Article 226 of the Turkish Penal Code, persons under 18 are prohibited from browsing this site or making purchases.',
    'age.yes': 'I Confirm I am 18+',
    'age.no': 'Exit',
    'age.small': 'Your privacy matters — age verification is stored only in this browser.',
    'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.about': 'About', 'nav.contact': 'Contact', 'nav.account': 'My Account',
    'nav.admin': 'Admin Panel', 'nav.cart': 'Cart', 'nav.menu': 'Menu', 'nav.login': 'Sign in',
    'foot.desc': ' — know your body, discover your pleasure. A respect & privacy-first online store with a 2026 design language.',
    'foot.h.shop': 'Shop', 'foot.all': 'All Products',
    'foot.about': 'About Us', 'foot.discreet': 'Discreet Packaging', 'foot.returns': 'Return Policy',
    'foot.contact': 'Contact',
    'foot.rights': ' — 18+ content. All rights reserved.',
    'foot.pay.wa': 'WhatsApp Orders', 'foot.pay.shop': 'Pay in Store', 'foot.pay.discreet': 'Discreet Packaging',
    'hero.eyebrow': '✦ 18+ · Discreet Packaging · Anonymous Payment',
    'hero.h1': 'Pleasure is yours.<br><em class="em-rose">Explore. Feel. Live.</em>',
    'hero.p': 'Body-safe, award-winning designs; delivered to your door with total privacy, judgement-free and fast. The finest way to shop, with 2026\'s best web experience.',
    'hero.cta.shop': 'Explore the Shop →', 'hero.cta.why': 'Why Us?',
    'hero.stat1': 'Curated products', 'hero.stat2': '100%', 'hero.stat2.label': 'Discreet packaging', 'hero.stat3': '4.8', 'hero.stat3.label': 'Average rating',
    'mq.1': 'DISCREET PACKAGING', 'mq.2': 'PAY AT DOOR', 'mq.3': 'BODY SAFE', 'mq.4': 'SAME-DAY SHIPPING', 'mq.5': '18+ ADULT WELLNESS', 'mq.6': 'ANONYMOUS SHOPPING',
    'sec.cats.eb': 'Categories', 'sec.cats.h2': 'Find your own <em class="em-rose">rhythm</em>',
    'sec.cats.p': 'Everything you\'re curious about, spoken in a respectful voice, with over {n} carefully curated products.',
    'sec.cats.link': 'Catalog', 'cats.products': 'PRODUCTS', 'bento.explore': 'Explore →',
    'bcta.kicker': 'The full catalog', 'bcta.h3': 'All Categories', 'bcta.count': '{cats} CATEGORIES · {prods} PRODUCTS',
    'sec.feat.eb': 'Featured', 'sec.feat.h2': 'This month\'s <em class="em-rose">favorites</em>', 'sec.feat.link': 'See All →',
    'banner.eb': '✦ The Love Shop Promise',
    'banner.h2': 'Every parcel arrives like an unopened <em class="em-rose">secret</em>. Only you know what\'s inside.',
    'banner.p': 'No logo on the outer box, no product name, no store name. Your statement simply reads "LS TR Bilişim". Even the courier never knows.',
    'banner.btn': 'Privacy Manifesto',
    'sec.new.eb': 'New Arrivals', 'sec.new.h2': 'Fresh <em class="em-rose">in</em>', 'sec.new.link': 'What\'s New →',
    'f1.t': '100% Discreet Packaging', 'f1.p': 'Plain box, no logo, contents never guessable from outside.',
    'f2.t': 'Anonymous Payment', 'f2.p': 'SSL-encrypted infrastructure; the store name never appears on your statement.',
    'f3.t': 'Body Safe', 'f3.p': 'Every product is CE-certified, hypoallergenic premium material.',
    'f4.t': 'Judgement-free Support', 'f4.p': 'Expert team 24/7 — questions answered with no names asked.',
    'sec.rev.eb': 'Our Guests', 'sec.rev.h2': 'Door closed, <em class="em-rose">satisfaction</em> open', 'sec.rev.empty': 'Be the first to review.',
    'nl.eb': 'Club Love', 'nl.h2': '10% off your <em class="em-rose">first order</em>',
    'nl.p': 'Join the list; hear about novelties and secret sales first. No spam, promise.',
    'nl.ph': 'your e-mail address', 'nl.btn': 'Join ✦',
    'badge.new': 'New', 'badge.hot': 'Best Seller', 'badge.sale': 'Sale', 'quickadd': 'Add to Cart', 'quickview': 'Quick View',
    'curator.trigger': '✦ Curated Mood Finder',
    'curator.title': 'Personal Experience & Gift Curator',
    'curator.sub': 'Discover the perfect pieces tailored to your rhythm in just 2 questions.',
    'curator.bundle': 'Add Curated Bundle to Cart (15% Off)',
    'shop.crumb.home': 'Home', 'shop.title': 'Shop',
    'shop.desc': '{n} carefully curated products — all body-safe, all shipped silently.',
    'shop.search': '🔍 Search products…', 'shop.cat': 'Category', 'shop.all': 'All',
    'shop.sort.def': 'Sort: Recommended', 'shop.sort.new': 'Newest First', 'shop.sort.asc': 'Price: Low to High',
    'shop.sort.desc': 'Price: High to Low', 'shop.sort.rate': 'Highest Rated',
    'rv.title': 'Write a Review ✍️', 'rv.rating': 'Your rating', 'rv.comment': 'Your review (min. 10 characters)', 'rv.ph': 'Share your experience…',
    'rv.submit': 'Submit', 'rv.note': 'Reviews are published after approval ·', 'rv.back': 'Back to product',
    'cart.title': 'My Cart', 'cart.crumb': 'Cart',
    'checkout.title': 'Checkout', 'checkout.crumb': 'Checkout',
    'login.title': 'Welcome back 👋', 'login.sub': 'Sign in to your account and track your orders.',
    'login.email': 'E-mail', 'login.pass': 'Password', 'login.btn': 'Sign In', 'login.alt': 'No account yet?', 'login.altLink': 'Register',
    'reg.title': 'Join us 💜', 'reg.sub': 'Become a member to track orders and enjoy exclusive discounts.',
    'reg.name': 'Full Name', 'reg.email': 'E-mail', 'reg.pass': 'Password', 'reg.pass2': 'Password (Again)',
    'reg.age': 'I confirm I am over 18. I have read the privacy policy.',
    'reg.btn': 'Create Account', 'reg.alt': 'Already a member?', 'reg.altLink': 'Sign in',
    'account.title': 'My Account', 'profile.title': 'My Profile',
    'about.eb': '✦ Our Story',
    'about.h1': 'We left the shame behind. We put <em class="em-rose">pleasure</em> first.',
    'about.p1': 'Love Shop was founded by a team that refuses to let the word "taboo" poison the shopping experience.',
    'about.p2': 'We paired the award-winning web design language of 2026 with Turkey\'s first adult store you can browse with pride.',
    'about.priv.h': 'Privacy Manifesto 🔒',
    'about.priv.p': 'Privacy is not a marketing slogan for us; it is an architectural decision:',
    'about.priv.list': '• <b>Package:</b> Plain kraft box. No logo, no product name.<br>• <b>Statement:</b> Your card statement reads "LS TR Bilişim".<br>• <b>Data:</b> Encrypted and private.',
    'about.ret.h': 'Returns & Warranty',
    'about.ret.p': 'Used products cannot be returned due to hygiene regulations.',
    'about.ret.list': '• Damaged items replaced unconditionally.<br>• 2-year warranty on electronic items.',
    'about.val.h': 'Our Values',
    'about.v1.t': 'Respect', 'about.v1.p': 'Every taste and body belongs here.',
    'about.v2.t': 'Safety', 'about.v2.p': 'CE-certified body-safe materials only.',
    'about.v3.t': 'Inclusivity', 'about.v3.p': 'Open to all identities and preferences.',
    'about.cta.h': 'Having questions? We listen without judgement.', 'about.cta.btn': 'Get in Touch',
    'contact.eb': '✦ Write to Us', 'contact.h1': 'The judgement-free way to say hello',
    'contact.p': 'Your questions can stay anonymous. 24/7 via WhatsApp, or in person at our store.',
    'contact.wa.t': 'WhatsApp Orders', 'contact.wa.s': 'Privacy-first, judgement-free contact',
    'contact.store.t': 'Our Store', 'contact.phone.t': 'Phone', 'contact.phone.s': 'between 09:00–22:00',
    'contact.map.h': '📍 How to find us',
    'contact.map.p': 'On Doktorlar Street, next to Akbank, Ilgaz Business Center.',
    'contact.map.btn': 'Open in Google Maps →', 'contact.wa.btn': 'Ask on WhatsApp',
    'contact.form.h': 'Write via form', 'contact.form.name': 'Name (optional)', 'contact.form.name.ph': 'Leave blank if you prefer',
    'contact.form.email': 'E-mail', 'contact.form.email.ph': 'so we can reply',
    'contact.form.msg': 'Your message', 'contact.form.msg.ph': 'Anything you\'re curious about…', 'contact.form.btn': 'Send 💜',
    '404.h': '404 — Page not found', '404.p': 'Let\'s head back:', '404.home': 'Home', '404.shop': 'Shop',
    'thanks.total': 'Amount:', 'thanks.continue': 'Continue Shopping',
    'thanks.h.pickup': 'Your order is ready!', 'thanks.h.ship': 'Almost done!',
    'thanks.p.pickup': 'We set your items aside at our store.',
    'thanks.p.ship': 'To confirm payment/shipping, please forward your order to us via WhatsApp.',
    'thanks.wa.pickup': 'Confirm Stock on WhatsApp', 'thanks.wa.ship': 'Send Order to WhatsApp',
    'thanks.account': 'Order details are saved in <a href="/hesap" style="color:var(--rose);font-weight:600">My Account</a>.'
  }
};

function makeT(lang: string) {
  const d = STR[lang] || STR.tr;
  return (k: string, vars?: Record<string, any>) => {
    let s = d[k] !== undefined ? d[k] : (STR.tr[k] !== undefined ? STR.tr[k] : k);
    if (vars) for (const v in vars) s = s.split('{' + v + '}').join(String(vars[v]));
    return s;
  };
}

function pageCtx(req: http.IncomingMessage) {
  const lang = getCookieValue(req, 'ls_lang') === 'en' ? 'en' : 'tr';
  const theme = getCookieValue(req, 'ls_theme') === 'dark' ? 'dark' : 'light';
  return { lang, theme, t: makeT(lang), num: (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR') };
}

const ERR: Record<string, Record<string, string>> = {
  tr: {
    'err.rate': 'Çok fazla deneme, 1 dakika bekleyin.',
    'err.email': 'Geçerli bir e-posta girin.',
    'err.pass6': 'Şifre en az 6 karakter olmalı.',
    'err.emailUsed': 'Bu e-posta zaten kayıtlı.',
    'err.badLogin': 'E-posta veya şifre hatalı.',
    'err.notFound404': 'Endpoint bulunamadı.',
    'err.noUser': 'Giriş yapmalısın.',
    'err.noProd': 'Ürün bulunamadı.',
    'err.noStock': 'Bu ürün tükendi.',
    'err.notInCart': 'Sepette bu ürün yok.',
    'err.couponNone': 'Kupon bulunamadı.',
    'err.couponOff': 'Bu kupon artık aktif değil.',
    'err.couponMin': 'Bu kupon için en az {min} sepette olmalı.',
    'err.emptyCart': 'Sepet boş.',
    'err.namePhone': 'Ad soyad ve telefon zorunludur.',
    'err.address': 'Kargo için adres ve şehir zorunludur.',
    'err.noOrder': 'Sipariş bulunamadı.',
    'err.orderForbid': 'Bu siparişi göremezsin.',
    'err.revShort': 'Yorum en az 10 karakter olmalı.',
    'err.reviewNeedUser': 'Yorum yapmak için giriş yapmalısın.',
    'err.msgShort': 'Mesaj çok kısa.',
    'err.needName': 'Ad ve fiyat zorunlu.',
    'err.catName': 'Kategori adı zorunlu.',
    'err.catSlug': 'Bu slug zaten bir kategoriye ait.',
    'err.catBusy': 'Bu kategoride {count} ürün var. Önce ürünleri taşı veya sil.',
    'err.catNone': 'Kategori bulunamadı.',
    'err.wheelFull': 'Çarkta en fazla 8 ürün olabilir; önce birini çıkar.',
    'err.couponShort': 'Kupon kodu en az 3 karakter olmalı.',
    'err.couponExists': 'Bu kod zaten var.',
    'err.revNone': 'Yorum bulunamadı.',
    'err.userNone': 'Kullanıcı bulunamadı.',
    'err.selfEdit': 'Kendi hesabını değiştiremezsin.',
    'err.selfDel': 'Kendi hesabını silemezsin.',
    'err.badReq': 'Geçersiz istek.',
    'err.needAdmin': 'Önce admin girişi gerekli.',
    'err.tooLarge': 'Dosya/istek çok büyük.',
    'err.badJson': 'Geçersiz istek gövdesi.',
    'err.server': 'Sunucuda bir sorun oluştu.'
  },
  en: {
    'err.rate': 'Too many attempts, please wait 1 minute.',
    'err.email': 'Please enter a valid e-mail.',
    'err.pass6': 'Password must be at least 6 characters.',
    'err.emailUsed': 'This e-mail is already registered.',
    'err.badLogin': 'E-mail or password is incorrect.',
    'err.notFound404': 'Endpoint not found.',
    'err.noUser': 'You must be signed in.',
    'err.noProd': 'Product not found.',
    'err.noStock': 'This product is out of stock.',
    'err.notInCart': 'This item is not in your cart.',
    'err.couponNone': 'Coupon not found.',
    'err.couponOff': 'This coupon is no longer active.',
    'err.couponMin': 'You need at least {min} in your cart for this coupon.',
    'err.emptyCart': 'Cart is empty.',
    'err.namePhone': 'Full name and phone are required.',
    'err.address': 'Address and city are required for shipping.',
    'err.noOrder': 'Order not found.',
    'err.orderForbid': 'You cannot view this order.',
    'err.revShort': 'Review must be at least 10 characters.',
    'err.reviewNeedUser': 'You must sign in to review.',
    'err.msgShort': 'Message is too short.',
    'err.needName': 'Name and price are required.',
    'err.catName': 'Category name is required.',
    'err.catSlug': 'This slug already belongs to a category.',
    'err.catBusy': 'This category has {count} products. Move or delete them first.',
    'err.catNone': 'Category not found.',
    'err.wheelFull': 'The wheel can hold up to 8 products; remove one first.',
    'err.couponShort': 'Coupon code must be at least 3 characters.',
    'err.couponExists': 'This code already exists.',
    'err.revNone': 'Review not found.',
    'err.userNone': 'User not found.',
    'err.selfEdit': 'You cannot modify your own account.',
    'err.selfDel': 'You cannot delete your own account.',
    'err.badReq': 'Invalid request.',
    'err.needAdmin': 'Admin sign-in required first.',
    'err.tooLarge': 'File/request too large.',
    'err.badJson': 'Invalid request body.',
    'err.server': 'A server error occurred.'
  }
};

function errT(lang: string, key: string, vars?: Record<string, any>) {
  let s = (ERR[lang] && ERR[lang][key]) || ERR.tr[key] || key;
  if (vars) for (const v in vars) s = s.split('{' + v + '}').join(String(vars[v]));
  return s;
}

/* ---------------- calc helpers ---------------- */
function allCategories() {
  const cats = Array.isArray(db.categories) ? [...db.categories] : [];
  const known = new Set(cats.map((c: any) => c.slug));
  for (const p of db.products || []) {
    if (p.category && !known.has(p.category)) {
      known.add(p.category);
      cats.push({ id: 'ct_' + p.category, slug: p.category, name: p.categoryName || p.category, image: '', createdAt: p.createdAt });
    }
  }
  return cats;
}

function wheelProducts() {
  if (!Array.isArray(db.settings.wheelIds)) db.settings.wheelIds = [];
  const chosen: any[] = [];
  const ids = new Set();
  for (const id of db.settings.wheelIds) {
    const p = db.products.find((x: any) => x.id === id);
    if (p && !ids.has(p.id)) { chosen.push(p); ids.add(p.id); }
    if (chosen.length >= 8) break;
  }
  if (chosen.length < 8) {
    for (const p of db.products.filter((x: any) => (x.featured || x.bestSeller) && !ids.has(x.id)).slice(0, 8 - chosen.length)) {
      chosen.push(p); ids.add(p.id);
    }
  }
  if (chosen.length < 8) {
    for (const p of db.products) {
      if (!ids.has(p.id)) { chosen.push(p); ids.add(p.id); if (chosen.length >= 8) break; }
    }
  }
  return chosen.slice(0, 8);
}

function bentoTemplate(n: number) {
  n = Math.max(1, Math.min(n || 1, 4));
  const L = 'abcd';
  const desk: string[][] = [], mid: string[][] = [], mob: string[][] = [];
  if (n === 1) {
    desk.push([L[0], L[0], L[0]], ['e', 'e', 'e']);
    mid.push([L[0]], ['e']);
    mob.push([L[0]], ['e']);
  } else if (n === 2) {
    desk.push([L[0], L[0], L[1], L[1]], ['e', 'e', 'e', 'e']);
    mid.push([L[0], L[1]], ['e', 'e']);
    mob.push([L[0]], [L[1]], ['e']);
  } else if (n === 3) {
    desk.push([L[0], L[0], L[1], L[2]], [L[0], L[0], 'e', 'e']);
    mid.push([L[0], L[1]], [L[2], L[2]], ['e', 'e']);
    mob.push([L[0]], [L[1]], [L[2]], ['e']);
  } else {
    desk.push([L[0], L[0], L[1], L[2]], [L[0], L[0], L[3], 'e']);
    mid.push([L[0], L[1]], [L[2], L[3]], ['e', 'e']);
    mob.push([L[0]], [L[1]], [L[2]], [L[3]], ['e']);
  }
  const formatRows = (rows: string[][]) => rows.map((r) => `'${r.join(' ')}'`).join(' ');
  return { desktop: formatRows(desk), mid: formatRows(mid), mob: formatRows(mob) };
}

function cartCalc(sess: any) {
  const st = db.settings;
  const items: any[] = [];
  for (const line of sess.cart || []) {
    const p = db.products.find((x: any) => x.id === line.productId);
    if (!p || p.stock <= 0) continue;
    items.push({
      productId: p.id, slug: p.slug, name: p.name, categoryName: p.categoryName,
      category: p.category, image: p.image, variant: line.variant || 'standart',
      price: p.price, qty: Math.min(line.qty, p.stock), lineTotal: p.price * Math.min(line.qty, p.stock)
    });
  }
  const subtotal = items.reduce((a, i) => a + i.lineTotal, 0);
  let discount = 0, coupon = null;
  if (sess.coupon) {
    const c = db.coupons.find((x: any) => x.code === sess.coupon);
    if (c && c.active && subtotal >= c.minTotal) {
      coupon = c;
      discount = c.type === 'percent' ? Math.round(subtotal * c.value) / 100 : c.value;
      discount = Math.min(discount, subtotal);
    }
  }
  const shipping = subtotal === 0 ? 0 : (subtotal - discount >= st.freeShippingThreshold ? 0 : st.shippingFee);
  return { items, subtotal, discount: Math.round(discount * 100) / 100, shipping, coupon, total: Math.round((subtotal - discount + shipping) * 100) / 100, freeShippingThreshold: st.freeShippingThreshold };
}

function findCoupon(code: string, lang = 'tr') {
  const c = db.coupons.find((x: any) => x.code.toUpperCase() === String(code || '').toUpperCase().trim());
  if (!c) return { error: errT(lang, 'err.couponNone') };
  if (!c.active) return { error: errT(lang, 'err.couponOff') };
  return { coupon: c };
}

/* ---------------- layout ---------------- */
const CAT_EN: Record<string, string> = {
  'vibratori': 'Vibrators',
  'ciftler': 'For Couples',
  'kozmetik': 'Cosmetics',
  'fantasy': 'Fantasy & Costume',
  'oyunlar': 'Games & Accessories'
};

function catNameEN(slug: string, name: string) { return CAT_EN[slug] || name; }

function layout(title: string, body: string, opts: any = {}, ctx: any = null) {
  const st = db.settings;
  const C = ctx || { lang: 'tr', theme: 'light', t: makeT('tr'), num: (n: number) => n.toLocaleString('tr-TR') };
  const tr = C.t;
  const dark = C.theme === 'dark';
  return `<!DOCTYPE html>
<html lang="${C.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="view-transition" content="same-origin">
<title>${esc(title)} — ${esc(st.storeName)}</title>
<meta name="description" content="${esc(st.storeName)}: gizli paketleme, güvenli ödeme, vücut dostu ürünler. 18+ yetkin yaşam mağazası.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💖</text></svg>">
<script>try{var d=localStorage.getItem('ls_theme');if(d==='dark'||((d===null||d==='')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}</script>
<link rel="stylesheet" href="/css/shop.css">
</head>
<body>
${opts.noChrome ? body : `
<div id="age-gate" class="hidden-check">
  <div class="age-overlay" aria-hidden="true"></div>
  <div class="age-content">
    <h2 class="brand" style="justify-content:center;font-size:30px">LOVE<span class="dot">.</span></h2>
    <h1 class="age-title">${tr('age.title')}</h1>
    <p class="age-legal">${tr('age.legal')}</p>
    <div class="age-actions">
      <button id="age-yes" class="btn btn-primary">${tr('age.yes')}</button>
      <button id="age-no" class="btn btn-ghost">${tr('age.no')}</button>
    </div>
    <small class="age-small">${tr('age.small')}</small>
  </div>
</div>
<div id="cursor-glow"></div>
<nav class="top">
  <a href="/" class="brand">LOVE<span class="dot">.</span></a>
  <div class="nav-links">
    <a href="/" data-nav="/">${tr('nav.home')}</a>
    <a href="/magaza" data-nav="/magaza">${tr('nav.shop')}</a>
    <a href="/hakkimizda" data-nav="/hakkimizda">${tr('nav.about')}</a>
    <a href="/iletisim" data-nav="/iletisim">${tr('nav.contact')}</a>
  </div>
  <div class="nav-tools">
    <button id="theme-toggle" class="icon-btn" title="${dark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}" aria-label="Dark mode">
      ${dark ? '<svg class="icon-svg icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' : '<svg class="icon-svg icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}
    </button>
    <button id="lang-toggle" class="lang-btn" title="${C.lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'}" aria-label="Switch language">${C.lang === 'tr' ? 'EN' : 'TR'}</button>
    <span id="nav-user"><a href="/giris" class="icon-btn" title="${tr('nav.login')}"><svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></a></span>
    <a href="/admin" id="nav-admin" class="icon-btn" style="display:none" title="Admin Panel"><svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></a>
    <a href="/sepet" class="icon-btn" title="Sepet"><svg class="icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span class="cart-badge" id="cart-badge">0</span></a>
    <button id="burger" class="icon-btn" aria-label="Menü"><svg class="icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <a href="/">${tr('nav.home')}</a><a href="/magaza">${tr('nav.shop')}</a><a href="/hakkimizda">${tr('nav.about')}</a><a href="/iletisim">${tr('nav.contact')}</a><a href="/hesap">${tr('nav.account')}</a>
  <div class="mm-toggles">
    <button id="mm-theme" class="icon-btn" aria-label="Dark mode">
      ${dark ? '<svg class="icon-svg icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' : '<svg class="icon-svg icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}
    </button>
    <button id="mm-lang" class="lang-btn" aria-label="Switch language">${C.lang === 'tr' ? 'EN' : 'TR'}</button>
  </div>
</div>
<main id="app-main">
${body}
</main>
<footer>
  <div class="foot-main">
    <div class="foot-id">
      <a href="/" class="brand foot-brand">LOVE<span class="dot">.</span></a>
      <p class="foot-desc"><b>${esc(st.storeName)}</b>${tr('foot.desc')}</p>
    </div>
    <nav class="foot-links">
      <a href="/magaza">${tr('foot.all')}</a>
      <a href="/hakkimizda">${tr('foot.about')}</a>
      <a href="/hakkimizda#gizlilik">${tr('foot.discreet')}</a>
      <a href="/hakkimizda#iade">${tr('foot.returns')}</a>
      <a href="/iletisim">${tr('foot.contact')}</a>
    </nav>
    <div class="foot-contact">
      <a class="foot-phone" href="${esc(st.whatsapp)}" target="_blank" rel="noopener">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
        ${esc(st.supportPhone)}
      </a>
    </div>
  </div>
  <div class="foot-bottom">
    <span>© ${new Date().getFullYear()} ${esc(st.storeName)}${tr('foot.rights')}</span>
    <div class="pay-chips"><span>${tr('foot.pay.wa')}</span><span>${tr('foot.pay.shop')}</span><span>${tr('foot.pay.discreet')}</span></div>
  </div>
</footer>`}
<div id="toast-zone"></div>

<!-- Spatial Card Zoom / Morphing Canvas Modal (2026 E-Commerce Award Winner) -->
<div class="spatial-canvas-overlay" id="spatial-canvas-overlay" aria-hidden="true">
  <div class="spatial-card-stage" id="spatial-card-stage" role="dialog" aria-modal="true" aria-label="Product Showcase">
    <!-- Populated with FLIP spring animation by shop.js -->
  </div>
</div>

<script>window.__LS_LANG__='${C.lang}';</script>
<script src="/js/shop.js"></script>
</body>
</html>`;
}

const productCardSSR = (p: any, tr: any) => `
<article class="prod-card rv" data-id="${p.id}">
  <a href="/urun/${esc(p.slug)}" class="prod-media" data-slug="${esc(p.slug)}">
    <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
    <div class="card-sheen"></div>
    <div class="prod-badges">${p.isNew ? `<span class="badge new">${tr('badge.new')}</span>` : ''}${p.bestSeller ? `<span class="badge hot">${tr('badge.hot')}</span>` : ''}${p.oldPrice ? `<span class="badge sale">${tr('badge.sale')}</span>` : ''}</div>
  </a>
  <div class="prod-actions">
    <button type="button" class="action-btn quick-add-btn" data-add="${p.id}" title="${tr('quickadd')}" aria-label="${tr('quickadd')}">＋</button>
  </div>
  <div class="prod-info">
    <div class="prod-cat">${esc(p.categoryName)}</div>
    <a href="/urun/${esc(p.slug)}" class="prod-name">${esc(p.name)}</a>
    <div class="prod-rating">${stars(p.rating)} <span>(${p.reviewCount || 0})</span></div>
    <div class="prod-price-row"><span class="price">${fmt(p.price)}</span>${p.oldPrice ? `<span class="price-old">${fmt(p.oldPrice)}</span>` : ''}</div>
  </div>
</article>`;

/* ---------------- pages ---------------- */
function pageHome(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  const allCats = allCategories().map((c: any) => {
    const products = db.products.filter((p: any) => p.category === c.slug);
    const cover = products.find((p: any) => p.bestSeller) || products[0];
    const rawName = c.name || catNameEN(c.slug, c.slug);
    return { slug: c.slug, name: C.lang === 'en' ? catNameEN(c.slug, rawName) : rawName, count: products.length, image: c.image || (cover ? cover.image : '') };
  });
  const top = [...allCats].sort((a, b) => b.count - a.count).slice(0, 4);
  const rest = allCats.filter((c) => !top.some((t) => t.slug === c.slug));
  const totalCount = allCats.reduce((s, c) => s + c.count, 0);
  const tpl = bentoTemplate(top.length);
  const bentoStyle = `.bento{grid-template-areas:${tpl.desktop}}
@media(max-width:1100px){.bento{grid-template-areas:${tpl.mid}}}
@media(max-width:860px){.bento{grid-template-areas:${tpl.mob}}}`;
  const featured = db.products.filter((p: any) => p.featured).slice(0, 10);
  const news = [...db.products].sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const reviews = db.reviews.filter((r: any) => r.approved).slice(0, 6);
  const html = `
<style id="bento-areas">${bentoStyle}</style>
<section class="hero">
  <div class="hero-bg"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
  <div class="hero-content">
    <span class="eyebrow">${tr('hero.eyebrow')}</span>
    <h1>${tr('hero.h1')}</h1>
    <p>${tr('hero.p')}</p>
    <div class="hero-cta">
      <a href="/magaza" class="btn btn-primary">${tr('hero.cta.shop')}</a>
      <a href="/hakkimizda" class="btn btn-ghost">${tr('hero.cta.why')}</a>
    </div>
    <div class="hero-stats"><div><strong>${C.num(db.products.length)}+</strong><span>${tr('hero.stat1')}</span></div><div><strong>${tr('hero.stat2')}</strong><span>${tr('hero.stat2.label')}</span></div><div><strong>${tr('hero.stat3')}</strong><span>${tr('hero.stat3.label')}</span></div></div>
  </div>
  <div class="hero-visual">
    <div class="cf-stage" id="cf-stage" aria-label="Featured product showcase"></div>
  </div>
</section>
<div class="marquee"><div class="marquee-track">
  ${Array(2).fill([tr('mq.1'), tr('mq.2'), tr('mq.3'), tr('mq.4'), tr('mq.5'), tr('mq.6')].join(' <b>✦</b> ') + ' <b>✦</b>').map((s) => `<span>${s}</span>`).join('')}
</div></div>
<section class="block">
  <div class="section-head rv"><div><span class="eyebrow"><span class="dot-em"></span>${tr('sec.cats.eb')}</span><h2>${tr('sec.cats.h2')}</h2><p>${tr('sec.cats.p', { n: C.num(totalCount) })}</p></div><a href="/magaza" class="link-more">${tr('sec.cats.link')}</a></div>
  <div class="bento">${top.map((c, i) => {
    const parts = c.name.split(' ');
    const nm = parts[0] + (parts.length > 1 ? ` <em>${parts.slice(1).join(' ')}</em>` : '');
    return `
    <a class="bento-card rv rv-d${i + 1}" style="grid-area:${'abcde'[i]}" href="/magaza?kat=${c.slug}">
      <span class="bento-rank">0${i + 1}</span>
      <img class="bento-bg" src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">
      <div class="bento-meta"><h3>${nm}</h3><span class="bcount">${c.count} ${tr('cats.products')}</span></div>
      <span class="bento-go">${tr('bento.explore')}</span>
    </a>`;
  }).join('')}
    <a class="bento-cta rv rv-d${top.length + 1}" style="grid-area:e" href="/magaza">
      <span class="cta-glow" aria-hidden="true"></span>
      <span class="cta-arrows" aria-hidden="true">→ → →</span>
      <span class="cta-inner">
        <em class="cta-kicker">${tr('bcta.kicker')}</em>
        <h3>${tr('bcta.h3')}<span class="dot-rose">.</span></h3>
        <span class="cta-count">${tr('bcta.count', { cats: allCats.length, prods: C.num(totalCount) })}</span>
      </span>
      <span class="cta-list">${rest.slice(0, 7).map((c) => esc(c.name)).join(' · ')}${rest.length > 7 ? ' · …' : ''}</span>
    </a>
  </div>
</section>
<section class="block" style="padding-top:20px">
  <div class="section-head rv"><div><span class="eyebrow"><span class="dot-em"></span>${tr('sec.feat.eb')}</span><h2>${tr('sec.feat.h2')}</h2></div><a href="/magaza" class="link-more">${tr('sec.feat.link')}</a></div>
  <div class="prod-grid" id="featured-grid">${featured.map((p: any) => productCardSSR(p, tr)).join('')}</div>
</section>
<section class="block" style="padding-top:0">
  <div class="banner rv">
    <span class="eyebrow">${tr('banner.eb')}</span>
    <h2>${tr('banner.h2')}</h2>
    <p>${tr('banner.p')}</p>
    <a href="/hakkimizda#gizlilik" class="btn btn-gold">${tr('banner.btn')}</a>
  </div>
</section>
<section class="block" style="padding-top:0">
  <div class="section-head rv"><div><span class="eyebrow"><span class="dot-em"></span>${tr('sec.new.eb')}</span><h2>${tr('sec.new.h2')}</h2></div><a href="/magaza?sort=yeni" class="link-more">${tr('sec.new.link')}</a></div>
  <div class="prod-grid" id="new-grid">${news.map((p: any) => productCardSSR(p, tr)).join('')}</div>
</section>
<section class="block" style="padding-top:0">
  <div class="features">
    <div class="feature rv"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></div><div><h4>${tr('f1.t')}</h4><p>${tr('f1.p')}</p></div></div>
    <div class="feature rv rv-d1"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div><h4>${tr('f2.t')}</h4><p>${tr('f2.p')}</p></div></div>
    <div class="feature rv rv-d2"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div><div><h4>${tr('f3.t')}</h4><p>${tr('f3.p')}</p></div></div>
    <div class="feature rv rv-d3"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg></div><div><h4>${tr('f4.t')}</h4><p>${tr('f4.p')}</p></div></div>
  </div>
</section>
<section class="block" style="padding-top:0">
  <div class="section-head rv"><div><span class="eyebrow"><span class="dot-em"></span>${tr('sec.rev.eb')}</span><h2>${tr('sec.rev.h2')}</h2></div></div>
  <div class="review-grid">${reviews.map((r: any) => {
    const p = db.products.find((x: any) => x.id === r.productId);
    return `<div class="review-card rv"><div class="stars">${stars(r.rating)}</div><p>"${esc(r.text)}"</p><small>— ${esc(r.userName)} · ${esc(p ? p.name : 'Product')}</small></div>`;
  }).join('') || `<div class="empty-state"><div class="big">💬</div><p>${tr('sec.rev.empty')}</p></div>`}
  </div>
</section>
<section class="block" style="padding-top:0">
  <div class="newsletter rv">
    <span class="eyebrow"><span class="dot-em"></span>${tr('nl.eb')}</span>
    <h2>${tr('nl.h2')}</h2>
    <p>${tr('nl.p')}</p>
    <form class="nl-form" id="nl-form">
      <input id="nl-email" type="email" placeholder="${tr('nl.ph')}" required>
      <button class="btn btn-primary" type="submit">${tr('nl.btn')}</button>
    </form>
  </div>
</section>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Pleasure is yours — 18+ Adult Wellness Store' : 'Haz senin — 18+ Yetkin Yaşam Mağazası', html, {}, C));
}

function pageShop(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="page-head"><div class="crumbs"><a href="/">${tr('shop.crumb.home')}</a> / ${tr('shop.title')}</div><h1>${tr('shop.title')}</h1><p>${tr('shop.desc', { n: C.num(db.products.length) })}</p></div>
<div class="shop-layout">
  <aside class="filters">
    <div class="field"><input id="shop-search" placeholder="${tr('shop.search')}"></div>
    <h4>${tr('shop.cat')}</h4>
    <div class="filter-chips" id="cat-chips"></div>
  </aside>
  <div>
    <div class="shop-toolbar">
      <span class="results-count" id="results-count"></span>
      <select id="shop-sort">
        <option value="onerilen">${tr('shop.sort.def')}</option>
        <option value="yeni">${tr('shop.sort.new')}</option>
        <option value="fiyat-artan">${tr('shop.sort.asc')}</option>
        <option value="fiyat-azalan">${tr('shop.sort.desc')}</option>
        <option value="puan">${tr('shop.sort.rate')}</option>
      </select>
    </div>
    <div id="shop-root"></div>
  </div>
</div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(tr('shop.title'), html, {}, C));
}

function pageProduct(req: http.IncomingMessage, res: http.ServerResponse, slug: string) {
  const C = pageCtx(req);
  const html = `<div id="product-root"><div class="spinner"></div></div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Product' : 'Ürün', html, {}, C));
}

function pageReviewForm(req: http.IncomingMessage, res: http.ServerResponse, slug: string) {
  const p = db.products.find((x: any) => x.slug === slug);
  if (!p) { res.writeHead(302, { Location: '/magaza' }); return res.end(); }
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="auth-wrap"><div class="auth-card" style="max-width:520px">
  <h1>${tr('rv.title')}</h1><p class="sub">${esc(p.name)}</p>
  <form id="review-form" data-product="${p.id}" data-slug="${esc(p.slug)}">
    <div class="field"><label>${tr('rv.rating')}</label>
      <div id="stars-row" style="font-size:26px;letter-spacing:4px;color:var(--gold);cursor:pointer">
        ${[1, 2, 3, 4, 5].map((i) => `<span data-star="${i}">★</span>`).join('')}<input type="hidden" value="5">
      </div>
    </div>
    <div class="field"><label>${tr('rv.comment')}</label><textarea id="rv-text" placeholder="${tr('rv.ph')}"></textarea></div>
    <button class="btn btn-primary btn-block" type="submit">${tr('rv.submit')}</button>
  </form>
  <p class="auth-alt">${tr('rv.note')} <a href="/urun/${esc(p.slug)}">${tr('rv.back')}</a></p>
</div></div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Write a Review' : 'Yorum Yaz', html, {}, C));
}

function pageCart(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(tr('cart.title'), `<div class="page-head"><div class="crumbs"><a href="/">${tr('shop.crumb.home')}</a> / ${tr('cart.crumb')}</div><h1>${tr('cart.title')}</h1></div><div class="cart-layout" id="cart-root"><div class="spinner"></div></div>`, {}, C));
}

function pageCheckout(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(tr('checkout.title'), `<div class="page-head"><div class="crumbs"><a href="/">${tr('shop.crumb.home')}</a> / <a href="/sepet">${tr('cart.crumb')}</a> / ${tr('checkout.crumb')}</div><h1>${tr('checkout.title')}</h1></div><div id="checkout-root"><div class="spinner"></div></div>`, {}, C));
}

function pageThanks(req: http.IncomingMessage, res: http.ServerResponse, id: string) {
  const st = db.settings;
  const C = pageCtx(req);
  const tr = C.t;
  const en = C.lang === 'en';
  const order = db.orders.find((o: any) => o.id === id);
  const pickup = !!(order && order.address && String(order.address.full).startsWith('MAĞAZADAN'));
  const lines = order
    ? [(en ? 'Hello Love, my order:' : 'Merhaba Love, siparişim:'), (en ? 'Order No: ' : 'Sipariş No: ') + order.id, '']
    : [(en ? 'Hello Love, I have a new order:' : 'Merhaba Love, yeni siparişim var:')];
  if (order) {
    for (const i of order.items) lines.push(`- ${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`);
    if (order.discount) lines.push((en ? 'Coupon discount: ' : 'Kupon indirimi: ') + '-' + fmt(order.discount));
    if (order.shipping) lines.push((en ? 'Shipping: ' : 'Kargo: ') + fmt(order.shipping));
    lines.push((en ? 'TOTAL: ' : 'TOPLAM: ') + fmt(order.total));
  }
  const waLink = (st.whatsapp || 'https://wa.me/905436331325') + '?text=' + encodeURIComponent(lines.join('\n'));
  const html = `
<div class="success-wrap"><div class="success-card">
  <div class="success-icon">${pickup ? '🏬' : '💬'}</div>
  <h1>${pickup ? tr('thanks.h.pickup') : tr('thanks.h.ship')}</h1>
  <p id="thanks-total">${order ? tr('thanks.total') + ' ' + fmt(order.total) : ''}</p>
  <p>${pickup ? tr('thanks.p.pickup') : tr('thanks.p.ship')}</p>
  <div class="order-no" id="thanks-order">${esc(id)}</div>
  <a href="${esc(waLink)}" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:20px">💬 ${pickup ? tr('thanks.wa.pickup') : tr('thanks.wa.ship')}</a>
  <p style="font-size:12.5px;color:var(--muted);margin-top:8px">${tr('thanks.account')}</p>
  <div style="margin-top:26px;display:flex;gap:12px;justify-content:center"><a href="/magaza" class="btn btn-ghost">${tr('thanks.continue')}</a></div>
</div></div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(en ? 'Order Received' : 'Sipariş Alındı', html, {}, C));
}

function pageLogin(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="auth-wrap"><div class="auth-card">
  <h1>${tr('login.title')}</h1>
  <p class="sub">${tr('login.sub')}</p>
  <form id="login-form">
    <div class="field"><label>${tr('login.email')}</label><input id="l-email" type="email" required placeholder="e-posta@adres.com"></div>
    <div class="field"><label>${tr('login.pass')}</label><input id="l-pass" type="password" required placeholder="••••••••"></div>
    <button class="btn btn-primary btn-block" type="submit">${tr('login.btn')}</button>
  </form>
  <p class="auth-alt">${tr('login.alt')} <a href="/kayit">${tr('login.altLink')}</a></p>
</div></div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Sign In' : 'Giriş Yap', html, {}, C));
}

function pageRegister(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="auth-wrap"><div class="auth-card">
  <h1>${tr('reg.title')}</h1>
  <p class="sub">${tr('reg.sub')}</p>
  <form id="register-form">
    <div class="field"><label>${tr('reg.name')}</label><input id="r-name" required placeholder="${C.lang === 'en' ? 'Your full name' : 'Adınız Soyadınız'}"></div>
    <div class="field"><label>${tr('reg.email')}</label><input id="r-email" type="email" required placeholder="e-posta@adres.com"></div>
    <div class="grid-2">
      <div class="field"><label>${tr('reg.pass')}</label><input id="r-pass" type="password" required placeholder="${C.lang === 'en' ? 'At least 6 characters' : 'En az 6 karakter'}"></div>
      <div class="field"><label>${tr('reg.pass2')}</label><input id="r-pass2" type="password" required placeholder="••••••••"></div>
    </div>
    <div class="checkbox-row" style="margin-bottom:18px"><input type="checkbox" id="r-age"><label for="r-age">${tr('reg.age')}</label></div>
    <button class="btn btn-primary btn-block" type="submit">${tr('reg.btn')}</button>
  </form>
  <p class="auth-alt">${tr('reg.alt')} <a href="/giris">${tr('reg.altLink')}</a></p>
</div></div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Register' : 'Kayıt Ol', html, {}, C));
}

function pageAccount(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(tr('account.title'), `<div class="page-head"><div class="crumbs"><a href="/">${tr('shop.crumb.home')}</a> / ${tr('nav.account')}</div><h1>${tr('account.title')}</h1></div><div class="acc-layout" id="account-root"><div class="spinner"></div></div>`, {}, C));
}

function pageProfile(req: http.IncomingMessage, res: http.ServerResponse) {
  const C = pageCtx(req);
  const tr = C.t;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(tr('profile.title'), `<div class="page-head"><div class="crumbs"><a href="/">${tr('shop.crumb.home')}</a> / <a href="/hesap">${tr('account.title')}</a> / ${tr('profile.title')}</div><h1>${tr('profile.title')}</h1></div><div class="acc-layout" id="profile-root"><div class="spinner"></div></div>`, {}, C));
}

function pageAbout(req: http.IncomingMessage, res: http.ServerResponse) {
  const st = db.settings;
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="rich">
  <span class="eyebrow">${tr('about.eb')}</span>
  <h2 style="font-family:var(--font-display);font-size:clamp(30px,4vw,52px);line-height:1.1">${tr('about.h1')}</h2>
  <p style="font-size:16px">${tr('about.p1')}</p>
  <p>${tr('about.p2')}</p>
  <h2 id="gizlilik">${tr('about.priv.h')}</h2>
  <p>${tr('about.priv.p')}</p>
  <p>${tr('about.priv.list')}</p>
  <h2 id="iade">${tr('about.ret.h')}</h2>
  <p>${tr('about.ret.p')}</p>
  <p>${tr('about.ret.list')}</p>
  <h2>${tr('about.val.h')}</h2>
  <div class="value-grid">
    <div class="feature"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div><h4>${tr('about.v1.t')}</h4><p>${tr('about.v1.p')}</p></div>
    <div class="feature"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg></div><h4>${tr('about.v2.t')}</h4><p>${tr('about.v2.p')}</p></div>
    <div class="feature"><div class="fi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="7"/><circle cx="15" cy="15" r="7"/></svg></div><h4>${tr('about.v3.t')}</h4><p>${tr('about.v3.p')}</p></div>
  </div>
  <div class="banner rv" style="margin-top:40px;text-align:center">
    <h2 style="margin:0 auto">${tr('about.cta.h')}</h2>
    <p style="margin:14px auto 28px">${esc(st.supportEmail)} · ${esc(st.supportPhone)}</p>
    <a href="/iletisim" class="btn btn-primary">${tr('about.cta.btn')}</a>
  </div>
</div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'About Us' : 'Hakkımızda', html, {}, C));
}

function pageContact(req: http.IncomingMessage, res: http.ServerResponse) {
  const st = db.settings;
  const C = pageCtx(req);
  const tr = C.t;
  const html = `
<div class="rich">
  <span class="eyebrow">${tr('contact.eb')}</span>
  <h2 style="font-family:var(--font-display);font-size:clamp(30px,4vw,52px);line-height:1.1">${tr('contact.h1')}</h2>
  <p>${tr('contact.p')}</p>
  <div class="contact-cards" style="display:grid;gap:26px;margin-top:30px">
    <div class="feature"><div class="fi">💬</div><div><h4>${tr('contact.wa.t')}</h4><p><a href="${esc(st.whatsapp)}" target="_blank" rel="noopener" style="color:var(--rose);font-weight:600">+90 543 633 13 25</a><br><span class="muted" style="font-size:12px">${tr('contact.wa.s')}</span></p></div></div>
    <div class="feature"><div class="fi">🏬</div><div><h4>${tr('contact.store.t')}</h4><p>${esc(st.address)}</p></div></div>
    <div class="feature"><div class="fi">📞</div><div><h4>${tr('contact.phone.t')}</h4><p>${esc(st.supportPhone)}<br><span class="muted" style="font-size:12px">${tr('contact.phone.s')}</span></p></div></div>
  </div>
  <div class="check-step" style="margin-top:34px">
    <h3>${tr('contact.map.h')}</h3>
    <p style="margin-bottom:16px">${tr('contact.map.p')}</p>
    <iframe src="https://www.google.com/maps?q=${esc(st.mapsQuery)}&output=embed" style="width:100%;height:340px;border:1px solid var(--line);border-radius:var(--r-md)" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="Love Sex Shop Eskişehir — Google Maps"></iframe>
    <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap">
      <a href="https://www.google.com/maps/search/?api=1&query=${esc(st.mapsQuery)}" target="_blank" rel="noopener" class="btn btn-primary">${tr('contact.map.btn')}</a>
      <a href="${esc(st.whatsapp)}" target="_blank" rel="noopener" class="btn btn-ghost">${tr('contact.wa.btn')}</a>
    </div>
  </div>
  <div class="check-step" style="margin-top:34px">
    <h3>${tr('contact.form.h')}</h3>
    <form id="contact-form">
      <div class="grid-2">
        <div class="field"><label>${tr('contact.form.name')}</label><input id="c-name" placeholder="${tr('contact.form.name.ph')}"></div>
        <div class="field"><label>${tr('contact.form.email')}</label><input id="c-email" type="email" required placeholder="${tr('contact.form.email.ph')}"></div>
      </div>
      <div class="field"><label>${tr('contact.form.msg')}</label><textarea id="c-msg" required placeholder="${tr('contact.form.msg.ph')}"></textarea></div>
      <button class="btn btn-primary" type="submit">${tr('contact.form.btn')}</button>
    </form>
  </div>
</div>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(layout(C.lang === 'en' ? 'Contact' : 'İletişim', html, {}, C));
}

function pageAdmin(req: http.IncomingMessage, res: http.ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Panel — LOVE SHOP</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚙️</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body>
<div id="admin-root"></div>
<div id="toast-zone"></div>
<script src="/js/admin.js"></script>
</body>
</html>`);
}

/* ---------------- static ---------------- */
const MIME: Record<string, string> = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4'
};

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, pathname: string) {
  const p = path.normalize(path.join(PUB, pathname));
  if (!p.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  const type = MIME[path.extname(p)] || 'application/octet-stream';
  fs.stat(p, (serr, st) => {
    if (serr) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
    fs.readFile(p, (err, buf) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404'); }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      res.end(buf);
    });
  });
}

function saveUpload(dataUrl: string) {
  const m = dataUrl.match(/^data:image\/(svg\+xml|png|jpe?g|webp);base64,(.+)$/);
  if (!m) return '/uploads/aurora-wand.svg';
  const ext = { 'svg+xml': 'svg', png: 'png', jpeg: 'jpg', jpg: 'jpg', webp: 'webp' }[m[1]] || 'png';
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 2 * 1024 * 1024) return '/uploads/aurora-wand.svg';
  const name = uid('img') + '.' + ext;
  fs.mkdirSync(path.join(PUB, 'uploads'), { recursive: true });
  fs.writeFileSync(path.join(PUB, 'uploads', name), buf);
  return '/uploads/' + name;
}

/* ---------------- API ---------------- */
async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, pathname: string, url: URL) {
  const method = req.method;
  const q = url.searchParams;
  const sess = getSession(req, res);
  const user = getUser(sess);
  const apiLang = getCookieValue(req, 'ls_lang') === 'en' ? 'en' : 'tr';
  const E = (key: string, vars?: any) => errT(apiLang, key, vars);

  /* --- session --- */
  if (pathname === '/api/session' && method === 'GET') {
    return json(res, 200, { ok: true, user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, addresses: user.addresses } : null });
  }

  /* --- auth --- */
  if (pathname === '/api/auth/register' && method === 'POST') {
    if (rateLimited(req, 'auth', 8, 60000)) return sendError(res, 429, E('err.rate'));
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return sendError(res, 400, E('err.email'));
    if (!String(b.password || '') || b.password.length < 6) return sendError(res, 400, E('err.pass6'));
    if (db.users.some((u: any) => u.email === email)) return sendError(res, 409, E('err.emailUsed'));
    const u = { id: uid('u'), email, passwordHash: hash(b.password), name: String(b.name || '').trim() || 'Misafir', role: 'customer', createdAt: new Date().toISOString(), addresses: [] };
    db.users.push(u); save();
    sess.userId = u.id; persistSessions();
    return json(res, 200, { ok: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  }
  if (pathname === '/api/auth/login' && method === 'POST') {
    if (rateLimited(req, 'auth', 8, 60000)) return sendError(res, 429, E('err.rate'));
    const b = await readBody(req);
    const u = db.users.find((x: any) => x.email === String(b.email || '').trim().toLowerCase());
    if (!u || u.passwordHash !== hash(String(b.password || ''))) return sendError(res, 401, E('err.badLogin'));
    sess.userId = u.id; persistSessions();
    return json(res, 200, { ok: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  }
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const sid = getSid(req);
    if (sid && sessions[sid]) { delete sessions[sid]; persistSessions(); }
    clearSidCookie(res);
    return json(res, 200, { ok: true });
  }

  /* --- categories & products (public) --- */
  if (pathname === '/api/categories' && method === 'GET') {
    const cats = allCategories().map((c: any) => ({ slug: c.slug, name: c.name, image: c.image || '', count: db.products.filter((p: any) => p.category === c.slug).length }));
    return json(res, 200, { ok: true, categories: cats });
  }
  if (pathname === '/api/products' && method === 'GET') {
    let list = [...db.products];
    const cat = q.get('cat'); if (cat) list = list.filter((p: any) => p.category === cat);
    const kw = q.get('q'); if (kw) { const k = kw.toLowerCase(); list = list.filter((p: any) => p.name.toLowerCase().includes(k) || p.description.toLowerCase().includes(k) || p.slug.includes(k)); }
    if (q.get('featured') === '1') list = list.filter((p: any) => p.featured);
    if (q.get('wheel') === '1') return json(res, 200, { ok: true, total: 0, products: wheelProducts() });
    switch (q.get('sort')) {
      case 'yeni': case 'new': list.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)); break;
      case 'fiyat-artan': list.sort((a: any, b: any) => a.price - b.price); break;
      case 'fiyat-azalan': list.sort((a: any, b: any) => b.price - a.price); break;
      case 'puan': list.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)); break;
      default: list.sort((a: any, b: any) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
    }
    const total = list.length;
    const offset = parseInt(q.get('offset') || '0', 10) || 0;
    const limit = Math.min(parseInt(q.get('limit') || '24', 10) || 24, 60);
    return json(res, 200, { ok: true, total, products: list.slice(offset, offset + limit) });
  }
  const pSlug = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (pSlug && method === 'GET') {
    const p = db.products.find((x: any) => x.slug === decodeURIComponent(pSlug[1]) || x.id === decodeURIComponent(pSlug[1]));
    if (!p) return sendError(res, 404, E('err.noProd'));
    return json(res, 200, { ok: true, product: p });
  }
  const pRev = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/);
  if (pRev) {
    const p = db.products.find((x: any) => x.id === decodeURIComponent(pRev[1]) || x.slug === decodeURIComponent(pRev[1]));
    if (!p) return sendError(res, 404, E('err.noProd'));
    if (method === 'GET') return json(res, 200, { ok: true, reviews: db.reviews.filter((r: any) => r.productId === p.id && r.approved).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)) });
    if (method === 'POST') {
      const b = await readBody(req);
      const text = String(b.text || '').trim();
      if (text.length < 10) return sendError(res, 400, E('err.revShort'));
      const rating = Math.min(5, Math.max(1, parseInt(b.rating, 10) || 5));
      const masked = user ? user.name.trim()[0] + '***' : 'M***';
      db.reviews.push({ id: uid('r'), productId: p.id, userName: masked, rating, text, approved: false, createdAt: new Date().toISOString() });
      save();
      return json(res, 200, { ok: true });
    }
  }

  /* --- cart --- */
  if (pathname === '/api/cart' && method === 'GET') return json(res, 200, { ok: true, ...cartCalc(sess) });
  if (pathname === '/api/cart/add' && method === 'POST') {
    const b = await readBody(req);
    const prodId = String(b.productId || '').trim();
    const p = db.products.find((x: any) => x.id === prodId || x.slug === prodId);
    if (!p) return sendError(res, 404, E('err.noProd'));
    if (p.stock <= 0) return sendError(res, 400, E('err.noStock'));
    if (!Array.isArray(sess.cart)) sess.cart = [];
    const line = sess.cart.find((l: any) => l.productId === p.id);
    const qty = Math.min(Math.max(1, parseInt(b.qty, 10) || 1), p.stock);
    if (line) line.qty = Math.min(line.qty + qty, p.stock);
    else sess.cart.push({ productId: p.id, qty, variant: b.variant || 'standart' });
    persistSessions();
    return json(res, 200, { ok: true, ...cartCalc(sess) });
  }
  if (pathname === '/api/cart/update' && method === 'POST') {
    const b = await readBody(req);
    const prodId = String(b.productId || '').trim();
    if (!Array.isArray(sess.cart)) sess.cart = [];
    const line = sess.cart.find((l: any) => l.productId === prodId);
    if (!line) return sendError(res, 404, E('err.notInCart'));
    const p = db.products.find((x: any) => x.id === prodId || x.slug === prodId);
    line.qty = Math.min(Math.max(1, parseInt(b.qty, 10) || 1), p ? p.stock : 99);
    persistSessions();
    return json(res, 200, { ok: true, ...cartCalc(sess) });
  }
  if (pathname === '/api/cart/remove' && method === 'POST') {
    const b = await readBody(req);
    const prodId = String(b.productId || '').trim();
    if (!Array.isArray(sess.cart)) sess.cart = [];
    sess.cart = sess.cart.filter((l: any) => l.productId !== prodId);
    persistSessions();
    return json(res, 200, { ok: true, ...cartCalc(sess) });
  }
  if (pathname === '/api/cart/coupon' && method === 'POST') {
    const b = await readBody(req);
    const r = findCoupon(b.code, apiLang);
    if (r.error) return sendError(res, 400, r.error);
    const c = cartCalc({ ...sess, coupon: r.coupon.code });
    if (r.coupon.minTotal > c.subtotal) return sendError(res, 400, E('err.couponMin', { min: fmt(r.coupon.minTotal) }));
    sess.coupon = r.coupon.code; persistSessions();
    return json(res, 200, { ok: true, ...cartCalc(sess) });
  }

  /* --- checkout --- */
  if (pathname === '/api/checkout' && method === 'POST') {
    const st = db.settings;
    const b = await readBody(req);
    const c = cartCalc(sess);
    if (!c.items.length) return sendError(res, 400, E('err.emptyCart'));
    const name = String(b.name || '').trim();
    const phone = String(b.phone || '').trim();
    const PAY: Record<string, string> = { whatsapp: 'WhatsApp ile Sipariş', shop: 'Mağazadan Teslim & Ödeme' };
    const payKey = PAY[b.payment] ? b.payment : 'whatsapp';
    const pickup = payKey === 'shop';
    if (!name || !phone) return sendError(res, 400, E('err.namePhone'));
    const address = String(b.address || '').trim();
    const city = String(b.city || '').trim();
    if (!pickup && (!address || !city)) return sendError(res, 400, E('err.address'));
    const shipping = pickup ? 0 : c.shipping;
    const total = Math.round((c.subtotal - c.discount + shipping) * 100) / 100;
    const orderId = 'LS-' + (1000 + nextId('order'));
    const email = user ? user.email : String(b.email || '').trim().toLowerCase() || sess.lastGuestEmail || '';
    const order = {
      id: orderId, userId: user ? user.id : null, userEmail: email, customerName: name,
      items: c.items.map((i: any) => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, image: i.image })),
      subtotal: c.subtotal, shipping, discount: c.discount, total,
      coupon: c.coupon ? c.coupon.code : null, status: 'processing', payment: PAY[payKey],
      discreet: pickup ? false : !!b.discreet, phone,
      address: pickup ? { full: 'MAĞAZADAN TESLİM — ' + (st.address || ''), city: 'Eskişehir', zip: '26170' } : { full: address, city, zip: String(b.zip || '').trim() },
      createdAt: new Date().toISOString(), note: String(b.note || '').trim()
    };
    for (const i of c.items) {
      const p = db.products.find((x: any) => x.id === i.productId);
      if (p) p.stock = Math.max(0, p.stock - i.qty);
    }
    if (c.coupon) { c.coupon.used++; }
    if (user) {
      user.addresses = [{ label: pickup ? 'Mağazadan' : 'Ev', full: order.address.full, city: order.address.city, zip: order.address.zip, phone, discreet: order.discreet }];
    }
    db.orders.push(order);
    sess.cart = []; sess.coupon = null; sess.lastGuestEmail = email || null;
    save(); persistSessions();

    const lines = ['Merhaba Love, yeni siparişim var:', 'Sipariş No: ' + orderId, ''];
    for (const i of order.items) lines.push(`- ${i.name} x${i.qty} = ${fmt(i.price * i.qty)}`);
    if (order.discount) lines.push(`Kupon indirimi: -${fmt(order.discount)}`);
    if (order.shipping) lines.push(`Kargo: ${fmt(order.shipping)}`);
    lines.push(`TOPLAM: ${fmt(total)}`, '');
    lines.push(pickup ? 'Teslimat: Mağazanızdan teslim alacağım (Ilgaz İş Hanı)' : 'Teslimat: Adrese kargo, gizli paketleme lütfen');
    lines.push('Ad Soyad: ' + name, 'Telefon: ' + phone);
    if (!pickup) lines.push('Adres: ' + address + ', ' + city);
    const waMessage = lines.join('\n');
    return json(res, 200, { ok: true, orderId, total, pickup, waMessage, waLink: (st.whatsapp || 'https://wa.me/905436331325') + '?text=' + encodeURIComponent(waMessage) });
  }

  /* --- orders --- */
  if (pathname === '/api/orders/mine' && method === 'GET') {
    if (!user) return sendError(res, 401, E('err.noUser'));
    return json(res, 200, { ok: true, orders: db.orders.filter((o: any) => o.userId === user.id).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)) });
  }
  const oGet = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (oGet && method === 'GET') {
    const o = db.orders.find((x: any) => x.id === decodeURIComponent(oGet[1]));
    if (!o) return sendError(res, 404, E('err.noOrder'));
    const allowed = (user && user.role === 'admin') || (user && o.userId === user.id) || (o.userEmail && o.userEmail === sess.lastGuestEmail);
    if (!allowed) return sendError(res, 403, E('err.orderForbid'));
    return json(res, 200, { ok: true, order: o });
  }

  /* --- account --- */
  if (pathname === '/api/account' && method === 'POST') {
    if (!user) return sendError(res, 401, E('err.noUser'));
    const b = await readBody(req);
    if (b.name) user.name = String(b.name).trim();
    save();
    return json(res, 200, { ok: true });
  }
  if (pathname === '/api/account/address' && method === 'POST') {
    if (!user) return sendError(res, 401, E('err.noUser'));
    const b = await readBody(req);
    user.addresses = [{ label: 'Ev', full: String(b.full || ''), city: String(b.city || ''), zip: String(b.zip || ''), phone: String(b.phone || ''), discreet: !!b.discreet }];
    save();
    return json(res, 200, { ok: true });
  }
  if (pathname === '/api/account/password' && method === 'POST') {
    if (!user) return sendError(res, 401, E('err.noUser'));
    const b = await readBody(req);
    if (!b.password || b.password.length < 6) return sendError(res, 400, E('err.pass6'));
    user.passwordHash = hash(b.password); save();
    return json(res, 200, { ok: true });
  }

  /* --- newsletter & contact --- */
  if (pathname === '/api/newsletter' && method === 'POST') {
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return sendError(res, 400, E('err.email'));
    if (db.newsletter.some((n: any) => n.email === email)) return sendError(res, 409, E('err.emailUsed'));
    db.newsletter.push({ email, createdAt: new Date().toISOString() }); save();
    return json(res, 200, { ok: true });
  }
  if (pathname === '/api/contact' && method === 'POST') {
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    const message = String(b.message || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return sendError(res, 400, E('err.email'));
    if (message.length < 5) return sendError(res, 400, E('err.msgShort'));
    db.contact.push({ id: uid('m'), name: String(b.name || 'Anonim').trim(), email, message, createdAt: new Date().toISOString(), read: false });
    save();
    return json(res, 200, { ok: true });
  }

  /* ================= ADMIN ================= */
  const adm = requireAdmin(req, res);

  if (pathname.startsWith('/api/admin/')) {
    if (!adm) return sendError(res, 401, E('err.needAdmin'));

    if (pathname === '/api/admin/stats' && method === 'GET') {
      const revenueOrders = db.orders.filter((o: any) => o.status !== 'cancelled');
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const total = revenueOrders.filter((o: any) => o.createdAt.slice(0, 10) === key).reduce((a: number, o: any) => a + o.total, 0);
        days.push({ label: d.toLocaleDateString('tr-TR', { weekday: 'short' }), value: total });
      }
      const catDist: Record<string, number> = {};
      for (const p of db.products) {
        for (const o of revenueOrders) for (const i of o.items) if (i.productId === p.id) catDist[p.categoryName] = (catDist[p.categoryName] || 0) + i.qty;
      }
      return json(res, 200, {
        ok: true,
        stats: {
          revenue: Math.round(revenueOrders.reduce((a: number, o: any) => a + o.total, 0) * 100) / 100,
          orders: db.orders.length,
          customers: db.users.filter((u: any) => u.role === 'customer').length,
          products: db.products.length,
          newsletter: db.newsletter.length,
          pendingReviews: db.reviews.filter((r: any) => !r.approved).length,
          lowStock: db.products.filter((p: any) => p.stock <= 5),
          days, catDist
        }
      });
    }

    if (pathname === '/api/admin/orders' && method === 'GET') {
      const orders = [...db.orders].sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
      return json(res, 200, { ok: true, orders });
    }
    const oUp = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
    if (oUp && method === 'POST') {
      const o = db.orders.find((x: any) => x.id === decodeURIComponent(oUp[1]));
      if (!o) return sendError(res, 404, E('err.noOrder'));
      const b = await readBody(req);
      if (['processing', 'shipped', 'delivered', 'cancelled'].includes(b.status)) { o.status = b.status; save(); }
      return json(res, 200, { ok: true, order: o });
    }

    if (pathname === '/api/admin/products' && method === 'GET') {
      const kw = (q.get('q') || '').toLowerCase();
      let list = [...db.products];
      if (kw) list = list.filter((p: any) => p.name.toLowerCase().includes(kw) || p.slug.includes(kw));
      return json(res, 200, { ok: true, products: list });
    }
    if (pathname === '/api/admin/products' && method === 'POST') {
      const b = await readBody(req);
      if (!b.name || !b.price) return sendError(res, 400, E('err.needName'));
      let slug = String(b.slug || b.name).toLowerCase().replace(/[çğıöşü]/g, (c) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }[c] || c)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('p');
      if (db.products.some((p: any) => p.slug === slug)) slug += '-' + Date.now().toString(36);
      let image = '/uploads/aurora-wand.svg';
      if (b.image && String(b.image).startsWith('data:image/')) image = saveUpload(b.image);
      else if (b.image && String(b.image).startsWith('/uploads/')) image = b.image;
      const p = {
        id: uid('p'), slug, name: String(b.name).trim(),
        category: b.category || 'ciftler', categoryName: b.categoryName || 'Genel',
        description: String(b.description || ''), longDescription: String(b.longDescription || b.description || ''),
        price: Math.max(0, Number(b.price)), oldPrice: b.oldPrice ? Number(b.oldPrice) : null,
        stock: Math.max(0, parseInt(b.stock, 10) || 0), rating: Number(b.rating) || 0, reviewCount: 0,
        featured: !!b.featured, isNew: !!b.isNew, bestSeller: !!b.bestSeller,
        image, gallery: [image], tags: [], variants: ['standart'], createdAt: new Date().toISOString()
      };
      db.products.push(p); save();
      return json(res, 200, { ok: true, product: p });
    }
    const pUp = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (pUp && (method === 'POST' || method === 'PUT')) {
      const p = db.products.find((x: any) => x.id === decodeURIComponent(pUp[1]));
      if (!p) return sendError(res, 404, E('err.noProd'));
      const b = await readBody(req);
      const f = ['name', 'category', 'categoryName', 'description', 'longDescription', 'price', 'oldPrice', 'stock', 'rating', 'featured', 'isNew', 'bestSeller', 'slug'];
      for (const k of f) if (b[k] !== undefined) p[k] = k === 'featured' || k === 'isNew' || k === 'bestSeller' ? !!b[k] : b[k];
      if (b.oldPrice === null || b.oldPrice === '') p.oldPrice = null;
      if (b.image && String(b.image).startsWith('data:image/')) p.image = saveUpload(b.image);
      else if (b.image && String(b.image).startsWith('/uploads/')) p.image = b.image;
      save();
      return json(res, 200, { ok: true, product: p });
    }
    if (pUp && method === 'DELETE') {
      const id = decodeURIComponent(pUp[1]);
      const idx = db.products.findIndex((x: any) => x.id === id);
      if (idx === -1) return sendError(res, 404, E('err.noProd'));
      db.products.splice(idx, 1);
      for (const s of Object.values(sessions)) s.cart = (s.cart || []).filter((l: any) => l.productId !== id);
      persistSessions(); save();
      return json(res, 200, { ok: true });
    }

    /* --- categories --- */
    if (!Array.isArray(db.categories)) db.categories = [];
    if (pathname === '/api/admin/categories' && method === 'GET') {
      return json(res, 200, { ok: true, categories: allCategories().map((c: any) => ({ ...c, count: db.products.filter((p: any) => p.category === c.slug).length })) });
    }
    if (pathname === '/api/admin/categories' && method === 'POST') {
      const b = await readBody(req);
      const name = String(b.name || '').trim();
      if (!name) return sendError(res, 400, E('err.catName'));
      let slug = String(b.slug || name).toLowerCase().replace(/[çğıöşü]/g, (c) => ({ 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' }[c] || c)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('ct');
      if (allCategories().some((c: any) => c.slug === slug)) return sendError(res, 409, E('err.catSlug'));
      let image = '';
      if (b.image && String(b.image).startsWith('data:image/')) image = saveUpload(b.image);
      else if (b.image && String(b.image).startsWith('/uploads/')) image = b.image;
      const c = { id: uid('ct'), slug, name, image, createdAt: new Date().toISOString() };
      db.categories.push(c); save();
      return json(res, 200, { ok: true, category: c });
    }
    const ctUp = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
    if (ctUp && (method === 'POST' || method === 'PUT')) {
      const c = db.categories.find((x: any) => x.id === decodeURIComponent(ctUp[1]));
      if (!c) return sendError(res, 404, E('err.catNone'));
      const b = await readBody(req);
      if (b.name) c.name = String(b.name).trim();
      if (b.image && String(b.image).startsWith('data:image/')) c.image = saveUpload(b.image);
      else if (b.image && String(b.image).startsWith('/uploads/')) c.image = b.image;
      else if (b.useAutoCover) {
        const cover = db.products.find((p: any) => p.category === c.slug && p.bestSeller) || db.products.find((p: any) => p.category === c.slug);
        c.image = cover ? cover.image : '';
      }
      save();
      return json(res, 200, { ok: true, category: c });
    }
    if (ctUp && method === 'DELETE') {
      const id = decodeURIComponent(ctUp[1]);
      const c = db.categories.find((x: any) => x.id === id);
      if (!c) return sendError(res, 404, E('err.catNone'));
      const count = db.products.filter((p: any) => p.category === c.slug).length;
      if (count > 0) return sendError(res, 400, `Bu kategoride ${count} ürün var. Önce ürünleri taşı veya sil.`);
      db.categories = db.categories.filter((x: any) => x.id !== id);
      save();
      return json(res, 200, { ok: true });
    }

    /* --- wheel --- */
    if (pathname === '/api/admin/wheel' && method === 'GET') {
      if (!Array.isArray(db.settings.wheelIds)) db.settings.wheelIds = [];
      return json(res, 200, { ok: true, ids: db.settings.wheelIds, products: wheelProducts() });
    }
    if (pathname === '/api/admin/wheel' && method === 'POST') {
      if (!Array.isArray(db.settings.wheelIds)) db.settings.wheelIds = [];
      const b = await readBody(req);
      if (Array.isArray(b.ids)) {
        const clean: string[] = [], seen = new Set();
        for (const id of b.ids) {
          const p = db.products.find((x: any) => x.id === id);
          if (p && !seen.has(p.id)) { clean.push(p.id); seen.add(p.id); }
          if (clean.length >= 8) break;
        }
        db.settings.wheelIds = clean; save();
        return json(res, 200, { ok: true, ids: db.settings.wheelIds });
      }
      if (b.toggle) {
        const p = db.products.find((x: any) => x.id === String(b.toggle));
        if (!p) return sendError(res, 404, E('err.noProd'));
        if (db.settings.wheelIds.includes(p.id)) db.settings.wheelIds = db.settings.wheelIds.filter((x: any) => x !== p.id);
        else {
          if (db.settings.wheelIds.length >= 8) return sendError(res, 400, E('err.wheelFull'));
          db.settings.wheelIds.push(p.id);
        }
        save();
        return json(res, 200, { ok: true, ids: db.settings.wheelIds });
      }
      return sendError(res, 400, E('err.badReq'));
    }

    if (pathname === '/api/admin/reviews' && method === 'GET') {
      return json(res, 200, { ok: true, reviews: [...db.reviews].sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)) });
    }
    const rApp = pathname.match(/^\/api\/admin\/reviews\/([^/]+)\/approve$/);
    if (rApp && method === 'POST') {
      const r = db.reviews.find((x: any) => x.id === decodeURIComponent(rApp[1]));
      if (!r) return sendError(res, 404, E('err.revNone'));
      r.approved = true;
      const p = db.products.find((x: any) => x.id === r.productId);
      if (p) {
        p.rating = Math.round(((p.rating || 0) * (p.reviewCount || 0) + r.rating) / ((p.reviewCount || 0) + 1) * 10) / 10;
        p.reviewCount = (p.reviewCount || 0) + 1;
      }
      save();
      return json(res, 200, { ok: true });
    }
    const rDel = pathname.match(/^\/api\/admin\/reviews\/([^/]+)$/);
    if (rDel && method === 'DELETE') {
      const i = db.reviews.findIndex((x: any) => x.id === decodeURIComponent(rDel[1]));
      if (i === -1) return sendError(res, 404, E('err.revNone'));
      db.reviews.splice(i, 1); save();
      return json(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/coupons' && method === 'GET') return json(res, 200, { ok: true, coupons: db.coupons });
    if (pathname === '/api/admin/coupons' && method === 'POST') {
      const b = await readBody(req);
      const code = String(b.code || '').toUpperCase().trim();
      if (!code || code.length < 3) return sendError(res, 400, E('err.couponShort'));
      if (db.coupons.some((c: any) => c.code === code)) return sendError(res, 409, E('err.couponExists'));
      const c = { id: uid('c'), code, type: b.type === 'fixed' ? 'fixed' : 'percent', value: Math.max(0, Number(b.value) || 0), minTotal: Math.max(0, Number(b.minTotal) || 0), active: b.active !== false, used: 0 };
      db.coupons.push(c); save();
      return json(res, 200, { ok: true, coupon: c });
    }
    const cUp = pathname.match(/^\/api\/admin\/coupons\/([^/]+)$/);
    if (cUp && (method === 'POST' || method === 'PUT')) {
      const c = db.coupons.find((x: any) => x.id === decodeURIComponent(cUp[1]));
      if (!c) return sendError(res, 404, E('err.couponNone'));
      const b = await readBody(req);
      if (b.active !== undefined) c.active = !!b.active;
      if (b.value !== undefined) c.value = Number(b.value);
      save();
      return json(res, 200, { ok: true });
    }
    if (cUp && method === 'DELETE') {
      const i = db.coupons.findIndex((x: any) => x.id === decodeURIComponent(cUp[1]));
      if (i === -1) return sendError(res, 404, E('err.couponNone'));
      db.coupons.splice(i, 1); save();
      return json(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/users' && method === 'GET') {
      return json(res, 200, { ok: true, users: db.users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, orders: db.orders.filter((o: any) => o.userId === u.id).length })) });
    }
    const uUp = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (uUp && (method === 'POST' || method === 'PUT')) {
      const u = db.users.find((x: any) => x.id === decodeURIComponent(uUp[1]));
      if (!u) return sendError(res, 404, E('err.userNone'));
      if (u.id === adm.id) return sendError(res, 400, E('err.selfEdit'));
      const b = await readBody(req);
      if (b.role === 'admin' || b.role === 'customer') u.role = b.role;
      save();
      return json(res, 200, { ok: true });
    }
    if (uUp && method === 'DELETE') {
      const id = decodeURIComponent(uUp[1]);
      if (id === adm.id) return sendError(res, 400, E('err.selfDel'));
      const i = db.users.findIndex((x: any) => x.id === id);
      if (i === -1) return sendError(res, 404, E('err.userNone'));
      db.users.splice(i, 1); save();
      return json(res, 200, { ok: true });
    }

    if (pathname === '/api/admin/settings' && method === 'GET') return json(res, 200, { ok: true, settings: db.settings });
    if (pathname === '/api/admin/settings' && (method === 'POST' || method === 'PUT')) {
      const b = await readBody(req);
      for (const k of ['storeName', 'announcement', 'supportEmail', 'supportPhone', 'instagram', 'whatsapp', 'address', 'mapsQuery']) if (b[k] !== undefined) db.settings[k] = String(b[k]);
      for (const k of ['freeShippingThreshold', 'shippingFee', 'kdvRate']) if (b[k] !== undefined) db.settings[k] = Number(b[k]) || 0;
      save();
      return json(res, 200, { ok: true, settings: db.settings });
    }

    if (pathname === '/api/admin/messages' && method === 'GET') return json(res, 200, { ok: true, messages: [...db.contact].reverse() });
  }

  return sendError(res, 404, E('err.notFound404'));
}

/* ---------------- router ---------------- */
export const handler = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURI(url.pathname).replace(/\/+$/, '') || '/';
  try {
    if (req.method === 'GET') {
      if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/uploads/') || pathname.startsWith('/media/')) {
        return serveStatic(req, res, pathname);
      }
      if (pathname === '/') return pageHome(req, res);
      if (pathname === '/magaza') return pageShop(req, res);
      const rev = pathname.match(/^\/urun\/([^/]+)\/yorum$/);
      if (rev) return pageReviewForm(req, res, decodeURIComponent(rev[1]));
      const pr = pathname.match(/^\/urun\/([^/]+)$/);
      if (pr) return pageProduct(req, res, decodeURIComponent(pr[1]));
      if (pathname === '/sepet') return pageCart(req, res);
      if (pathname === '/odeme') return pageCheckout(req, res);
      const th = pathname.match(/^\/tesekkurler\/([^/]+)$/);
      if (th) return pageThanks(req, res, decodeURIComponent(th[1]));
      if (pathname === '/giris') return pageLogin(req, res);
      if (pathname === '/kayit') return pageRegister(req, res);
      if (pathname === '/hesap') return pageAccount(req, res);
      if (pathname === '/profil') return pageProfile(req, res);
      if (pathname === '/hakkimizda') return pageAbout(req, res);
      if (pathname === '/iletisim') return pageContact(req, res);
      if (pathname === '/admin') return pageAdmin(req, res);
      if (pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
    }
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname, url);
    const nf = pageCtx(req);
    const nfT = nf.t;
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(layout('404', `<div class="success-wrap"><div class="success-card">
  <div class="success-icon">🫣</div>
  <h1>${nfT('404.h')}</h1>
  <p>${nfT('404.p')}</p>
  <div style="margin-top:22px"><a href="/" class="btn btn-primary">${nfT('404.home')}</a> <a href="/magaza" class="btn btn-ghost" style="margin-left:8px">${nfT('404.shop')}</a></div>
</div></div>`, { noChrome: false }, nf));
  } catch (e: any) {
    const cLang = getCookieValue(req, 'ls_lang') === 'en' ? 'en' : 'tr';
    if (e.message === 'BODY_TOO_LARGE') return sendError(res, 413, errT(cLang, 'err.tooLarge'));
    if (e.message === 'BAD_JSON') return sendError(res, 400, errT(cLang, 'err.badJson'));
    console.error(e);
    return sendError(res, 500, errT(cLang, 'err.server'));
  }
};

const server = http.createServer(handler);

if (process.env.NODE_ENV !== 'production' || process.env.RENDER || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LOVE SHOP ready on http://0.0.0.0:${PORT}`);
    console.log(`Admin paneli: http://localhost:${PORT}/admin`);
    console.log(`Admin girişi -> admin@loveshop.com.tr / loveshop2026`);
  });
}

export default handler;
