import { sb, state, view, ui, esc, rupiah, safeUrl, waLink, toast, spinner, errBox, begin, show, loadAuth, navigate, renderNav } from './core.js';
import { ADMIN_WA } from './config.js';

// =====================================================
// HALAMAN UTAMA  (#/)
// =====================================================
export async function renderHome() {
  const v = begin();
  const daftarWa = waLink(ADMIN_WA, 'Halo Admin NusaLapak, saya ingin mendaftarkan usaha saya agar punya etalase digital. Mohon info paket & caranya ya.');

  show(v, `
    <section class="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
      <div class="max-w-5xl mx-auto px-4 py-14 sm:py-20 text-center">
        <p class="inline-block bg-white/15 rounded-full px-3 py-1 text-xs font-semibold mb-4">Etalase digital untuk UMKM</p>
        <h1 class="text-3xl sm:text-5xl font-extrabold leading-tight">Punya lapak online sendiri,<br>pesanan langsung ke WhatsApp</h1>
        <p class="mt-4 text-emerald-50 max-w-2xl mx-auto text-sm sm:text-base">
          NusaLapak membuatkan katalog produk atau menu usaha Anda dalam satu link cantik.
          Tanpa ribet bikin website, tanpa biaya besar. Pelanggan tinggal pilih, lalu pesan lewat WhatsApp.
        </p>
        <div class="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="${esc(daftarWa)}" target="_blank" rel="noopener" class="${ui.btnWa} text-base px-6 py-3">Daftar via WhatsApp Admin</a>
          <a href="#daftar-toko" data-scroll class="inline-flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white text-base font-semibold px-6 py-3 transition">Lihat Toko UMKM</a>
        </div>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 py-12">
      <h2 class="text-xl sm:text-2xl font-bold text-center">Kenapa NusaLapak?</h2>
      <div class="grid sm:grid-cols-3 gap-4 mt-6">
        ${[
          ['🛍️', 'Katalog Rapi', 'Tampilkan produk, harga, dan foto dalam satu halaman yang mudah dibuka dari HP.'],
          ['💬', 'Order via WhatsApp', 'Pesanan pelanggan otomatis tersusun rapi dan terkirim ke WhatsApp Anda.'],
          ['⚡', 'Kelola Sendiri', 'Tambah, ubah, atau hapus produk kapan saja lewat dasbor sederhana.'],
        ].map(([i, t, d]) => `
          <div class="${ui.card} p-5 text-center">
            <div class="text-3xl">${i}</div>
            <h3 class="font-bold mt-2">${t}</h3>
            <p class="text-sm text-slate-500 mt-1">${d}</p>
          </div>`).join('')}
      </div>
    </section>

    <section class="bg-white border-y border-slate-200">
      <div class="max-w-5xl mx-auto px-4 py-12">
        <h2 class="text-xl sm:text-2xl font-bold text-center">Cara Kerjanya</h2>
        <div class="grid sm:grid-cols-3 gap-4 mt-6 text-center">
          ${[
            ['1', 'Hubungi Admin', 'Kirim pesan lewat WhatsApp untuk mendaftarkan usaha Anda.'],
            ['2', 'Lapak Dibuat', 'Admin membuat lapak dan akun dasbor untuk Anda.'],
            ['3', 'Mulai Jualan', 'Isi produk, bagikan link lapak ke pelanggan. Selesai!'],
          ].map(([n, t, d]) => `
            <div>
              <div class="mx-auto w-10 h-10 rounded-full bg-amber-400 text-white font-extrabold flex items-center justify-center">${n}</div>
              <h3 class="font-bold mt-3">${t}</h3>
              <p class="text-sm text-slate-500 mt-1">${d}</p>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <section id="daftar-toko" class="max-w-5xl mx-auto px-4 py-12">
      <h2 class="text-xl sm:text-2xl font-bold text-center">Toko UMKM Aktif</h2>
      <div id="store-list" class="mt-6">${spinner}</div>
    </section>
  `);

  document.getElementById('app').onclick = (e) => {
    const a = e.target.closest('[data-scroll]');
    if (a) {
      e.preventDefault();
      document.getElementById('daftar-toko')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { data, error } = await sb
    .from('stores')
    .select('name,slug,description')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (v !== view.id) return;
  const box = document.getElementById('store-list');
  if (error) return (box.innerHTML = errBox(error.message));
  if (!data.length) {
    box.innerHTML = '<p class="text-center text-slate-500 text-sm">Belum ada toko aktif. Jadilah yang pertama!</p>';
    return;
  }
  box.innerHTML = `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${data
    .map(
      (s) => `
      <a href="#/lapak/${esc(s.slug)}" class="${ui.card} p-4 hover:shadow-md hover:border-emerald-400 transition block">
        <div class="font-bold text-emerald-700">${esc(s.name)}</div>
        <p class="text-sm text-slate-500 mt-1 line-clamp-2">${esc(s.description || 'Kunjungi lapak kami!')}</p>
        <span class="inline-block mt-3 text-xs font-semibold text-emerald-600">Kunjungi lapak &rarr;</span>
      </a>`
    )
    .join('')}</div>`;
}

// =====================================================
// ETALASE TOKO  (#/lapak/slug)
// =====================================================
export async function renderLapak(slug) {
  const v = begin();
  show(v, spinner);

  const { data: store, error } = await sb
    .from('stores')
    .select('id,name,slug,description,whatsapp,is_active')
    .eq('slug', slug)
    .maybeSingle();
  if (v !== view.id) return;
  if (error) return show(v, errBox(error.message));

  if (!store || !store.is_active) {
    let suspended = !!store && !store.is_active;
    if (!store) {
      const { data } = await sb.rpc('get_store_status', { p_slug: slug });
      suspended = !!(data && data.length && data[0].is_active === false);
    }
    if (v !== view.id) return;
    if (suspended) {
      return show(v, `
        <div class="max-w-md mx-auto px-4 py-20 text-center">
          <div class="text-5xl">⏸️</div>
          <h1 class="text-xl font-bold mt-4">Lapak Sedang Ditangguhkan</h1>
          <p class="text-sm text-slate-500 mt-2">Lapak ini sementara tidak dapat diakses. Silakan hubungi pemilik toko secara langsung atau kembali lagi nanti.</p>
          <a href="#/" class="${ui.btn} mt-6">Kembali ke Beranda</a>
        </div>`);
    }
    return show(v, `
      <div class="max-w-md mx-auto px-4 py-20 text-center">
        <div class="text-5xl">🔍</div>
        <h1 class="text-xl font-bold mt-4">Lapak Tidak Ditemukan</h1>
        <p class="text-sm text-slate-500 mt-2">Periksa kembali alamat link-nya.</p>
        <a href="#/" class="${ui.btn} mt-6">Kembali ke Beranda</a>
      </div>`);
  }

  const { data: products, error: pErr } = await supabaseProducts(store.id);
  if (v !== view.id) return;
  if (pErr) return show(v, errBox(pErr.message));

  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const cart = {};

  const card = (p) => {
    const img = safeUrl(p.image_url);
    return `
    <div class="${ui.card} overflow-hidden flex flex-col">
      ${img ? `<img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" class="w-full h-36 object-cover" onerror="this.remove()">` : ''}
      <div class="p-3 flex flex-col flex-1">
        <div class="font-semibold">${esc(p.name)}</div>
        ${p.description ? `<p class="text-xs text-slate-500 mt-0.5">${esc(p.description)}</p>` : ''}
        <div class="mt-auto pt-3 flex items-center justify-between gap-2">
          <span class="font-bold text-emerald-700 text-sm">${rupiah(p.price)}</span>
          ${p.is_available
            ? `<div class="flex items-center gap-2">
                 <button data-act="dec" data-id="${esc(p.id)}" class="w-8 h-8 rounded-full border border-slate-300 font-bold">−</button>
                 <span data-qty="${esc(p.id)}" class="w-5 text-center text-sm font-semibold">0</span>
                 <button data-act="inc" data-id="${esc(p.id)}" class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold">+</button>
               </div>`
            : '<span class="text-xs font-semibold text-red-600">Habis</span>'}
        </div>
      </div>
    </div>`;
  };

  show(v, `
    <section class="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
      <div class="max-w-5xl mx-auto px-4 py-8">
        <h1 class="text-2xl sm:text-3xl font-extrabold">${esc(store.name)}</h1>
        ${store.description ? `<p class="text-emerald-50 text-sm mt-2 max-w-2xl">${esc(store.description)}</p>` : ''}
        <a href="${esc(waLink(store.whatsapp, `Halo ${store.name}, saya mau tanya-tanya dulu ya.`))}" target="_blank" rel="noopener" class="${ui.btnWa} mt-4">Chat WhatsApp</a>
      </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 py-6 pb-44">
      <h2 class="font-bold text-lg mb-3">Daftar Produk / Menu</h2>
      ${products.length
        ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${products.map(card).join('')}</div>`
        : '<p class="text-sm text-slate-500">Produk belum tersedia.</p>'}
    </section>

    <div id="cart-bar" class="hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-2xl p-3 z-30">
      <div class="max-w-5xl mx-auto grid gap-2">
        <div class="grid grid-cols-2 gap-2">
          <input id="cust-name" maxlength="60" placeholder="Nama Anda" class="${ui.input}">
          <input id="cust-note" maxlength="150" placeholder="Catatan (opsional)" class="${ui.input}">
        </div>
        <button data-act="order" class="${ui.btnWa} py-3 text-base">Pesan via WhatsApp &bull; <span id="cart-sum" class="ml-1"></span></button>
      </div>
    </div>
  `);

  const entries = () => Object.entries(cart).filter(([, q]) => q > 0);
  const total = () => entries().reduce((a, [id, q]) => a + byId[id].price * q, 0);

  function sync() {
    const items = entries();
    document.querySelectorAll('[data-qty]').forEach((el) => (el.textContent = cart[el.dataset.qty] || 0));
    const bar = document.getElementById('cart-bar');
    bar.classList.toggle('hidden', items.length === 0);
    document.getElementById('cart-sum').textContent =
      `${items.reduce((a, [, q]) => a + q, 0)} item • ${rupiah(total())}`;
  }

  document.getElementById('app').onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    const id = b.dataset.id;
    if (act === 'inc') {
      cart[id] = Math.min((cart[id] || 0) + 1, 99);
      sync();
    } else if (act === 'dec') {
      cart[id] = Math.max((cart[id] || 0) - 1, 0);
      sync();
    } else if (act === 'order') {
      const items = entries();
      if (!items.length) return;
      const name = document.getElementById('cust-name').value.trim() || '-';
      const note = document.getElementById('cust-note').value.trim();
      const lines = items.map(([pid, q], i) => {
        const p = byId[pid];
        return `${i + 1}. ${p.name} x${q} = ${rupiah(p.price * q)}`;
      });
      const text =
        `Halo ${store.name}, saya ingin memesan:\n\n` +
        lines.join('\n') +
        `\n\nTotal: ${rupiah(total())}\n` +
        `Nama: ${name}\n` +
        (note ? `Catatan: ${note}\n` : '') +
        `\nTerima kasih!`;
      window.open(waLink(store.whatsapp, text), '_blank', 'noopener');
    }
  };
}

