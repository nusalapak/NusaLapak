import { loadAuth, renderNav, begin, show, errBox, ui } from './core.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { renderHome, renderLapak, renderLogin } from './public.js';
import { renderSuperadmin, renderDashboard } from './admin.js';

const notConfigured = () =>
  SUPABASE_URL.includes('ISI-') || SUPABASE_ANON_KEY.includes('ISI-');

async function route() {
  renderNav();
  window.scrollTo(0, 0);

  if (notConfigured()) {
    const v = begin();
    return show(v, `
      <div class="max-w-md mx-auto px-4 py-20 text-center">
        <div class="text-5xl">⚙️</div>
        <h1 class="text-xl font-bold mt-4">Konfigurasi Belum Diisi</h1>
        <p class="text-sm text-slate-500 mt-2">Buka file <code class="bg-slate-100 px-1 rounded">config.js</code> lalu isi SUPABASE_URL, SUPABASE_ANON_KEY, dan ADMIN_WA.</p>
      </div>`);
  }

  const raw = location.hash.replace(/^#/, '') || '/';
  const path = raw.split('?')[0].replace(/\/+$/, '') || '/';

  try {
    if (path === '/') await renderHome();
    else if (path.startsWith('/lapak/')) await renderLapak(decodeURIComponent(path.slice(7)).toLowerCase());
    else if (path === '/login') await renderLogin();
    else if (path === '/superadmin') await renderSuperadmin();
    else if (path === '/dashboard') await renderDashboard();
    else {
      const v = begin();
      show(v, `
        <div class="max-w-md mx-auto px-4 py-20 text-center">
          <div class="text-5xl">🧭</div>
          <h1 class="text-xl font-bold mt-4">Halaman Tidak Ditemukan</h1>
          <a href="#/" class="${ui.btn} mt-6">Ke Beranda</a>
        </div>`);
    }
  } catch (err) {
    console.error(err);
    const v = begin();
    show(v, errBox(err.message || String(err)));
  }
}

window.addEventListener('hashchange', route);

(async () => {
  if (!notConfigured()) await loadAuth();
  route();
})();
