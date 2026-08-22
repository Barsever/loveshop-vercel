import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.join(__dirname, '..', 'data');
export const DB_FILE = path.join(DATA_DIR, 'db.json');

let db = null;

function empty() {
  return {
    users: [],
    products: [],
    categories: [],
    orders: [],
    coupons: [],
    reviews: [],
    newsletter: [],
    contact: [],
    settings: {
      storeName: 'Love.',
      announcement: 'WHATSAPP SİPARİŞ + MAĞAZADA ÖDEME — GİZLİ PAKETLEME GARANTİSİ',
      freeShippingThreshold: 750,
      shippingFee: 49.9,
      kdvRate: 20,
      supportEmail: 'info@loveshop.com.tr',
      supportPhone: '+90 543 633 13 25',
      whatsapp: 'https://wa.me/905436331325',
      address: 'İsmet İnönü-1 Cd. 52/2 (Akbank Yanı), Ilgaz İş Hanı Kat:1 Daire:2, 26170 Tepebaşı/Eskişehir',
      mapsQuery: encodeURIComponent('Love Sex Shop Eskişehir Erotik Shop'),
      instagram: '@loveshop.tr',
      wheelIds: []
    },
    meta: { createdAt: new Date().toISOString(), seq: { product: 0, order: 0 } }
  };
}

export function load() {
  if (db) return db;
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    db = empty();
    save();
  }
  return db;
}

export function save() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    // Read-only filesystem (Vercel)
  }
}

export function uid(prefix) {
  return (prefix || '') + crypto.randomBytes(6).toString('hex');
}

function getSecret() {
  const SECRET_FILE = path.join(DATA_DIR, 'secret.txt');
  try { return fs.readFileSync(SECRET_FILE, 'utf8'); }
  catch {
    const s = 'loveshop_secret_key_2026';
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(SECRET_FILE, s);
    } catch (e) {}
    return s;
  }
}

export function hashPassword(s) {
  return crypto.createHash('sha256').update(getSecret() + ':' + s).digest('hex');
}

export function nextId(kind) {
  db = load();
  db.meta.seq[kind] = (db.meta.seq[kind] || 0) + 1;
  return db.meta.seq[kind];
}
