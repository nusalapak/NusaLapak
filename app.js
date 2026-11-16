import { loadAuth, renderNav, begin, show, errBox, notice } from './core.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { renderHome, renderLapak, renderLogin } from './public.js';
import { renderSuperadmin, renderDashboard } from './admin.js';

const DEFAULT_TITLE = 'NusaLapak - Etalase Digital UMKM';
const notConfigured = () =>
  SUPABASE_URL.includes('ISI-') || SUPABASE_ANON_KEY.includes('ISI-');

async function route() {
  document.title = DEFAULT_TITLE;
  renderNav();
  window.scrollTo(0, 0);

  if (notConfigured()) {
    const v = begin();
    return show(v, notice({
      title: 'Konfigurasi belum diisi',
      text: 'Buka file <code class="bg-ink/10 px-1 rounded">config.js</code>, lalu isi SUPABASE_URL, SUPABASE_ANON_KEY, dan ADMIN_WA.',
    }));
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
      show(v, notice({
        title: 'Halaman tidak ditemukan',
        text: 'Alamat yang kamu buka tidak ada di NusaLapak.',
        cta: { href: '#/', label: 'Ke beranda' },
      }));
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
