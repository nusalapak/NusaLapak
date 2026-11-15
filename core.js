import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const state = { user: null, profile: null };
export const view = { id: 0 };

// ---------- Kelas Tailwind yang dipakai ulang ----------
export const ui = {
  input: 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500',
  label: 'block text-xs font-semibold text-slate-600 mb-1',
  btn: 'inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 transition disabled:opacity-50',
  btnWa: 'inline-flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 transition',
  btnGhost: 'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 transition',
  btnDanger: 'inline-flex items-center justify-center rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 transition',
  card: 'bg-white border border-slate-200 rounded-xl',
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

export function toast(msg, ok = true) {
  const el = document.createElement('div');
  el.className = `fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] px-4 py-2 rounded-lg shadow-lg text-sm text-white ${ok ? 'bg-emerald-600' : 'bg-red-600'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

export const spinner = '<div class="py-20 text-center text-slate-400 text-sm">Memuat...</div>';
export const errBox = (msg) =>
  `<div class="max-w-xl mx-auto px-4 py-16 text-center"><p class="text-red-600 font-semibold">Terjadi kesalahan</p><p class="text-sm text-slate-500 mt-2">${esc(msg)}</p></div>`;

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

export function renderNav() {
  const nav = document.getElementById('nav');
  const isSuper = state.profile?.role === 'superadmin';
  const link = 'text-slate-600 hover:text-emerald-700 font-medium';
  nav.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <a href="#/" class="font-extrabold text-lg text-emerald-700">Nusa<span class="text-amber-500">Lapak</span></a>
      <div class="flex items-center gap-4 text-sm">
        ${isSuper ? `<a href="#/superadmin" class="${link}">Super Admin</a>` : ''}
        ${state.user ? `<a href="#/dashboard" class="${link}">Dasbor</a>
          <button data-logout class="${link}">Keluar</button>`
          : `<a href="#/login" class="${link}">Masuk</a>`}
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