async function supabaseProducts(storeId) {
  return sb.from('products').select('*').eq('store_id', storeId).order('created_at', { ascending: true });
}

// =====================================================
// LOGIN & DAFTAR  (#/login)
// =====================================================
export async function renderLogin() {
  const v = begin();

  if (state.user) {
    const isSuper = state.profile?.role === 'superadmin';
    return show(v, `
      <div class="max-w-sm mx-auto px-4 py-16 text-center">
        <p class="text-sm text-slate-500">Anda sudah masuk sebagai</p>
        <p class="font-bold mt-1">${esc(state.user.email)}</p>
        <a href="${isSuper ? '#/superadmin' : '#/dashboard'}" class="${ui.btn} mt-5">Buka Dasbor</a>
      </div>`);
  }

  let mode = 'login';

  function draw(msg = '') {
    const isLogin = mode === 'login';
    show(v, `
      <div class="max-w-sm mx-auto px-4 py-12">
        <div class="${ui.card} p-6">
          <div class="grid grid-cols-2 bg-slate-100 rounded-lg p-1 text-sm font-semibold mb-5">
            <button data-act="mode" data-mode="login" class="py-2 rounded-md ${isLogin ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}">Masuk</button>
            <button data-act="mode" data-mode="register" class="py-2 rounded-md ${!isLogin ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}">Daftar</button>
          </div>
          ${msg ? `<div class="mb-4 text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-800 p-3">${esc(msg)}</div>` : ''}
          <form id="auth-form" class="grid gap-3">
            ${!isLogin ? `<div><label class="${ui.label}">Nama Lengkap</label><input name="full_name" required maxlength="80" class="${ui.input}"></div>` : ''}
            <div><label class="${ui.label}">Email</label><input name="email" type="email" required autocomplete="email" class="${ui.input}"></div>
            <div><label class="${ui.label}">Password</label><input name="password" type="password" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" class="${ui.input}"></div>
            <button class="${ui.btn} mt-1" type="submit">${isLogin ? 'Masuk' : 'Buat Akun'}</button>
          </form>
          ${!isLogin ? '<p class="text-xs text-slate-500 mt-3">Setelah mendaftar, beri tahu admin NusaLapak email Anda agar lapak Anda bisa ditautkan ke akun ini.</p>' : ''}
        </div>
      </div>`);
  }
  draw();

  const app = document.getElementById('app');
  app.onclick = (e) => {
    const b = e.target.closest('[data-act="mode"]');
    if (b) {
      mode = b.dataset.mode;
      draw();
    }
  };
  app.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    const email = f.email.value.trim();
    const password = f.password.value;
    btn.disabled = true;
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { full_name: f.full_name.value.trim() } },
        });
        if (error) throw error;
        if (!data.session) {
          mode = 'login';
          return draw('Akun dibuat. Silakan cek email untuk konfirmasi, lalu masuk.');
        }
      }
      await loadAuth();
      renderNav();
      toast('Berhasil masuk');
      navigate(state.profile?.role === 'superadmin' ? '#/superadmin' : '#/dashboard');
    } catch (err) {
      toast(translateAuthError(err.message), false);
      btn.disabled = false;
    }
  };
}

function translateAuthError(m = '') {
  if (/invalid login/i.test(m)) return 'Email atau password salah.';
  if (/already registered/i.test(m)) return 'Email sudah terdaftar, silakan masuk.';
  if (/email not confirmed/i.test(m)) return 'Email belum dikonfirmasi. Cek kotak masuk Anda.';
  if (/password/i.test(m)) return 'Password minimal 6 karakter.';
  return m;
}
