import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const state = { user: null, profile: null };
export const view = { id: 0 };

// ---------- Kelas Tailwind yang dipakai ulang ----------
export const ui = {
  input: 'w-full rounded-lg border-2 border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none',
  label: 'block text-xs font-semibold text-ink/70 mb-1',
  btn: 'sticker inline-flex items-center justify-center rounded-lg bg-pandan text-white text-sm font-bold px-4 py-2',
  btnSm: 'inline-flex items-center justify-center rounded-md bg-pandan hover:bg-pandan-700 text-white text-xs font-semibold px-3 py-1.5 transition disabled:opacity-50',
  btnWa: 'sticker inline-flex items-center justify-center rounded-lg bg-[#25D366] text-ink text-sm font-bold px-4 py-2',
  btnLight: 'sticker inline-flex items-center justify-center rounded-lg bg-white text-ink text-sm font-bold px-4 py-2',
  btnGhost: 'inline-flex items-center justify-center rounded-md border border-ink/25 bg-white hover:bg-ink/5 text-ink text-xs font-semibold px-3 py-1.5 transition',
  btnDanger: 'inline-flex items-center justify-center rounded-md border border-sambal/50 bg-white hover:bg-sambal/10 text-sambal text-xs font-semibold px-3 py-1.5 transition',
  card: 'bg-white border border-ink/15 rounded-xl',
};

// ---------- Helper umum ----------
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

export function safeUrl(u) {
  try {
    const x = new URL(u);
    return ['http:', 'https:'].includes(x.protocol) ? x.href : '';
  } catch {
    return '';
  }
}

export function waNumber(n) {
  let d = String(n || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d;
}

export const waLink = (n, text) => `https://wa.me/${waNumber(n)}?text=${encodeURIComponent(text)}`;

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

export function toast(msg, ok = true) {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className = `fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2.5 rounded-lg border-2 border-ink text-sm font-semibold text-white ${ok ? 'bg-pandan' : 'bg-sambal'}`;
  el.style.boxShadow = '3px 3px 0 #1B1A17';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

export const spinner = '<div class="py-24 text-center text-ink/50 text-sm font-medium">Memuat...</div>';

// Kartu pemberitahuan (ditangguhkan, tidak ditemukan, error, dll.)
export const notice = ({ title, text, cta }) => `
  <div class="max-w-md mx-auto px-4 py-14">
    <div class="bg-white border-2 border-ink rounded-xl overflow-hidden" style="box-shadow:5px 5px 0 #1B1A17">
      <div class="awning"></div>
      <div class="p-6 text-center">
        <h1 class="font-display text-2xl font-extrabold">${title}</h1>
        <p class="text-sm text-ink/70 mt-2">${text}</p>
        ${cta ? `<a href="${cta.href}" class="${ui.btn} mt-5">${cta.label}</a>` : ''}
      </div>
    </div>
  </div>`;

export const errBox = (msg) =>
  notice({ title: 'Terjadi kesalahan', text: esc(msg), cta: { href: '#/', label: 'Ke beranda' } });

// ---------- Render area utama (anti-balapan antar halaman) ----------
export function begin() {
  view.id++;
  const a = document.getElementById('app');
  a.onclick = a.onsubmit = a.oninput = a.onchange = null;
  return view.id;
}
export function show(v, html) {
  if (v !== view.id) return false;
  document.getElementById('app').innerHTML = html;
  return true;
}

// ---------- Auth ----------
export async function loadAuth() {
  const { data } = await sb.auth.getSession();
  state.user = data?.session?.user || null;
  state.profile = null;
  if (state.user) {
    const { data: p } = await sb.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
    state.profile = p || null;
  }
}

export function navigate(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

const logo = `
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
    <rect x="4" y="13" width="22" height="14" fill="#1B1A17"/>
    <rect x="12" y="18" width="6" height="9" fill="#FFC83D"/>
    <path d="M2 13 L6 3 H24 L28 13 Z" fill="#E2341D"/>
    <path d="M10 3 L9 13 M15 3 V13 M20 3 L21 13" stroke="#fff" stroke-width="2.4"/>
  </svg>`;

export function renderNav() {
  const nav = document.getElementById('nav');
  const isSuper = state.profile?.role === 'superadmin';
  const link = 'text-ink/70 hover:text-ink font-semibold';
  nav.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="#/" class="flex items-center gap-2 font-display font-extrabold text-xl text-ink">${logo}<span>NusaLapak</span></a>
      <div class="flex items-center gap-4 text-sm">
        ${isSuper ? `<a href="#/superadmin" class="${link}">Super Admin</a>` : ''}
        ${state.user
          ? `<a href="#/dashboard" class="${link}">Dasbor</a>
             <button data-logout class="${link}">Keluar</button>`
          : `<a href="#/login" class="sticker rounded-md bg-kunyit text-ink font-bold px-3 py-1.5">Masuk</a>`}
      </div>
    </div>`;
  nav.onclick = async (e) => {
    if (e.target.closest('[data-logout]')) {
      await sb.auth.signOut();
      await loadAuth();
      renderNav();
      navigate('#/');
    }
  };
}
